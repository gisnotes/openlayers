import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import OverviewMap from '../src/ol/control/OverviewMap.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import DragRotateAndZoom from '../src/ol/interaction/DragRotateAndZoom.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

const rotateWithView = document.getElementById('rotateWithView');

// Initialize customized overview map control with Thunderforest layer
// 初始化定制化鹰眼微缩地图控件，加载 Thunderforest 地形骑行图层
const overviewMapControl = new OverviewMap({
  // see in overviewmap-custom.html to see the custom CSS used
  // 自定义 CSS 样式类名
  className: 'ol-overviewmap ol-custom-overviewmap',
  layers: [
    new TileLayer({
      source: new OSM({
        'url':
          'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
          '?apikey=0e6fc415256d4fbb9b5166a718591d71',
      }),
    }),
  ],
  collapseLabel: '\u00BB',
  label: '\u00AB',
  collapsed: false,
});

// Toggle rotate with view behavior
// 切换是否随主视图同步旋转
rotateWithView.addEventListener('change', function () {
  overviewMapControl.setRotateWithView(this.checked);
});

// Initialize map with custom overview and drag-rotate-and-zoom interaction
// 初始化地图，挂载定制鹰眼控件与 Shift 键旋转缩放交互
const map = new Map({
  controls: defaultControls().extend([overviewMapControl]),
  interactions: defaultInteractions().extend([new DragRotateAndZoom()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [500000, 6000000],
    zoom: 7,
  }),
});
