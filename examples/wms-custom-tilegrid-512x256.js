import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getWidth} from '../src/ol/extent.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {get as getProjection} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import TileWMS from '../src/ol/source/TileWMS.js';
import TileGrid from '../src/ol/tilegrid/TileGrid.js';

// Calculate resolutions for 22 zoom levels based on EPSG:3857 world extent width
// 基于 EPSG:3857 世界外包范围宽度计算 22 个缩放层级的分辨率数组
const projExtent = getProjection('EPSG:3857').getExtent();
const startResolution = getWidth(projExtent) / 256;
const resolutions = new Array(22);
for (let i = 0, ii = resolutions.length; i < ii; ++i) {
  resolutions[i] = startResolution / Math.pow(2, i);
}

// Define custom tile grid with rectangular non-square tile sizes (512x256 px)
// 定义带有非正方形矩形瓦片尺寸 (512x256 像素) 的自定义瓦片网格
const tileGrid = new TileGrid({
  extent: [-13884991, 2870341, -7455066, 6338219],
  resolutions: resolutions,
  tileSize: [512, 256],
});

// Layer list: standard OSM base and WMS layer using custom rectangular tile grid
// 图层列表：标准 OSM 底图与采用自定义矩形切片网格的 WMS 图层
const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new TileLayer({
    source: new TileWMS({
      url: 'https://ahocevar.com/geoserver/wms',
      params: {'LAYERS': 'topp:states', 'TILED': true},
      serverType: 'geoserver',
      tileGrid: tileGrid,
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
