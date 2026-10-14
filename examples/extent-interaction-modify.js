import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {never} from '../src/ol/events/condition.js';
import ExtentInteraction from '../src/ol/interaction/Extent.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {transformExtent} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

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
  }),
});

// Configure Extent interaction with predefined extent, disabling new creation while enabling dragging
// 配置 Extent 交互：预设初始范围，禁用新建矩形，启用已有范围的整体平移拖拽
const extent = new ExtentInteraction({
  extent: transformExtent([-10, -10, 10, 10], 'EPSG:4326', 'EPSG:3857'),
  createCondition: never, // do not create a new extent on pointer down / 禁止在鼠标按下时创建新的范围矩形
  drag: true, // drag existing extent / 允许整体拖拽移动已有范围矩形
  boxStyle: {
    'fill-color': 'rgba(255, 255, 255, 0.4)',
    'stroke-color': '#3399CC',
    'stroke-width': 1.25,
  },
});
map.addInteraction(extent);
