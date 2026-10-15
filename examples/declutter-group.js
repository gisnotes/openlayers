import {apply} from 'ol-mapbox-style';
import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getCenter} from '../src/ol/extent.js';
import Point from '../src/ol/geom/Point.js';
import {fromExtent} from '../src/ol/geom/Polygon.js';
import LayerGroup from '../src/ol/layer/Group.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';

// Bounding box extent for the demonstration polygon in Web Mercator coordinates
// 演示多边形的 Web 墨卡托平面坐标包围盒范围
const square = [-12e6, 3.5e6, -10e6, 5.5e6];

// Vector overlay layer using 'separate' declutter group to avoid competing with MapTiler labels
// 矢量覆盖物图层：采用 'separate' 独立避让组，避免与下方 Mapbox 矢量瓦片图层的文字发生互相剔除
const overlay = new VectorLayer({
  declutter: 'separate',
  source: new VectorSource({
    features: [
      new Feature({
        geometry: fromExtent(square),
        text: 'Polygon above Mapbox styled layers',
      }),
      new Feature({
        geometry: new Point([-11e6, 4.3e6]),
        text: 'Point above Mapbox styled layers',
      }),
    ],
  }),
  // Modern declarative Flat Style configuration
  // 现代声明式 Flat Style 扁平样式配置
  style: {
    'stroke-color': 'rgba(180, 180, 255, 1)',
    'stroke-width': 1,
    'fill-color': 'rgba(200, 200, 255, 0.85)',
    'text-value': ['get', 'text'],
    'text-font': 'bold 14px sans-serif',
    'text-offset-y': -12,
    'text-overflow': true,
    'circle-radius': 5,
    'circle-fill-color': 'rgba(180, 180, 255, 1)',
    'circle-stroke-color': 'rgba(255, 255, 255, 1)',
  },
});

// Layer group loading Mapbox Vector Tiles from MapTiler Streets style
// 图层组：利用 ol-mapbox-style 的 apply 函数加载 MapTiler Streets 矢量瓦片样式
const layer = new LayerGroup();
apply(
  layer,
  'https://api.maptiler.com/maps/streets-v2/style.json?key=EPhPi7Zr1GTS500UybLu',
);

// Initialize map containing both Mapbox vector tiles and the separated overlay layer
// 初始化地图实例：同时挂载 Mapbox 矢量瓦片底图与隔离避让的矢量标注层
const map = new Map({
  target: 'map',
  view: new View({
    center: getCenter(square),
    zoom: 3.9,
  }),
  layers: [layer, overlay],
});
