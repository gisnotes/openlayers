import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Normalization function: scale Sentinel-2 reflectance values (0-3000) to 0-1 range
// 归一化函数：将哨兵2号（Sentinel-2）反射率值（0-3000）缩放到 0-1 范围
const max = 3000;
function normalize(value) {
  return ['/', value, max];
}

// 4 bands of Sentinel-2: Band 1 (Red), Band 2 (Green), Band 3 (Blue), Band 4 (NIR)
// 哨兵2号的 4 个波段：波段 1（红光）、波段 2（绿光）、波段 3（蓝光）、波段 4（近红外 NIR）
const red = normalize(['band', 1]);
const green = normalize(['band', 2]);
const blue = normalize(['band', 3]);
const nir = normalize(['band', 4]);

// True Color style (RGB composite)
// 真彩色样式（RGB 合成）
const trueColor = {
  color: ['array', red, green, blue, 1],
  gamma: 1.1,
};

// False Color style (NIR, Red, Green composite) - useful for highlighting vegetation
// 标准假彩色样式（近红外、红光、绿光合成）—— 常用于突出显示植被
const falseColor = {
  color: ['array', nir, red, green, 1],
  gamma: 1.1,
};

// NDVI: (NIR - Red) / (NIR + Red)
// 归一化植被指数 NDVI: (近红外 - 红光) / (近红外 + 红光)
const ndvi = {
  color: [
    'interpolate',
    ['linear'],
    ['/', ['-', nir, red], ['+', nir, red]],
    // color ramp for NDVI values, ranging from -1 to 1
    // NDVI 值的颜色渐变（Color Ramp），取值范围从 -1 到 1
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
};

// NDVI using Plasma discrete color palette
// 使用 Plasma 离散调色板渲染的 NDVI
const ndviPalettePlasma = {
  color: [
    'palette',
    [
      'interpolate',
      ['linear'],
      ['/', ['-', nir, red], ['+', nir, red]],
      -0.2,
      0,
      0.65,
      4,
    ],
    ['#0d0887', '#7e03a8', '#cb4778', '#f89540', '#f0f921'],
  ],
};

// NDVI using Viridis discrete color palette
// 使用 Viridis 离散调色板渲染的 NDVI
const ndviPaletteViridis = {
  color: [
    'palette',
    [
      'interpolate',
      ['linear'],
      ['/', ['-', nir, red], ['+', nir, red]],
      -0.2,
      0,
      0.65,
      4,
    ],
    ['#440154', '#3b528b', '#21918c', '#5ec962', '#fde725'],
  ],
};

// Create a WebGL tile layer with a Cloud Optimized GeoTIFF (COG) source
// 创建带有云优化 GeoTIFF (COG) 数据源的 WebGL 瓦片图层
const layer = new TileLayer({
  style: trueColor,
  source: new GeoTIFF({
    normalize: false,
    sources: [
      {
        url: 'https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/exploitation-ready-epsg-4326/exploitation-ready_eoxcloudless-sentinel-2-2024_zoom-1_4bands_16bit.tif',
      },
    ],
  }),
});

// Initialize the map
// 初始化地图
const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
    maxZoom: 6,
  }),
});

const styles = {
  trueColor,
  falseColor,
  ndvi,
  ndviPalettePlasma,
  ndviPaletteViridis,
};

const styleSelector = document.getElementById('style');

// Update layer style when user changes the dropdown selection
// 用户切换下拉框选择时更新图层样式
function update() {
  const style = styles[styleSelector.value];
  layer.setStyle(style);
}
styleSelector.addEventListener('change', update);
