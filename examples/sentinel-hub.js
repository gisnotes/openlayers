import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import SentinelHub from '../src/ol/source/SentinelHub.js';

// Enable geographic coordinates (lon, lat) directly across View and geometry
// 启用地理坐标系模式，允许直接使用经纬度配置 View 与空间范围
useGeographic();

// Configure Sentinel Hub Processing API source with custom spectral band combination
// 配置 Sentinel Hub 数据源：拉取 Sentinel-2 L2A 多光谱数据并执行云端波段运算合成
const source = new SentinelHub({
  data: [
    {
      type: 'sentinel-2-l2a', // Sentinel-2 Level-2A Bottom-Of-Atmosphere reflectance / 哨兵2号L2A地表反射率产品
      dataFilter: {
        timeRange: {
          from: '2024-05-30T00:00:00Z',
          to: '2024-06-01T00:00:00Z',
        },
      },
    },
  ],
  evalscript: {
    // Declare requested bands (SWIR-2 B12, NIR B08, Red B04)
    // 声明订阅的波段：短波红外 B12、近红外 B08、红光 B04
    setup: () => ({
      input: ['B12', 'B08', 'B04'],
      output: {bands: 3},
    }),
    // Pixel-level dynamic stretching formula evaluated in the cloud
    // 云端像素级波段线性拉伸公式
    evaluatePixel: (sample) => [
      2.5 * sample.B12,
      2 * sample.B08,
      2 * sample.B04,
    ],
  },
});

// Render with WebGLTile layer for optimal rendering performance
// 采用 WebGLTile 图层实现高吞吐硬件加速渲染
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

// Listen to OAuth authentication form submission
// 监听认证弹窗提交事件，注入 OAuth 凭证换取 Token
document.getElementById('auth-form').addEventListener('submit', (event) => {
  const clientId = event.target.elements['id'].value;
  const clientSecret = event.target.elements['secret'].value;
  source.setAuth({clientId, clientSecret});
});

// Handle authentication or processing errors
// 监听数据源状态变更，捕获并提示认证失败或请求超限异常
source.on('change', () => {
  if (source.getState() === 'error') {
    alert(source.getError());
  }
});
