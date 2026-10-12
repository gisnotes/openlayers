import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import KML from '../src/ol/format/KML.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

/*
 * 动态计算每个时区要素的样式（styleFunction）：
 * 根据该时区当前本地时间距离“正午 12:00（Noon）”的时差来计算黄色填充的不透明度（opacity）。
 * 例如：当前正处于正午 12 点的时区，其不透明度最高（为 0.75）；
 * 当前正处于午夜 0 点的时区，其不透明度最低（为 0，完全透明）。
 * 注：此计算未考虑夏令时（DST），仅供可视化演示，请勿用于规划假期行程。
 */
const styleFunction = function (feature) {
  // 读取在 featuresloadend 阶段预解析好的该时区相对 UTC 的分钟偏移量
  const tzOffset = feature.get('tz-offset');
  const local = new Date();
  // local.getTimezoneOffset() 返回 (UTC - 浏览器本地时间) 的分钟数，
  // 加上它可先将时间还原为 UTC 时间，再加上 tzOffset 即可得到该时区要素当前的当地时间！
  local.setTime(
    local.getTime() + (local.getTimezoneOffset() + (tzOffset || 0)) * 60000,
  );

  // 计算该时区当前时间距离当地正午 12:00 的绝对小时差（delta 范围：0 ~ 12 小时）
  let delta = Math.abs(12 - (local.getHours() + local.getMinutes() / 60));
  if (delta > 12) {
    delta = 24 - delta;
  }

  // 将小时差线性映射为不透明度：正午（delta = 0）为 0.75，午夜（delta = 12）为 0
  const opacity = 0.75 * (1 - delta / 12);
  return new Style({
    fill: new Fill({
      // 使用 RGBA 数组格式指定填充色：[255, 255, 51, opacity]（明黄色 + 动态透明度）
      color: [0xff, 0xff, 0x33, opacity],
    }),
    stroke: new Stroke({
      color: '#ffffff',
    }),
  });
};

// 创建时区矢量图层：加载 KML 数据并禁用 KML 内置样式（extractStyles: false）
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/kml/timezones.kml',
    format: new KML({
      extractStyles: false,
    }),
  }),
  style: styleFunction,
});

/**
 * 从 KML 要素名称中解析相对 UTC 的分钟偏移量
 * @param {string} name 时区名称字符串，例如 "GMT -08:30" 或 "GMT +05:45"
 * @return {number|null} 相对 UTC 的偏移分钟数（如 -510），若不匹配则返回 null
 */
function parseOffsetFromUtc(name) {
  const match = name.match(/([+-]?)(\d{2}):(\d{2})$/);
  if (!match) {
    return null;
  }
  const sign = match[1] === '-' ? -1 : 1;
  const hours = Number(match[2]);
  const minutes = Number(match[3]);
  return sign * (60 * hours + minutes);
}

// 监听矢量数据源加载完成事件：一次性预解析所有时区要素的 UTC 偏移分钟数
vector.getSource().on('featuresloadend', function (evt) {
  evt.features.forEach(function (feature) {
    const tzOffset = parseOffsetFromUtc(feature.get('name'));
    // 第三个参数传入 true（silent 静默模式）：仅设置属性而不派发要素的 'change' 事件，避免批量更新时触发几百次多余重绘
    feature.set('tz-offset', tzOffset, true);
  });
});

// 创建深色系的 Stamen Toner 瓦片底图（与半透明亮黄色时区叠加后可凸显黑夜与白昼对比）
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

// 初始化地图实例
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// 获取用于挂载 Bootstrap Tooltip 的 1x1 像素绝对定位锚点容器 #info
const info = document.getElementById('info');
info.style.pointerEvents = 'none';
const tooltip = new bootstrap.Tooltip(info, {
  animation: false,
  customClass: 'pe-none', // 禁用鼠标事件拦截，防止闪烁
  offset: [0, 5],
  title: '-',
  trigger: 'manual', // 手动控制显示与隐藏
});

// 记录当前鼠标所在的要素，避免在同一时区内移动时重复更新 DOM 文本
let currentFeature;
const displayFeatureInfo = function (pixel, target) {
  // 若鼠标悬停在地图控件按钮（.ol-control）上，则跳过要素检测并隐藏提示框
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    // 将 #info 锚点实时移动到当前鼠标的屏幕像素位置
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    // 仅当进入新的时区要素时才更新 Tooltip 文本内容
    if (feature !== currentFeature) {
      tooltip.setContent({'.tooltip-inner': feature.get('name')});
    }
    if (currentFeature) {
      tooltip.update();
    } else {
      tooltip.show();
    }
  } else {
    tooltip.hide();
  }
  currentFeature = feature;
};

// 监听鼠标移动事件：拖拽地图时隐藏提示框，正常移动时实时跟随显示所在时区名称
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    tooltip.hide();
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// 监听点击事件（适配移动端触摸屏点击查看时区）
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// 当鼠标移出地图画布区域时，隐藏提示框并重置状态
map.getTargetElement().addEventListener('pointerleave', function () {
  tooltip.hide();
  currentFeature = undefined;
});
