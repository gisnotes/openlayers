import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Attribution from '../src/ol/control/Attribution.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize custom Attribution control with initial non-collapsible state
// 初始化自定义版权署名控件，初始设定为不可折叠
const attribution = new Attribution({
  collapsible: false,
});

// Initialize map and replace default attribution control with our custom instance
// 初始化地图并禁用默认版权控件，注入我们自定义的 attribution 实例
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  controls: defaultControls({attribution: false}).extend([attribution]),
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Responsive handler: update collapsible state based on container width threshold (600px)
// 响应式尺寸检测：当视口宽度小于 600px 时启用折叠，并在小屏下默认收拢
function checkSize() {
  const small = map.getSize()[0] < 600;
  attribution.setCollapsible(small);
  attribution.setCollapsed(small);
}

// Listen to container size changes and run initial evaluation
// 监听地图容器尺寸变动事件，并执行初始检测
map.on('change:size', checkSize);
checkSize();
