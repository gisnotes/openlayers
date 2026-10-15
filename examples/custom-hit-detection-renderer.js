import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Circle from '../src/ol/geom/Circle.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import Style from '../src/ol/style/Style.js';

// Columbus Circle coordinates in Web Mercator
// 哥伦布圆环（Columbus Circle）经纬度转为 Web 墨卡托投影坐标
const columbusCircleCoords = fromLonLat([-73.98189, 40.76805]);
const labelTextStroke = 'rgba(120, 120, 120, 1)';
const labelText = 'Columbus Circle';

let pointerOverFeature = null;

// Helper to render label text on a Canvas 2D context
// 辅助函数：在指定的 Canvas 2D 上下文上绘制标签文本与文字阴影
const renderLabelText = (ctx, x, y, stroke) => {
  ctx.fillStyle = 'rgba(255,0,0,1)';
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold 30px verdana`;
  ctx.filter = 'drop-shadow(7px 7px 2px #e81)';
  ctx.fillText(labelText, x, y);
  ctx.strokeText(labelText, x, y);
};

// Create circle feature with 50-meter radius
// 创建半径为 50 米的圆形要素
const circleFeature = new Feature({
  geometry: new Circle(columbusCircleCoords, 50),
});

circleFeature.set('label-color', labelTextStroke);

// Attach style with separate renderer (visual) and hitDetectionRenderer (picking)
// 挂载样式：将常规视觉渲染与命中检测拾取渲染分离
circleFeature.setStyle(
  new Style({
    // Standard visual renderer: draws radial gradient circle AND label text
    // 标准视觉渲染器：同时绘制径向渐变大圆与中心文字
    renderer(coordinates, state) {
      const [[x, y], [x1, y1]] = coordinates;
      const ctx = state.context;
      const dx = x1 - x;
      const dy = y1 - y;
      const radius = Math.sqrt(dx * dx + dy * dy);

      const innerRadius = 0;
      const outerRadius = radius * 1.4;

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
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI, true);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,0,0,1)';
      ctx.stroke();

      renderLabelText(ctx, x, y, circleFeature.get('label-color'));
    },
    // Hit detection renderer: ONLY draws the text label, excluding the circle
    // 命中检测渲染器：仅向离屏 Hit-test 画布绘制文本，彻底排除圆周区域
    hitDetectionRenderer(coordinates, state) {
      const [x, y] = coordinates[0];
      const ctx = state.context;
      renderLabelText(ctx, x, y, circleFeature.get('label-color'));
    },
  }),
);

const map = new Map({
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
    center: columbusCircleCoords,
    zoom: 19,
  }),
});

// Detect pointer hover over feature and update dynamic label stroke color
// 监听指针移动事件，命中检测成功时动态高亮文字描边
map.on('pointermove', (evt) => {
  const featureOver = map.forEachFeatureAtPixel(evt.pixel, (feature) => {
    feature.set('label-color', 'rgba(255,255,255,1)');
    return feature;
  });

  if (pointerOverFeature && pointerOverFeature != featureOver) {
    pointerOverFeature.set('label-color', labelTextStroke);
  }
  pointerOverFeature = featureOver;
});
