import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Modify from '../src/ol/interaction/Modify.js';
import Select from '../src/ol/interaction/Select.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// 根据几何类型返回不同的静态样式映射
const styleFunction = (function () {
  const styles = {};
  const image = new CircleStyle({
    radius: 5,
    fill: null,
    stroke: new Stroke({color: 'orange', width: 2}),
  });
  styles['Point'] = new Style({image: image});
  styles['Polygon'] = new Style({
    stroke: new Stroke({
      color: 'blue',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 255, 0.1)',
    }),
  });
  styles['MultiLineString'] = new Style({
    stroke: new Stroke({
      color: 'green',
      width: 3,
    }),
  });
  styles['MultiPolygon'] = new Style({
    stroke: new Stroke({
      color: 'yellow',
      width: 1,
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 0, 0.1)',
    }),
  });
  styles['default'] = new Style({
    stroke: new Stroke({
      color: 'red',
      width: 3,
    }),
    fill: new Fill({
      color: 'rgba(255, 0, 0, 0.1)',
    }),
    image: image,
  });
  return function (feature) {
    return styles[feature.getGeometry().getType()] || styles['default'];
  };
})();

// 测试数据集：包含单点、多点、折线、带洞多边形、复合折线、复合面以及几何集合
const geojsonObject = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Point',
        'coordinates': [0, 0],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiPoint',
        'coordinates': [
          [-2e6, 0],
          [0, -2e6],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [4e6, -2e6],
          [8e6, 2e6],
          [9e6, 2e6],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'LineString',
        'coordinates': [
          [4e6, -2e6],
          [8e6, 2e6],
          [8e6, 3e6],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'Polygon',
        'coordinates': [
          [
            [-5e6, -1e6],
            [-4e6, 1e6],
            [-3e6, -1e6],
            [-5e6, -1e6],
          ],
          [
            [-4.5e6, -0.5e6],
            [-3.5e6, -0.5e6],
            [-4e6, 0.5e6],
            [-4.5e6, -0.5e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiLineString',
        'coordinates': [
          [
            [-1e6, -7.5e5],
            [-1e6, 7.5e5],
          ],
          [
            [-1e6, -7.5e5],
            [-1e6, 7.5e5],
            [-5e5, 0],
            [-1e6, -7.5e5],
          ],
          [
            [1e6, -7.5e5],
            [15e5, 0],
            [15e5, 0],
            [1e6, 7.5e5],
          ],
          [
            [-7.5e5, -1e6],
            [7.5e5, -1e6],
          ],
          [
            [-7.5e5, 1e6],
            [7.5e5, 1e6],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'MultiPolygon',
        'coordinates': [
          [
            [
              [-5e6, 6e6],
              [-5e6, 8e6],
              [-3e6, 8e6],
              [-3e6, 6e6],
              [-5e6, 6e6],
            ],
          ],
          [
            [
              [-3e6, 6e6],
              [-2e6, 8e6],
              [0, 8e6],
              [0, 6e6],
              [-3e6, 6e6],
            ],
          ],
          [
            [
              [1e6, 6e6],
              [1e6, 8e6],
              [3e6, 8e6],
              [3e6, 6e6],
              [1e6, 6e6],
            ],
          ],
        ],
      },
    },
    {
      'type': 'Feature',
      'geometry': {
        'type': 'GeometryCollection',
        'geometries': [
          {
            'type': 'LineString',
            'coordinates': [
              [-5e6, -5e6],
              [0, -5e6],
            ],
          },
          {
            'type': 'Point',
            'coordinates': [4e6, -5e6],
          },
          {
            'type': 'Polygon',
            'coordinates': [
              [
                [1e6, -5e6],
                [2e6, -3.5e6],
                [3e6, -5e6],
                [1e6, -5e6],
              ],
            ],
          },
          {
            'type': 'Polygon',
            'coordinates': [
              [
                [1e6, -5e6],
                [2e6, -6.5e6],
                [3e6, -5e6],
                [1e6, -5e6],
              ],
            ],
          },
        ],
      },
    },
  ],
};

const source = new VectorSource({
  features: new GeoJSON().readFeatures(geojsonObject),
});

const layer = new VectorLayer({
  source: source,
  style: styleFunction,
});

// 选中与修改过程中的高亮草绘样式
const overlayStyle = (function () {
  const styles = {};
  styles['Polygon'] = [
    new Style({
      fill: new Fill({
        color: [255, 255, 255, 0.5],
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: [255, 255, 255, 1],
        width: 5,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: [0, 153, 255, 1],
        width: 3,
      }),
    }),
  ];
  styles['MultiPolygon'] = styles['Polygon'];

  styles['LineString'] = [
    new Style({
      stroke: new Stroke({
        color: [255, 255, 255, 1],
        width: 5,
      }),
    }),
    new Style({
      stroke: new Stroke({
        color: [0, 153, 255, 1],
        width: 3,
      }),
    }),
  ];
  styles['MultiLineString'] = styles['LineString'];

  styles['Point'] = [
    new Style({
      image: new CircleStyle({
        radius: 7,
        fill: new Fill({
          color: [0, 153, 255, 1],
        }),
        stroke: new Stroke({
          color: [255, 255, 255, 0.75],
          width: 1.5,
        }),
      }),
      zIndex: 100000,
    }),
  ];
  styles['MultiPoint'] = styles['Point'];

  styles['GeometryCollection'] = styles['Polygon'].concat(styles['Point']);

  return function (feature) {
    return styles[feature.getGeometry().getType()];
  };
})();

// 选择交互：选中要素时应用 overlayStyle
const select = new Select({
  style: overlayStyle,
});

// 修改交互：通过 insertVertexCondition 限制禁止向多边形中插入新顶点
const modify = new Modify({
  features: select.getFeatures(),
  style: overlayStyle,
  insertVertexCondition: function () {
    // 禁止向多边形要素中添加新顶点（仅允许拖动已有顶点）
    return !select
      .getFeatures()
      .getArray()
      .every(function (feature) {
        return /Polygon/.test(feature.getGeometry().getType());
      });
  },
});

const map = new Map({
  interactions: defaultInteractions().extend([select, modify]),
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 1000000],
    zoom: 2,
    multiWorld: true,
  }),
});
