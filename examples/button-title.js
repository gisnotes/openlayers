import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize map with an initial rotation
// 初始化带有初始旋转角的地图实例
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [-8730000, 5930000],
    rotation: Math.PI / 5,
    zoom: 8,
  }),
});

// Query default control buttons and bind Bootstrap Tooltips
// 查找默认缩放和旋转重置按钮，挂载 Bootstrap Tooltip 提示组件
document
  .querySelectorAll('.ol-zoom-in, .ol-zoom-out, .ol-rotate-reset')
  .forEach(function (el) {
    new bootstrap.Tooltip(el, {
      container: '#map', // Ensure tooltips display properly in fullscreen mode / 确保全屏模式下提示依然能够正常显示在地图容器内
    });
  });
