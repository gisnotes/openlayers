import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';

// Initialize map with Stadia Maps retina dark theme
// 使用 Stadia Maps 视网膜高清暗黑主题初始化地图
const map = new Map({
  layers: [
    // NOTE: Layers from Stadia Maps do not require an API key for localhost development or most production
    // web deployments. See https://docs.stadiamaps.com/authentication/ for details.
    // 注意：来自 Stadia Maps 的图层在本地开发（localhost）或多数生产 Web 部署中无需 API Key。
    // 详情请参阅 https://docs.stadiamaps.com/authentication/。
    new TileLayer({
      source: new StadiaMaps({
        layer: 'alidade_smooth_dark',
        retina: true,
        // apiKey: 'OPTIONAL' / 可选 API Key
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([24.750645, 59.444351]),
    zoom: 14,
  }),
});
