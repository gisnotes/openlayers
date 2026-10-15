import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import TileJSON from '../src/ol/source/TileJSON.js';

// Initialize map with a TileJSON source
// 初始化地图实例，接入符合 TileJSON 规范的切片服务
const map = new Map({
  layers: [
    new TileLayer({
      source: new TileJSON({
        url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad?f=tilejson',
        crossOrigin: 'anonymous', // Enable CORS for remote tile access / 开启匿名跨域支持
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
