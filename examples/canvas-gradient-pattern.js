import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import KML from '../src/ol/format/KML.js';
import {DEVICE_PIXEL_RATIO} from '../src/ol/has.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// CanvasGradient（渐变）和 CanvasPattern（图案）定义在底层 Canvas 的物理像素空间中，
// 因此需要乘以当前设备的像素比（DEVICE_PIXEL_RATIO），以确保在高分屏（Retina）下渐变跨度一致
const pixelRatio = DEVICE_PIXEL_RATIO;

// 1. 创建一个离屏 <canvas> 上下文，用于生成横向七色彩虹线性渐变（CanvasGradient）
// 注：此处创建的 canvas 无需挂载到 DOM，仅作为调用 createLinearGradient 工厂方法的载体
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
// 定义从画布左上角 (0, 0) 到水平向右 (1024 * pixelRatio, 0) 的线性渐变
const gradient = context.createLinearGradient(0, 0, 1024 * pixelRatio, 0);
gradient.addColorStop(0, 'red'); // 0/6 处：红
gradient.addColorStop(1 / 6, 'orange'); // 1/6 处：橙
gradient.addColorStop(2 / 6, 'yellow'); // 2/6 处：黄
gradient.addColorStop(3 / 6, 'green'); // 3/6 处：绿
gradient.addColorStop(4 / 6, 'aqua'); // 4/6 处：青
gradient.addColorStop(5 / 6, 'blue'); // 5/6 处：蓝
gradient.addColorStop(1, 'purple'); // 6/6 处：紫

// 2. 创建矢量图层：加载美国各州 KML 边界数据，并将 CanvasGradient 直接作为 Fill 的 color 传入
const vectorLayer = new VectorLayer({
  background: 'white', // 设置图层背景为纯白色（无需加载底图瓦片）
  source: new VectorSource({
    url: 'data/kml/states.kml',
    // 关键配置：设为 false 以忽略 KML 文件内部自带的样式，从而让当前图层的渐变 style 生效
    format: new KML({extractStyles: false}),
  }),
  style: new Style({
    fill: new Fill({color: gradient}), // 直接传入 CanvasGradient 实例（同样也可传入 CanvasPattern 实例）
    stroke: new Stroke({
      color: '#333',
      width: 1,
    }),
  }),
});

// 3. 初始化地图实例
const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: fromLonLat([-100, 38.5]), // 视图中心定位在美国本土中心（经度 -100°, 纬度 38.5°）
    zoom: 4,
  }),
});
