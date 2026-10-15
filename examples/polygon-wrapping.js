import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {fromExtent} from '../src/ol/geom/Polygon.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {get as getProjection} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Get EPSG:3857 projection limits (left and right bounds of the Web Mercator world)
// 获取 EPSG:3857 Web 墨卡托投影的边界范围（全球东西极值边界坐标）
const proj = getProjection('EPSG:3857');
const extent = proj.getExtent();
const leftX = extent[0];
const rightX = extent[2];

// Initialize map with OSM basemap and polygons wrapping across the antimeridian
// 初始化包含 OSM 底图以及跨越反子午线（日界线）多边形要素的地图实例
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      updateWhileAnimating: true,
      updateWhileInteracting: true,
      source: new VectorSource({
        features: [
          // A vertical line spanning the antimeridian boundary
          // 紧贴西侧反子午线边界的垂向狭长矩形
          new Feature(fromExtent([leftX, -15000000, leftX, 15000000])),
          // A polygon extending beyond the left boundary into the wrapped world
          // 向左延伸穿透西侧世界边界进入连续环绕世界的矩形
          new Feature(
            fromExtent([leftX - 2000000, 4500000, leftX + 4000000, 6500000]),
          ),
          // A polygon extending beyond the right boundary into the wrapped world
          // 向右延伸穿透东侧世界边界进入连续环绕世界的矩形
          new Feature(
            fromExtent([rightX - 4000000, 7500000, rightX + 2000000, 9500000]),
          ),
        ],
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 6000000],
    zoom: 1,
  }),
});
