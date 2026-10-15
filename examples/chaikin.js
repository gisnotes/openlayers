import smooth from 'chaikin-smooth';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Draw from '../src/ol/interaction/Draw.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

/**
 * Apply Chaikin's corner-cutting algorithm iteratively to smooth a coordinate path
 * 迭代调用 Chaikin 割角切角平滑算法平滑给定的坐标序列
 * @param {Array<Array<number>>} path Input coordinate array / 原始坐标数组
 * @param {number} numIterations Number of smoothing rounds / 平滑迭代轮次
 * @return {Array<Array<number>>} Smoothed coordinate array / 平滑后的坐标数组
 */
function makeSmooth(path, numIterations) {
  // Clamp iterations between 1 and 10 to prevent exponential vertex explosion
  // 将迭代次数限制在 1 到 10 之间，防止顶点数量指数级爆炸
  numIterations = Math.min(Math.max(numIterations, 1), 10);
  while (numIterations > 0) {
    path = smooth(path);
    numIterations--;
  }
  return path;
}

// Vector source storing the drawn features
// 存储用户绘制要素的矢量数据源
const vectorSource = new VectorSource({});

// Main map instance with OSM basemap and vector overlay
// 地图主实例，包含半透明 OSM 底图与矢量绘制图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
      opacity: 0.5,
    }),
    new VectorLayer({
      source: vectorSource,
    }),
  ],
  target: 'map',
  view: new View({
    center: [1078373.595, 6871994.591],
    zoom: 5,
  }),
});

const shallSmoothen = document.getElementById('shall-smoothen');
const numIterations = document.getElementById('iterations');

// Add Draw interaction for LineString
// 添加折线交互绘制工具
const draw = new Draw({
  source: vectorSource,
  type: 'LineString',
  // Stop drawing when double-clicking
});
map.addInteraction(draw);

// Intercept drawend to apply Chaikin smoothing before storing into vector source
// 监听 drawend 绘制完成事件，在几何最终确认前执行 Chaikin 算法平滑重置坐标
draw.on('drawend', function (event) {
  if (!shallSmoothen.checked) {
    return;
  }
  const feat = event.feature;
  const geometry = feat.getGeometry();
  const coords = geometry.getCoordinates();
  const smoothened = makeSmooth(coords, parseInt(numIterations.value, 10) || 5);
  geometry.setCoordinates(smoothened);
});
