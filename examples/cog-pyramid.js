import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import WebGLTileLayer from '../src/ol/layer/WebGLTile.js';
import {sourcesFromTileGrid} from '../src/ol/source.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';
import TileGrid from '../src/ol/tilegrid/TileGrid.js';

// Metadata from https://s2downloads.eox.at/demo/EOxCloudless/2019/rgb/2019_EOxCloudless_rgb.json

// Tile grid defining resolutions and non-square tile sizes across zoom levels
// 瓦片网格：定义 EPSG:4326 下各缩放层级的空间分辨率与矩形瓦片尺寸
const tileGrid = new TileGrid({
  extent: [-180, -90, 180, 90],
  resolutions: [0.703125, 0.3515625, 0.17578125, 8.7890625e-2, 4.39453125e-2],
  tileSizes: [
    [512, 256],
    [1024, 512],
    [2048, 1024],
    [4096, 2048],
    [4096, 4096],
  ],
});

// Create WebGLTileLayer using sourcesFromTileGrid helper to instantiate GeoTIFF sources on demand
// 创建 WebGLTileLayer，利用 sourcesFromTileGrid 辅助函数按瓦片网格动态懒加载 GeoTIFF 数据源
const pyramid = new WebGLTileLayer({
  sources: sourcesFromTileGrid(
    tileGrid,
    ([z, x, y]) =>
      new GeoTIFF({
        sources: [
          {
            url: `https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/STACTA-TileDirectory-2025-viewing-basic-epsg-4326-zoom-6-0/${z}/${y}/${x}.tif`,
          },
        ],
      }),
  ),
});

const map = new Map({
  target: 'map',
  layers: [pyramid],
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 0,
    showFullExtent: true,
  }),
});
