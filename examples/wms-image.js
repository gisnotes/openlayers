import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';
import OSM from '../src/ol/source/OSM.js';

// Configure map layers: OSM base and a single image WMS layer
// 配置地图图层：OSM 基础瓦片底图与单图像 WMS 业务图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new ImageLayer({
    // Bounding box constraint for US states
    // 限制图层仅在美国各州范围内请求单张大图
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageWMS({
      url: 'https://ahocevar.com/geoserver/wms',
      params: {'LAYERS': 'topp:states'},
      // ratio: 1 fetches an image exactly matching the map viewport size
      // ratio: 1 请求与当前地图视口尺寸完全一致的图像（不额外预加载周边缓冲）
      ratio: 1,
      serverType: 'geoserver',
    }),
  }),
];

// Initialize map centered on the United States
// 初始化地图实例，中心对齐美国本土
const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  }),
});
