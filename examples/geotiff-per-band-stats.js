import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// GeoTIFF source with independent min, max, and nodata configured per band
// 为每个波段独立配置 min、max 极值和 nodata 无效值的 GeoTIFF 数据源
const source = new GeoTIFF({
  sources: [
    {
      url: 'https://spacenet-dataset.s3.amazonaws.com/spacenet/SN3_roads/train/AOI_3_Paris/PS-RGB/SN3_roads_train_AOI_3_Paris_PS-RGB_img101.tif',
      nodata: 0,
      min: [110, 216, 217], // Minimum reflectance values for Bands 1, 2, 3 / 波段 1、2、3 对应的最小值
      max: [586, 579, 432], // Maximum reflectance values for Bands 1, 2, 3 / 波段 1、2、3 对应的最大值
    },
  ],
});

// Initialize map with WebGL tile layer and the source's native view
// 初始化地图实例，使用 WebGL 瓦片图层与数据源原生视图
const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: source.getView(),
});
