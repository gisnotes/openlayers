import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

const viewport = document.getElementById('map');

/**
 * Calculate minimum zoom level to ensure only a single world is visible horizontally.
 * 计算最小缩放级别，确保视口中横向只呈现单个世界切片，防止多次平铺重复。
 * @return {number} Calculated min zoom.
 */
function getMinZoom() {
  const width = viewport.clientWidth;
  return Math.ceil(Math.LOG2E * Math.log(width / 256));
}

const initialZoom = getMinZoom();

// Initialize view with dynamic minZoom constraint
// 使用动态计算的 minZoom 约束初始化视图
const view = new View({
  center: [0, 0],
  minZoom: initialZoom,
  zoom: initialZoom,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

// Update minZoom dynamically upon window resize
// 监听窗口尺寸变化，动态更新视图的最小缩放级别
window.addEventListener('resize', function () {
  const minZoom = getMinZoom();
  if (minZoom !== view.getMinZoom()) {
    view.setMinZoom(minZoom);
  }
});
