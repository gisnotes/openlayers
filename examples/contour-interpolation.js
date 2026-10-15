import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import MousePosition from '../src/ol/control/MousePosition.js';
import {toStringHDMS} from '../src/ol/coordinate.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {fromLonLat, toLonLat} from '../src/ol/proj.js';
import DataTile from '../src/ol/source/DataTile.js';
import OSM from '../src/ol/source/OSM.js';
import RasterSource from '../src/ol/source/Raster.js';

const attribution =
  '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank">Data sources and attribution</a>';

/**
 * Decode Mapzen Terrarium elevation from RGB pixel array.
 * 从 RGB 像素数组解码 Mapzen Terrarium 格式的高程值
 * @param {Array<number>} pixel Pixel values [R, G, B, A] / 像素通道数组
 * @return {number|undefined} Elevation in meters / 高程值（米）
 */
const calculateElevation = function (pixel) {
  if (pixel[3]) {
    return -32768 + (pixel[0] * 256 + pixel[1] + pixel[2] / 256);
  }
};

// Use Float32 interpolation where supported for best results on mobile devices.
// 在支持的设备上使用 Float32 精度直接读取解算后的高程数值
const calculateElevationFromData = function (pixel) {
  return pixel[0];
};

const elevation = ['band', 1];
const tileSize = 256;
const gutter = 1;
const canvas = document.createElement('canvas');
canvas.width = tileSize * 3;
canvas.height = tileSize * 3;
const context = canvas.getContext('2d', {willReadFrequently: true});

