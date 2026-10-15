import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Pre-instantiated OpenStreetMap tile source
// 预先声明的 OpenStreetMap 切片数据源实例
const source = new OSM();

// Instantiate an empty tile layer container without an initial source
// 实例化一个初始不含任何数据源的空白切片图层容器
const layer = new TileLayer();

// Create map and mount the sourceless layer
// 创建地图并挂载该无源图层（此时图层静默，不发起任何渲染与请求）
const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Mount data source dynamically on click
// 点击按钮：动态为图层装载数据源，激活瓦片拉取与渲染管线
document.getElementById('set-source').onclick = function () {
  layer.setSource(source);
};

// Unmount data source on click, freeing tile cache and stopping rendering
// 点击按钮：解绑数据源（传入 null），清空画面并切断强引用
document.getElementById('unset-source').onclick = function () {
  layer.setSource(null);
};
