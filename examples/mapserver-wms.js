import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import ImageSource from '../src/ol/source/Image.js';
import {createLoader} from '../src/ol/source/wms.js';

// Image layer loading WMS from MapServer with High-DPI auto-adaptation
// 单图像图层：从 MapServer 加载 WMS 服务并支持高分屏 (HiDPI) 自动适配
const layer = new ImageLayer({
  source: new ImageSource({
    loader: createLoader({
      url: 'https://demo.mapserver.org/cgi-bin/wms?',
      params: {
        LAYERS: ['bluemarble,country_bounds,cities'],
        VERSION: '1.3.0',
        FORMAT: 'image/png',
      },
      projection: 'EPSG:4326',
      // Note: serverType only needs to be set when hidpi is true to send MAP_RESOLUTION parameter
      // 注意：仅当 hidpi 为 true 时才需要设置 serverType，以向 MapServer 发送 MAP_RESOLUTION 参数
      hidpi: true,
      serverType: 'mapserver',
    }),
  }),
});

const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
  }),
});
