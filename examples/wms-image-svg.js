import {load} from '../src/ol/Image.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageSource from '../src/ol/source/Image.js';
import OSM from '../src/ol/source/OSM.js';
import {createLoader} from '../src/ol/source/wms.js';

// Layer list: OSM base and an ImageLayer requesting SVG format via custom WMS loader
// 图层列表：OSM 底图与通过自定义 WMS loader 请求 SVG 矢量格式的单图像图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new ImageLayer({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: new ImageSource({
      // Use createLoader with load function from ol/Image.js to treat SVG as HTMLImageElement
      // 使用 createLoader 并指定来自 ol/Image.js 的 load 函数，将 SVG 作为 HTMLImageElement 处理以保持矢量缩放锐利度
      loader: createLoader({
        url: 'https://ahocevar.com/geoserver/wms',
        params: {'LAYERS': 'topp:states', 'FORMAT': 'image/svg+xml'},
        ratio: 1,
        load: load,
      }),
    }),
  }),
];

const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  }),
});
