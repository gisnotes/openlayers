import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import {getRenderPixel} from '../src/ol/render.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler API Key for vector streets and satellite imagery
// MapTiler API 密钥：用于加载街道底图与卫星遥感影像
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Base streets tile layer (rendered underneath)
// 基础矢量街道切片图层（位于底层，作为透视背景呈现）
const roads = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
    tileSize: 512,
    maxZoom: 22,
  }),
});

// Satellite imagery tile layer (rendered on top, clipped into a spyglass circle)
// 卫星遥感切片图层（位于上层，通过 prerender 剪切为探照灯圆形透镜）
const imagery = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

const container = document.getElementById('map');

// Initialize map containing both roads and imagery layers
// 初始化地图实例：同时挂载道路底图与卫星图层，初始中心位于北美蒙大拿州
const map = new Map({
  layers: [roads, imagery],
  target: container,
  view: new View({
    center: fromLonLat([-109, 46.5]),
    zoom: 6,
  }),
});

// Radius of the circular spyglass lens in CSS pixels (default: 75px)
// 探照灯透镜半径（以 CSS 像素为基准，默认 75px）
let radius = 75;

// Listen to keyboard ArrowUp and ArrowDown to dynamically resize the spyglass
// 键盘方向键监听：按下 ↑ 键扩大半径（最大 150px），按下 ↓ 键缩小半径（最小 25px）
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
// 实时记录鼠标指针在视口容器中的像素坐标
let mousePosition = null;

container.addEventListener('mousemove', function (event) {
  mousePosition = map.getEventPixel(event);
  map.render();
});

container.addEventListener('mouseout', function () {
  mousePosition = null;
  map.render();
});

// Before rendering the imagery layer, apply a circular clipping mask
// 在卫星图层渲染之前（prerender 钩子）：计算物理像素半径并应用圆形裁剪蒙版
imagery.on('prerender', function (event) {
  const ctx = event.context;
  ctx.save();
  ctx.beginPath();
  if (mousePosition) {
    // Convert CSS pixels to Canvas physical render pixels (handles HiDPI/Retina displays)
    // 将 CSS 像素坐标与偏移点换算为真实 Canvas 物理像素（自适应高分屏/视网膜屏）
    const pixel = getRenderPixel(event, mousePosition);
    const offset = getRenderPixel(event, [
      mousePosition[0] + radius,
      mousePosition[1],
    ]);
    const canvasRadius = Math.sqrt(
      Math.pow(offset[0] - pixel[0], 2) + Math.pow(offset[1] - pixel[1], 2),
    );
    // Draw circle and stroke border ring
    // 绘制圆形剪切路径并描边半透明环线
    ctx.arc(pixel[0], pixel[1], canvasRadius, 0, 2 * Math.PI);
    ctx.lineWidth = (5 * canvasRadius) / radius;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.stroke();
  }
  // Restrict imagery rasterization exclusively to the circle interior
  // 执行裁切，将卫星图层限制在圆形路径内
  ctx.clip();
});

// After rendering the layer, restore the canvas context to avoid polluting other layers
// 渲染完成后（postrender 钩子）：弹出绘图状态栈，恢复上下文初始状态
imagery.on('postrender', function (event) {
  const ctx = event.context;
  ctx.restore();
});
