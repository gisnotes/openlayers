import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import RasterSource from '../src/ol/source/Raster.js';

/**
 * Flood operation decoding elevation and coloring pixels below water level.
 * 解码像素高程并将低于设定水位的陆地区域染成水体蓝色的泛洪运算函数
 * @param {Array<Array<number>>} pixels Input pixel arrays / 输入像素通道数组
 * @param {Object} data Parameters from beforeoperations / 外部传入参数对象
 * @return {Array<number>} Output pixel / 运算输出的像素
 */
function flood(pixels, data) {
  const pixel = pixels[0];
  if (pixel[3]) {
    // Mapbox/MapTiler Terrain-RGB decoding formula: height = -10000 + (R*256*256 + G*256 + B) * 0.1
    // Mapbox/MapTiler Terrain-RGB 标准解码公式
    const height =
      -10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1;
    if (height <= data.level) {
      // Inundated sea water color / 淹没水体赋浅蓝色
      pixel[0] = 134;
      pixel[1] = 203;
      pixel[2] = 249;
      pixel[3] = 255;
    } else {
      // Transparent to reveal base street map / 高于海平面区域完全透明透出街道底图
      pixel[3] = 0;
    }
  }
  return pixel;
}

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Terrain-RGB elevation tile source / Terrain-RGB 数字高程切片数据源
const elevation = new ImageTile({
  // The RGB values in the source collectively represent elevation.
  // Interpolation of individual colors would produce incorrect elevations and is disabled.
  // RGB 通道联合表示数值高程，通道独立平滑插值会产生严重高程突变，故强制禁用插值
  url:
    'https://api.maptiler.com/tiles/terrain-rgb-v2/{z}/{x}/{y}.webp?key=' + key,
  tileSize: 512,
  maxZoom: 14,
  interpolate: false,
});

// Raster source running flood calculation in Web Worker / 执行海平面泛洪运算的光栅数据源
const raster = new RasterSource({
  sources: [elevation],
  operation: flood,
});

// Initialize map with street basemap and sea level raster overlay / 初始化地图
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
        tileSize: 512,
        maxZoom: 22,
      }),
    }),
    new ImageLayer({
      opacity: 0.6,
      source: raster,
    }),
  ],
  view: new View({
    center: fromLonLat([-122.3267, 37.8377]),
    zoom: 11,
  }),
});

// getData() returns the input source values at a coordinate; here the single
// input is the terrain-RGB source, so we decode its pixel to an elevation.
// getData() 返回指定坐标处的原始像素数组，从中解码并显示真实海拔
const elevationOutput = document.getElementById('elevation');
map.on(['pointermove', 'click'], function (event) {
  const pixels = raster.getData(event.coordinate);
  const pixel = pixels && pixels[0];
  if (!pixel || !pixel[3]) {
    elevationOutput.innerText = ' ';
    return;
  }
  const height =
    -10000 + (pixel[0] * 256 * 256 + pixel[1] * 256 + pixel[2]) * 0.1;
  elevationOutput.innerText = Math.round(height) + ' m';
});

// Sea level slider control / 海平面滑块控件联动
const control = document.getElementById('level');
const output = document.getElementById('output');
control.addEventListener('input', function () {
  output.innerText = control.value;
  raster.changed();
});
output.innerText = control.value;

// Pass slider value to worker before operations execute / 计算执行前将水位线数值传入 Worker
raster.on('beforeoperations', function (event) {
  event.data.level = control.value;
});

// Quick navigation buttons for coastal metropolitan areas / 沿海重点城市视角快速定位
const locations = document.getElementsByClassName('location');
for (let i = 0, ii = locations.length; i < ii; ++i) {
  locations[i].addEventListener('click', relocate);
}

/**
 * Relocate map view to selected city. / 将地图视角平移缩放至目标城市
 * @param {Event} event Click event / 点击事件
 */
function relocate(event) {
  const data = event.target.dataset;
  const view = map.getView();
  view.setCenter(fromLonLat(data.center.split(',').map(Number)));
  view.setZoom(Number(data.zoom));
}
