import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Polygon from '../src/ol/geom/Polygon.js';
import Draw, {
  createBox,
  createRegularPolygon,
} from '../src/ol/interaction/Draw.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource({wrapX: false});

const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
  }),
});

const typeSelect = document.getElementById('type');

let draw; // global so we can remove it later / 全局变量，便于后续动态移除与重置

function addInteraction() {
  let value = typeSelect.value;
  if (value !== 'None') {
    let geometryFunction;
    if (value === 'Square') {
      value = 'Circle';
      // Generate 4-sided regular polygon (square)
      // 生成 4 边正多边形（正方形）
      geometryFunction = createRegularPolygon(4);
    } else if (value === 'Box') {
      value = 'Circle';
      // Generate axis-aligned bounding box from two points
      // 将两点对角线转换为矩形面
      geometryFunction = createBox();
    } else if (value === 'Star') {
      value = 'Circle';
      // Custom geometry function to construct a star polygon
      // 自定义几何函数：根据圆心与半径推算多角星交替顶点
      geometryFunction = function (coordinates, geometry) {
        const center = coordinates[0];
        const last = coordinates[coordinates.length - 1];
        const dx = center[0] - last[0];
        const dy = center[1] - last[1];
        const radius = Math.sqrt(dx * dx + dy * dy);
        const rotation = Math.atan2(dy, dx);
        const newCoordinates = [];
        const numPoints = 12;
        for (let i = 0; i < numPoints; ++i) {
          const angle = rotation + (i * 2 * Math.PI) / numPoints;
          const fraction = i % 2 === 0 ? 1 : 0.5;
          const offsetX = radius * fraction * Math.cos(angle);
          const offsetY = radius * fraction * Math.sin(angle);
          newCoordinates.push([center[0] + offsetX, center[1] + offsetY]);
        }
        newCoordinates.push(newCoordinates[0].slice());
        if (!geometry) {
          geometry = new Polygon([newCoordinates]);
        } else {
          geometry.setCoordinates([newCoordinates]);
        }
        return geometry;
      };
    }
    draw = new Draw({
      source: source,
      type: value,
      geometryFunction: geometryFunction,
    });
    map.addInteraction(draw);
  }
}

/**
 * Handle shape type change event.
 * 处理形状类型下拉框切换事件。
 */
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

document.getElementById('undo').addEventListener('click', function () {
  draw.removeLastPoint();
});

addInteraction();
