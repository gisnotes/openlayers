import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {transform} from '../src/ol/proj.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// 初始化 GeoTIFF 数据源（影像内嵌 UTM Zone 36N 投影元数据）
const source = new GeoTIFF({
  sources: [
    {
      url: 'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif',
    },
  ],
});

// 创建地图实例，默认采用 EPSG:3857（球面墨卡托）视图
const map = new Map({
  target: 'map',
  layers: [new TileLayer({source})],
  view: new View({
    center: [0, 0],
    zoom: 12,
  }),
});

// 读取解析 GeoTIFF 元数据后，平移重置地图中心以展示影像
source.getView().then((sourceView) => {
  const view = map.getView();

  // 将影像中心坐标从源数据投影（UTM Zone 36N）转换为视图投影（EPSG:3857）
  const center = transform(
    sourceView.center,
    sourceView.projection,
    view.getProjection(),
  );

  // 更新视图中心以准确定位并呈现影像
  view.setCenter(center);
});
