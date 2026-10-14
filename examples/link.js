import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Link from '../src/ol/interaction/Link.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize the map
// 初始化地图实例
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

// Create Link interaction to sync map state with URL query parameters
// 创建 Link 交互实例，用于在地图状态与 URL 查询参数之间实现双向同步
const link = new Link();

const exampleCheckbox = document.getElementById('example-checkbox');
exampleCheckbox.addEventListener('change', function () {
  if (exampleCheckbox.checked) {
    link.update('example', 'checked');
  } else {
    // updating to null will remove the param from the URL
    // 将参数值更新为 null 可从 URL 中移除该查询参数
    link.update('example', null);
  }
});

// Track changes to the 'example' URL parameter
// 监听 'example' URL 参数变化以响应浏览器前进/后退
const initialValue = link.track('example', (newValue) => {
  exampleCheckbox.checked = newValue === 'checked';
});

exampleCheckbox.checked = initialValue === 'checked';

map.addInteraction(link);
