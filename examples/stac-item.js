import STAC from 'ol-stac';
import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {register} from '../src/ol/proj/proj4.js';
import OSM from '../src/ol/source/OSM.js';

// Required to support source reprojection
// 注册 proj4 实例以支持数据源客户端动态重投影
register(proj4);

// Initialize STAC layer parsing remote STAC Item JSON
// 初始化 STAC 图层，解析远程 STAC Item JSON 元数据并自动构建图层组
const layer = new STAC({
  url: 'https://s3.us-west-2.amazonaws.com/sentinel-cogs/sentinel-s2-l2a-cogs/10/T/ES/2022/7/S2A_10TES_20220726_0_L2A/S2A_10TES_20220726_0_L2A.json',
});

const background = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [background, layer],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
});

// Fit map view to the STAC item footprint extent once metadata is ready
// 当 STAC 元数据加载就绪后，将地图视图缩放适配至该景影像的地理外包范围
layer.on('sourceready', () => {
  const view = map.getView();
  view.fit(layer.getExtent());
});
