import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

let openSansAdded = false;

// DOM element references for form controls / 表单控件 DOM 元素引用字典
const myDom = {
  points: {
    text: document.getElementById('points-text'),
    align: document.getElementById('points-align'),
    baseline: document.getElementById('points-baseline'),
    rotation: document.getElementById('points-rotation'),
    font: document.getElementById('points-font'),
    weight: document.getElementById('points-weight'),
    size: document.getElementById('points-size'),
    height: document.getElementById('points-height'),
    offsetX: document.getElementById('points-offset-x'),
    offsetY: document.getElementById('points-offset-y'),
    color: document.getElementById('points-color'),
    outline: document.getElementById('points-outline'),
    outlineWidth: document.getElementById('points-outline-width'),
    maxreso: document.getElementById('points-maxreso'),
  },
  lines: {
    text: document.getElementById('lines-text'),
    align: document.getElementById('lines-align'),
    baseline: document.getElementById('lines-baseline'),
    rotation: document.getElementById('lines-rotation'),
    font: document.getElementById('lines-font'),
    weight: document.getElementById('lines-weight'),
    placement: document.getElementById('lines-placement'),
    maxangle: document.getElementById('lines-maxangle'),
    overflow: document.getElementById('lines-overflow'),
    size: document.getElementById('lines-size'),
    height: document.getElementById('lines-height'),
    offsetX: document.getElementById('lines-offset-x'),
    offsetY: document.getElementById('lines-offset-y'),
    color: document.getElementById('lines-color'),
    outline: document.getElementById('lines-outline'),
    outlineWidth: document.getElementById('lines-outline-width'),
    maxreso: document.getElementById('lines-maxreso'),
  },
  polygons: {
    text: document.getElementById('polygons-text'),
    align: document.getElementById('polygons-align'),
    baseline: document.getElementById('polygons-baseline'),
    rotation: document.getElementById('polygons-rotation'),
    font: document.getElementById('polygons-font'),
    weight: document.getElementById('polygons-weight'),
    placement: document.getElementById('polygons-placement'),
    maxangle: document.getElementById('polygons-maxangle'),
    overflow: document.getElementById('polygons-overflow'),
    size: document.getElementById('polygons-size'),
    height: document.getElementById('polygons-height'),
    offsetX: document.getElementById('polygons-offset-x'),
    offsetY: document.getElementById('polygons-offset-y'),
    color: document.getElementById('polygons-color'),
    outline: document.getElementById('polygons-outline'),
    outlineWidth: document.getElementById('polygons-outline-width'),
    maxreso: document.getElementById('polygons-maxreso'),
  },
};

/**
 * Resolve display text based on resolution and strategy.
 * 根据地图分辨率及截断/换行策略获取最终标注文本
 * @param {import('../src/ol/Feature.js').default} feature Feature / 矢量要素
 * @param {number} resolution View resolution / 视图分辨率
 * @param {Object} dom Control DOMs / 表单 DOM 控件对象
 * @return {string} Processed text / 处理后的文本字符串
 */
const getText = function (feature, resolution, dom) {
  const type = dom.text.value;
  const maxResolution = dom.maxreso.value;
  let text = feature.get('name');

  if (resolution > maxResolution) {
    text = '';
  } else if (type === 'hide') {
    text = '';
  } else if (type === 'shorten') {
    text = truncate(text, 12);
  } else if (
    type === 'wrap' &&
    (!dom.placement || dom.placement.value !== 'line')
  ) {
    text = stringDivider(text, 16, '\n');
  }

  return text;
};

/**
 * Create dynamic ol/style/Text instance from user controls.
 * 根据界面表单配置动态创建 ol/style/Text 文本样式对象
 * @param {import('../src/ol/Feature.js').default} feature Feature / 矢量要素
 * @param {number} resolution View resolution / 视图分辨率
 * @param {Object} dom Control DOMs / 表单 DOM 控件对象
 * @return {Text} Text style instance / 文本样式实例
 */
