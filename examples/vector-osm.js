import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import OSMXML from '../src/ol/format/OSMXML.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {bbox as bboxStrategy} from '../src/ol/loadingstrategy.js';
import {transformExtent} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

let map = null;

// Style rules mapped by OSM tag keys and regular expressions / 按 OSM 标签键与正则表达式匹配的样式规则表
const styles = {
  'amenity': {
    'parking': new Style({
      stroke: new Stroke({
        color: 'rgba(170, 170, 170, 1.0)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(170, 170, 170, 0.3)',
      }),
    }),
  },
  'building': {
    '.*': new Style({
      zIndex: 100,
      stroke: new Stroke({
        color: 'rgba(246, 99, 79, 1.0)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(246, 99, 79, 0.3)',
      }),
    }),
  },
  'highway': {
    'service': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 2,
      }),
    }),
    '.*': new Style({
      stroke: new Stroke({
        color: 'rgba(255, 255, 255, 1.0)',
        width: 3,
      }),
    }),
  },
  'landuse': {
    'forest|grass|allotments': new Style({
      stroke: new Stroke({
        color: 'rgba(140, 208, 95, 1.0)',
        width: 1,
      }),
      fill: new Fill({
        color: 'rgba(140, 208, 95, 0.3)',
      }),
    }),
  },
  'natural': {
    'tree': new Style({
      image: new CircleStyle({
        radius: 2,
        fill: new Fill({
          color: 'rgba(140, 208, 95, 1.0)',
        }),
        stroke: null,
      }),
    }),
  },
};

// Vector source with Overpass API bbox loader / 配置 Overpass API 视口范围加载器的矢量数据源
const vectorSource = new VectorSource({
  format: new OSMXML(),
  loader: function (extent, resolution, projection, success, failure) {
    // Transform extent from map projection to WGS84 / 将视口范围从当前地图投影转换为 EPSG:4326 经纬度
    const epsg4326Extent = transformExtent(extent, projection, 'EPSG:4326');
    const client = new XMLHttpRequest();
    client.open('POST', 'https://overpass-api.de/api/interpreter');
    client.addEventListener('load', function () {
      const features = new OSMXML().readFeatures(client.responseText, {
        featureProjection: map.getView().getProjection(),
      });
      vectorSource.addFeatures(features);
      success(features);
    });
    client.addEventListener('error', failure);

    // Build Overpass QL query bounded by longitude [-180, 180] / 构建带经度钳位保护的 Overpass QL 空间查询语句
    const query =
      '(node(' +
      epsg4326Extent[1] +
      ',' +
      Math.max(epsg4326Extent[0], -180) +
      ',' +
      epsg4326Extent[3] +
      ',' +
      Math.min(epsg4326Extent[2], 180) +
      ');rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out meta;';
    client.send(query);
  },
  strategy: bboxStrategy,
});

// Vector layer with rule-based style matcher / 基于 OSM 标签属性规则匹配样式的矢量图层
const vector = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    for (const key in styles) {
      const value = feature.get(key);
      if (value !== undefined) {
        for (const regexp in styles[key]) {
          if (new RegExp(regexp).test(value)) {
            return styles[key][regexp];
          }
        }
      }
    }
    return null;
  },
});

// MapTiler satellite basemap / MapTiler 卫星影像底图
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const raster = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Initialize map centered on Lausanne, Switzerland / 初始化地图并定位至瑞士洛桑
map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: [739218, 5906096],
    maxZoom: 19,
    zoom: 17,
  }),
});
