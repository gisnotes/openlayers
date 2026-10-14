import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize map with constrainResolution enabled to snap pinch zoom to integers
// 初始化地图实例，配置 constrainResolution: true 以便在双指捏合缩放结束后自动吸附到整数缩放级别
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    constrainResolution: true, // Snap to integer zoom levels / 约束至整数层级
  }),
});
