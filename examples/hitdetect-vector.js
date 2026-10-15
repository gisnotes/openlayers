import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';

// Ecoregions vector layer with attribute-based fill styling / 基于 GeoJSON 属性着色的全球生态区矢量图层
const vectorLayer = new VectorLayer({
  background: '#1a2b39',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/ecoregions.json',
    format: new GeoJSON(),
  }),
  style: {
    'fill-color': ['string', ['get', 'COLOR_NNH'], '#eee'],
  },
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

// Dedicated vector overlay for fast hover highlighting / 用于悬停快速高亮的专用矢量覆盖层
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
 * Display feature information and update hover overlay.
 * 检测像素位置的要素信息并更新高亮图层状态
 * @param {import('../src/ol/pixel.js').Pixel} pixel Screen pixel coordinate / 屏幕像素坐标
 */
const displayFeatureInfo = function (pixel) {
  // Use high-performance layer-level hit detection / 调用图层级的高性能拾取方法
  vectorLayer.getFeatures(pixel).then(function (features) {
    const feature = features.length ? features[0] : undefined;
    const info = document.getElementById('info');
    if (features.length) {
      info.innerHTML = feature.get('ECO_NAME') + ': ' + feature.get('NNH_NAME');
    } else {
      info.innerHTML = '&nbsp;';
    }

    // Toggle highlight feature in overlay / 在覆盖层中切换高亮要素
    if (feature !== highlight) {
      if (highlight) {
        featureOverlay.getSource().removeFeature(highlight);
      }
      if (feature) {
        featureOverlay.getSource().addFeature(feature);
      }
      highlight = feature;
    }
  });
};

// Pointer move listener with dragging guard / 监听光标悬停移动并过滤拖拽过程
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});

// Click listener for feature selection / 监听地图点击拾取
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
