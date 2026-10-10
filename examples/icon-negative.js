import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import Select from '../src/ol/interaction/Select.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

/**
 * 创建图标样式的工厂函数
 * @param {string|undefined} src 图标图片 URL（与 img 二选一）
 * @param {HTMLImageElement|HTMLCanvasElement|undefined} img 已加载的 Image 或离屏 Canvas 元素（与 src 二选一）
 * @return {Style} OpenLayers 样式实例
 */
function createStyle(src, img) {
  return new Style({
    image: new Icon({
      anchor: [0.5, 0.96], // 锚点设在水平居中（0.5）、垂直靠近底部尖端（0.96）处
      crossOrigin: 'anonymous', // 允许跨域加载，防止后续调用 canvas.getContext('2d').getImageData() 时触发画布污染报错
      src: src, // 通过 URL 加载图片时传入
      img: img, // 通过离屏 Canvas 直接提供像素图像时传入
    }),
  });
}

// 创建一个位于坐标原点 [0, 0] 的点要素
const iconFeature = new Feature(new Point([0, 0]));
// 将初始样式保存在要素的自定义属性 'style' 中，便于图层渲染与后续 Select 交互读取原图
iconFeature.set('style', createStyle('data/icon.png', undefined));

const map = new Map({
  layers: [
    // 底图图层：Stamen 水彩风格瓦片底图
    new TileLayer({
      source: new StadiaMaps({layer: 'stamen_watercolor'}),
    }),
    // 矢量图层：通过样式函数读取要素身上的 'style' 属性进行渲染
    new VectorLayer({
      style: function (feature) {
        return feature.get('style');
      },
      source: new VectorSource({features: [iconFeature]}),
    }),
  ],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 3,
  }),
});

// 缓存字典：以原图 src 为键，缓存已生成的反色（负片）Style 实例，避免重复执行像素遍历
const selectStyle = {};

// 添加点选（Select）交互：选中要素时动态生成并渲染其反色（负片）图标
const select = new Select({
  style: function (feature) {
    // 第一次 getImage() 获取 Style 中的 Icon 实例；第二次 getImage() 获取 Icon 底层的 HTMLImageElement
    const image = feature.get('style').getImage().getImage();

    // 若该图片尚未生成过反色样式，则通过离屏 Canvas 进行像素级反色处理
    if (!selectStyle[image.src]) {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = image.width;
      canvas.height = image.height;

      // 1. 将原始图标绘制到离屏 Canvas 上
      context.drawImage(image, 0, 0, image.width, image.height);

      // 2. 提取画布上所有像素的 RGBA 一维字节数组（每 4 个元素代表一个像素的 R, G, B, A）
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // 3. 遍历像素并反转 R、G、B 三个颜色通道（255 - 原值）
      // 当 i % 4 == 2（即处理完 B 通道）时，步进 +2 以跳过 i % 4 == 3 的 Alpha 透明度通道，保持原有透明度不变
      for (let i = 0, ii = data.length; i < ii; i = i + (i % 4 == 2 ? 2 : 1)) {
        data[i] = 255 - data[i];
      }

      // 4. 将反色处理后的像素数据写回离屏 Canvas
      context.putImageData(imageData, 0, 0);

      // 5. 将离屏 Canvas 作为 img 参数创建新的 Icon 样式，并存入缓存字典
      selectStyle[image.src] = createStyle(undefined, canvas);
    }

    return selectStyle[image.src];
  },
});
map.addInteraction(select);

// 监听鼠标移动事件：当鼠标悬停在要素上方时，将鼠标指针切换为手型（pointer）
map.on('pointermove', function (evt) {
  map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel)
    ? 'pointer'
    : '';
});
