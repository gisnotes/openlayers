import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Draw from '../src/ol/interaction/Draw.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

const raster = new TileLayer({
  source: new OSM(),
});

// Vector source configured without wrapping across the antimeridian
// 矢量数据源，禁用多世界水平环绕
const source = new VectorSource({wrapX: false});

const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

const typeSelect = document.getElementById('type');

const freehandCheckbox = document.getElementById('freehand');

let draw; // global so we can remove it later / 全局变量，便于后续动态移除与重置

function addInteraction() {
  if (typeSelect.value !== 'None') {
    draw = new Draw({
      source: source,
      type: typeSelect.value,
      freehand: freehandCheckbox.checked,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle geometry type change event.
 * 处理几何类型下拉切换事件。
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

/**
 * Handle freehand checkbox change event.
 * 处理自由手绘复选框勾选切换事件。
 */
freehandCheckbox.onchange = function () {
  if (draw) {
    draw.setFreehand(freehandCheckbox.checked);
  }
};

addInteraction();
