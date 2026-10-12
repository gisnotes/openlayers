import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
// 注意：此处导入的是 WebGL 硬件加速瓦片图层（ol/layer/WebGLTile.js），而非传统的 Canvas 2D TileLayer
import TileLayer from '../src/ol/layer/WebGLTile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler API 密钥与地图版权说明
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// 定义传递给 WebGL 片元着色器（Fragment Shader）的初始样式变量字典
const variables = {
  exposure: 0, // 曝光度初始值（0 表示保持原图曝光）
  contrast: 0, // 对比度初始值（0 表示保持原图对比度）
  saturation: 0, // 饱和度初始值（0 表示保持原图饱和度）
};

// 创建 WebGL 瓦片图层：将曝光度、对比度、饱和度绑定到动态变量表达式 ['var', '...']
const layer = new TileLayer({
  style: {
    exposure: ['var', 'exposure'],
    contrast: ['var', 'contrast'],
    saturation: ['var', 'saturation'],
    variables: variables,
  },
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// 初始化地图实例
const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
});

// 遍历 variables 字典，自动将同名滑块控件（#exposure, #contrast, #saturation）与图层样式变量双向绑定
let variable;
for (variable in variables) {
  const name = variable;
  const element = document.getElementById(name);
  const value = variables[name];
  // 初始化滑块位置与旁边的数值文本（保留两位小数）
  element.value = value.toString();
  document.getElementById(name + '-value').innerText = value.toFixed(2);

  // 监听滑块实时拖动事件：调用 layer.updateStyleVariables() 极速更新 GPU Uniform 变量（无需重新编译着色器）
  element.addEventListener('input', function (event) {
    const value = parseFloat(event.target.value);
    document.getElementById(name + '-value').innerText = value.toFixed(2);
    layer.updateStyleVariables({[name]: value});
  });
}
