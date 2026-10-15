import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import {fromLonLat} from '../src/ol/proj.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import Vector from '../src/ol/source/Vector.js';

const vectorSource = new Vector({
  attributions: 'NASA',
});

const oldColor = 'rgba(242,56,22,0.61)';
const newColor = '#ffe52c';
const period = 12; // Animation period in seconds / 动画周期（秒）
// Construct periodic pulse ratio using shader math operators
// 使用着色器数学运算符构造周期性呼吸脉冲比率
const animRatio = [
  '^',
  [
    '/',
    [
      '%',
      [
        '+',
        ['time'],
        ['interpolate', ['linear'], ['get', 'year'], 1850, 0, 2015, period],
      ],
      period,
    ],
    period,
  ],
  0.5,
];

// WebGL style expressions mapping mass and animation ratio to radius, color, and opacity
// WebGL 样式表达式：将质量和动画比率映射到半径、填充色和透明度
const style = {
  'circle-radius': [
    '*',
    ['interpolate', ['linear'], ['get', 'mass'], 0, 4, 200000, 13],
    ['-', 1.75, ['*', animRatio, 0.75]],
  ],
  'circle-fill-color': [
    'interpolate',
    ['linear'],
    animRatio,
    0,
    newColor,
    1,
    oldColor,
  ],
  'circle-opacity': ['-', 1.0, ['*', animRatio, 0.75]],
};

// Handle input slider values and events / 处理滑块输入值与事件
const minYearInput = document.getElementById('min-year');
const maxYearInput = document.getElementById('max-year');

function updateStatusText() {
  const div = document.getElementById('status');
  div.querySelector('span.min-year').textContent = minYearInput.value;
  div.querySelector('span.max-year').textContent = maxYearInput.value;
}

const pointsLayer = new WebGLVectorLayer({
  variables: {
    minYear: parseInt(minYearInput.value, 10),
    maxYear: parseInt(maxYearInput.value, 10),
  },
  style: [
    {
      style,
      filter: [
        'between',
        ['get', 'year'],
        ['var', 'minYear'],
        ['var', 'maxYear'],
      ],
    },
  ],
  source: vectorSource,
  disableHitDetection: true, // Disable hit detection for optimal performance with 45k points / 禁用拾取探测以提升海量点性能
});

minYearInput.addEventListener('input', function () {
  pointsLayer.updateStyleVariables({
    minYear: parseInt(minYearInput.value, 10),
  });
  updateStatusText();
});
maxYearInput.addEventListener('input', function () {
  pointsLayer.updateStyleVariables({
    maxYear: parseInt(maxYearInput.value, 10),
  });
  updateStatusText();
});
updateStatusText();

// Load CSV data / 异步加载陨石撞击 CSV 数据
const client = new XMLHttpRequest();
client.open('GET', 'data/csv/meteorite_landings.csv');
client.onload = function () {
  const csv = client.responseText;
  const features = [];

  let prevIndex = csv.indexOf('\n') + 1; // Scan past header line / 跳过表头首行

  let curIndex;
  while ((curIndex = csv.indexOf('\n', prevIndex)) != -1) {
    const line = csv.substr(prevIndex, curIndex - prevIndex).split(',');
    prevIndex = curIndex + 1;

    const coords = fromLonLat([parseFloat(line[4]), parseFloat(line[3])]);
    if (isNaN(coords[0]) || isNaN(coords[1])) {
      // Guard against bad or missing data / 过滤无效坐标数据
      continue;
    }

    features.push(
      new Feature({
        mass: parseFloat(line[1]) || 0,
        year: parseInt(line[2], 10) || 0,
        geometry: new Point(coords),
      }),
    );
  }

  vectorSource.addFeatures(features);
};
client.send();

const map = new Map({
  layers: [
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_toner',
      }),
    }),
    pointsLayer,
  ],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Animate map continuously every frame / 逐帧驱动地图重绘以展示着色器脉冲动画
function animate() {
  map.render();
  window.requestAnimationFrame(animate);
}
animate();
