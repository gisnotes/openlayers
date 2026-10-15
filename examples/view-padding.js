import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

/** @type {VectorSource<import('../src/ol/Feature.js').default<import('../src/ol/geom/SimpleGeometry.js').default>>} */
// Vector source with Switzerland boundary and points
// 包含瑞士边界和城市点位的矢量数据源
const source = new VectorSource({
  url: 'data/geojson/switzerland.geojson',
  format: new GeoJSON(),
});
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
  image: new CircleStyle({
    radius: 5,
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.6)',
    }),
    stroke: new Stroke({
      color: '#319FD3',
      width: 1,
    }),
  }),
});
const vectorLayer = new VectorLayer({
  source: source,
  style: style,
});

// Initialize view with global padding to offset center and rotation/zoom anchor
// 初始化视图，配置全局内边距（padding）以偏移中心点与旋转缩放锚点
const view = new View({
  center: fromLonLat([6.6339863, 46.5193823]),
  padding: [170, 50, 30, 150],
  zoom: 6,
});
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  target: 'map',
  view: view,
});

// Bind buttons after features are loaded
// 矢量要素加载完成后绑定交互按钮
vectorLayer.getSource().on('featuresloadend', function () {
  const zoomtoswitzerland = document.getElementById('zoomtoswitzerland');
  zoomtoswitzerland.addEventListener(
    'click',
    function () {
      const feature = source.getFeatures()[0];
      const polygon = feature.getGeometry();
      // Auto-fits within the unpadded viewport area
      // 自动在剔除 padding 后的有效区域内完整适配
      view.fit(polygon);
    },
    false,
  );

  const centerlausanne = document.getElementById('centerlausanne');
  centerlausanne.addEventListener(
    'click',
    function () {
      const feature = source.getFeatures()[1];
      const point = feature.getGeometry();
      // Centers on the unpadded area center
      // 自动居中对齐至有效区域正中心
      view.setCenter(point.getCoordinates());
    },
    false,
  );
});
