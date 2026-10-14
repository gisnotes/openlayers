import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {
  addCoordinateTransforms,
  addProjection,
  transform,
} from '../src/ol/proj.js';
import Projection from '../src/ol/proj/Projection.js';
import TileWMS from '../src/ol/source/TileWMS.js';

// OpenLayers 默认未内置瑞士国家投影 EPSG:21781 (CH1903 / LV03)。
// 因此我们为 EPSG:21781 创建一个 Projection 投影实例，并通过 addProjection
// 将其注册到库中，使其可以通过投影代号进行全局检索。

const projection = new Projection({
  code: 'EPSG:21781',
  // extent 用于决定缩放级别 0 时的默认有效包围盒。
  // 各投影的推荐合法范围可查阅 https://spatialreference.org/。
  extent: [485869.5728, 76443.1884, 837076.5648, 299941.7864],
  units: 'm',
});
addProjection(projection);

// 声明 EPSG:21781 与 EPSG:4326 (WGS84 经纬度) 之间的双向坐标转换函数。
// 这些转换函数对于 ScaleLine 比例尺控件（用于反算地表点分辨率与大地线距离）
// 以及通过 ol/proj~transform 设置地图视图的初始中心点都是必不可少的。

addCoordinateTransforms(
  'EPSG:4326',
  projection,
  // 正向转换：WGS84 经纬度 [lng, lat] -> 瑞士平面直角坐标 [Easting(y), Northing(x)]
  function (coordinate) {
    return [
      WGStoCHy(coordinate[1], coordinate[0]),
      WGStoCHx(coordinate[1], coordinate[0]),
    ];
  },
  // 逆向转换：瑞士平面直角坐标 [Easting(y), Northing(x)] -> WGS84 经纬度 [lng, lat]
  function (coordinate) {
    return [
      CHtoWGSlng(coordinate[0], coordinate[1]),
      CHtoWGSlat(coordinate[0], coordinate[1]),
    ];
  },
);

// 瑞士区域适用的显示范围 [minx, miny, maxx, maxy]
const extent = [420000, 30000, 900000, 350000];

