import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import Polygon from '../src/ol/geom/Polygon.js';
import {toContext} from '../src/ol/render.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Get target canvas element and create an immediate-mode VectorContext
// 获取目标 Canvas DOM 元素并创建脱离 Map 实例的即时模式 VectorContext 渲染上下文
const canvas = document.getElementById('canvas');
const vectorContext = toContext(canvas.getContext('2d'), {size: [100, 100]});

// Define styles for fill, stroke, and point markers
// 定义包含填充、描边与圆点标记的标准 OpenLayers 样式对象
const fill = new Fill({color: 'blue'});
const stroke = new Stroke({color: 'black'});
const style = new Style({
  fill: fill,
  stroke: stroke,
  image: new CircleStyle({
    radius: 10,
    fill: fill,
    stroke: stroke,
  }),
});
vectorContext.setStyle(style);

// Draw a line geometry directly to canvas pixels
// 直接在 Canvas 像素坐标系中绘制线段几何
vectorContext.drawGeometry(
  new LineString([
    [10, 10],
    [90, 90],
  ]),
);

// Draw a triangular polygon geometry directly to canvas pixels
// 直接在 Canvas 像素坐标系中绘制闭合三角形多边形几何
vectorContext.drawGeometry(
  new Polygon([
    [
      [2, 2],
      [98, 2],
      [2, 98],
      [2, 2],
    ],
  ]),
);

// Draw a point geometry (rendered as CircleStyle) directly to canvas pixels
// 直接在 Canvas 像素坐标系中绘制点几何（渲染为对应圆点样式）
vectorContext.drawGeometry(new Point([88, 88]));
