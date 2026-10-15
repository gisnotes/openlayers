import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {fromLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Band math operates on normalized values from 0-1, so we scale by 255 to align with elevation formula
// 着色器波段数学运算使用 0-1 范围的归一化像素值，因此乘以 255 对齐 Terrain-RGB 真实海拔反算公式
const elevation = [
  '+',
  -10000,
  ['*', 0.1 * 255 * 256 * 256, ['band', 1]],
  ['*', 0.1 * 255 * 256, ['band', 2]],
  ['*', 0.1 * 255, ['band', 3]],
];

const layer = new TileLayer({
  opacity: 0.6,
  source: new ImageTile({
    url:
      'https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=' +
      key,
    tileSize: 512,
    maxZoom: 14,
  }),
  style: {
    variables: {
      level: 0,
    },
    color: [
      'case',
      // Use the `level` style variable to determine color (blue if submerged, transparent otherwise)
      // 使用 `level` 样式变量判断像素颜色（被水淹没区域显示为蓝色，陆地部分完全透明）
      ['<=', elevation, ['var', 'level']],
      [139, 212, 255, 1],
      [139, 212, 255, 0],
    ],
  },
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new ImageTile({
        url:
          'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
        attributions: attributions,
        tileSize: 512,
        maxZoom: 22,
      }),
    }),
    layer,
  ],
  view: new View({
    center: fromLonLat([-122.3267, 37.8377]),
    zoom: 11,
  }),
});

const control = document.getElementById('level');
const output = document.getElementById('output');
control.addEventListener('input', function () {
  output.innerText = control.value;
  layer.updateStyleVariables({level: parseFloat(control.value)});
});
output.innerText = control.value;

const locations = document.getElementsByClassName('location');
for (let i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

// Quick jump to city coordinates / 快速跳转至指定城市中心点
function relocate(event) {
  const data = event.target.dataset;
  const view = map.getView();
  view.setCenter(fromLonLat(data.center.split(',').map(Number)));
  view.setZoom(Number(data.zoom));
}
