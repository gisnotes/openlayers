import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import OSM from '../src/ol/source/OSM.js';

const variables = {};

// Method used to extract elevations from the DEM.
// In this case the format used is Terrarium: (red * 256 + green + blue / 256) - 32768
// Other frequently used methods include the Mapbox format: (red * 256 * 256 + green * 256 + blue) * 0.1 - 10000
// 从 DEM 瓦片中提取真实海拔高程的方法。
// 本例使用的瓦片编码格式为 Mapzen Terrarium：red * 256 + green + blue / 256 - 32768
function elevation(xOffset, yOffset) {
  const red = ['band', 1, xOffset, yOffset];
  const green = ['band', 2, xOffset, yOffset];
  const blue = ['band', 3, xOffset, yOffset];

  // Band math operates on normalized values from 0-1, so we scale by 255
  // 波段数学运算使用 0-1 范围的归一化像素值，因此乘以 255 对齐字节分量
  return [
    '+',
    ['*', 255 * 256, red],
    ['*', 255, green],
    ['*', 255 / 256, blue],
    -32768,
  ];
}

// Generates shaded relief image given elevation data. Uses 3x3 neighborhood for determining slope and aspect.
// 根据高程数据在着色器中生成山体日照阴影。利用 3x3 邻域中心差分计算地表坡度（Slope）与坡向（Aspect）。
const dp = ['*', 2, ['resolution']];
const z0x = ['*', ['var', 'vert'], elevation(-1, 0)];
const z1x = ['*', ['var', 'vert'], elevation(1, 0)];
const dzdx = ['/', ['-', z1x, z0x], dp];
const z0y = ['*', ['var', 'vert'], elevation(0, -1)];
const z1y = ['*', ['var', 'vert'], elevation(0, 1)];
const dzdy = ['/', ['-', z1y, z0y], dp];
const slope = ['atan', ['sqrt', ['+', ['^', dzdx, 2], ['^', dzdy, 2]]]];
const aspect = ['clamp', ['atan', ['-', 0, dzdx], dzdy], -Math.PI, Math.PI];
const sunEl = ['*', Math.PI / 180, ['var', 'sunEl']];
const sunAz = ['*', Math.PI / 180, ['var', 'sunAz']];

// Lambertian cosine incidence angle / 漫反射光照入射角余弦值计算
const cosIncidence = [
  '+',
  ['*', ['sin', sunEl], ['cos', slope]],
  ['*', ['cos', sunEl], ['sin', slope], ['cos', ['-', sunAz, aspect]]],
];
const scaled = ['*', 255, cosIncidence];

const shadedRelief = new TileLayer({
  opacity: 0.3,
  source: new ImageTile({
    url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    maxZoom: 15,
    attributions:
      '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank">Data sources and attribution</a>',
  }),
  style: {
    variables: variables,
    color: ['color', scaled, scaled, scaled],
  },
});

// Update style variables and reflect them in UI text spans
// 动态更新样式变量并同步界面文本显示
const controlIds = ['vert', 'sunEl', 'sunAz'];
controlIds.forEach(function (id) {
  const control = document.getElementById(id);
  const output = document.getElementById(id + 'Out');
  function value() {
    return parseFloat(control.value);
  }
  variables[id] = value();
  function update() {
    output.innerText = control.value;
    variables[id] = value();
    shadedRelief.updateStyleVariables(variables);
  }
  control.addEventListener('input', update);
  update();
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    shadedRelief,
  ],
  view: new View({
    center: [15016024, -4076722],
    zoom: 11,
  }),
});
