import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Define a multi-source GeoTIFF combining two independent Sentinel-2 single-band COG files
// 定义一个多数据源 GeoTIFF，将两个独立的哨兵 2 号单波段 COG 文件组合在一起
const source = new GeoTIFF({
  sources: [
    {
      // Visible red band (B04), corresponding to ['band', 1] in style expressions
      // 可见光红光波段 (B04)，在着色器样式表达式中对应 ['band', 1]
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B04.tif',
      max: 10000,
    },
    {
      // Near infrared band (B08), corresponding to ['band', 2] in style expressions
      // 近红外波段 (B08)，在着色器样式表达式中对应 ['band', 2]
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B08.tif',
      max: 10000,
    },
  ],
});

// Create a WebGLTile layer with GPU-evaluated NDVI formula and linear color ramp
// 创建 WebGLTile 图层，使用 GPU 实时计算 NDVI 指数并应用线性颜色阶梯插值
const layer = new TileLayer({
  style: {
    color: [
      'interpolate',
      ['linear'],
      // Calculate NDVI: (NIR - Red) / (NIR + Red)
      // 计算 NDVI: (近红外 - 红光) / (近红外 + 红光)
      ['/', ['-', ['band', 2], ['band', 1]], ['+', ['band', 2], ['band', 1]]],
      // Color ramp for NDVI values ranging from -1 to 1
      // NDVI 颜色渐变阶梯映射（取值范围 -1 到 1）
      -0.2,
      [191, 191, 191],
      -0.1,
      [219, 219, 219],
      0,
      [255, 255, 224],
      0.025,
      [255, 250, 204],
      0.05,
      [237, 232, 181],
      0.075,
      [222, 217, 156],
      0.1,
      [204, 199, 130],
      0.125,
      [189, 184, 107],
      0.15,
      [176, 194, 97],
      0.175,
      [163, 204, 89],
      0.2,
      [145, 191, 82],
      0.25,
      [128, 179, 71],
      0.3,
      [112, 163, 64],
      0.35,
      [97, 150, 54],
      0.4,
      [79, 138, 46],
      0.45,
      [64, 125, 36],
      0.5,
      [48, 110, 28],
      0.55,
      [33, 97, 18],
      0.6,
      [15, 84, 10],
      0.65,
      [0, 69, 0],
    ],
  },
  source: source,
});

const map = new Map({
  target: 'map',
  layers: [layer],
  view: source.getView(),
});

// Display calculated NDVI value from raw pixel reflectance under cursor
// 拾取光标所在位置的原始像元反射率，动态计算并展示 NDVI 数值
const output = document.getElementById('output');
function displayPixelValue(event) {
  const data = layer.getData(event.pixel);
  if (!data) {
    return;
  }
  const red = data[0];
  const nir = data[1];
  const ndvi = (nir - red) / (nir + red);
  output.textContent = ndvi.toFixed(2);
}
map.on(['pointermove', 'click'], displayPixelValue);
