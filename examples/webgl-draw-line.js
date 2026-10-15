import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Draw from '../src/ol/interaction/Draw.js';
import Modify from '../src/ol/interaction/Modify.js';
import Snap from '../src/ol/interaction/Snap.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Initial values for dynamic WebGL style variables / WebGL 样式动态变量初始值字典
/** @type {import('../src/ol/style/flat.js').StyleVariables} */
const styleVariables = {
  width: 12,
  offset: 0,
  capType: 'butt',
  joinType: 'miter',
  miterLimit: 10, // Miter limit ratio / 斜接比例限制
  dashLength1: 25,
  dashLength2: 15,
  dashLength3: 15,
  dashLength4: 15,
  dashOffset: 0,
  patternSpacing: 0,
  patternOffset: 0,
};

const source = new VectorSource({
  url: 'data/geojson/switzerland.geojson',
  format: new GeoJSON(),
});

/**
 * Generate WebGL FlatStyle expression based on dash and pattern toggles
 * 根据虚线与纹理开关生成 WebGL FlatStyle 样式表达式
 * @param {boolean} dash Whether dash pattern is enabled / 是否包含虚线
 * @param {boolean} pattern Whether image pattern is enabled / 是否包含图片纹理
 * @return {import('../src/ol/style/flat.js').FlatStyle} Generated style object / 生成的样式对象
 */
const getStyle = (dash, pattern) => {
  let newStyle = {
    'stroke-width': ['var', 'width'],
    'stroke-color': 'rgba(24,86,34,0.7)',
    'stroke-offset': ['var', 'offset'],
    'stroke-miter-limit': ['var', 'miterLimit'],
    'stroke-line-cap': ['var', 'capType'],
    'stroke-line-join': ['var', 'joinType'],
  };
  if (dash) {
    newStyle = {
      ...newStyle,
      'stroke-line-dash': [
        ['var', 'dashLength1'],
        ['var', 'dashLength2'],
        ['var', 'dashLength3'],
        ['var', 'dashLength4'],
      ],
      'stroke-line-dash-offset': ['var', 'dashOffset'],
    };
  }
  if (pattern) {
    delete newStyle['stroke-color'];
    newStyle = {
      ...newStyle,
      'stroke-pattern-src': 'data/dot.svg',
      'stroke-pattern-spacing': ['var', 'patternSpacing'],
      'stroke-pattern-start-offset': ['var', 'patternOffset'],
    };
  }
  return newStyle;
};

/** @type {import('../src/ol/style/flat.js').FlatStyle} */
let style = getStyle(false, false);

let vector = new WebGLVectorLayer({
  source,
  style,
  variables: {...styleVariables},
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vector,
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([8.43, 46.82]),
    zoom: 7,
  }),
});

// Rebuild shader style when structure changes (e.g. toggling dashes or textures)
// 重构着色器样式（当勾选虚线或纹理开关改变着色器输入结构时调用）
const rebuildStyle = () => {
  const dash = document.getElementById('dashEnable').checked;
  const pattern = document.getElementById('patternEnable').checked;
  style = getStyle(dash, pattern);
  map.removeLayer(vector);
  vector = new WebGLVectorLayer({
    source,
    style,
    variables: {...styleVariables},
  });
  map.addLayer(vector);
};

const modify = new Modify({source: source});
map.addInteraction(modify);

let draw, snap; // Global variables for interaction management / 全局变量，便于移除重建

function addInteractions() {
  draw = new Draw({
    source: source,
    type: 'LineString',
  });
  map.addInteraction(draw);
  snap = new Snap({source: source});
  map.addInteraction(snap);
}

addInteractions();

// Listen to input changes and update style variables for instantaneous GPU uniform updates
// 监听样式变量控件输入事件，通过 updateStyleVariables 实现微秒级 GPU Uniform 更新
const inputListener = (event) => {
  const variableName = event.target.name;
  if (event.target.type === 'radio') {
    styleVariables[variableName] = event.target.value;
  } else {
    styleVariables[variableName] = parseFloat(event.target.value);
  }
  vector.updateStyleVariables(styleVariables);
  const valueSpan = document.getElementById(`value-${variableName}`);
  if (valueSpan) {
    valueSpan.textContent = String(styleVariables[variableName]);
  }
  map.render();
};
document
  .querySelectorAll('input.uniform')
  .forEach((input) => input.addEventListener('input', inputListener));
document
  .querySelectorAll('input.rebuild')
  .forEach((input) => input.addEventListener('input', rebuildStyle));
