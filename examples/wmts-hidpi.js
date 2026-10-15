import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import WMTSCapabilities from '../src/ol/format/WMTSCapabilities.js';
import {DEVICE_PIXEL_RATIO} from '../src/ol/has.js';
import TileLayer from '../src/ol/layer/Tile.js';
import WMTS, {optionsFromCapabilities} from '../src/ol/source/WMTS.js';

const capabilitiesUrl =
  'https://mapsneu.wien.gv.at/basemapneu/1.0.0/WMTSCapabilities.xml';

// HiDPI support:
// * Use 'bmaphidpi' layer (pixel ratio 2) for device pixel ratio > 1
// * Use 'geolandbasemap' layer (pixel ratio 1) for device pixel ratio == 1
// 高分辨率（HiDPI）支持：
// * 设备像素比 > 1 时使用 'bmaphidpi' 高清图层（像素比为 2）
// * 设备像素比 == 1 时使用 'geolandbasemap' 常规图层（像素比为 1）
const hiDPI = DEVICE_PIXEL_RATIO > 1;
const layer = hiDPI ? 'bmaphidpi' : 'geolandbasemap';
const tilePixelRatio = hiDPI ? 2 : 1;

// Initialize map view
// 初始化地图视图
const map = new Map({
  target: 'map',
  view: new View({
    center: [1823849, 6143760],
    zoom: 11,
  }),
});

// Fetch and parse WMTS Capabilities XML
// 请求并解析 WMTS Capabilities 元数据 XML
fetch(capabilitiesUrl)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    const result = new WMTSCapabilities().read(text);
    const options = optionsFromCapabilities(result, {
      layer: layer,
      matrixSet: 'google3857',
      style: 'normal',
    });
    options.tilePixelRatio = tilePixelRatio;
    options.attributions =
      'Grundkarte: <a target="_blank" href="https://basemap.at/">basemap.at</a>';
    map.addLayer(
      new TileLayer({
        source: new WMTS(options),
      }),
    );
  });
