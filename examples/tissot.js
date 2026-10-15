import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {circular as circularPolygon} from '../src/ol/geom/Polygon.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import TileWMS from '../src/ol/source/TileWMS.js';
import VectorSource from '../src/ol/source/Vector.js';

// Vector layers to hold Tissot indicatrices for both projections
// 用于存放两个投影对应蒂索变形椭圆要素的矢量图层
const vectorLayer4326 = new VectorLayer({
  source: new VectorSource(),
});

const vectorLayer3857 = new VectorLayer({
  source: new VectorSource(),
});

// Map 1: WGS84 Equirectangular / Plate Carrée projection (EPSG:4326)
// 第一个地图实例：基于 WGS84 等距矩形圆柱投影（EPSG:4326）
const map4326 = new Map({
  layers: [
    new TileLayer({
      source: new TileWMS({
        url: 'https://ahocevar.com/geoserver/wms',
        params: {
          'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
          'TILED': true,
        },
      }),
    }),
    vectorLayer4326,
  ],
  target: 'map4326',
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
  }),
});

// Map 2: Web Mercator conformal projection (EPSG:3857)
// 第二个地图实例：基于 Web 墨卡托正形等角投影（EPSG:3857）
const map3857 = new Map({
  layers: [
    new TileLayer({
      source: new TileWMS({
        url: 'https://ahocevar.com/geoserver/wms',
        params: {
          'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
          'TILED': true,
        },
      }),
    }),
    vectorLayer3857,
  ],
  target: 'map3857',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Radius of geodesic circles: 800,000 meters (800 km)
// 测地等径圆真实半径：800,000 米（800 公里）
const radius = 800000;
let x, y;

// Generate geodesic circles across global longitude and latitude grid (step: 30 degrees)
// 沿全球经纬网格（步长 30 度）循环生成真实的球面测地圆
for (x = -180; x < 180; x += 30) {
  for (y = -90; y <= 90; y += 30) {
    // Generate geodesic circle polygon with 64 vertices on the WGS84 ellipsoid
    // 在 WGS84 椭球体上生成具有 64 个顶点的测地圆多边形
    const circle4326 = circularPolygon([x, y], radius, 64);
    // Clone and transform geometry into EPSG:3857 projected coordinate space
    // 克隆该几何多边形并将其坐标转换至 EPSG:3857 墨卡托投影平面
    const circle3857 = circle4326.clone().transform('EPSG:4326', 'EPSG:3857');
    vectorLayer4326.getSource().addFeature(new Feature(circle4326));
    vectorLayer3857.getSource().addFeature(new Feature(circle3857));
  }
}
