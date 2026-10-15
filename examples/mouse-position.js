import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import MousePosition from '../src/ol/control/MousePosition.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import {createStringXY} from '../src/ol/coordinate.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize mouse position control targeted to external DOM container
// 初始化鼠标位置控件，并挂载到地图外部的 DOM 容器中
const mousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(4),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  // 若需将鼠标位置控件放置在地图内部，可注释以下两行配置
  className: 'custom-mouse-position',
  target: document.getElementById('mouse-position'),
});

// Initialize map with mouse position control
// 初始化地图并挂载鼠标位置控件
const map = new Map({
  controls: defaultControls().extend([mousePositionControl]),
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

// Handle projection select change
// 处理坐标投影切换
const projectionSelect = document.getElementById('projection');
projectionSelect.addEventListener('change', function (event) {
  mousePositionControl.setProjection(event.target.value);
});

// Handle coordinate precision change
// 处理坐标小数精度切换
const precisionInput = document.getElementById('precision');
precisionInput.addEventListener('change', function (event) {
  const format = createStringXY(event.target.valueAsNumber);
  mousePositionControl.setCoordinateFormat(format);
});
