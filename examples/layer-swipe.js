import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {getRenderPixel} from '../src/ol/render.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import OSM from '../src/ol/source/OSM.js';

// Base OpenStreetMap tile layer (rendered underneath across the full viewport)
// 基础 OpenStreetMap 切片图层：铺满整个视口底层，作为被卷帘透视的底图
const osm = new TileLayer({
  source: new OSM(),
});

// MapTiler API Key for aerial satellite imagery
// MapTiler API 密钥：用于加载卫星遥感切片
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Aerial satellite imagery tile layer (clipped dynamically on top)
// 卫星遥感切片图层：叠加在顶层，由卷帘滑块动态裁切矩形视口
const aerial = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Initialize map containing both base OSM and aerial imagery layers
// 初始化地图实例：挂载 OSM 与卫星影像双图层，全景居中显示
const map = new Map({
  layers: [osm, aerial],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Range input slider element for controlling swipe divider position (0% - 100%)
// 卷帘滑动条控件：控制卷帘分割线位置百分比
const swipe = document.getElementById('swipe');

// Hook into prerender on aerial layer to apply rectangular clip mask
// 在卫星图层渲染之前（prerender 阶段）：计算滑块分割线并将右侧区域设为裁剪蒙版
aerial.on('prerender', function (event) {
  const ctx = event.context;
  const mapSize = map.getSize();
  const width = mapSize[0] * (Number(swipe.value) / 100);

  // Map CSS pixel coordinates to Canvas device render pixels (handles HiDPI/Retina)
  // 将四个视口顶点的 CSS 坐标换算为 Canvas 物理像素坐标（自适应视网膜高分屏）
  const tl = getRenderPixel(event, [width, 0]);
  const tr = getRenderPixel(event, [mapSize[0], 0]);
  const bl = getRenderPixel(event, [width, mapSize[1]]);
  const br = getRenderPixel(event, mapSize);

  // Construct rectangular clipping path for the right half
  // 绘制右半侧可见矩形裁切路径并启用裁剪
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(tl[0], tl[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(tr[0], tr[1]);
  ctx.closePath();
  ctx.clip();
});

// Restore canvas context after rendering to prevent affecting subsequent passes
// 渲染完成后（postrender 阶段）：弹出状态栈恢复画布原始状态
aerial.on('postrender', function (event) {
  const ctx = event.context;
  ctx.restore();
});

// Re-render map on every slider input interaction
// 监听滑动条实时拖拽事件：调度地图重绘以更新卷帘分割位置
swipe.addEventListener('input', function () {
  map.render();
});
