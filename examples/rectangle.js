import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {fromExtent} from '../src/ol/geom/Polygon.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Initialize map with OSM basemap and a rectangular polygon feature
// 初始化包含 OSM 底图与矩形多边形要素的地图实例
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [
          new Feature(
            // Create a rectangular polygon geometry directly from bounding box extent [minX, minY, maxX, maxY]
            // 利用 fromExtent 便捷函数直接从四至包围盒坐标 [minX, minY, maxX, maxY] 构建矩形多边形
            fromExtent([-1000000, 5000000, 3000000, 7000000]),
          ),
        ],
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [1000000, 6000000],
    zoom: 4,
  }),
});
