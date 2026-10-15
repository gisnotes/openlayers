import Geolocation from '../src/ol/Geolocation.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Initial view centered at world origin
// 初始化视图：居中于原点 [0, 0]
const view = new View({
  center: [0, 0],
  zoom: 2,
});

// Full-screen map instance with OpenStreetMap tiles
// 沉浸式移动端全屏地图实例：挂载 OSM 切片底图
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: view,
});

// Geolocation tracking enabled immediately on startup
// 初始化地理定位控制器：启动即刻开启设备追踪
const geolocation = new Geolocation({
  projection: view.getProjection(),
  tracking: true,
});

// Listen once to the initial position fix, then lock view center and zoom
// 单次监听初次定位成功事件：自动将视图中心平移至用户物理坐标，并设置精细街区级分辨率
geolocation.once('change:position', function () {
  view.setCenter(geolocation.getPosition());
  view.setResolution(2.388657133911758);
});
