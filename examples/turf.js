import {along} from '@turf/along';
import {length} from '@turf/length';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Vector source to hold original road and generated milestone markers
// 存放原始道路要素与计算生成的等间距里程桩标记要素的矢量数据源
const source = new VectorSource();

// Fetch roads GeoJSON and analyze with Turf.js
// 异步拉取首尔道路网络 GeoJSON 并结合 Turf.js 进行空间分析
fetch('data/geojson/roads-seoul.geojson')
  .then(function (response) {
    return response.json();
  })
  .then(function (json) {
    const format = new GeoJSON();
    // Parse GeoJSON features in original EPSG:4326 coordinates for Turf.js
    // 解析出保持原生 WGS84 经纬度（EPSG:4326）的要素供 Turf 进行测地线计算
    const features = format.readFeatures(json);
    const street = features[0];

    // convert to a turf.js feature
    // 将 OpenLayers 要素无损序列化为 Turf.js 原生 GeoJSON 对象
    const turfLine = format.writeFeatureObject(street);

    // show a marker every 200 meters (0.2 km)
    // 设定里程桩采样间距：每隔 200 米（0.2 千米）
    const distance = 0.2;

    // get the line length in kilometers using Turf geodesic calculation
    // 利用 Turf 大圆测地线算法计算折线的真实物理总长度（单位：千米）
    const lineLength = length(turfLine, {units: 'kilometers'});
    for (let i = 1; i <= lineLength / distance; i++) {
      // Sample geodesic point along the line at specified distance
      // 沿道路线按指定累加距离进行球面测地定长插值取点
      const turfPoint = along(turfLine, i * distance, {units: 'kilometers'});

      // convert the generated point to a OpenLayers feature
      // 将生成的 Turf GeoJSON 点反向反序列化为 OpenLayers 要素
      const marker = format.readFeature(turfPoint);
      // Transform coordinate from EPSG:4326 to EPSG:3857 for map rendering
      // 将要素坐标由 4326 经纬度投影至 3857 墨卡托视图空间
      marker.getGeometry().transform('EPSG:4326', 'EPSG:3857');
      source.addFeature(marker);
    }

    // Reproject original road geometry and add to source
    // 将原始道路几何投影并装载至数据源
    street.getGeometry().transform('EPSG:4326', 'EPSG:3857');
    source.addFeature(street);
  });

// Vector layer to display roads and milestone points
// 渲染道路与里程桩的矢量图层
const vectorLayer = new VectorLayer({
  source: source,
});

// Base OpenStreetMap tile layer
// OpenStreetMap 基础底图
const rasterLayer = new TileLayer({
  source: new OSM(),
});

// Initialize map centered on Seoul road network
// 初始化地图实例，视口居中于首尔道路网络
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([126.980366, 37.52654]),
    zoom: 15,
  }),
});