const createTextStyle = function (feature, resolution, dom) {
  const align = dom.align.value;
  const baseline = dom.baseline.value;
  const size = dom.size.value;
  const height = dom.height.value;
  const offsetX = parseInt(dom.offsetX.value, 10);
  const offsetY = parseInt(dom.offsetY.value, 10);
  const weight = dom.weight.value;
  const placement = dom.placement ? dom.placement.value : undefined;
  const maxAngle = dom.maxangle ? parseFloat(dom.maxangle.value) : undefined;
  const overflow = dom.overflow ? dom.overflow.value === 'true' : undefined;
  const rotation = parseFloat(dom.rotation.value);

  // Dynamically load Google Open Sans font if requested / 按需动态注入 Open Sans Web 字体
  if (dom.font.value === "'Open Sans'" && !openSansAdded) {
    const openSans = document.createElement('link');
    openSans.href = 'https://fonts.googleapis.com/css?family=Open+Sans';
    openSans.rel = 'stylesheet';
    document.head.appendChild(openSans);
    openSansAdded = true;
  }
  const font = weight + ' ' + size + '/' + height + ' ' + dom.font.value;
  const fillColor = dom.color.value;
  const outlineColor = dom.outline.value;
  const outlineWidth = parseInt(dom.outlineWidth.value, 10);

  return new Text({
    textAlign: align === '' ? undefined : align,
    textBaseline: baseline,
    font: font,
    text: getText(feature, resolution, dom),
    fill: new Fill({color: fillColor}),
    stroke: new Stroke({color: outlineColor, width: outlineWidth}),
    offsetX: offsetX,
    offsetY: offsetY,
    placement: placement,
    maxAngle: maxAngle,
    overflow: overflow,
    rotation: rotation,
  });
};

// Polygons style function / 多边形要素样式函数
function polygonStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
    text: createTextStyle(feature, resolution, myDom.polygons),
  });
}

const vectorPolygons = new VectorLayer({
  source: new VectorSource({
    url: 'data/geojson/polygon-samples.geojson',
    format: new GeoJSON(),
  }),
  style: polygonStyleFunction,
});

// Lines style function / 折线要素样式函数
function lineStyleFunction(feature, resolution) {
  return new Style({
    stroke: new Stroke({
      color: 'green',
      width: 2,
    }),
    text: createTextStyle(feature, resolution, myDom.lines),
  });
}

const vectorLines = new VectorLayer({
  source: new VectorSource({
    url: 'data/geojson/line-samples.geojson',
    format: new GeoJSON(),
  }),
  style: lineStyleFunction,
});

// Points style function / 点要素样式函数
function pointStyleFunction(feature, resolution) {
  return new Style({
    image: new CircleStyle({
      radius: 10,
      fill: new Fill({color: 'rgba(255, 0, 0, 0.1)'}),
      stroke: new Stroke({color: 'red', width: 1}),
    }),
    text: createTextStyle(feature, resolution, myDom.points),
  });
}

const vectorPoints = new VectorLayer({
  source: new VectorSource({
    url: 'data/geojson/point-samples.geojson',
    format: new GeoJSON(),
  }),
  style: pointStyleFunction,
});

// Initialize map instance / 初始化地图实例
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorPolygons,
    vectorLines,
    vectorPoints,
  ],
  target: 'map',
  view: new View({
    center: [-8161939, 6095025],
    zoom: 8,
  }),
});

// Event listeners to refresh styles / 绑定表单按钮点击事件刷新对应图层样式
document
  .getElementById('refresh-points')
  .addEventListener('click', function () {
    vectorPoints.setStyle(pointStyleFunction);
  });

document.getElementById('refresh-lines').addEventListener('click', function () {
  vectorLines.setStyle(lineStyleFunction);
});

document
  .getElementById('refresh-polygons')
  .addEventListener('click', function () {
    vectorPolygons.setStyle(polygonStyleFunction);
  });

/**
 * Truncate long string and append ellipsis. / 截断超出长度的字符串并追加省略号
 * @param {string} string Input string / 输入字符串
 * @param {number} n Max character count / 最大保留字符数
 * @return {string} Truncated string / 截断后字符串
 */
function truncate(string, n) {
  return string.length > n ? string.slice(0, n - 1) + '…' : string.slice();
}

/**
 * Wrap string at whitespace or hyphen boundaries. / 在空格或破折号处自动分词折行
 * @param {string} str Input string / 输入字符串
 * @param {number} width Line wrap threshold / 折行宽度阈值
 * @param {string} spaceReplacer Separator character (e.g. \n) / 换行替换符
 * @return {string} Wrapped multi-line text / 折行后多行文本
 */
function stringDivider(str, width, spaceReplacer) {
  if (str.length > width) {
    let p = width;
    while (p > 0 && str[p] !== ' ' && str[p] !== '-') {
      p--;
    }
    if (p > 0) {
      let left;
      if (str.substring(p, p + 1) === '-') {
        left = str.substring(0, p + 1);
      } else {
        left = str.substring(0, p);
      }
      const right = str.substring(p + 1);
      return left + spaceReplacer + stringDivider(right, width, spaceReplacer);
    }
  }
  return str;
}
