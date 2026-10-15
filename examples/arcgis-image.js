import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageArcGISRest from '../src/ol/source/ImageArcGISRest.js';
import OSM from '../src/ol/source/OSM.js';

// ArcGIS Server REST MapService endpoint URL (US sample demographic/boundary map)
// ArcGIS Server REST 动态地图服务地址（美国人口统计与边界示例服务）
const url =
  'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/' +
  'USA/MapServer';

// Layers configuration: OSM basemap and dynamic ArcGIS ImageLayer
// 图层配置：底层为 OSM 切片底图，顶层为 ArcGIS 动态图像服务单张出图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new ImageLayer({
    source: new ImageArcGISRest({
      // 1:1 pixel match with the viewport container
      // ratio: 1 使得请求的图片像素尺寸严格匹配视口大小
      ratio: 1,
      // Dynamic request parameters (e.g. LAYERS, LAYERDEFS, TIME)
      // 动态请求参数对象：可传入 LAYERS 显隐图层或 LAYERDEFS 属性过滤
      params: {},
      url: url,
    }),
  }),
];

// Initialize map centered over continental US in Web Mercator
// 初始化地图实例：中心位于美国本土上空（Web 墨卡托平面坐标）
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  }),
});
