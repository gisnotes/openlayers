import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// Initialize map with a constrained extent over the contiguous United States
// 初始化地图实例：视图限制在美国本土空间范围并启用全视口自适应
const map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    extent: [-13882269, 2890586, -7456136, 6340207],
    showFullExtent: true,
  }),
});

// Reusable text label style singleton with high-contrast white stroke halo
// 可复用的文本注记样式单例：配置黑色填充与 4px 白色高对比度文字描边
const labelStyle = new Style({
  text: new Text({
    font: '13px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 4,
    }),
  }),
});

// Reusable polygon boundary and fill style
// 可复用的多边形边界描边与半透明填充样式
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

// Vector layer loading US states GeoJSON and applying dynamic rich text labels
// 矢量图层：加载美国各州边界 GeoJSON 数据，并在要素样式回调中动态组装富文本注记
const vectorLayer = new VectorLayer({
  background: 'white',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/us-states.json',
    format: new GeoJSON(),
  }),
  style: function (feature) {
    // Pass an array of alternating [text, font] segments to build rich typography
    // 传入交替的 [文本片段, 字体描述] 数组以构建多行、多粗细字号的富文本排版
    labelStyle
      .getText()
      .setText([
        feature.getId(),
        'bold 13px Calibri,sans-serif',
        ` ${feature.get('name')}`,
        '',
        '\n',
        '',
        `${feature.get('density')} people/mi²`,
        'italic 11px Calibri,sans-serif',
      ]);
    return style;
  },
});

map.addLayer(vectorLayer);
