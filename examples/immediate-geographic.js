import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {upAndDown} from '../src/ol/easing.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {useGeographic} from '../src/ol/proj.js';
import {getVectorContext} from '../src/ol/render.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import Circle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Style from '../src/ol/style/Style.js';

// Enable geographic coordinates (longitude/latitude) for all inputs and rendering
// 全局启用地理坐标（经纬度 [lon, lat]）模式，几何体与视图直接使用地理坐标
useGeographic();

// Basemap tile layer using Stadia Maps (Stamen Toner style)
// 底图切片图层：采用 Stadia Maps（经典 Stamen Toner 黑白极简风格）
const layer = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

// Map instance configuration
// 地图实例配置：挂载图层与中心位于 [0, 0] 的全景视图
const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Shared circle image style (reused across all particles to avoid GC overhead)
// 共享圆形点样式单例（跨所有粒子复用，避免在每帧渲染循环中频繁创建对象导致 GC 抖动）
const image = new Circle({
  radius: 8,
  fill: new Fill({color: 'rgb(255, 153, 0)'}),
});

const style = new Style({
  image: image,
});

// Particle collection size (sliding window of 1000 geographic points)
// 粒子集合容量（维护包含 1000 个经纬度几何点的滑动窗口队列）
const n = 1000;
const geometries = new Array(n);

// Initialize random points across the globe: lon [-180, 180], lat [-90, 90]
// 初始化全球随机经纬度点：经度 [-180, 180]，纬度 [-90, 90]
for (let i = 0; i < n; ++i) {
  const lon = 360 * Math.random() - 180;
  const lat = 180 * Math.random() - 90;
  geometries[i] = new Point([lon, lat]);
}

// Hook into the tile layer's postrender event for immediate vector drawing
// 监听底图切片图层的 postrender 渲染完成事件，执行即时矢量绘制
layer.on('postrender', function (event) {
  // Obtain the vector rendering context directly from the render event
  // 直接从渲染事件中获取轻量级矢量渲染上下文
  const vectorContext = getVectorContext(event);

  for (let i = 0; i < n; ++i) {
    // Calculate importance based on point age in the sliding window
    // 根据点在滑动窗口中的生存周期计算重要性权重（衰减与呼吸缓动曲线）
    const importance = upAndDown(Math.pow((n - i) / n, 0.15));
    if (importance < 0.1) {
      continue;
    }
    // Update style properties dynamically on the singleton
    // 动态更新单例样式的透明度与缩放倍率
    image.setOpacity(importance);
    image.setScale(importance);
    vectorContext.setStyle(style);
    // Draw geometry immediately into the canvas context
    // 将几何图形直接光栅化绘制到当前画布上下文中
    vectorContext.drawGeometry(geometries[i]);
  }

  // Generate a new random point and slide the queue (FIFO)
  // 生成新的随机地理坐标点，并通过队列先进先出（FIFO）机制更新数组
  const lon = 360 * Math.random() - 180;
  const lat = 180 * Math.random() - 90;
  geometries.push(new Point([lon, lat]));
  geometries.shift();

  // Request next frame render to sustain continuous animation
  // 调度下一帧地图渲染，保持连续平滑动画
  map.render();
});
