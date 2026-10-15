import {applyBackground, applyStyle} from 'ol-mapbox-style';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import {createXYZ} from '../src/ol/tilegrid.js';

// MapTiler cloud access key (replace with your own key in production)
// MapTiler 访问凭证密钥（生产环境请替换为您自己的有效密钥）
const key = 'EPhPi7Zr1GTS500UybLu';
const url = 'https://api.maptiler.com/maps/basic-4326/style.json?key=' + key;

// Match the server resolutions and grid dimensions for EPSG:4326
// 匹配服务端针对 EPSG:4326 全球 2:1 网格的分辨率金字塔与切片规则
const tileGrid = createXYZ({
  extent: [-180, -90, 180, 90],
  tileSize: 512,
  maxResolution: 180 / 512,
  maxZoom: 13,
});

// Create vector tile layer configured with EPSG:4326 projection
// 创建配置为 EPSG:4326 投影坐标系的矢量切片图层
const layer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    projection: 'EPSG:4326',
    tileGrid: tileGrid,
  }),
});

// Apply Mapbox Style JSON styling and background to the vector tile layer
// 将 Mapbox Style 规范的样式规则与背景色应用到 OpenLayers 矢量切片图层
applyStyle(layer, url, {resolutions: tileGrid.getResolutions()});
applyBackground(layer, url);

// Initialize Map with EPSG:4326 View
// 初始化采用 EPSG:4326 投影视图的地图实例
const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    projection: 'EPSG:4326',
    zoom: 0,
    center: [0, 30],
  }),
});
