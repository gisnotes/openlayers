import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

// MapTiler access key and copyright attributions / MapTiler 访问密钥与版权信息
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Tile source configuration / 瓦片数据源配置
const source = new ImageTile({
  attributions: attributions,
  url: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
  tileSize: 512,
});

// Initialize map instance / 初始化地图实例
const map = new Map({
  layers: [new TileLayer({source: source})],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Listen for global map load start / 监听地图全局加载开始事件，显示 CSS 旋转器
map.on('loadstart', function () {
  map.getTargetElement().classList.add('spinner');
});

// Listen for global map load completion / 监听地图全局加载完成事件，移除 CSS 旋转器
map.on('loadend', function () {
  map.getTargetElement().classList.remove('spinner');
});
