import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';

// Vector layer configured with declarative flat style and decluttering / 配置声明式扁平样式与文字避让的矢量图层
const vectorLayer = new VectorLayer({
  background: '#1a2b39',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/ecoregions.json',
    format: new GeoJSON(),
  }),
  style: {
    'fill-color': ['string', ['get', 'COLOR'], '#eee'],
    'text-value': ['coalesce', ['get', 'ECO_NAME'], 'unknown'],
    'text-font': 'bold 12px "Open Sans", "Arial Unicode MS", sans-serif',
    'text-fill-color': '#333',
    'text-stroke-color': 'rgba(255,255,255,0.8)',
    'text-stroke-width': 2,
    'text-overflow': true,
    'text-declutter-mode': 'declutter',
    // 'text-rotate-with-view': true,
  },
  declutter: true,
});

// Initialize map instance / 初始化地图实例
const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

// Feature overlay layer for hover highlighting / 用于悬停高亮的专用矢量覆盖层
const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: {
    'stroke-color': 'rgba(255, 255, 255, 0.7)',
    'stroke-width': 2,
  },
});

let highlight;

/**
 * Display feature attribute information and update hover overlay.
 * 检测像素位置的要素属性信息并更新高亮图层状态
 * @param {import('../src/ol/pixel.js').Pixel} pixel Screen coordinates / 屏幕像素坐标
 */
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });

  const info = document.getElementById('info');
  if (feature) {
    info.innerHTML = feature.get('ECO_NAME') || '&nbsp;';
  } else {
    info.innerHTML = '&nbsp;';
  }

  // Update highlight feature in overlay / 在高亮覆盖层中替换目标要素
  if (feature !== highlight) {
    if (highlight) {
      featureOverlay.getSource().removeFeature(highlight);
    }
    if (feature) {
      featureOverlay.getSource().addFeature(feature);
    }
    highlight = feature;
  }
};

// Pointer move listener with dragging check / 监听光标悬停移动并过滤拖拽操作
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});

// Click listener for feature inspection / 监听地图点击交互
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
