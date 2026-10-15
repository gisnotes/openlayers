import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {tile} from '../src/ol/loadingstrategy.js';
import {useGeographic} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import {createXYZ} from '../src/ol/tilegrid.js';

// Enable geographic coordinates across the entire OpenLayers API / 激活全局地理经纬度坐标模式
useGeographic();

// Vector source configured with GeoServer WFS and tile strategy / 配置 GeoServer WFS 与切片加载策略的矢量数据源
const vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: function (extent) {
    // Under useGeographic(), extent is [minLon, minLat, maxLon, maxLat] / 在 useGeographic 模式下，extent 直接为经纬度数组
    return (
      'https://ahocevar.com/geoserver/wfs?service=WFS&' +
      'version=1.1.0&request=GetFeature&typename=osm:water_areas&' +
      'outputFormat=application/json&srsname=EPSG:4326&' +
      'bbox=' +
      extent.join(',') +
      ',EPSG:4326'
    );
  },
  strategy: tile(createXYZ({tileSize: 512})),
});

// Water areas vector layer with blue stroke / 水系矢量图层，应用蓝色描边样式
const vector = new VectorLayer({
  source: vectorSource,
  style: new Style({
    stroke: new Stroke({
      color: 'rgba(0, 0, 255, 1.0)',
      width: 2,
    }),
  }),
});

// MapTiler satellite background layer / MapTiler 卫星影像背景底图
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

// Initialize map with geographic coordinates center / 初始化地图并直接传入经纬度中心点
const map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: [-80.0298, 43.4578],
    maxZoom: 19,
    zoom: 12,
  }),
});
