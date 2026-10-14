import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import Projection from '../src/ol/proj/Projection.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';
import TileWMS from '../src/ol/source/TileWMS.js';

/**
 * 图层列表定义
 * 包含一个瓦片式 WMS（TileWMS）底图和一个单图像 WMS（ImageWMS）业务专题图层。
 * 两者均采用瑞士国家坐标系 EPSG:21781 (CH1903 / LV03)。
 */
const layers = [
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

// 极简投影对象（Minimal Projection）：
// 仅配置空间参考标识码（SRS code）与地图单位（units）。
// 使用该极简投影对象时，客户端无法执行经纬度与其他坐标系之间的正逆转换。
// 客户端向 WMS 请求切片或单图时，只需附带该 code 以及视口笛卡尔直角坐标范围（BBOX）；
// 服务端会自行根据该代号渲染制图，客户端无需感知该坐标在地球椭球面上的经纬度几何关系。
//
// 在无坐标转换函数的情况下，OpenLayers 默认将投影单位（此处为米 'm'）视作地表真实距离。
// 对于局部工程或国家投影系统，此假设与地表真实尺度的偏差极小，足以支撑比例尺控件（ScaleLine）
// 呈现出极具实用价值的近似比例。

const projection = new Projection({
  code: 'EPSG:21781',
  units: 'm',
});

// 初始化地图实例
const map = new Map({
  controls: defaultControls().extend([new ScaleLine()]),
  layers: layers,
  target: 'map',
  view: new View({
    // 瑞士伯尔尼附近的旧国家投影坐标点 [X(东), Y(北)]
    center: [660000, 190000],
    projection: projection,
    zoom: 9,
  }),
});
