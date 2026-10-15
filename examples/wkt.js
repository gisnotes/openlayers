import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import WKT from '../src/ol/format/WKT.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Base raster OpenStreetMap tile layer
// OpenStreetMap 基础栅格底图瓦片图层
const raster = new TileLayer({
  source: new OSM(),
});

// WKT string defining a polygon in WGS84 coordinates (longitude latitude)
// OGC 标准 WKT 格式的多边形纯文本定义（基于 WGS84 经纬度坐标系）
const wkt =
  'POLYGON((10.689 -25.092, 34.595 ' +
  '-20.170, 38.814 -35.639, 13.502 ' +
  '-39.155, 10.689 -25.092))';

// Instantiate WKT format parser
// 实例化 WKT 几何格式解析器
const format = new WKT();

// Parse WKT string into feature while reprojecting from EPSG:4326 to EPSG:3857
// 解析 WKT 文本为矢量要素，并在解析流水线中直接完成从 4326 到 3857 的投影转换
const feature = format.readFeature(wkt, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857',
});

// Create vector layer containing the parsed feature
// 创建包含已解析要素的矢量图层
const vector = new VectorLayer({
  source: new VectorSource({
    features: [feature],
  }),
});

// Initialize map centered on the polygon feature in southern Africa
// 初始化地图，居中对准非洲南部多边形要素
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [2952104.0199, -3277504.823],
    zoom: 4,
  }),
});
