import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import ImageLayer from '../src/ol/layer/Image.js';
import {fromLonLat} from '../src/ol/proj.js';
import Projection from '../src/ol/proj/Projection.js';
import {register} from '../src/ol/proj/proj4.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';

/**
 * Proj4js 透明集成机制说明：
 *
 * 1. 通过 proj4.defs() 注册 EPSG:21781 (瑞士国家投影 CH1903 / LV03) 的 Proj 字符串定义；
 * 2. 调用 register(proj4) 将 Proj4js 内部已注册的所有投影转换规则同步至 OpenLayers 全局投影表；
 * 3. 当我们通过 new Projection({code: 'EPSG:21781', ...}) 创建投影实例时，OpenLayers 会自动绑定 Proj4js 提供的正反算函数；
 *    若需直接获取带有单位、轴向等完整元数据的已注册投影对象，也可以直接调用 ol/proj#get('EPSG:21781')；
 * 4. 为投影配置的 extent 包围盒范围非常关键，OpenLayers 视图（View）依据该范围计算 Zoom 级别 0 时的默认初始分辨率。
 *    各投影的推荐有效范围可在 https://spatialreference.org/ 检索获取。
 */

// 注册瑞士国家投影定义（基于贝塞尔 1841 椭球体的斜轴等角圆柱投影 / 瑞士斜轴墨卡托）
proj4.defs(
  'EPSG:21781',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
    '+x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs',
);
// 同步注册至 OpenLayers
register(proj4);

// 创建带有合法有效范围的投影实例
const projection = new Projection({
  code: 'EPSG:21781',
  extent: [485869.5728, 76443.1884, 837076.5648, 299941.7864],
});

// 瑞士区域适用的显示范围 [minX, minY, maxX, maxY]（米）
const extent = [420000, 30000, 900000, 350000];

// 业务图层列表（均采用单图像 ImageLayer + ImageWMS）
const layers = [
  // 底图：瑞士联邦地形局 1:1,000,000 彩色像元地图（单图像 WMS）
  new ImageLayer({
    extent: extent,
    source: new ImageWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions:
        '© <a href="https://shop.swisstopo.admin.ch/en/products/maps/national/lk1000"' +
        'target="_blank">Pixelmap 1:1000000 / geo.admin.ch</a>',
      params: {
        'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
        'FORMAT': 'image/jpeg',
      },
      serverType: 'mapserver',
    }),
  }),
  // 专题图层：瑞士环境局全国洪水警戒分布图
  new ImageLayer({
    extent: extent,
    source: new ImageWMS({
      url: 'https://wms.geo.admin.ch/',
      crossOrigin: 'anonymous',
      attributions:
        '© <a href="https://www.hydrodaten.admin.ch/en/notes-on-the-flood-alert-maps.html"' +
        'target="_blank">Flood Alert / geo.admin.ch</a>',
      params: {'LAYERS': 'ch.bafu.hydroweb-warnkarte_national'},
      serverType: 'mapserver',
    }),
  }),
];

// 初始化地图实例
const map = new Map({
  controls: defaultControls().extend([new ScaleLine()]),
  layers: layers,
  target: 'map',
  view: new View({
    projection: projection,
    // 通过 fromLonLat 自动利用 Proj4js 将经纬度中心点 [8.23°E, 46.86°N] 转换为 EPSG:21781 平面米制坐标
    center: fromLonLat([8.23, 46.86], projection),
    extent: extent,
    zoom: 2,
  }),
});
