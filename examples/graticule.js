import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Graticule from '../src/ol/layer/Graticule.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import Stroke from '../src/ol/style/Stroke.js';

// Initialize map with base tile layer and Graticule grid layer
// 初始化地图实例，叠加 OpenStreetMap 底图与经纬网图层
const map = new Map({
  layers: [
    // OpenStreetMap base tile layer with wrapX disabled
    // 关闭跨日界线多世界横向环绕的 OpenStreetMap 底图图层
    new TileLayer({
      source: new OSM({
        wrapX: false,
      }),
    }),
    // Graticule layer displaying coordinate grid lines and longitude/latitude labels
    // 经纬网图层：绘制橙色虚线网格线并在视口边缘标注经纬度度数
    new Graticule({
      // the style to use for the lines, optional.
      // 经纬网格线样式：半透明橙色、线宽 2px、点划虚线
      strokeStyle: new Stroke({
        color: 'rgba(255,120,0,0.9)',
        width: 2,
        lineDash: [0.5, 4],
      }),
      // Display degree labels along viewport edges
      // 启用在视口四周边缘自适应吸附展示经纬度度数文本
      showLabels: true,
      wrapX: false,
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([4.8, 47.75]),
    zoom: 5,
  }),
});
