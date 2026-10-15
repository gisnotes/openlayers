import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// GeoTIFF source specifying both the base TIFF and an external overview pyramid file
// 创建 GeoTIFF 数据源，同时指定基础 TIFF 文件与外部概览金字塔文件 (.ovr)
const source = new GeoTIFF({
  sources: [
    {
      url: 'https://openlayers.org/data/raster/no-overviews.tif',
      overviews: ['https://openlayers.org/data/raster/no-overviews.ovr.tif'],
    },
  ],
});

// Initialize map with WebGL tile layer and default view from source
// 初始化地图实例，使用 WebGL 瓦片图层与数据源推导出的默认视图
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
  view: source.getView(),
});
