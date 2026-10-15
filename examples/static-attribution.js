import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Attribution from '../src/ol/control/Attribution.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize Attribution control with static attribution string (independent of layer lifecycle)
// 初始化版权署名控件并传入常驻静态 HTML 字符串（独立于图层生命周期）
const attribution = new Attribution({
  collapsible: false,
  attributions: `<a href="https://openlayers.org">I'm a static attribution. I never disappear</a>`,
});

// Create map and inject custom attribution control while disabling default
// 创建地图实例，禁用默认版权控件并注入包含静态常驻版权的自定义控件
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

// Toggle visibility of all layers on button click to demonstrate static persistence
// 按钮点击事件：切换地图中所有图层的显隐状态，验证即使无可见图层静态版权依然常驻
document.getElementById('toggleLayerButton').addEventListener('click', () => {
  map.getLayers().forEach((l) => {
    l.setVisible(l.getVisible() ? false : true);
  });
});
