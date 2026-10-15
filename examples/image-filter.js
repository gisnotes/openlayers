import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler API Key for satellite imagery access
// MapTiler API 密钥：用于加载高分辨率卫星影像瓦片
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Satellite imagery tile layer
// 卫星遥感切片图层
const imagery = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Initialize map centered on North America Pacific Northwest
// 初始化地图实例：中心定位至北美太平洋西北地区
const map = new Map({
  layers: [imagery],
  target: 'map',
  view: new View({
    center: fromLonLat([-120, 50]),
    zoom: 6,
  }),
});

// 3x3 Convolution kernels for various image processing effects
// 预定义的 3x3 空间卷积核字典：涵盖直通、锐化、高斯模糊、阴影投影、浮雕及边缘检测
const kernels = {
  none: [0, 0, 0, 0, 1, 0, 0, 0, 0],
  sharpen: [0, -1, 0, -1, 5, -1, 0, -1, 0],
  sharpenless: [0, -1, 0, -1, 10, -1, 0, -1, 0],
  blur: [1, 1, 1, 1, 1, 1, 1, 1, 1],
  shadow: [1, 2, 1, 0, 1, 0, -1, -2, -1],
  emboss: [-2, 1, 0, -1, 1, 1, 0, 1, 2],
  edge: [0, 1, 0, 1, -4, 1, 0, 1, 0],
};

// Normalize kernel weights so that overall image brightness is preserved
// 卷积核归一化函数：当权重和大于 0 时平分权重保持整体亮度，否则标记未归一化（如边缘检测）
function normalize(kernel) {
  const len = kernel.length;
  const normal = new Array(len);
  let i,
    sum = 0;
  for (i = 0; i < len; ++i) {
    sum += kernel[i];
  }
  if (sum <= 0) {
    normal.normalized = false;
    sum = 1;
  } else {
    normal.normalized = true;
  }
  for (i = 0; i < len; ++i) {
    normal[i] = kernel[i] / sum;
  }
  return normal;
}

const select = document.getElementById('kernel');
let selectedKernel = normalize(kernels[select.value]);

/**
 * Update the kernel and re-render on change.
 * 监听滤镜下拉选单变更：重新计算归一化卷积核并触发地图画布重绘
 */
select.onchange = function () {
  selectedKernel = normalize(kernels[select.value]);
  map.render();
};

/**
 * Apply a filter on "postrender" events.
 * 监听遥感图层的 postrender 事件：拦截光栅化后的 Canvas 像素应用空间卷积
 */
imagery.on('postrender', function (event) {
  convolve(event.context, selectedKernel);
});

/**
 * Apply a convolution kernel to canvas.  This works for any size kernel, but
 * performance starts degrading above 3 x 3.
 * 对 Canvas 2D 绘图上下文应用空间卷积核：遍历每个像素的 3x3 邻域并加权合成
 * @param {CanvasRenderingContext2D} context Canvas 2d context.
 * @param {Array<number>} kernel Kernel.
 */
function convolve(context, kernel) {
  const canvas = context.canvas;
  const width = canvas.width;
  const height = canvas.height;

  const size = Math.sqrt(kernel.length);
  const half = Math.floor(size / 2);

  // Read raw RGBA pixel byte stream from canvas context
  // 从 Canvas 2D 上下文中读取原始 RGBA 像素字节数组
  const inputData = context.getImageData(0, 0, width, height).data;

  // Allocate empty target image buffer
  // 分配同样尺寸的目标像素缓冲区
  const output = context.createImageData(width, height);
  const outputData = output.data;

  // Iterate over every pixel on the canvas
  // 逐行、逐列遍历画布上的每一个像素点
  for (let pixelY = 0; pixelY < height; ++pixelY) {
    const pixelsAbove = pixelY * width;
    for (let pixelX = 0; pixelX < width; ++pixelX) {
      let r = 0,
        g = 0,
        b = 0,
        a = 0;
      // Convolve surrounding neighborhood window
      // 遍历当前像素的 3x3 邻域窗口并乘以对应核权重
      for (let kernelY = 0; kernelY < size; ++kernelY) {
        for (let kernelX = 0; kernelX < size; ++kernelX) {
          const weight = kernel[kernelY * size + kernelX];
          // Clamp coordinates to image boundaries
          // 边界箝位保护：防止采样坐标越界
          const neighborY = Math.min(
            height - 1,
            Math.max(0, pixelY + kernelY - half),
          );
          const neighborX = Math.min(
            width - 1,
            Math.max(0, pixelX + kernelX - half),
          );
          const inputIndex = (neighborY * width + neighborX) * 4;
          r += inputData[inputIndex] * weight;
          g += inputData[inputIndex + 1] * weight;
          b += inputData[inputIndex + 2] * weight;
          a += inputData[inputIndex + 3] * weight;
        }
      }
      const outputIndex = (pixelsAbove + pixelX) * 4;
      outputData[outputIndex] = r;
      outputData[outputIndex + 1] = g;
      outputData[outputIndex + 2] = b;
      outputData[outputIndex + 3] = kernel.normalized ? a : 255;
    }
  }
  // Write modified pixels back to the Canvas context
  // 将后处理完成的像素写回当前画布
  context.putImageData(output, 0, 0);
}
