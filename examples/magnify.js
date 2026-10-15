import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import {getRenderPixel} from '../src/ol/render.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler API Key for satellite imagery access
// MapTiler API 密钥：用于加载卫星遥感影像切片
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Imagery tile layer
// 遥感影像切片图层
const imagery = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

const container = document.getElementById('map');

// Initialize map centered on Montana, USA
// 初始化地图实例：中心定位至美国蒙大拿州
const map = new Map({
  layers: [imagery],
  target: container,
  view: new View({
    center: fromLonLat([-109, 46.5]),
    zoom: 6,
  }),
});

// Magnifier lens radius in CSS pixels (default: 75px)
// 放大镜透镜半径（CSS 像素，默认 75px）
let radius = 75;

// Dynamically adjust magnifier radius with arrow keys
// 键盘监听：使用 ↑ / ↓ 方向键动态调整放大镜半径（25px ~ 150px）
document.addEventListener('keydown', function (evt) {
  if (evt.key === 'ArrowUp') {
    radius = Math.min(radius + 5, 150);
    map.render();
    evt.preventDefault();
  } else if (evt.key === 'ArrowDown') {
    radius = Math.max(radius - 5, 25);
    map.render();
    evt.preventDefault();
  }
});

// Track current pointer position in CSS pixels
// 实时追踪鼠标光标在容器中的像素位置
let mousePosition = null;

container.addEventListener('mousemove', function (event) {
  mousePosition = map.getEventPixel(event);
  map.render();
});

container.addEventListener('mouseout', function () {
  mousePosition = null;
  map.render();
});

// After rendering the layer, render an oversampled magnified circle around the pointer
// 在图层渲染完成后（postrender 钩子）：对光标周围区域进行 2x 像素级超采样放大渲染
imagery.on('postrender', function (event) {
  if (mousePosition) {
    // Calculate physical render pixels and radius on Canvas (HiDPI support)
    // 换算 Canvas 物理渲染像素与半径（适配高分屏）
    const pixel = getRenderPixel(event, mousePosition);
    const offset = getRenderPixel(event, [
      mousePosition[0] + radius,
      mousePosition[1],
    ]);
    const half = Math.sqrt(
      Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2),
    );
    const context = event.context;
    const centerX = pixel[0];
    const centerY = pixel[1];
    const originX = centerX - half;
    const originY = centerY - half;
    const size = Math.round(2 * half + 1);

    // Read original pixel data from the square bounding box
    // 从正方形局部包围盒中读取原始像素数据
    const sourceData = context.getImageData(originX, originY, size, size).data;
    const dest = context.createImageData(size, size);
    const destData = dest.data;

    // Resample pixels: 2x zoom within the circle, 1:1 outside
    // 像素重采样循环：在圆形透镜内部执行 2 倍放大采样，在圆外保持原图
    for (let j = 0; j < size; ++j) {
      for (let i = 0; i < size; ++i) {
        const dI = i - half;
        const dJ = j - half;
        const dist = Math.sqrt(dI * dI + dJ * dJ);
        let sourceI = i;
        let sourceJ = j;
        if (dist < half) {
          sourceI = Math.round(half + dI / 2);
          sourceJ = Math.round(half + dJ / 2);
        }
        const destOffset = (j * size + i) * 4;
        const sourceOffset = (sourceJ * size + sourceI) * 4;
        destData[destOffset] = sourceData[sourceOffset];
        destData[destOffset + 1] = sourceData[sourceOffset + 1];
        destData[destOffset + 2] = sourceData[sourceOffset + 2];
        destData[destOffset + 3] = sourceData[sourceOffset + 3];
      }
    }

    // Write magnified pixels back and draw lens highlight border
    // 将重采样后的像素写回画布，并绘制半透明白色圆形光环边框
    context.beginPath();
    context.arc(centerX, centerY, half, 0, 2 * Math.PI);
    context.lineWidth = (3 * half) / radius;
    context.strokeStyle = 'rgba(255,255,255,0.5)';
    context.putImageData(dest, originX, originY);
    context.stroke();
    context.restore();
  }
});
