import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import WKB from '../src/ol/format/WKB.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Base raster OpenStreetMap tile layer
// OpenStreetMap 基础栅格底图瓦片图层
const raster = new TileLayer({
  source: new OSM(),
});

// Hex-encoded Well-Known Binary (WKB) representation of a polygon
// 十六进制编码的 OGC 标准 Well-Known Binary (WKB) 多边形二进制数据流
const wkb =
  '0103000000010000000500000054E3A59BC4602540643BDF4F8D1739C05C8FC2F5284C4140EC51B81E852B34C0D578E926316843406F1283C0CAD141C01B2FDD2406012B40A4703D0AD79343C054E3A59BC4602540643BDF4F8D1739C0';

// Instantiate WKB binary format parser
// 实例化 WKB 二进制格式解析器
const format = new WKB();

// Decode WKB stream and transform coordinates from EPSG:4326 to EPSG:3857
// 反序列化 WKB 数据流并直接完成坐标从 4326 到 3857 的投影转换
const feature = format.readFeature(wkb, {
  dataProjection: 'EPSG:4326',
  featureProjection: 'EPSG:3857',
});

// Mount parsed feature into a vector layer
// 将解析出的要素装载至矢量图层
const vector = new VectorLayer({
  source: new VectorSource({
    features: [feature],
  }),
});

// Initialize map centered on the polygon feature
// 初始化地图，居中对准多边形要素
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [2952104.0199, -3277504.823],
    zoom: 4,
  }),
});
