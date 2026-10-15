import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';

// Create vector layer with ecoregions data
// 创建包含生态区数据的矢量图层
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/ecoregions.json',
    format: new GeoJSON(),
  }),
  background: 'white',
  style: {
    'fill-color': ['string', ['get', 'COLOR'], '#eeeeee'],
  },
});

// Initialize map
// 初始化地图
const map = new Map({
  layers: [vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

const info = document.getElementById('info');

let currentFeature;
/**
 * Display feature info at pixel position
 * 在指定像素位置显示要素信息
 * @param {import('../src/ol/pixel.js').Pixel} pixel Pixel coordinates. / 像素坐标。
 * @param {EventTarget} target Event target element. / 事件目标元素。
 */
const displayFeatureInfo = function (pixel, target) {
  // Ignore hits on map controls
  // 忽略对地图原生控件的命中
  const feature = target.closest('.ol-control')
    ? undefined
    : map.forEachFeatureAtPixel(pixel, function (feature) {
        return feature;
      });
  if (feature) {
    info.style.left = pixel[0] + 'px';
    info.style.top = pixel[1] + 'px';
    if (feature !== currentFeature) {
      info.style.visibility = 'visible';
      info.innerText = feature.get('ECO_NAME');
    }
  } else {
    info.style.visibility = 'hidden';
  }
  currentFeature = feature;
};

// Pointer move listener
// 指针移动事件监听
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    info.style.visibility = 'hidden';
    currentFeature = undefined;
    return;
  }
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// Click listener for mobile and touch devices
// 点击事件监听（适配移动端与触控设备）
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel, evt.originalEvent.target);
});

// Hide tooltip when pointer leaves map container
// 当光标离开地图容器时隐藏提示框
map.getTargetElement().addEventListener('pointerleave', function () {
  currentFeature = undefined;
  info.style.visibility = 'hidden';
});
