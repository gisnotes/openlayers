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

// Vector source to store finished drawn features
// 用于存储绘制完成要素的矢量数据源
const source = new VectorSource({wrapX: false});

// Vector layer displaying the features (uses default OpenLayers style for finished features)
// 用于显示要素的矢量图层（绘制完成后的要素使用图层的默认样式显示）
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

// Custom sketch styles for each geometry type during the drawing interaction
// 绘制交互进行过程中针对各几何类型的自定义草绘样式（使用声明式字面量样式语法）
const styles = {
  Point: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
  },
  LineString: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'yellow',
    'stroke-width': 2,
  },
  Polygon: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'yellow',
    'stroke-width': 2,
    'fill-color': 'blue',
  },
  Circle: {
    'circle-radius': 5,
    'circle-fill-color': 'red',
    'stroke-color': 'blue',
    'stroke-width': 2,
    'fill-color': 'yellow',
  },
};

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later / 全局变量，便于后续移除或重新绑定
function addInteraction() {
  const value = typeSelect.value;
  if (value !== 'None') {
    draw = new Draw({
      source: source,
      type: typeSelect.value,
      style: styles[value], // Apply custom sketch style during drawing / 应用绘制过程中的自定义草绘样式
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

addInteraction();
