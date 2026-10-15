import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import OSM from '../src/ol/source/OSM.js';
import TileWMS from '../src/ol/source/TileWMS.js';

// Configure map layers: OSM base layer and a tiled WMS layer
// 配置地图图层：OSM 基础底图与瓦片式 WMS 业务图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    // Bounding box constraint for US states
    // 限制图层仅在美国各州范围内请求瓦片
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new TileWMS({
      url: 'https://ahocevar.com/geoserver/wms',
      params: {'LAYERS': 'topp:states', 'TILED': true},
      serverType: 'geoserver',
      // Transparent overlay, disable fade-in transition to avoid visual artifacts
      // 覆盖层具有透明背景，关闭淡入过渡动画以避免透明重叠闪烁
      transition: 0,
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
