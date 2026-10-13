import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getBottomLeft, getTopRight} from '../src/ol/extent.js';
import KML from '../src/ol/format/KML.js';
import Polygon from '../src/ol/geom/Polygon.js';
import {DEVICE_PIXEL_RATIO} from '../src/ol/has.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {toContext} from '../src/ol/render.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

/**
 * 闭包函数：生成指定缩放比例和偏移量的不规则闪电多边形几何轮廓。
 * 通过 IIFE（立即执行函数表达式）预先定义基础图形并执行一次旋转，
 * 避免在渲染循环中重复创建和旋转多边形模板，提升运行效率。
 */
const getSymbolOutline = (function () {
  // 闪电符号的 6 个特征顶点（形成一个闭合折线环）
  const path = [
    [0, 0],
    [4, 2],
    [6, 0],
    [10, 5],
    [6, 3],
    [4, 5],
    [0, 0],
  ];
  // 基于顶点坐标构建基础多边形
  const symbolOutline = new Polygon([path]);
  // 绕原点 [0, 0] 顺时针旋转 1.2 弧度（约 68.75 度），使其呈现倾斜俯冲的闪电姿态
  symbolOutline.rotate(1.2, path[0]);

  /**
   * @param {number} scale 几何体缩放倍数（与震级挂钩）
   * @param {number} offset 坐标内边距偏移量（通常取描边宽度的一半），防止绘制时边缘描边被画布裁剪
   * @return {Polygon} 缩放并平移归一化后的多边形几何对象
   */
  return function (scale, offset) {
    // 克隆旋转后的几何模板，避免直接修改污染原多边形
    const outline = symbolOutline.clone();
    // 绕起点按指定倍率进行等比缩放
    outline.scale(scale, scale, path[0]);
    // 获取旋转缩放后几何体包围盒的左下角极值 [minX, minY]
    const origin = getBottomLeft(outline.getExtent());
    // 将几何体平移到 [offset, offset] 正坐标象限内，确保所有坐标均大于 0 且留有半线宽安全边距
    outline.translate(offset - origin[0], offset - origin[1]);
    return outline;
  };
})();

// 样式缓存字典：以震级数值为键，复用已生成的 Icon 样式实例
const styleCache = {};

// 地震矢量点图层：从 KML 加载数据，并通过动态 style 函数配合 toContext 离屏绘制闪电图标
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      // 禁用 KML 内置样式提取，完全由自定义 style 函数接管视觉表现
      extractStyles: false,
    }),
  }),
  /**
   * 动态样式回调函数
   * @param {import('../src/ol/Feature.js').default} feature 当前渲染的地震要素
   * @return {Style} 匹配该地震震级的图标样式
   */
  style: function (feature) {
    const magnitude = feature.get('magnitude');
    let style = styleCache[magnitude];
    if (!style) {
      // 震级换算为缩放倍数：基准为 5 级地震（scale = 1），每增加 1 级放大 4 倍
      const scale = 1 + 4 * (magnitude - 5);
      const lineWidth = 2;
      // 生成平移归一化后的闪电几何轮廓，预留半线宽边距（1 像素）
      const outline = getSymbolOutline(scale, Math.ceil(lineWidth / 2));
      // 创建离屏 Canvas DOM 元素
      const canvas = document.createElement('canvas');
      // 将离屏 Canvas 上下文包装为 OpenLayers 立即渲染器（VectorContext）
      const vectorContext = toContext(canvas.getContext('2d'), {
        // 画布尺寸：基于多边形包围盒右上角坐标（即最大 X 和最大 Y），加上半线宽预留
        size: getTopRight(outline.getExtent()).map((n) =>
          Math.ceil(n + lineWidth / 2),
        ),
        // 设备像素比（高分屏适配）：按实际设备倍率超采样放大画布物理分辨率
        pixelRatio: DEVICE_PIXEL_RATIO,
      });
      // 在离屏渲染器上设置多边形的填充与描边样式
      vectorContext.setStyle(
        new Style({
          fill: new Fill({color: 'rgba(255, 153, 0, 0.4)'}), // 半透明亮橙色填充
          stroke: new Stroke({
            color: 'rgba(255, 204, 0, 0.2)', // 柔和的金黄色描边
            width: 2,
          }),
        }),
      );
      // 在离屏 Canvas 上直接绘制几何图形
      vectorContext.drawGeometry(outline);
      // 将离屏 Canvas 包装为 Icon 样式，并将 scale 设为 1 / DEVICE_PIXEL_RATIO 缩回 CSS 逻辑尺寸
      style = new Style({
        image: new Icon({
          img: canvas,
          scale: 1 / DEVICE_PIXEL_RATIO,
        }),
      });
      // 缓存该震级对应的样式对象，避免相同震级重复创建 Canvas
      styleCache[magnitude] = style;
    }
    return style;
  },
});

// 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
// standards-violating <magnitude> tag in each Placemark.  We extract it from
// the Placemark's name instead.
// 注：该 KML 文件中的 <magnitude> 标签不符合官方规范，KML 解析器默认会忽略它。
// 因此我们从要素的名称（Placemark name，格式如 "M 5.9 - ..."）中截取前缀并解析浮点数震级。
function parseMagnitudeFromName(name) {
  return parseFloat(name.substr(2));
}

// 监听要素加载完成事件：一次性遍历并解析写入 magnitude 属性
vector.getSource().on('featuresloadend', function (evt) {
  evt.features.forEach((f) => {
    // 第三个参数传入 true 表示静默模式（silent），不触发要素的 change 事件，避免批量更新时造成重复重绘
    f.set('magnitude', parseMagnitudeFromName(f.get('name')), true);
  });
});

// 底图图层：采用黑白单色调的 Stadia Maps (Stamen Toner) 瓦片图层
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

// 创建地图实例
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
