import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Graticule from '../src/ol/layer/Graticule.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import Projection from '../src/ol/proj/Projection.js';
import {register} from '../src/ol/proj/proj4.js';
import VectorSource from '../src/ol/source/Vector.js';

// 向 Proj4js 注册基于标准球体（半径 6371000m）的全球摩尔威特等面积伪圆柱投影 (Sphere Mollweide / ESRI:53009)
proj4.defs(
  'ESRI:53009',
  '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +a=6371000 ' +
    '+b=6371000 +units=m +no_defs',
);
// 将定义同步至 OpenLayers 投影表
register(proj4);

// 为球形摩尔威特投影配置平面 Extent 及 WGS84 经纬度 WorldExtent。
// 这两个范围配置对于 Graticule 经纬网图层精准解算经纬线绘制范围至关重要：
// 1. extent: 椭圆平面外接矩形范围 [-2*sqrt(2)*R, -sqrt(2)*R, 2*sqrt(2)*R, sqrt(2)*R]；
// 2. worldExtent: 经纬度合法起止范围（微小内缩以避开极点与日界线数学奇异点）。
const sphereMollweideProjection = new Projection({
  code: 'ESRI:53009',
  extent: [
    -18019909.21177587, -9009954.605703328, 18019909.21177587,
    9009954.605703328,
  ],
  worldExtent: [-179, -89.99, 179, 89.99],
});

// 初始化地图实例
const map = new Map({
  // 允许通过键盘快捷键进行平移缩放交互
  keyboardEventTarget: document,
  layers: [
    // 全球生态大区矢量图层（原生数据为 EPSG:4326 GeoJSON，加载时自动在客户端重投影）
    new VectorLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ecoregions.json',
        format: new GeoJSON(),
      }),
      // 矢量样式：提取要素的 COLOR_BIO 字段颜色属性进行填充
      style: {
        'fill-color': ['string', ['get', 'COLOR_BIO'], '#eee'],
      },
    }),
    // 经纬网图层：自动依摩尔威特投影的曲率解算经纬线对称椭圆弧网格
    new Graticule(),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    projection: sphereMollweideProjection,
    zoom: 2,
  }),
});
