import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import SentinelHub from '../src/ol/source/SentinelHub.js';

useGeographic();

// Initialize source with true-color RGB band extraction (Red B04, Green B03, Blue B02)
// 初始化数据源：订阅真彩色波段（红 B04、绿 B03、蓝 B02）并进行对比度增强
const source = new SentinelHub({
  evalscript: {
    setup: () => ({
      input: ['B02', 'B03', 'B04'],
      output: {bands: 3},
    }),
    evaluatePixel: (sample) => [3 * sample.B04, 3 * sample.B03, 3 * sample.B02],
  },
});

const map = new Map({
  layers: [new TileLayer({source})],
  target: 'map',
  view: new View({
    center: [-108.6, 43.185],
    zoom: 12,
    minZoom: 7,
    maxZoom: 13,
  }),
});

document.getElementById('auth-form').addEventListener('submit', (event) => {
  const clientId = event.target.elements['id'].value;
  const clientSecret = event.target.elements['secret'].value;
  source.setAuth({clientId, clientSecret});
});

const picker = document.getElementById('to-date');

/**
 * Compute 7-day rolling time range and update input data filter on Sentinel Hub source.
 * 计算当前选定日期往前推移 7 天的滑动时间窗口，并通过 source.setData() 更新时空数据过滤参数。
 */
function updateInputData() {
  const toDate = new Date(picker.value);
  const fromDate = new Date(toDate.getTime());
  fromDate.setDate(fromDate.getDate() - 7);

  source.setData([
    {
      type: 'sentinel-2-l2a',
      dataFilter: {
        timeRange: {
          from: fromDate.toISOString(),
          to: toDate.toISOString(),
        },
      },
    },
  ]);
}

picker.addEventListener('change', () => updateInputData());
updateInputData();

source.on('change', () => {
  if (source.getState() === 'error') {
    alert(source.getError());
  }
});
