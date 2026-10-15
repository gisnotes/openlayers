import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import OSM from '../src/ol/source/OSM.js';
import Raster from '../src/ol/source/Raster.js';

/**
 * Generates a shaded relief image given elevation data.
 * Uses a 3x3 neighborhood for determining slope and aspect.
 * 基于数字高程切片使用 3x3 邻域解算坡度与坡向，生成日照山体阴影图像
 * @param {Array<ImageData>} inputs Array of input images. / 输入图像数组
 * @param {Object} data Data added in the "beforeoperations" event. / 外部上下文参数
 * @return {ImageData|Object} Output image. / 计算生成的山体阴影图像
 */
function shade(inputs, data) {
  const elevationImage = inputs[0];
  const width = elevationImage.width;
  const height = elevationImage.height;
  const elevationData = elevationImage.data;
  const shadeData = new Uint8ClampedArray(elevationData.length);
  const dp = data.resolution * 2;
  const maxX = width - 1;
  const maxY = height - 1;
  const pixel = [0, 0, 0, 0];
  const twoPi = 2 * Math.PI;
  const halfPi = Math.PI / 2;
  const sunEl = (Math.PI * data.sunEl) / 180;
  const sunAz = (Math.PI * data.sunAz) / 180;
  const cosSunEl = Math.cos(sunEl);
  const sinSunEl = Math.sin(sunEl);
  let pixelX,
    pixelY,
    x0,
    x1,
    y0,
    y1,
    offset,
    z0,
    z1,
    dzdx,
    dzdy,
    slope,
    aspect,
    cosIncidence,
    scaled;

  /**
   * Extract elevation in meters from Terrarium DEM format.
   * 从 Terrarium 格式像素解码真实高程（米）
   * @param {Array<number>} pixel RGBA values / 像素数组
   * @return {number} Elevation in meters / 高程（米）
   */
  function calculateElevation(pixel) {
    // Terrarium encoding: red * 256 + green + blue / 256 - 32768
    // Mapbox format alternative: (red * 256 * 256 + green * 256 + blue) * 0.1 - 10000
    return pixel[0] * 256 + pixel[1] + pixel[2] / 256 - 32768;
  }

  // Iterate over all pixels calculating gradients in X and Y / 遍历视口像素计算 X 与 Y 方向有限差分梯度
  for (pixelY = 0; pixelY <= maxY; ++pixelY) {
    y0 = pixelY === 0 ? 0 : pixelY - 1;
    y1 = pixelY === maxY ? maxY : pixelY + 1;
    for (pixelX = 0; pixelX <= maxX; ++pixelX) {
      x0 = pixelX === 0 ? 0 : pixelX - 1;
      x1 = pixelX === maxX ? maxX : pixelX + 1;

      // Determine elevation for (x0, pixelY) / 计算西侧邻域高程
      offset = (pixelY * width + x0) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z0 = data.vert * calculateElevation(pixel);

      // Determine elevation for (x1, pixelY) / 计算东侧邻域高程
      offset = (pixelY * width + x1) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z1 = data.vert * calculateElevation(pixel);

      // Partial derivative dz/dx / X 方向偏导数
      dzdx = (z1 - z0) / dp;

      // Determine elevation for (pixelX, y0) / 计算北侧邻域高程
      offset = (y0 * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z0 = data.vert * calculateElevation(pixel);

      // Determine elevation for (pixelX, y1) / 计算南侧邻域高程
      offset = (y1 * width + pixelX) * 4;
      pixel[0] = elevationData[offset];
      pixel[1] = elevationData[offset + 1];
      pixel[2] = elevationData[offset + 2];
      pixel[3] = elevationData[offset + 3];
      z1 = data.vert * calculateElevation(pixel);

      // Partial derivative dz/dy / Y 方向偏导数
      dzdy = (z1 - z0) / dp;

      // Slope calculation / 计算坡度角
      slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));

      // Aspect calculation aligned to compass azimuth / 计算坡向角并对齐罗盘方位角
      aspect = Math.atan2(dzdy, -dzdx);
      if (aspect < 0) {
        aspect = halfPi - aspect;
      } else if (aspect > halfPi) {
        aspect = twoPi - aspect + halfPi;
      } else {
        aspect = halfPi - aspect;
      }

      // Lambertian diffuse reflectance illumination / 朗伯漫反射光照余弦值解算
      cosIncidence =
        sinSunEl * Math.cos(slope) +
        cosSunEl * Math.sin(slope) * Math.cos(sunAz - aspect);

      offset = (pixelY * width + pixelX) * 4;
      scaled = 255 * cosIncidence;
      shadeData[offset] = scaled;
      shadeData[offset + 1] = scaled;
      shadeData[offset + 2] = scaled;
      shadeData[offset + 3] = elevationData[offset + 3];
    }
  }

  return {
    data: shadeData,
    width,
    height,
    colorSpace: 'srgb',
  };
}

// AWS Mapzen Terrarium DEM tile source / AWS 托管的 Mapzen Terrarium 高程数据源
const elevation = new ImageTile({
  url: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
  maxZoom: 15,
  attributions:
    '<a href="https://github.com/tilezen/joerd/blob/master/docs/attribution.md" target="_blank">Data sources and attribution</a>',
});

// Raster source with image operation running in worker / 在 Worker 中执行光照运算的栅格数据源
const raster = new Raster({
  sources: [elevation],
  operationType: 'image',
  operation: shade,
});

// Map instance with OSM basemap and shaded relief overlay / 初始化地图与半透明山体阴影层
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new ImageLayer({
      opacity: 0.3,
      source: raster,
    }),
  ],
  view: new View({
    center: [-13615645, 4497969],
    zoom: 13,
  }),
});

// Interactive controls for vertical exaggeration and sun angles / 垂直夸大与太阳入射角交互控件
const controlIds = ['vert', 'sunEl', 'sunAz'];
const controls = {};
controlIds.forEach(function (id) {
  const control = document.getElementById(id);
  const output = document.getElementById(id + 'Out');
  control.addEventListener('input', function () {
    output.innerText = control.value;
    raster.changed();
  });
  output.innerText = control.value;
  controls[id] = control;
});

// Pass parameters and resolution before operations start / 运算前注入真实分辨率与光照参数
raster.on('beforeoperations', function (event) {
  const data = event.data;
  data.resolution = event.resolution;
  for (const id in controls) {
    data[id] = Number(controls[id].value);
  }
});
