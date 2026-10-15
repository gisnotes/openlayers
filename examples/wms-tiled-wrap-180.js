import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import TileWMS from '../src/ol/source/TileWMS.js';

// Layer definitions: OSM base and a global WMS layer with seamless wrapX across 180° meridian
// 图层定义：OSM 底图与支持跨 180° 经线连续无缝环绕的全球 WMS 图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    source: new TileWMS({
      url: 'https://ahocevar.com/geoserver/ne/wms',
      params: {'LAYERS': 'ne:ne_10m_admin_0_countries', 'TILED': true},
      serverType: 'geoserver',
      // wrapX is true by default, enabling tiles to repeat across the dateline
      // wrapX 默认为 true，切片可自动跨越国际日界线在各世界副本中循环复用
    }),
  }),
];

const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});
