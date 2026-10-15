import OL3Parser from 'jsts/org/locationtech/jts/io/OL3Parser.js';
import BufferOp from 'jsts/org/locationtech/jts/operation/buffer/BufferOp.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import LineString from '../src/ol/geom/LineString.js';
import LinearRing from '../src/ol/geom/LinearRing.js';
import MultiLineString from '../src/ol/geom/MultiLineString.js';
import MultiPoint from '../src/ol/geom/MultiPoint.js';
import MultiPolygon from '../src/ol/geom/MultiPolygon.js';
import Point from '../src/ol/geom/Point.js';
import Polygon from '../src/ol/geom/Polygon.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Vector source to hold roads and their computed buffer polygons
// 用于存放道路及其计算后缓冲区多边形要素的矢量数据源
const source = new VectorSource();

// Fetch roads GeoJSON and perform JSTS buffer operations
// 异步拉取道路 GeoJSON 数据并执行 JSTS 空间拓扑缓冲区运算
fetch('data/geojson/roads-seoul.geojson')
  .then(function (response) {
    return response.json();
  })
  .then(function (json) {
    const format = new GeoJSON();
    // Parse GeoJSON features and project coordinates to EPSG:3857 (meters)
    // 解析 GeoJSON 要素并将坐标投影到 EPSG:3857 墨卡托投影（单位为米）
    const features = format.readFeatures(json, {
      featureProjection: 'EPSG:3857',
    });

    // Initialize OL3Parser and inject OpenLayers geometry constructors
    // 实例化 OL3Parser 并依赖注入 OpenLayers 几何类构造函数
    const parser = new OL3Parser(undefined, undefined);
    parser.inject(
      Point,
      LineString,
      LinearRing,
      Polygon,
      MultiPoint,
      MultiLineString,
      MultiPolygon,
    );

    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      // convert the OpenLayers geometry to a JSTS geometry
      // 将 OpenLayers 几何体转换为 JSTS 拓扑几何对象
      const jstsGeom = parser.read(feature.getGeometry());

      // create a buffer of 40 meters around each line
      // 对道路线要素执行双向向外扩张 40 米的缓冲区分析计算
      const buffered = BufferOp.bufferOp(jstsGeom, 40);

      // convert back from JSTS and replace the geometry on the feature
      // 将计算生成的 JSTS 多边形转回 OpenLayers 几何体并替换要素几何
      feature.setGeometry(parser.write(buffered));
    }

    // Add buffered features into vector source
    // 将生成缓冲区的要素批量注入矢量源触发上屏渲染
    source.addFeatures(features);
  });

// Create vector layer for the buffered road polygons
// 承载道路缓冲区多边形的矢量图层
const vectorLayer = new VectorLayer({
  source: source,
});

// Base OpenStreetMap tile layer
// OpenStreetMap 底图瓦片图层
const rasterLayer = new TileLayer({
  source: new OSM(),
});

// Initialize map centered on Seoul
// 初始化地图实例，视口居中于首尔市中心
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([126.979293, 37.528787]),
    zoom: 15,
  }),
});
