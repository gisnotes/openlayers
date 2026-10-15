import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import TileJSON from '../src/ol/source/TileJSON.js';

const key = 'EPhPi7Zr1GTS500UybLu';

// Initialize map with layer-level zoom limits
// 初始化带有图层级缩放可见性区间控制的地图实例
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      maxZoom: 14, // Visible at zoom levels 14 and below (zoom <= 14) / 14级及以下可见
      source: new OSM(),
    }),
    new TileLayer({
      minZoom: 14, // Visible at zoom levels above 14 (zoom > 14) / 超过14级可见
      source: new TileJSON({
        url: 'https://api.maptiler.com/maps/outdoor-v2/tiles.json?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
  view: new View({
    center: fromLonLat([-112.18688965, 36.057944835]),
    zoom: 15,
    maxZoom: 18,
    constrainOnlyCenter: true,
  }),
});
