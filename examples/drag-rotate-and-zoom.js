import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import DragRotateAndZoom from '../src/ol/interaction/DragRotateAndZoom.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Extend default interactions with DragRotateAndZoom for Shift+Drag gesture
// 在默认交互集合的基础上添加 DragRotateAndZoom 交互，启用 Shift+拖拽 复合手势
const map = new Map({
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
