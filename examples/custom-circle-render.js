import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Circle from '../src/ol/geom/Circle.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import Style from '../src/ol/style/Style.js';

// Create a circle feature with center coordinates and radius in projection units
// 创建圆形要素，设置地理投影坐标系下的圆心坐标与半径（米）
const circleFeature = new Feature({
  geometry: new Circle([12127398.797692968, 4063894.123105166], 50),
});

// Configure custom renderer using HTML5 Canvas radial gradient
// 配置自定义渲染器，利用 Canvas 径向渐变绘制发光圆形
circleFeature.setStyle(
  new Style({
    renderer(coordinates, state) {
      // coordinates contains [[centerX, centerY], [edgeX, edgeY]] in pixel coordinates
      // coordinates 包含经过视口转换后的像素坐标：[[圆心X, 圆心Y], [圆周边缘X, 圆周边缘Y]]
      const [[x, y], [x1, y1]] = coordinates;
      const ctx = state.context;
      const dx = x1 - x;
      const dy = y1 - y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      const innerRadius = 0;
      const outerRadius = radius * 1.4;

      // Create radial gradient for smooth glowing edge
      // 创建径向渐变，实现从内圈透明到外圈半透明的发光光晕
      const gradient = ctx.createRadialGradient(
        x,
        y,
        innerRadius,
        x,
        y,
        outerRadius,
      );
      gradient.addColorStop(0, 'rgba(255,0,0,0)');
      gradient.addColorStop(0.6, 'rgba(255,0,0,0.2)');
      gradient.addColorStop(1, 'rgba(255,0,0,0.8)');

      // Fill the circle with the gradient
      // 使用渐变色填充圆形
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Draw red stroke around the circle perimeter
      // 沿圆周轮廓绘制红色描边
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.strokeStyle = 'rgba(255,0,0,1)';
      ctx.stroke();
    },
  }),
);

// Instantiate map with OSM basemap and custom-rendered vector circle
// 初始化地图，挂载 OSM 底图与带有自定义渲染样式的矢量图层
new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
      visible: true,
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [circleFeature],
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [12127398.797692968, 4063894.123105166],
    zoom: 19,
  }),
});
