import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {register} from '../src/ol/proj/proj4.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';
import XYZ from '../src/ol/source/XYZ.js';

// MapTiler API Key / MapTiler 服务密钥
const key = 'EPhPi7Zr1GTS500UybLu';

// Basemap data attributions / 底图数据版权声明
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Register proj4 with OpenLayers so it can handle coordinate transformations between different projections.
// Must be called before any projection definitions are looked up and registered dynamically.
// 向 OpenLayers 注册 proj4 实例，使其支持不同投影坐标系之间的动态转换与计算。
// 必须在自动查找并注册任何未知投影定义之前先完成此注册步骤。
register(proj4);

// Create a GeoTIFF source for a Cloud-Optimized GeoTIFF (COG) in British National Grid (EPSG:27700).
// 'loadMissingProjection: true' enables automatic fetching and registering of unknown projection definitions via fromProjectionCode.
// 创建云优化 GeoTIFF (COG) 数据源，该影像采用英国国家格网坐标系 (EPSG:27700)。
// 配置 'loadMissingProjection: true' 可在检测到未知投影代码时，自动通过 fromProjectionCode 从远端服务查找并注册该投影。
const cogSource = new GeoTIFF({
  sources: [
    {
      url: 'https://mikenunn.net/data/MiniScale_(std_with_grid)_R23.tif',
      // Treat pixel value 0 as no-data to render backgrounds transparently
      // 将像元值 0 标识为无数据区域，使影像边缘的黑色背景呈现透明
      nodata: 0,
    },
  ],
  loadMissingProjection: true,
});

// Set attributions dynamically with current year for Ordnance Survey Crown Copyright
// 动态为 COG 数据源设置包含当前年份的英国皇家测量局 (Ordnance Survey) 版权信息
cogSource.setAttributions(
  'Contains OS data © Crown Copyright and database right ' +
    new Date().getFullYear(),
);

// Initialize map with two layers in different projections:
// 1. Satellite basemap in Web Mercator (EPSG:3857)
// 2. MiniScale COG overlay in British National Grid (EPSG:27700)
// The view is configured using cogSource.getView() which resolves to the COG's native projection.
// 初始化包含两个不同投影图层的地图：
// 1. Web 墨卡托投影 (EPSG:3857) 的卫星遥感底图；
// 2. 英国国家格网投影 (EPSG:27700) 的 MiniScale COG 叠加层。
// 视图通过 cogSource.getView() 异步解析得到，默认采用该 COG 的本地原生投影与范围。
const map = new Map({
  target: 'map',
  layers: [
    // Satellite basemap reprojected on the fly to the view's projection (EPSG:27700)
    // 卫星遥感底图，由 WebGLTile 在 GPU 片元着色器中实时重投影至视图坐标系 (EPSG:27700)
    new TileLayer({
      source: new XYZ({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
        maxZoom: 20,
        crossOrigin: '',
      }),
      // Reduce exposure to dim satellite imagery and highlight the map overlay
      // 降低曝光度以弱化卫星底图，突出上方叠加的地图细节
      style: {exposure: 0.2},
    }),
    // COG overlay layer rendered with partial transparency and gamma adjustment
    // COG 叠加图层，设置 70% 不透明度并应用伽马校正优化对比度
    new TileLayer({
      source: cogSource,
      opacity: 0.7,
      style: {gamma: 0.7},
    }),
  ],
  view: cogSource.getView(),
});
