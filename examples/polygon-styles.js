import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import MultiPoint from '../src/ol/geom/MultiPoint.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

/* We are using two different styles for the polygons:
 *  - The first style is for the polygons themselves.
 *  - The second style is to draw the vertices of the polygons.
 *    In a custom `geometry` function the vertices of a polygon are
 *    returned as `MultiPoint` geometry, which will be used to render
 *    the style.
 *
 * 在这里我们为多边形定义了两种不同的样式规则（复合样式数组）：
 *  - 第 1 种样式应用于多边形本体（绘制蓝色半透明填充及蓝色边框）。
 *  - 第 2 种样式用于绘制多边形各个顶点的控制点。
 *    通过在 Style 中指定自定义 `geometry` 函数，动态提取多边形外环的全部顶点坐标，
 *    并封装为 `MultiPoint`（多点几何）返回，从而驱动 `image` 样式（橙色圆点）在此几何上渲染。
 */
const styles = [
  // 1. Style for the polygon body / 多边形本体样式（填充与描边）
  new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  }),
  // 2. Style for the polygon vertices / 多边形顶点样式（使用几何函数动态生成 MultiPoint）
  new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: 'orange',
      }),
    }),
    geometry: function (feature) {
      // return the coordinates of the first ring of the polygon
      // 获取多边形第 1 个环（即外环 Exterior Ring）的所有顶点坐标，并包装为 MultiPoint 几何对象
      const coordinates = feature.getGeometry().getCoordinates()[0];
      return new MultiPoint(coordinates);
    },
  }),
];

// GeoJSON FeatureCollection containing 4 polygon geometries (using EPSG:3857 coordinates)
// 包含 4 个多边形要素的 GeoJSON 数据集合（坐标系为 EPSG:3857 墨卡托投影）
const geojsonObject = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-5e6, 6e6],
            [-5e6, 8e6],
            [-3e6, 8e6],
            [-3e6, 6e6],
            [-5e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-2e6, 6e6],
            [-2e6, 8e6],
            [0, 8e6],
            [0, 6e6],
            [-2e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [1e6, 6e6],
            [1e6, 8e6],
            [3e6, 8e6],
            [3e6, 6e6],
            [1e6, 6e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-2e6, -1e6],
            [-1e6, 1e6],
            [0, -1e6],
            [-2e6, -1e6],
          ],
        ],
      },
    },
  ],
};

// Create a vector source and parse features from GeoJSON
// 创建矢量数据源，并使用 GeoJSON 格式解析器将上述对象转为 OpenLayers Feature 要素
const source = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObject),
});

// Create a vector layer and apply the composite styles array
// 创建矢量图层，应用上面定义的复合样式数组（同时渲染面本体与顶点）
const layer = new VectorLayer({
  source: source,
  style: styles,
});

// Initialize the map, mount to 'map' container, and configure initial view
// 初始化地图并挂载到 target 'map' DOM 容器，设置初始中心点与缩放级别
const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 3000000],
    zoom: 2,
  }),
});
