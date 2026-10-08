import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Draw from '../src/ol/interaction/Draw.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Base map raster layer (OpenStreetMap)
// 基础底图栅格图层（OpenStreetMap）
const raster = new TileLayer({
  source: new OSM(),
});

// Vector source to store drawn features
// 用于存储所绘制要素的矢量数据源
const source = new VectorSource({wrapX: false});

// Vector layer to display the drawn features
// 用于展示所绘制要素的矢量图层
const vector = new VectorLayer({
  source: source,
});

// Initialize the map
// 初始化地图
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later / 全局变量，便于后续移除或重新绑定
function addInteraction() {
  const value = typeSelect.value;
  if (value !== 'None') {
    draw = new Draw({
      source: source,
      type: typeSelect.value,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle change event.
 * 处理下拉选项变更事件。
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

// Undo: remove the last point drawn on the current geometry
// 撤销：移除当前正在绘制几何图形的最后一个顶点
document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

addInteraction();
