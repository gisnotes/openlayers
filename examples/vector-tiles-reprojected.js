import {applyBackground, applyStyle} from 'ol-mapbox-style';
import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import {fromLonLat} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import {createXYZ} from '../src/ol/tilegrid.js';

// Register Proj4 definition for North Pole Lambert Azimuthal Equal Area (ESRI:102017)
// 注册北极朗伯等面积方位投影（North Pole Lambert Azimuthal Equal Area，ESRI:102017）的 Proj4 投影定义
proj4.defs(
  'ESRI:102017',
  '+proj=laea +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs',
);
register(proj4);

// MapTiler access key (replace with your personal key in production)
// MapTiler 访问凭据密钥（生产环境请替换为专属密钥）
const key = 'EPhPi7Zr1GTS500UybLu';
const url = 'https://api.maptiler.com/maps/basic-4326/style.json?key=' + key;

// Create vector tile layer with EPSG:4326 source projection
// 创建矢量切片图层，指定源数据为 EPSG:4326 地理经纬度投影
const layer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    projection: 'EPSG:4326',
    // Match server tile resolutions and extent for EPSG:4326
    // 匹配服务端针对 EPSG:4326 的切片分辨率金字塔与范围
    tileGrid: createXYZ({
      extent: [-180, -90, 180, 90],
      tileSize: 512,
      maxResolution: 180 / 512,
      maxZoom: 13,
    }),
  }),
});

// Apply Mapbox style rules and background
// 应用 Mapbox Style 样式规则与背景色
applyStyle(layer, url);
applyBackground(layer, url);

// Initialize map with Arctic polar projection ESRI:102017, centered at North Pole [0, 90]
// 初始化地图实例，视图采用北极极地投影 ESRI:102017，中心定位在北极点 [0, 90]
const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    projection: 'ESRI:102017',
    minZoom: 3,
    zoom: 4,
    center: fromLonLat([0, 90], 'ESRI:102017'),
  }),
});
