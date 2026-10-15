import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import OverviewMap from '../src/ol/control/OverviewMap.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Shared tile source to reuse tile cache
// 共享切片数据源以复用瓦片内存缓存
const source = new OSM();

// Initialize overview map control with its own layer
// 初始化鹰眼微缩地图控件并配置专属图层
const overviewMapControl = new OverviewMap({
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
});

// Initialize main map with overview control
// 初始化主地图并挂载鹰眼控件
const map = new Map({
  controls: defaultControls().extend([overviewMapControl]),
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
  target: 'map',
  view: new View({
    center: [500000, 6000000],
    zoom: 7,
  }),
});
