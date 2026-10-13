import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import KML from '../src/ol/format/KML.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// 样式缓存字典（享元模式）：以圆圈像素半径 radius 为键缓存 Style 实例，避免为相同震级的上千个地震点重复创建离屏 Canvas 贴图
const styleCache = {};
const styleFunction = function (feature) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it from
  // the Placemark's name instead.
  // 2012_Earthquakes_Mag5.kml 将每次地震的震级保存在了不符合 KML 标准的 <magnitude> 标签中，
  // 因此我们改为直接从 Placemark 的 name 属性（如 "M 5.8 - ..."）中截取解析震级数值。
  const name = feature.get('name');
  const magnitude = parseFloat(name.substr(2));
  // 震级 M5.0 对应基础半径 5px，震级每增加 1 级半径放大 20px
  const radius = 5 + 20 * (magnitude - 5);
  let style = styleCache[radius];
  if (!style) {
    style = new Style({
      image: new CircleStyle({
        radius: radius,
        fill: new Fill({
          color: 'rgba(255, 153, 0, 0.4)',
        }),
        stroke: new Stroke({
          color: 'rgba(255, 204, 0, 0.2)',
          width: 1,
        }),
      }),
    });
    styleCache[radius] = style;
  }
  return style;
};

// 创建地震矢量图层：加载 2012 年 5 级以上地震 KML 数据（关闭 KML 内置样式提取）
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      extractStyles: false,
    }),
  }),
  style: styleFunction,
});

// 创建 StadiaMaps (Stamen Toner 黑白底图) 瓦片图层
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// 获取地图容器内的 1px × 1px 绝对定位锚点 DOM，并初始化手动控制的 Bootstrap Tooltip
const info = document.getElementById('info');
info.style.pointerEvents = 'none'; // 禁止锚点拦截鼠标事件
const tooltip = new bootstrap.Tooltip(info, {
  animation: false,
  customClass: 'pe-none', // 为弹出的 Tooltip DOM 添加 pointer-events: none 类，防止遮挡地图交互
  offset: [0, 5],
  title: '-',
  trigger: 'manual',
});

// 缓存当前鼠标悬停/点击命中的要素引用，避免在同一要素内移动时重复设置文本内容
let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  // 若鼠标当前位于地图控件按钮（.ol-control）上方，则跳过要素拾取
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    // 将 #info 锚点直接移动到当前鼠标像素坐标处
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      tooltip.setContent({'.tooltip-inner': feature.get('name')});
    }
    if (currentFeature) {
      // 如果上一帧已经显示了 Tooltip，只需轻量更新其位置
      tooltip.update();
    } else {
      // 否则首次弹出显示 Tooltip
      tooltip.show();
    }
  } else {
    tooltip.hide();
  }
  currentFeature = feature;
};

// 监听鼠标移动：拖拽地图时立即隐藏提示框，非拖拽状态下实时拾取并跟随显示地震信息
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    tooltip.hide();
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// 监听地图点击（兼顾移动端触屏点击查看详情）
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// 当鼠标移出地图容器边界时，立即隐藏提示框并清空选中状态
map.getTargetElement().addEventListener('pointerleave', function () {
  tooltip.hide();
  currentFeature = undefined;
});
