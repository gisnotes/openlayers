import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

// 获取页面上的宽高输入框、清除按钮及缩放比例展示节点
const widthInput = document.getElementById('width-input');
const heightInput = document.getElementById('height-input');
const clearWidthButton = document.getElementById('clear-width-button');
const clearHeightButton = document.getElementById('clear-height-button');
const scaleSpan = document.getElementById('scale');

// 创建位于坐标原点 [0, 0] 的点要素
const iconFeature = new Feature({
  geometry: new Point([0, 0]),
  name: 'Null Island',
  population: 4000,
  rainfall: 500,
});

// 创建初始图标样式：同时指定 width (40px) 和 height (40px)
// 原图 data/icon.png 尺寸为 32x48，因此初始会被非等比拉伸为 40x40，内部 scale 为 [40/32, 40/48] = [1.25, 0.83]
const iconStyle = new Style({
  image: new Icon({
    src: 'data/icon.png',
    width: Number(widthInput.value),
    height: Number(heightInput.value),
  }),
});
iconFeature.setStyle(iconStyle);

// 监听宽度输入框变化：保持当前高度不变，使用新的像素宽度重建 Icon 实例
widthInput.addEventListener('input', (event) => {
  const currentIcon = iconStyle.getImage();
  iconStyle.setImage(
    new Icon({
      src: 'data/icon.png',
      width: Number(event.target.value),
      height: currentIcon.getHeight(),
    }),
  );
  // 重新设置要素样式以触发图层重绘
  iconFeature.setStyle(iconStyle);
});

// 监听高度输入框变化：保持当前宽度不变，使用新的像素高度重建 Icon 实例
heightInput.addEventListener('input', (event) => {
  const currentIcon = iconStyle.getImage();
  iconStyle.setImage(
    new Icon({
      src: 'data/icon.png',
      height: Number(event.target.value),
      width: currentIcon.getWidth(),
    }),
  );
  iconFeature.setStyle(iconStyle);
});

// 点击“清除宽度”按钮：仅传入 height，不传 width
// 此时 Icon 会以 height 为基准自动按原图宽高比（32:48）等比推算 width！
clearWidthButton.addEventListener('click', () => {
  const currentIcon = iconStyle.getImage();
  iconStyle.setImage(
    new Icon({
      src: 'data/icon.png',
      height: currentIcon.getHeight(),
    }),
  );
  iconFeature.setStyle(iconStyle);
  // 将等比推算出的最新宽度四舍五入后回填到宽度输入框中
  widthInput.value = String(Math.round(iconStyle.getImage().getWidth()));
  scaleSpan.innerText = formatScale(iconStyle.getImage().getScale());
  iconFeature.setStyle(iconStyle);
});

// 点击“清除高度”按钮：仅传入 width，不传 height
// 此时 Icon 会以 width 为基准自动按原图宽高比（32:48）等比推算 height！
clearHeightButton.addEventListener('click', () => {
  const currentIcon = iconStyle.getImage();
  iconStyle.setImage(
    new Icon({
      src: 'data/icon.png',
      width: currentIcon.getWidth(),
    }),
  );
  iconFeature.setStyle(iconStyle);
  // 将等比推算出的最新高度四舍五入后回填到高度输入框中
  heightInput.value = String(Math.round(iconStyle.getImage().getHeight()));
  iconFeature.setStyle(iconStyle);
});

// 创建矢量数据源与矢量图层
const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// 初始化地图实例
const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 3,
  }),
});

// 每次地图渲染完成后，同步更新页面上的折算缩放比例（Scale approx.）显示值
map.on(
  'rendercomplete',
  () => (scaleSpan.innerText = formatScale(iconStyle.getImage().getScale())),
);

/**
 * 格式化 scale 缩放比例（支持单数值或 [scaleX, scaleY] 二元数组，保留两位小数）
 * @param {number|Array<number>|undefined} scale 图标缩放比例
 * @return {string|number|undefined} 格式化后的字符串
 */
function formatScale(scale) {
  return Array.isArray(scale)
    ? '[' + scale?.map((v) => v.toFixed(2)).join(', ') + ']'
    : scale;
}
