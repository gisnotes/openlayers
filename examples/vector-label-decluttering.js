import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// Initialize map centered on North America in Web Mercator
// 初始化地图实例：中心定位至北美大陆上空
const map = new Map({
  target: 'map',
  view: new View({
    center: fromLonLat([-100, 38.5]),
    zoom: 4,
  }),
});

// Text label style with overflow: true to allow labels exceeding polygon bounds to participate in decluttering
// 文本注记样式：启用 overflow: true，使得超出多边形几何包围盒的注记也能参与全局避让管线
const labelStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    overflow: true,
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});

// Boundary and fill style for state polygons
// 州行政区划多边形的面填充与边界描边样式
const countryStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
});
const style = [countryStyle, labelStyle];

// Vector layer with declutter: true enabled to prevent text label overlap
// 矢量图层：启用 declutter: true，通过 R 树空间索引自动避让重叠的文本注记
const vectorLayer = new VectorLayer({
  background: 'white',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/us-states.json',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    // Split space-separated names into multi-line labels for compact bounding boxes
    // 将包含空格的多单词地名按空格换行，形成更紧凑的像素包围盒以提升避让容纳率
    const label = feature.get('name').split(' ').join('\n');
    labelStyle.getText().setText(label);
    return style;
  },
  declutter: true,
});

map.addLayer(vectorLayer);
