import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import TileJSON from '../src/ol/source/TileJSON.js';

const key =
  'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ';

// Initialize map with a grayscale OSM basemap and a semi-transparent TileJSON layer
// 初始化地图实例：OSM 基础底图通过 CSS 类名应用黑白灰度滤镜，上层叠加半透明地震灾情专题瓦片
const map = new Map({
  layers: [
    new TileLayer({
      className: 'bw', // Styled via CSS filter: grayscale(100%) / 由 CSS 滤镜定义为灰度黑白
      source: new OSM(),
    }),
    new TileLayer({
      source: new TileJSON({
        url:
          'https://api.tiles.mapbox.com/v4/mapbox.va-quake-aug.json?secure&access_token=' +
          key,
        crossOrigin: 'anonymous',
        // This layer has transparency, so do not fade tiles to avoid dark halo flicker
        // 该图层自身具有半透明通道，必须设置 transition: 0 禁用淡入重叠暗影
        transition: 0,
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([-77.93255, 37.9555]),
    zoom: 7,
  }),
});
