import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import TileArcGISRest from '../src/ol/source/TileArcGISRest.js';

// ArcGIS Server REST MapService endpoint URL
// ArcGIS Server REST 动态地图服务地址
const url =
  'https://sampleserver6.arcgisonline.com/ArcGIS/rest/services/' +
  'USA/MapServer';

// Layers configuration: OSM basemap and tiled ArcGIS MapServer layer
// 图层配置：底层为 OSM 切片底图，顶层为限制在美国本土空间范围内的 ArcGIS 瓦片图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    // Constrain tile requests strictly to continental US extent to avoid redundant empty requests
    // 空间范围裁剪：将切片请求严格限定在美国本土经纬度范围内，消除无意义的空瓦片请求
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new TileArcGISRest({
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
