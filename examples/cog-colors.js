import {scale as chromaScale} from 'chroma-js';
import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

const segments = 10;

const defaultMinColor = '#0300AD';
const defaultMaxColor = '#00ff00';

const defaultMinValue = -0.5;
const defaultMaxValue = 0.7;

const minColorInput = document.getElementById('min-color');
minColorInput.value = defaultMinColor;

const maxColorInput = document.getElementById('max-color');
maxColorInput.value = defaultMaxColor;

const minValueOutput = document.getElementById('min-value-output');
const minValueInput = document.getElementById('min-value-input');
minValueInput.value = defaultMinValue.toString();

const maxValueOutput = document.getElementById('max-value-output');
const maxValueInput = document.getElementById('max-value-input');
maxValueInput.value = defaultMaxValue.toString();

// Generate dynamic style variables using Lab color interpolation across segments
// 在 Lab 感知均匀色彩空间中根据分段插值计算动态样式变量
function getVariables() {
  const variables = {};

  const minColor = minColorInput.value;
  const maxColor = maxColorInput.value;
  const scale = chromaScale([minColor, maxColor]).mode('lab');

  const minValue = parseFloat(minValueInput.value);
  const maxValue = parseFloat(maxValueInput.value);
  const delta = (maxValue - minValue) / segments;

  for (let i = 0; i <= segments; ++i) {
    const color = scale(i / segments).rgb();
    const value = minValue + i * delta;
    variables[`value${i}`] = value;
    variables[`red${i}`] = color[0];
    variables[`green${i}`] = color[1];
    variables[`blue${i}`] = color[2];
  }
  return variables;
}

// Build the array of stops for the interpolate expression reading from style variables
// 构建从样式变量读取数值与 RGB 颜色的插值色带 stops 数组
function colors() {
  const stops = [];
  for (let i = 0; i <= segments; ++i) {
    stops[i * 2] = ['var', `value${i}`];
    const red = ['var', `red${i}`];
    const green = ['var', `green${i}`];
    const blue = ['var', `blue${i}`];
    stops[i * 2 + 1] = ['color', red, green, blue];
  }
  return stops;
}

// NDVI expression: (NIR - Red) / (NIR + Red)
// NDVI 表达式：(近红外 - 红光) / (近红外 + 红光)
const ndvi = [
  '/',
  ['-', ['band', 2], ['band', 1]],
  ['+', ['band', 2], ['band', 1]],
];

const source = new GeoTIFF({
  sources: [
    {
      // visible red, band 1 in the style expression above
      // 可见光红光，在上方样式表达式中对应 band 1
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B04.tif',
      max: 10000,
    },
    {
      // near infrared, band 2 in the style expression above
      // 近红外，在上方样式表达式中对应 band 2
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B08.tif',
      max: 10000,
    },
  ],
});

const layer = new TileLayer({
  style: {
    variables: getVariables(),
    color: ['interpolate', ['linear'], ndvi, ...colors()],
  },
  source: source,
});

// Update style variables without recompiling GLSL shaders
// 更新样式变量（无需重新编译 GLSL 片元着色器）
function update() {
  layer.updateStyleVariables(getVariables());
  minValueOutput.innerText = parseFloat(minValueInput.value).toFixed(1);
  maxValueOutput.innerText = parseFloat(maxValueInput.value).toFixed(1);
}

minColorInput.addEventListener('input', update);
maxColorInput.addEventListener('input', update);
minValueInput.addEventListener('input', update);
maxValueInput.addEventListener('input', update);

const map = new Map({
  target: 'map',
  layers: [layer],
  view: source.getView(),
});

update();
