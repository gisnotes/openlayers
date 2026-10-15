import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import FullScreen from '../src/ol/control/FullScreen.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import DragRotateAndZoom from '../src/ol/interaction/DragRotateAndZoom.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Initialize map with FullScreen control and DragRotateAndZoom interaction
// 初始化带有 FullScreen 全屏控件与 DragRotateAndZoom 复合拖拽手势的地图实例
const map = new Map({
  controls: defaultControls().extend([new FullScreen()]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
        maxZoom: 20,
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [-33519607, 5616436],
    rotation: -Math.PI / 8,
    zoom: 8,
  }),
});
