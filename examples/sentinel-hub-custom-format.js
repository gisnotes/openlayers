import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import SentinelHub from '../src/ol/source/SentinelHub.js';

useGeographic();

// Configure Sentinel Hub source with default PNG format
// 配置 Sentinel Hub 数据源，初始默认使用 PNG 格式
const source = new SentinelHub({
  data: [
    {
      type: 'sentinel-2-l2a',
      dataFilter: {
        timeRange: {
          from: '2024-05-30T00:00:00Z',
          to: '2024-06-01T00:00:00Z',
        },
      },
    },
  ],
  evalscript: {
    setup: () => ({
      input: ['B12', 'B08', 'B04'],
      output: {bands: 3},
    }),
    evaluatePixel: (sample) => [
      2.5 * sample.B12,
      2 * sample.B08,
      2 * sample.B04,
    ],
  },
  format: 'image/png',
});

const map = new Map({
  layers: [new TileLayer({source})],
  target: 'map',
  view: new View({
    center: [-121.75, 46.85],
    zoom: 10,
    minZoom: 7,
    maxZoom: 13,
  }),
});

// Authenticate via OAuth form
// 监听认证表单提交，设置鉴权密钥
document.getElementById('auth-form').addEventListener('submit', (event) => {
  const clientId = event.target.elements['id'].value;
  const clientSecret = event.target.elements['secret'].value;
  source.setAuth({clientId, clientSecret});
});

const format = document.getElementById('format');

/**
 * Update image format on the Sentinel Hub source dynamically.
 * 动态调用 source.setFormat() 切换目标切片压缩格式。
 */
function updateInputData() {
  source.setFormat(format.value);
}

format.addEventListener('change', () => updateInputData());
updateInputData();

source.on('change', () => {
  if (source.getState() === 'error') {
    alert(source.getError());
  }
});
