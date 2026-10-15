import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import OSM from '../src/ol/source/OSM.js';
import Vector from '../src/ol/source/Vector.js';

const vectorSource = new Vector({
  url: 'data/geojson/world-cities.geojson',
  format: new GeoJSON(),
  wrapX: true,
});

// Predefined WebGL literal style configurations / 预设 WebGL 字面量样式集合
const predefinedStyles = {
  icons: {
    'icon-src': 'data/icon.png',
    'icon-width': 18,
    'icon-height': 28,
    'icon-color': 'lightyellow',
    'icon-rotate-with-view': false,
    'icon-displacement': [0, 9],
  },
  triangles: {
    'shape-points': 3,
    'shape-radius': 9,
    'shape-fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      20000,
      '#5aca5b',
      300000,
      '#ff6a19',
    ],
    'shape-rotate-with-view': true,
  },
  'triangles-latitude': {
    'shape-points': 3,
    'shape-radius': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      40000,
      6,
      2000000,
      12,
    ],
    'shape-fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'latitude'],
      -60,
      '#ff14c3',
      -20,
      '#ff621d',
      20,
      '#ffed02',
      60,
      '#00ff67',
    ],
    'shape-opacity': 0.95,
  },
  circles: {
    'circle-radius': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      40000,
      4,
      2000000,
      14,
    ],
    'circle-fill-color': ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
    'circle-rotate-with-view': false,
    'circle-displacement': [0, 0],
    'circle-opacity': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      40000,
      0.6,
      2000000,
      0.92,
    ],
  },
  'circles-text': {
    'text-value': ['get', 'city'],
    'text-font': 'bold 11px "Open Sans", "Arial Unicode MS", sans-serif',
    'text-fill-color': '#334',
    'text-stroke-color': 'rgba(255,255,255,0.8)',
    'text-stroke-width': 2,
    'text-offset-y': -12,
    'circle-radius': 4,
    'circle-fill-color': ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
    'circle-rotate-with-view': false,
  },
  'circles-zoom': {
    // By using an exponential interpolation with a base of 2, circles have fixed physical size in world coordinates
    // 使用底数为 2 的指数插值，保证圆形在层级 5 到 15 之间在真实世界坐标系中具有固定的物理尺寸
    'circle-radius': [
      'interpolate',
      ['exponential', 2],
      ['zoom'],
      5,
      1.5,
      15,
      1.5 * Math.pow(2, 10),
    ],
    'circle-fill-color': ['match', ['get', 'hover'], 1, '#ff3f3f', '#006688'],
    'circle-displacement': [0, 0],
    'circle-opacity': 0.95,
  },
  'rotating-bars': {
    'shape-rotation': ['*', ['time'], 0.13],
    'shape-points': 4,
    'shape-radius': 4,
    'shape-radius2': 4 * Math.sqrt(2),
    'shape-scale': [
      'array',
      1,
      ['interpolate', ['linear'], ['get', 'population'], 20000, 1, 300000, 7],
    ],
    'shape-fill-color': [
      'interpolate',
      ['linear'],
      ['get', 'population'],
      20000,
      '#ffdc00',
      300000,
      '#ff5b19',
    ],
    'shape-displacement': [
      'array',
      0,
      ['interpolate', ['linear'], ['get', 'population'], 20000, 2, 300000, 14],
    ],
  },
};

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

let literalStyle;
let pointsLayer;

let selected = null;

// Hover interaction to update feature 'hover' property
// 鼠标悬停交互：动态设置要素的 hover 属性以触发着色器分支变色
map.on('pointermove', function (ev) {
  if (selected !== null) {
    selected.set('hover', 0);
    selected = null;
  }

  map.forEachFeatureAtPixel(ev.pixel, function (feature) {
    feature.set('hover', 1);
    selected = feature;
    return true;
  });
});

// Refresh layer with new style configuration / 根据新样式重建并切换图层
function refreshLayer(newStyle) {
  const previousLayer = pointsLayer;
  pointsLayer = new WebGLVectorLayer({
    source: vectorSource,
    style: newStyle,
  });
  map.addLayer(pointsLayer);

  if (previousLayer) {
    map.removeLayer(previousLayer);
    previousLayer.dispose();
  }
  literalStyle = newStyle;
}

const spanValid = document.getElementById('style-valid');
const spanInvalid = document.getElementById('style-invalid');
function setStyleStatus(errorMsg) {
  const isError = typeof errorMsg === 'string';
  spanValid.style.display = errorMsg === null ? 'initial' : 'none';
  spanInvalid.firstElementChild.innerText = isError ? errorMsg : '';
  spanInvalid.style.display = isError ? 'initial' : 'none';
}

const editor = document.getElementById('style-editor');
editor.addEventListener('input', function () {
  const textStyle = editor.value;
  try {
    const newLiteralStyle = JSON.parse(textStyle);
    if (JSON.stringify(newLiteralStyle) !== JSON.stringify(literalStyle)) {
      refreshLayer(newLiteralStyle);
    }
    setStyleStatus(null);
  } catch (e) {
    setStyleStatus(e.message);
  }
});

const select = document.getElementById('style-select');
select.value = 'circles';
function onSelectChange() {
  const style = select.value;
  const newLiteralStyle = predefinedStyles[style];
  editor.value = JSON.stringify(newLiteralStyle, null, 2);
  try {
    refreshLayer(newLiteralStyle);
    setStyleStatus(null);
  } catch (e) {
    setStyleStatus(e.message);
  }
}
onSelectChange();
select.addEventListener('change', onSelectChange);

// Animate the map continuously / 持续驱动帧循环以播放自旋动画
function animate() {
  map.render();
  window.requestAnimationFrame(animate);
}
animate();
