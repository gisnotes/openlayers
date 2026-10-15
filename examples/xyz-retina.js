import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Layer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import Source from '../src/ol/source/ImageTile.js';

// Enable geographic coordinates (longitude, latitude)
// 启用地理坐标系（经度，纬度）
useGeographic();

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Initialize map with WebGL tile layer and Retina @2x source
// 使用 WebGLTile 图层和 Retina @2x 高清源初始化地图
const map = new Map({
  target: 'map',
  layers: [
    new Layer({
      source: new Source({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/outdoor-v2/256/{z}/{x}/{y}@2x.png?key=' +
          key,
      }),
    }),
  ],
  view: new View({
    center: [-112.21324137318899, 36.105337765976756],
    zoom: 13,
  }),
});
