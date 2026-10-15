import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {platformModifierKeyOnly} from '../src/ol/events/condition.js';
import DragPan from '../src/ol/interaction/DragPan.js';
import MouseWheelZoom from '../src/ol/interaction/MouseWheelZoom.js';
import {defaults} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize map with cooperative gesture interactions (two-finger touch or Cmd/Ctrl drag)
// 初始化带有协作手势（触屏双指平移、桌面端按住 Cmd/Ctrl 键拖拽平移与滚轮缩放）的地图实例
const map = new Map({
  interactions: defaults({dragPan: false, mouseWheelZoom: false}).extend([
    new DragPan({
      condition: function (event) {
        // Allow drag pan only with 2 fingers on touch screens or platform modifier key on desktops
        // 仅在触屏使用双指触摸或桌面端按下平台修饰键（Cmd/Ctrl）时允许平移地图
        return this.getPointerCount() === 2 || platformModifierKeyOnly(event);
      },
    }),
    new MouseWheelZoom({
      condition: platformModifierKeyOnly, // Zoom with mouse wheel only when Cmd/Ctrl is pressed / 仅按下修饰键时滚轮缩放
    }),
  ]),
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
