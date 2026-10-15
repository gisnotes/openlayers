import Map from '../src/ol/Map.js';
import ImageLayer from '../src/ol/layer/Image.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';
import RasterSource from '../src/ol/source/Raster.js';

// `normalize: false` keeps the raw 16-bit reflectance as Float32Array data, so
// the operation runs the NDVI math on the actual band values.
// `normalize: false` 保留原始 16 位反射率数据为 Float32Array，使像素算子能够基于真实辐射度数值计算 NDVI。
const cog = new GeoTIFF({
  normalize: false,
  sources: [
    {
      // Visible red / 可见光红光
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B04.tif',
    },
    {
      // Near infrared / 近红外
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/B08.tif',
    },
  ],
});

// NDVI color ramp, handed to the operation in "beforeoperations".
// NDVI 颜色渐变阶梯，在 "beforeoperations" 事件中传递给后台算子。
const ndviStops = [
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
];

/**
 * Map a value to an `[r, g, b, a]` color using a ramp of `value, [r, g, b]` stops.
 * 将数值通过 `[value, [r, g, b]]` 梯度插值为 `[r, g, b, a]` 颜色。
 * @param {number} value The value to map.
 * @param {Array<number|Array<number>>} stops Flat `value, color` ramp stops.
 * @return {Array<number>} The `[r, g, b, a]` color.
 */
function colorFromRamp(value, stops) {
  if (value <= stops[0]) {
    const first = stops[1];
    return [first[0], first[1], first[2], 255];
  }
  for (let i = 2; i < stops.length; i += 2) {
    if (value <= stops[i]) {
      const lowValue = stops[i - 2];
      const lowColor = stops[i - 1];
      const highValue = stops[i];
      const highColor = stops[i + 1];
      const f = (value - lowValue) / (highValue - lowValue);
      return [
        lowColor[0] + f * (highColor[0] - lowColor[0]),
        lowColor[1] + f * (highColor[1] - lowColor[1]),
        lowColor[2] + f * (highColor[2] - lowColor[2]),
        255,
      ];
    }
  }
  const last = stops[stops.length - 1];
  return [last[0], last[1], last[2], 255];
}

/**
 * Compute NDVI from the two input bands and map it through the color ramp.
 * 从两个输入波段中计算 NDVI 并通过色带映射出颜色。
 * @param {Array<Array<number>>} pixels One pixel per input source / 每个输入源的一个像素
 * @param {Object} data The object populated in the "beforeoperations" event / 在 beforeoperations 中注入的数据
 * @return {Array<number>} An `[r, g, b, a]` pixel.
 */
function ndviToColor(pixels, data) {
  const red = pixels[0][0];
  const nir = pixels[0][1];
  const sum = nir + red;
  if (!sum) {
    // Transparent outside the data / 数据有效范围之外设为全透明
    return [0, 0, 0, 0];
  }
  return colorFromRamp((nir - red) / sum, data.stops);
}

// Create RasterSource running calculation in Web Workers
// 创建在 Web Worker 多线程中执行像元算子的 RasterSource
const raster = new RasterSource({
  sources: [cog],
  operation: ndviToColor,
  // Functions in the `lib` object are available to the operation in the worker.
  // lib 中的辅助函数会被序列化并注入到 Web Worker 子线程中供算子调用
  lib: {
    colorFromRamp: colorFromRamp,
  },
});

raster.on('beforeoperations', (event) => {
  event.data.stops = ndviStops;
});

const map = new Map({
  target: 'map',
  layers: [new ImageLayer({source: raster})],
  view: cog.getView(),
});

// getData() returns the input band values at a coordinate, so we can compute
// and show the NDVI value the color above was derived from.
// getData() 返回指定地理坐标处的输入波段值，供主线程计算并展示光标下的精确 NDVI 数值
const output = document.getElementById('output');
map.on(['pointermove', 'click'], function (event) {
  const pixels = raster.getData(event.coordinate);
  if (!pixels) {
    output.textContent = ' ';
    return;
  }
  const [red, nir] = pixels[0];
  const sum = nir + red;
  output.textContent = sum ? ((nir - red) / sum).toFixed(2) : ' ';
});
