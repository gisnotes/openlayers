import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// OpenStreetMap tile layer subject to geometric clipping
// OpenStreetMap 切片图层：作为待裁切的目标底图
const osm = new TileLayer({
  source: new OSM(),
});

// Initialize map centered at [0, 0]
// 初始化地图实例：中心位于经纬度原点 [0, 0]，初始缩放层级为 2
const map = new Map({
  layers: [osm],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Hook into prerender to establish the Bézier heart clipping mask
// 监听底图的 prerender 事件：在切片光栅化之前构建贝塞尔心形裁切蒙版
osm.on('prerender', function (event) {
  const ctx = event.context;

  // Calculate the pixel ratio and rotation of the canvas from inversePixelTransform
  // 根据事件逆变换矩阵计算 Canvas 画布的物理像素比与视口旋转角度
  const matrix = event.inversePixelTransform;
  const canvasPixelRatio = Math.sqrt(
    matrix[0] * matrix[0] + matrix[1] * matrix[1],
  );
  const canvasRotation = -Math.atan2(matrix[1], matrix[0]);
  ctx.save();

  // Center the canvas and neutralize rotation to position clipping mask in screen space
  // 将原点移至画布中心并抵消地图旋转，确保裁切蒙版稳定居中且保持竖直
  ctx.translate(ctx.canvas.width / 2, ctx.canvas.height / 2);
  ctx.rotate(-canvasRotation);

  // Scale and translate into local heart curve coordinates
  // 缩放并平移至心形局部坐标系
  ctx.scale(3 * canvasPixelRatio, 3 * canvasPixelRatio);
  ctx.translate(-75, -80);

  // Construct Bézier heart shape path
  // 利用三次贝塞尔曲线构建闭合爱心矢量路径
  ctx.beginPath();
  ctx.moveTo(75, 40);
  ctx.bezierCurveTo(75, 37, 70, 25, 50, 25);
  ctx.bezierCurveTo(20, 25, 20, 62.5, 20, 62.5);
  ctx.bezierCurveTo(20, 80, 40, 102, 75, 120);
  ctx.bezierCurveTo(110, 102, 130, 80, 130, 62.5);
  ctx.bezierCurveTo(130, 62.5, 130, 25, 100, 25);
  ctx.bezierCurveTo(85, 25, 75, 37, 75, 40);
  ctx.clip();

  // Reverse local scale and translation transformations
  // 反向撤销局部平移与缩放变换
  ctx.translate(75, 80);
  ctx.scale(1 / 3 / canvasPixelRatio, 1 / 3 / canvasPixelRatio);

  // Reapply canvas rotation and position back to original coordinate system
  // 恢复画布原有的旋转与居中位置
  ctx.rotate(canvasRotation);
  ctx.translate(-ctx.canvas.width / 2, -ctx.canvas.height / 2);
});

// Restore canvas context state after rendering completes
// postrender 阶段：恢复 Canvas 绘图状态栈，释放裁剪区
osm.on('postrender', function (event) {
  const ctx = event.context;
  ctx.restore();
});