// 图层定义
const layers = [
  // 瓦片底图：瑞士联邦地形局 1:1,000,000 彩色像元地图（EPSG:21781）
  new TileLayer({
    extent: extent,
    source: new TileWMS({
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
  // 业务专题图层：瑞士环境局全国洪水警戒分布图
  new TileLayer({
    extent: extent,
    source: new TileWMS({
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
  controls: defaultControls().extend([
    // 配置公制比例尺控件（内部会自动调用上面注册的转换函数推算点分辨率）
    new ScaleLine({
      units: 'metric',
    }),
  ]),
  layers: layers,
  target: 'map',
  view: new View({
    projection: projection,
    // 将经纬度中心点 [8.23°E, 46.86°N]（瑞士中部卢塞恩湖附近）转换为 EPSG:21781 平面坐标
    center: transform([8.23, 46.86], 'EPSG:4326', 'EPSG:21781'),
    extent: extent,
    zoom: 2,
  }),
});

/*
 * 瑞士投影正反算多项式拟合函数（由瑞士联邦地形局官方提供）
 * 来源：https://www.swisstopo.admin.ch/en/knowledge-facts/surveying-geodesy/reference-systems/map-projections.html
 * 算法原理：以旧伯尔尼天文台为基准点，利用三次泰勒展开经验多项式完成高精度快速换算。
 */

/**
 * 将 WGS84 纬度/经度（十进制度）转换为瑞士东坐标 y (Easting)
 * @param {number} lat 纬度（十进制度）
 * @param {number} lng 经度（十进制度）
 * @return {number} 瑞士东坐标 y（米）
 */
function WGStoCHy(lat, lng) {
  // 十进制度转换为度分秒格式 (Sexagesimal)
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);

  // 度分秒转换为总角秒 (Sexagesimal seconds)
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);

  // 计算相对伯尔尼原点的辅助中间量（单位：万角秒）
  const lat_aux = (lat - 169028.66) / 10000;
  const lng_aux = (lng - 26782.5) / 10000;

  // 展开多项式计算 Y (Easting，基准原点偏移 600,000 米)
  const y =
    600072.37 +
    211455.93 * lng_aux -
    10938.51 * lng_aux * lat_aux -
    0.36 * lng_aux * Math.pow(lat_aux, 2) -
    44.54 * Math.pow(lng_aux, 3);

  return y;
}

/**
 * 将 WGS84 纬度/经度（十进制度）转换为瑞士北坐标 x (Northing)
 * @param {number} lat 纬度（十进制度）
 * @param {number} lng 经度（十进制度）
 * @return {number} 瑞士北坐标 x（米）
 */
function WGStoCHx(lat, lng) {
  // 十进制度转换为度分秒格式
  lat = DECtoSEX(lat);
  lng = DECtoSEX(lng);

  // 度分秒转换为总角秒
  lat = DEGtoSEC(lat);
  lng = DEGtoSEC(lng);

  // 计算相对伯尔尼原点的辅助中间量
  const lat_aux = (lat - 169028.66) / 10000;
  const lng_aux = (lng - 26782.5) / 10000;

  // 展开多项式计算 X (Northing，基准原点偏移 200,000 米)
  const x =
    200147.07 +
    308807.95 * lat_aux +
    3745.25 * Math.pow(lng_aux, 2) +
    76.63 * Math.pow(lat_aux, 2) -
    194.56 * Math.pow(lng_aux, 2) * lat_aux +
    119.79 * Math.pow(lat_aux, 3);

  return x;
}

/**
 * 将瑞士平面坐标 (y东, x北) 反算为 WGS84 纬度 (十进制度)
 * @param {number} y 瑞士东坐标（米）
 * @param {number} x 瑞士北坐标（米）
 * @return {number} WGS84 纬度（十进制度）
 */
function CHtoWGSlat(y, x) {
  // 军用坐标转换为民用坐标，并将单位转换为 1000 千米（相对伯尔尼原点的辅助量）
  const y_aux = (y - 600000) / 1000000;
  const x_aux = (x - 200000) / 1000000;

  // 展开多项式计算纬度中间值
  let lat =
    16.9023892 +
    3.238272 * x_aux -
    0.270978 * Math.pow(y_aux, 2) -
    0.002528 * Math.pow(x_aux, 2) -
    0.0447 * Math.pow(y_aux, 2) * x_aux -
    0.014 * Math.pow(x_aux, 3);

  // 单位由 10000 角秒转换为 1 角秒，再转换为十进制度 (除以 3600)
  lat = (lat * 100) / 36;

  return lat;
}

/**
 * 将瑞士平面坐标 (y东, x北) 反算为 WGS84 经度 (十进制度)
 * @param {number} y 瑞士东坐标（米）
 * @param {number} x 瑞士北坐标（米）
 * @return {number} WGS84 经度（十进制度）
 */
function CHtoWGSlng(y, x) {
  // 军用坐标转换为民用坐标，并将单位转换为 1000 千米
  const y_aux = (y - 600000) / 1000000;
  const x_aux = (x - 200000) / 1000000;

  // 展开多项式计算经度中间值
  let lng =
    2.6779094 +
    4.728982 * y_aux +
    0.791484 * y_aux * x_aux +
    0.1306 * y_aux * Math.pow(x_aux, 2) -
    0.0436 * Math.pow(y_aux, 3);

  // 单位由 10000 角秒转换为 1 角秒，再转换为十进制度
  lng = (lng * 100) / 36;

  return lng;
}

/**
 * 将十进制度转换为度分秒格式 (Sexagesimal DMS, dd.mmss)
 * @param {number} angle 十进制度角度
 * @return {number} 度分秒表示形式 (例如 46.5708 代表 46度57分08秒)
 */
function DECtoSEX(angle) {
  // 提取度、分、秒
  const deg = parseInt(angle, 10);
  const min = parseInt((angle - deg) * 60, 10);
  const sec = ((angle - deg) * 60 - min) * 60;

  // 返回度分秒结果 (dd.mmss)
  return deg + min / 100 + sec / 10000;
}

/**
 * 将度分秒格式角度转换为总角秒数
 * @param {number} angle 度分秒格式角度 (dd.mmss)
 * @return {number} 总角秒数 (Seconds)
 */
function DEGtoSEC(angle) {
  // 提取度、分、秒
  const deg = parseInt(angle, 10);
  let min = parseInt((angle - deg) * 100, 10);
  let sec = ((angle - deg) * 100 - min) * 100;

  // 避免 seconds=0 时的浮点舍入问题
  const parts = String(angle).split('.');
  if (parts.length == 2 && parts[1].length == 2) {
    min = Number(parts[1]);
    sec = 0;
  }

  // 计算并返回总角秒数 (秒 + 分*60 + 度*3600)
  return sec + min * 60 + deg * 3600;
}
