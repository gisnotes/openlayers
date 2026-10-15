import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {toRadians} from '../src/ol/math.js';
import OSM from '../src/ol/source/OSM.js';

// Initial view centered at [0, 0]
// 初始化视图：居中于原点 [0, 0]
const view = new View({
  center: [0, 0],
  zoom: 2,
});

// Map instance with OSM basemap
// 地图实例：加载基础 OSM 瓦片图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

function el(id) {
  return document.getElementById(id);
}

// Instantiate GyroNorm to normalize cross-browser device orientation events
// 实例化 GyroNorm：跨平台抹平不同浏览器陀螺仪与加速度计的原始数据差异
const gn = new GyroNorm();

gn.init().then(
  function () {
    // Start sensor listening loop
    // 启动物理传感器监听循环
    gn.start(function (event) {
      const center = view.getCenter();
      const resolution = view.getResolution();
      // Extract normalized Euler angles in radians
      // 提取归一化后的弧度角（α 航向角，β 俯仰角，γ 滚转角）
      const alpha = toRadians(event.do.alpha);
      const beta = toRadians(event.do.beta);
      const gamma = toRadians(event.do.gamma);

      el('alpha').innerText = alpha + ' [rad]';
      el('beta').innerText = beta + ' [rad]';
      el('gamma').innerText = gamma + ' [rad]';

      // Map device tilt angles to map pan offset scaled by current view resolution
      // 将设备倾斜度按当前分辨率比例映射为地图视图平移量
      center[0] -= resolution * gamma * 25;
      center[1] += resolution * beta * 25;

      view.setCenter(center);
    });
  },
  function (e) {
    // Handle devices without gyroscope/orientation support
    // 处理不支持陀螺仪或传感器受限的环境提示
    el('unsupported').innerText =
      typeof e === 'string' ? e : 'Could not initialize sensors';
  },
);
