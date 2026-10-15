import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ZoomSlider from '../src/ol/control/ZoomSlider.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize view with constrained spatial extent
// 初始化视图，配置空间边界范围约束（extent）
const view = new View({
  center: [328627.563458, 5921296.662223],
  zoom: 8,
  // Restrict panning within Western Europe / UK bounding box
  // 将漫游平移范围严格限制在西欧/英国局部地理包围盒内
  extent: [-572513.341856, 5211017.966314, 916327.095083, 6636950.728974],
});

// Initialize map with zoom slider control
// 初始化地图并挂载缩放滑块控件
new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  keyboardEventTarget: document,
  target: 'map',
  view: view,
  controls: defaultControls().extend([new ZoomSlider()]),
});
