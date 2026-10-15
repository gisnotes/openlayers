import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Load GeoJSON vector source containing Switzerland boundary and cities
// 加载包含瑞士国界多边形和城市要素的 GeoJSON 矢量数据源
const source = new VectorSource({
  url: 'data/geojson/switzerland.geojson',
  format: new GeoJSON(),
});

const vectorLayer = new VectorLayer({
  source: source,
  style: {
    'fill-color': 'rgba(255, 255, 255, 0.6)',
    'stroke-width': 1,
    'stroke-color': '#319FD3',
    'circle-radius': 5,
    'circle-fill-color': 'rgba(255, 255, 255, 0.6)',
    'circle-stroke-width': 1,
    'circle-stroke-color': '#319FD3',
  },
});

const view = new View({
  center: [0, 0],
  zoom: 1,
});

// Initialize map
// 初始化地图
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

// Fit polygon geometry with custom padding
// 在预留内边距的可用视口区域内自适应完整展示多边形几何体
const zoomtoswitzerland = document.getElementById('zoomtoswitzerland');
zoomtoswitzerland.addEventListener(
  'click',
  function () {
    const feature = source.getFeatures()[0];
    const polygon = feature.getGeometry();
    view.fit(polygon, {padding: [170, 50, 30, 150]});
  },
  false,
);

// Fit point geometry with padding and minimum resolution constraint
// 自适应点要素，配置内边距并设定最小分辨率约束
const zoomtolausanne = document.getElementById('zoomtolausanne');
zoomtolausanne.addEventListener(
  'click',
  function () {
    const feature = source.getFeatures()[1];
    const point = feature.getGeometry();
    view.fit(point, {padding: [170, 50, 30, 150], minResolution: 50});
  },
  false,
);

// Center on Lausanne coordinate at specific pixel location
// 将洛桑地理坐标精准对齐到特定的屏幕像素点位置
const centerlausanne = document.getElementById('centerlausanne');
centerlausanne.addEventListener(
  'click',
  function () {
    const feature = source.getFeatures()[1];
    const point = feature.getGeometry();
    const size = map.getSize();
    view.centerOn(point.getCoordinates(), size, [570, 500]);
  },
  false,
);