// DataTile source with 3x3 gutter buffer loader / 具备 3x3 邻域外扩裙边的无缝高程数据源
const source = new DataTile({
  attributions: attribution,
  tileSize: tileSize,
  gutter: gutter,
  maxZoom: 15,
  interpolate: true,
  wrapX: true,
  loader: (z, x, y) => {
    const promises = [];
    // Load 3x3 neighbor tiles to support seamless interpolation across boundaries
    // 并发加载四周 9 张邻接切片，消除切片接缝处插值伪影
    for (let i = 0; i < 3; ++i) {
      for (let j = 0; j < 3; ++j) {
        promises.push(
          new Promise((resolve, reject) => {
            const maxY = 2 ** z;
            const yy = y + j - 1;
            if (yy < 0 || yy >= maxY) {
              return resolve();
            }
            const maxX = 2 ** z;
            const xx = (((x + i - 1) % maxX) + maxX) % maxX;
            const image = new Image();
            image.crossOrigin = '';
            image.addEventListener('error', () => reject());
            image.addEventListener('load', () => resolve(image));
            image.src = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${z}/${xx}/${yy}.png`;
          }),
        );
      }
    }
    return Promise.all(promises).then((images) => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 3; ++j) {
          const image = images.shift();
          if (image) {
            context.drawImage(image, i * tileSize, j * tileSize);
          }
        }
      }
      const data = context.getImageData(
        tileSize - gutter,
        tileSize - gutter,
        tileSize + 2 * gutter,
        tileSize + 2 * gutter,
      ).data;
      const pixels = data.length / 4;
      const floatData = new Float32Array(data.buffer);
      for (let i = 0, j = 0; i < pixels;) {
        floatData[i++] = calculateElevation(data.slice(j, (j += 4)));
      }
      return floatData;
    });
  },
});
const pixelValue = ['*', ['+', elevation, 32768], 256];

const style = {
  color: [
    'array',
    ['/', ['floor', ['/', pixelValue, 256 * 256]], 255],
    ['/', ['floor', ['/', ['%', pixelValue, 256 * 256], 256]], 255],
    ['/', ['%', pixelValue, 256], 255],
    1,
  ],
};

// Duplicate layers to isolate rendering pipelines for contour and mouse elevation
// 实例化两个独立的图层以避免两个 RasterSource 共享图层时 WebGL 冲突
const elevation1 = new TileLayer({
  source: source,
  style: style,
});
const elevation2 = new TileLayer({
  source: source,
  style: style,
});

/**
 * Image operation running in Web Worker to trace contour lines.
 * 在 Web Worker 线程中执行邻域比较并绘制等高线的栅格图像算法
 * @param {Array<ImageData>} inputs Input images / 输入图像数据
 * @param {Object} data Parameters from beforeoperations / 外部传入参数
 * @return {ImageData} Output contour image / 渲染生成的等高线图元
 */
const contours = function (inputs, data) {
  const elevationImage = inputs[0];
  const width = elevationImage.width;
  const height = elevationImage.height;
  const elevationData = elevationImage.data;
  const pixel = [0, 0, 0, 0];
  const contourData = new Uint8ClampedArray(elevationData.length);
  const interval = data.interval;

  let offset, pixelY, pixelX;
  for (pixelY = 0; pixelY < height; ++pixelY) {
    for (pixelX = 0; pixelX < width; ++pixelX) {
      // 4-neighborhood sampling: left, right, top, bottom / 4-邻域采样：左、右、上、下
      offset = (pixelY * width + Math.max(pixelX - 1, 0)) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      const leftElevation = calculateElevation(pixel);

      offset = (pixelY * width + Math.min(pixelX + 1, width - 1)) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      const rightElevation = calculateElevation(pixel);

      offset = (Math.max(pixelY - 1, 0) * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      const topElevation = calculateElevation(pixel);

      offset = (Math.min(pixelY + 1, height - 1) * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      const bottomElevation = calculateElevation(pixel);

      offset = (pixelY * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      const centerElevation = calculateElevation(pixel);

      if (
        leftElevation !== undefined &&
        rightElevation !== undefined &&
        topElevation !== undefined &&
        bottomElevation !== undefined &&
        centerElevation !== undefined
      ) {
        // Detect if adjacent pixels cross the contour interval / 判断当前点与相邻像素是否跨越等高线步长
        const contour = Math.floor(centerElevation / interval);
        if (
          contour !== Math.floor(leftElevation / interval) ||
          contour !== Math.floor(rightElevation / interval) ||
          contour !== Math.floor(topElevation / interval) ||
          contour !== Math.floor(bottomElevation / interval)
        ) {
          if (
            centerElevation > 0 &&
            leftElevation > 0 &&
            rightElevation > 0 &&
            topElevation > 0 &&
            bottomElevation > 0
          ) {
            // Land contour color (brownish gold) / 陆地等高线赋金棕色
            contourData[offset] = 0xe0;
            contourData[offset + 1] = 0x94;
            contourData[offset + 2] = 0x5e;
            contourData[offset + 3] = 255;
          } else {
            // Marine bathymetric contour color (cyan) / 海洋等深线赋青蓝色
            contourData[offset] = 0x00;
            contourData[offset + 1] = 0xa9;
            contourData[offset + 2] = 0xca;
            contourData[offset + 3] = 255;
          }
        }
      }
    }
  }
  return {data: contourData, width: width, height: height};
};

// RasterSource executing contour tracing / 执行等高线提取的栅格数据源
const contourSource = new RasterSource({
  sources: [elevation1],
  operationType: 'image',
  operation: contours,
  lib: {
    calculateElevation: calculateElevation,
  },
  resolutions: null,
});

// Dynamically adjust contour interval based on view resolution / 依据视图分辨率自适应调整等高距
contourSource.on('beforeoperations', function (event) {
  const data = event.data;
  if (event.resolution < 5) {
    data.interval = 10;
  } else if (event.resolution < 25) {
    data.interval = 50;
  } else if (event.resolution < 50) {
    data.interval = 100;
  } else if (event.resolution < 250) {
    data.interval = 500;
  } else {
    data.interval = 1000;
  }
});

const contourLayer = new ImageLayer({
  source: contourSource,
  opacity: 0.5,
});

// Invisible elevation probe layer for mouse position / 用于鼠标位置高程探测的只读透明图层
const elevationLayer = new ImageLayer({
  source: new RasterSource({
    sources: [elevation2],
    operation: function (pixels) {
      return pixels[0];
    },
    resolutions: null,
  }),
  opacity: 0,
});

const dataLayer = new TileLayer({
  source: source,
  style: {color: ['array', 0, 0, 0, 0]},
});

// Check for WebGL float texture extension / 检查设备是否支持 WebGL 浮点线性插值扩展
dataLayer.once('postrender', function (event) {
  const gl = event.context;
  if (!gl.getSupportedExtensions().includes('OES_texture_float_linear')) {
    alert('Device does not support float interpolation');
  }
});

// Initialize map centered near Mount Chimborazo / 初始化地图并定位至厄瓜多尔钦博拉索火山
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    dataLayer,
    contourLayer,
    elevationLayer,
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([-78.8175, -1.469167]),
    zoom: 17,
    maxZoom: 21,
  }),
});

// Mouse position control displaying interpolated elevation / 实时显示插值后高程的鼠标位置控件
const mousePositionControl = new MousePosition({
  className: 'custom-mouse-position',
  target: 'info',
  wrapX: false,
  coordinateFormat: function (coordinate) {
    let position = 'Position ' + toStringHDMS(toLonLat(coordinate)) + '<br>';
    let pixel = elevationLayer.getData(map.getPixelFromCoordinate(coordinate));
    if (pixel) {
      const elevation = calculateElevation(pixel);
      if (elevation !== undefined) {
        position += 'Elevation ' + elevation.toFixed(1) + ' meters';
      }
    }
    position += '<br><br>';

    pixel = dataLayer.getData(map.getPixelFromCoordinate(coordinate));
    if (pixel) {
      const elevation = calculateElevationFromData(pixel);
      if (elevation !== undefined) {
        position += 'Data value ' + elevation.toFixed(1) + ' meters';
      }
    }
    position += '<br>';
    return position;
  },
  placeholder: '<br><br><br><br>',
});
map.addControl(mousePositionControl);
