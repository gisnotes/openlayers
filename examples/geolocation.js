import Feature from '../src/ol/Feature.js';
import Geolocation from '../src/ol/Geolocation.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Initialize initial map view centered at [0, 0]
// 初始化地图初始视图：居中于全球原点 [0, 0]
const view = new View({
  center: [0, 0],
  zoom: 2,
});

// Map instance with OpenStreetMap base layer
// 地图实例：挂载标准 OSM 切片底图
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

// Initialize OpenLayers Geolocation controller
// 初始化 OpenLayers 地理定位控制器：配置高精度模式并自动绑定视图投影
const geolocation = new Geolocation({
  // enableHighAccuracy must be set to true to have the heading value.
  // 必须将 enableHighAccuracy 设为 true 才能在移动设备上启用物理 GPS 并获取航向角与速度
  trackingOptions: {
    enableHighAccuracy: true,
  },
  projection: view.getProjection(),
});

function el(id) {
  return document.getElementById(id);
}

// Toggle position tracking on checkbox change
// 监听复选框切换：动态启动或暂停 GPS 位置追踪
el('track').addEventListener('change', function () {
  geolocation.setTracking(this.checked);
});

// Update the HTML dashboard when any geolocation attribute changes
// 监听位置及运动指标变更事件：更新网页仪表盘信息
geolocation.on('change', function () {
  el('accuracy').innerText = geolocation.getAccuracy() + ' [m]';
  el('altitude').innerText = geolocation.getAltitude() + ' [m]';
  el('altitudeAccuracy').innerText = geolocation.getAltitudeAccuracy() + ' [m]';
  el('heading').innerText = geolocation.getHeading() + ' [rad]';
  el('speed').innerText = geolocation.getSpeed() + ' [m/s]';
});

// Handle geolocation errors (permission denied, timeout, unavailable)
// 监听定位异常：呈现错误提示信息
geolocation.on('error', function (error) {
  const info = document.getElementById('info');
  info.innerHTML = error.message;
  info.style.display = '';
});

// Accuracy polygon feature representation
// 定位精度范围面要素：监听 change:accuracyGeometry 动态更新圆形包围面
const accuracyFeature = new Feature();
geolocation.on('change:accuracyGeometry', function () {
  accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
});

// User location marker point feature representation
// 用户当前位置点要素：监听 change:position 动态更新几何位置点
const positionFeature = new Feature();
positionFeature.setStyle(
  new Style({
    image: new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#3399CC',
      }),
      stroke: new Stroke({
        color: '#fff',
        width: 2,
      }),
    }),
  }),
);

geolocation.on('change:position', function () {
  const coordinates = geolocation.getPosition();
  positionFeature.setGeometry(coordinates ? new Point(coordinates) : null);
});

// Dedicated vector layer for displaying the user position and accuracy circle
// 独立矢量图层：用于绘制精度范围面与位置点标记
new VectorLayer({
  map: map,
  source: new VectorSource({
    features: [accuracyFeature, positionFeature],
  }),
});
