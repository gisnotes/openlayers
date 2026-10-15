import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import RasterSource from '../src/ol/source/Raster.js';

/**
 * Region growing segmentation algorithm running as an image operation in Web Worker.
 * 在 Web Worker 线程中运行的整图级区域生长空间分割算法
 * @param {Array<ImageData>} inputs Input images / 输入图像数据数组
 * @param {Object} data Context data from beforeoperations / 外部注入的上下文参数
 * @return {ImageData|Object} Output image with segmented region highlighted / 标记高亮后的输出图像
 */
function growRegion(inputs, data) {
  const image = inputs[0];
  let seed = data.pixel;
  const delta = parseInt(data.delta, 10);
  if (!seed) {
    return image;
  }

  seed = seed.map(Math.round);
  const width = image.width;
  const height = image.height;
  const inputData = image.data;
  const outputData = new Uint8ClampedArray(inputData);
  const seedIdx = (seed[1] * width + seed[0]) * 4;
  const seedR = inputData[seedIdx];
  const seedG = inputData[seedIdx + 1];
  const seedB = inputData[seedIdx + 2];
  let edge = [seed];
  while (edge.length) {
    const newedge = [];
    for (let i = 0, ii = edge.length; i < ii; i++) {
      // Access next4Edges provided through the lib option / 访问通过 lib 注入的 4-邻域搜索纯函数
      const next = next4Edges(edge[i]);
      for (let j = 0, jj = next.length; j < jj; j++) {
        const s = next[j][0];
        const t = next[j][1];
        if (s >= 0 && s < width && t >= 0 && t < height) {
          const ci = (t * width + s) * 4;
          const cr = inputData[ci];
          const cg = inputData[ci + 1];
          const cb = inputData[ci + 2];
          const ca = inputData[ci + 3];
          // If alpha is zero, it was already visited / 若 Alpha 为 0，说明此前已访问过，直接跳过
          if (ca === 0) {
            continue;
          }
          if (
            Math.abs(seedR - cr) < delta &&
            Math.abs(seedG - cg) < delta &&
            Math.abs(seedB - cb) < delta
          ) {
            // Highlight region pixel with opaque red / 满足容差阈值时染成不透明纯红
            outputData[ci] = 255;
            outputData[ci + 1] = 0;
            outputData[ci + 2] = 0;
            outputData[ci + 3] = 255;
            newedge.push([s, t]);
          }
          // Mark as visited in-place by zeroing alpha / 原地将 Alpha 置零充当访问标记
          inputData[ci + 3] = 0;
        }
      }
    }
    edge = newedge;
  }
  return {data: outputData, width: width, height: height};
}

/**
 * Return 4-connected neighbor pixel coordinates.
 * 获取当前像素上下左右 4-邻域连通坐标
 * @param {Array<number>} edge Pixel coordinates [x, y] / 当前像素坐标
 * @return {Array<Array<number>>} 4-connected neighbors / 四邻域坐标数组
 */
function next4Edges(edge) {
  const x = edge[0];
  const y = edge[1];
  return [
    [x + 1, y],
    [x - 1, y],
    [x, y + 1],
    [x, y - 1],
  ];
}

// MapTiler key and attributions / MapTiler 访问凭证与版权声明
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Base satellite imagery tile layer / 卫星遥感正射底图瓦片图层
const imagery = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Raster source configured with image-level operation / 配置为整图运算模式的栅格数据源
const raster = new RasterSource({
  sources: [imagery.getSource()],
  operationType: 'image',
  operation: growRegion,
  // Functions in the `lib` object are serialized to the web worker / lib 中的辅助函数会被序列化注入到 Web Worker
  lib: {
    next4Edges: next4Edges,
  },
});

// Semi-transparent overlay displaying computed segmented region / 半透明栅格图层展示计算得出的分割区域
const rasterImage = new ImageLayer({
  opacity: 0.7,
  source: raster,
});

// Initialize map centered near Grand Coulee, WA / 初始化地图并定位至华盛顿州大库力水库
const map = new Map({
  layers: [imagery, rasterImage],
  target: 'map',
  view: new View({
    center: fromLonLat([-119.07, 47.65]),
    zoom: 11,
  }),
});

let coordinate;

// Click event records geographic seed coordinate and triggers re-computation
// 点击地图记录种子地理坐标，并触发栅格数据源重新计算
map.on('click', function (event) {
  coordinate = event.coordinate;
  raster.changed();
});

const thresholdControl = document.getElementById('threshold');

// Inject latest parameters into worker before operation execution / 在计算前将最新参数装配入 Worker 上下文
raster.on('beforeoperations', function (event) {
  const data = event.data;
  data.delta = thresholdControl.value;
  if (coordinate) {
    data.pixel = map.getPixelFromCoordinate(coordinate);
  }
});

function updateControlValue() {
  document.getElementById('threshold-value').innerText = thresholdControl.value;
}
updateControlValue();

// Threshold slider changes re-trigger region growing / 滑块调节颜色容差并即时重新执行分割
thresholdControl.addEventListener('input', function () {
  updateControlValue();
  raster.changed();
});
