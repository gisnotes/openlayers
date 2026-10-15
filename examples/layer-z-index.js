import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';

// Declarative webgl/canvas vector styles for shapes (square, triangle, star)
// 几何图形矢量样式定义（蓝色正方形、红色三角形、绿色五角星）
const styles = {
  square: {
    'shape-points': 4,
    'shape-radius': 80,
    'shape-angle': Math.PI / 4,
    'shape-stroke-color': 'black',
    'shape-stroke-width': 1,
    'shape-fill-color': 'blue',
  },
  triangle: {
    'shape-points': 3,
    'shape-radius': 80,
    'shape-rotation': Math.PI / 4,
    'shape-stroke-color': 'black',
    'shape-stroke-width': 1,
    'shape-fill-color': 'red',
  },
  star: {
    'shape-points': 5,
    'shape-radius': 80,
    'shape-radius2': 40,
    'shape-rotation': Math.PI / 4,
    'shape-stroke-color': 'black',
    'shape-stroke-width': 1,
    'shape-fill-color': 'green',
  },
};

// Factory function to create a vector layer with a single point feature and initial zIndex
// 工厂函数：创建包含单点要素与初始 Z-index 优先级的矢量图层
function createLayer(coordinates, style, zIndex) {
  const feature = new Feature(new Point(coordinates));

  const source = new VectorSource({
    features: [feature],
  });

  const vectorLayer = new VectorLayer({
    source: source,
    style,
  });
  vectorLayer.setZIndex(zIndex);

  return vectorLayer;
}

// Create layers: star (unmanaged), square (managed, zIndex: 1), triangle (managed, zIndex: 0)
// 创建图层：五角星（非托管层）、方形（托管层，初始 Z-index=1）、三角形（托管层，初始 Z-index=0）
const layer0 = createLayer([40, 40], styles.star);
const layer1 = createLayer([0, 0], styles.square, 1);
const layer2 = createLayer([0, 40], styles.triangle, 0);

// Managed layers collection passed into the map constructor
// 传入地图构造函数的托管图层集合
const layers = [];
layers.push(layer1);
layers.push(layer2);

// Initialize map with managed layers
// 初始化地图并挂载托管图层
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 18,
  }),
});

// Set unmanaged layer directly on map: renders on top of all managed layers
// 直接通过 setMap 挂载非托管图层：脱离普通排序管线，始终置于托管图层之上
layer0.setMap(map);

// Bind input number controls to dynamically change layer Z-index
// 将输入框控件与对应图层的 Z-index 属性双向绑定
function bindInputs(id, layer) {
  const idxInput = document.getElementById('idx' + id);
  idxInput.onchange = function () {
    layer.setZIndex(parseInt(this.value, 10) || 0);
  };
  idxInput.value = String(layer.getZIndex());
}
bindInputs(1, layer1);
bindInputs(2, layer2);
