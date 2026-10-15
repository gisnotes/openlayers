import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import OSM from '../src/ol/source/OSM.js';

// MapTiler API access key
// MapTiler API 访问密钥
const key = 'EPhPi7Zr1GTS500UybLu';

// High-resolution satellite imagery layer rendered via WebGLTile
// 基于 WebGLTile 硬件加速渲染的高分辨率卫星航拍遥感影像底层
const imagery = new TileLayer({
  className: 'ol-layer-imagery',
  source: new ImageTile({
    attributions:
      '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ',
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Standard OpenStreetMap base layer placed on top
// 叠加在上方 Standard OpenStreetMap 街道底图图层
const osm = new TileLayer({
  source: new OSM(),
});

// Create map instance stacking imagery and OSM layers
// 创建地图实例，按数组顺序由下至上层叠渲染卫星图与街道图
const map = new Map({
  layers: [imagery, osm],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// DOM input controls for dynamic opacity adjustment
// 获取用于动态调节透明度的滑动条输入框与数值展示容器
const opacityInput = document.getElementById('opacity-input');
const opacityOutput = document.getElementById('opacity-output');

// Update layer opacity and reflect current value in the UI label
// 实时更新街道图层不透明度并同步回显数值文本
function update() {
  const opacity = parseFloat(opacityInput.value);
  osm.setOpacity(opacity);
  opacityOutput.innerText = opacity.toFixed(2);
}

// Bind input event for continuous smooth dragging updates
// 监听滑动条 input 事件实现平滑连续调节
opacityInput.addEventListener('input', update);
update();
