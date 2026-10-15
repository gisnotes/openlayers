import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import Projection from '../src/ol/proj/Projection.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';
import TileWMS from '../src/ol/source/TileWMS.js';

// Layer definitions: Tiled WMS base map and Single Image WMS thematic overlay
// 图层定义：瓦片式 WMS 底图与单图像 WMS 专题业务图层（均采用瑞士国家坐标系 EPSG:21781）
const layers = [
  // Tiled WMS layer (Swiss Federal Office of Topography 1:1,000,000 pixel map)
  // 基础底图：瓦片 WMS 图层（瑞士联邦地形局 1:1,000,000 彩色像元地图）
  new TileLayer({
    source: new TileWMS({
      attributions:
        '© <a href="https://shop.swisstopo.admin.ch/en/products/maps/national/lk1000"' +
        'target="_blank">Pixelmap 1:1000000 / geo.admin.ch</a>',
      crossOrigin: 'anonymous',
      params: {
        'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
        'FORMAT': 'image/jpeg',
      },
      url: 'https://wms.geo.admin.ch/',
    }),
  }),
  // Thematic layer: Single Image WMS (Swiss national flood alert hazard map)
  // 专题业务图层：单图像 WMS 图层（瑞士环境局全国洪水警戒分布图）
  new ImageLayer({
    source: new ImageWMS({
      attributions:
        '© <a href="https://www.hydrodaten.admin.ch/en/notes-on-the-flood-alert-maps.html"' +
        'target="_blank">Flood Alert / geo.admin.ch</a>',
      crossOrigin: 'anonymous',
      params: {'LAYERS': 'ch.bafu.hydroweb-warnkarte_national'},
      serverType: 'mapserver',
      url: 'https://wms.geo.admin.ch/',
    }),
  }),
];

// Minimal projection object: only configured with SRS code and distance units.
// Without coordinate transform functions, OpenLayers passes planar BBOX directly to the WMS server.
// 极简投影对象：仅配置空间参考标识码与地图单位。
// 在客户端无需转换坐标的情况下，OpenLayers 直接将平面直角坐标范围传递给 WMS 服务端。
const projection = new Projection({
  code: 'EPSG:21781',
  units: 'm',
});

// Initialize map instance with ScaleLine control and custom planar projection view
// 初始化地图实例，配置比例尺控件与自定义平面投影视图
const map = new Map({
  controls: defaultControls().extend([new ScaleLine()]),
  layers: layers,
  target: 'map',
  view: new View({
    // Coordinates near Bern in Swiss national grid [Easting, Northing]
    // 瑞士伯尔尼附近的旧国家投影坐标点 [X(东), Y(北)]
    center: [660000, 190000],
    projection: projection,
    zoom: 9,
  }),
});
