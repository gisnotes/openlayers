import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize map with OSM layer
// 初始化地图并加载 OSM 瓦片图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Mount map to initial target container map1
// 将地图初始挂载至 map1 目标容器
map.setTarget('map1');

const teleportButton = document.getElementById('teleport');

// Toggle target container between map1 and map2 on button click
// 点击按钮在 map1 和 map2 目标容器之间无损瞬移切换
teleportButton.addEventListener(
  'click',
  function () {
    const target = map.getTarget() === 'map1' ? 'map2' : 'map1';
    map.setTarget(target);
  },
  false,
);
