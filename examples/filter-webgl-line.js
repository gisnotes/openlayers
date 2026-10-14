import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import IGC from '../src/ol/format/IGC.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// 滑翔机 IGC 格式飞行轨迹数据文件列表
const igcUrls = [
  'data/igc/Clement-Latour.igc',
  'data/igc/Damien-de-Baenst.igc',
  'data/igc/Sylvain-Dhonneur.igc',
  'data/igc/Tom-Payne.igc',
  'data/igc/Ulrich-Prinz.igc',
];

const source = new VectorSource({
  features: [],
});

// 异步加载并解析 IGC 轨迹数据（点坐标包含经度、纬度与时间戳 M 值，即 XYM 布局）
const format = new IGC();
for (let i = 0; i < igcUrls.length; ++i) {
  fetch(igcUrls[i])
    .then((resp) => resp.text())
    .then((data) => {
      const features = format.readFeatures(data, {
        featureProjection: 'EPSG:3857',
      });
      source.addFeatures(features);
    });
}

let timestamp = 1303240000;
// WebGL 矢量图层：使用 line-metric 表达式读取 M 维度的时间戳，并进行颜色插值与时间阈值过滤
const vectorLayer = new WebGLVectorLayer({
  source,
  style: [
    {
      style: {
        'stroke-width': 4,
        'stroke-color': [
          'interpolate',
          ['linear'],
          ['line-metric'],
          1303200000,
          'hsl(312,100%,39%)',
          1303240000,
          'hsl(36,100%,45%)',
        ],
      },
      filter: ['<=', ['line-metric'], ['var', 'timestamp']],
    },
  ],
  variables: {
    timestamp,
  },
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: [703365.7089403362, 5714629.865071137],
    zoom: 9,
  }),
});

function showTime() {
  const dateTime = new Date(timestamp * 1000);
  document.getElementById('time-value').textContent = dateTime.toUTCString();
}
document.getElementById('time-input').addEventListener('input', (event) => {
  timestamp = parseFloat(event.target.value);
  vectorLayer.updateStyleVariables({timestamp});
  showTime();
  map.render();
});
showTime();
