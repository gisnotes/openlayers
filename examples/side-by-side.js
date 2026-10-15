import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler API Key and attribution notices
// MapTiler API 访问密钥与版权信息
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Road street map tile layer
// 标准矢量道路路网瓦片图层
const roadLayer = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
    tileSize: 512,
    maxZoom: 22,
  }),
});

// Aerial satellite imagery tile layer
// 高分辨率卫星遥感航拍图层
const aerialLayer = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Single shared view instance across both maps
// 两张地图全局共享的单一 View 实例，实现原生零延迟联动
const view = new View({
  center: [-6655.5402445057125, 6709968.258934638],
  zoom: 13,
});

// First map instance: displaying Road layer
// 第一个地图实例：渲染道路图层，绑定共享 View
const map1 = new Map({
  target: 'roadMap',
  layers: [roadLayer],
  view: view,
});

// Second map instance: displaying Aerial layer
// 第二个地图实例：渲染卫星航拍图层，绑定同一个 View
const map2 = new Map({
  target: 'aerialMap',
  layers: [aerialLayer],
  view: view,
});
