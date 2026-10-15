import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {getRenderPixel} from '../src/ol/render.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import OSM from '../src/ol/source/OSM.js';

// Base OSM layer / 底层 OSM 矢量底图
const osm = new TileLayer({
  source: new OSM({wrapX: true}),
});

const key = 'EPhPi7Zr1GTS500UybLu';

// Top satellite imagery layer to be clipped / 顶层待剪裁的卫星遥感瓦片图层
const imagery = new TileLayer({
  source: new ImageTile({
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    attributions:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
      '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
    maxZoom: 20,
  }),
});

const map = new Map({
  layers: [osm, imagery],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

const swipe = document.getElementById('swipe');

// Hook into prerender: enable scissor test and set scissor box based on slider value
// 挂载 prerender 钩子：开启硬件剪裁测试并根据滑块位置动态设置剪裁矩形
imagery.on('prerender', function (event) {
  const gl = event.context;
  gl.enable(gl.SCISSOR_TEST);

  const mapSize = map.getSize(); // [width, height] in CSS pixels / CSS 像素视口宽高

  // Get physical render coordinates and dimensions given CSS coordinates
  // 将 CSS 视口坐标转换为物理渲染像素坐标
  const bottomLeft = getRenderPixel(event, [0, mapSize[1]]);
  const topRight = getRenderPixel(event, [mapSize[0], 0]);

  const width = Math.round(
    (topRight[0] - bottomLeft[0]) * (Number(swipe.value) / 100),
  );
  const height = topRight[1] - bottomLeft[1];

  gl.scissor(bottomLeft[0], bottomLeft[1], width, height);
});

// Hook into postrender: disable scissor test to avoid affecting other layers
// 挂载 postrender 钩子：禁用硬件剪裁测试，防止污染后续图层上下文
imagery.on('postrender', function (event) {
  const gl = event.context;
  gl.disable(gl.SCISSOR_TEST);
});

// Trigger map redraw on slider input / 滑块拖动时触发地图重绘
swipe.addEventListener('input', function () {
  map.render();
});
