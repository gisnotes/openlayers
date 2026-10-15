import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import WFS from '../src/ol/format/WFS.js';
import {
  and as andFilter,
  equalTo as equalToFilter,
  like as likeFilter,
} from '../src/ol/format/filter.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Vector source and layer for holding query results
// 用于承载查询结果矢量要素的数据源与图层
const vectorSource = new VectorSource();
const vector = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2,
    }),
  }),
});

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Base satellite layer from MapTiler
// MapTiler 卫星影像基础底图
const raster = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Initialize map view
// 初始化地图视图
const map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: [-8908887.277395891, 5381918.072437216],
    maxZoom: 19,
    zoom: 12,
  }),
});

// Generate a WFS GetFeature XML request with compound filters
// 使用复合过滤器生成符合 OGC WFS 规范的 GetFeature XML 请求
const featureRequest = new WFS().writeGetFeature({
  srsName: 'EPSG:3857',
  featureNS: 'http://openstreemap.org',
  featurePrefix: 'osm',
  featureTypes: ['water_areas'],
  outputFormat: 'application/json',
  filter: andFilter(
    likeFilter('name', 'Mississippi*'),
    equalToFilter('waterway', 'riverbank'),
  ),
});

// Post the request and add the received features to the vector layer
// 提交 HTTP POST 请求并将接收到的要素添加至矢量图层
fetch('https://ahocevar.com/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(featureRequest),
})
  .then(function (response) {
    return response.json();
  })
  .then(function (json) {
    const features = new GeoJSON().readFeatures(json);
    vectorSource.addFeatures(features);
    map.getView().fit(vectorSource.getExtent());
  });
