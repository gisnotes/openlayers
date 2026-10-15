import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
} from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Create a GeoTIFF source pointing to a Cloud Optimized GeoTIFF (Sentinel-2 L2A true color image)
// 创建指向云优化 GeoTIFF (Sentinel-2 哨兵 2 号 L2A 级真彩色遥感影像) 的 GeoTIFF 数据源
const source = new GeoTIFF({
  sources: [
    {
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
    },
  ],
});

// Initialize the map with a WebGL tile layer and an automatically derived view
// 初始化地图实例，使用 WebGL 瓦片图层并自动派生匹配影像范围与分辨率的视图
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
  // getView creates a View matching the GeoTIFF projection and extent, allowing 1 level of over-zooming
  // getView 根据 GeoTIFF 的投影与范围生成视图配置，并额外允许一级超分辨率放大缩放
  view: getView(source, withHigherResolutions(1), withExtentCenter()),
});
