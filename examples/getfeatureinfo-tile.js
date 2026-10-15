import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import TileWMS from '../src/ol/source/TileWMS.js';

// Tiled WMS source with GeoServer cache parameters
// 瓦片化 WMS 数据源，启用 GeoServer 切片缓存参数
const wmsSource = new TileWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: {'LAYERS': 'ne:ne', 'TILED': true},
  serverType: 'geoserver',
  crossOrigin: 'anonymous',
});

const wmsLayer = new TileLayer({
  source: wmsSource,
});

const view = new View({
  center: [0, 0],
  zoom: 1,
});

// Initialize map
// 初始化地图
const map = new Map({
  layers: [wmsLayer],
  target: 'map',
  view: view,
});

// Single-click listener for WMS GetFeatureInfo
// 单击地图触发 WMS GetFeatureInfo 属性查询
map.on('singleclick', function (evt) {
  document.getElementById('info').innerHTML = '';
  const viewResolution = /** @type {number} */ (view.getResolution());
  const url = wmsSource.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'text/html'},
  );
  if (url) {
    fetch(url)
      .then((response) => response.text())
      .then((html) => {
        document.getElementById('info').innerHTML = html;
      });
  }
});

// Pointer move listener to probe pixel alpha and toggle cursor
// 指针移动事件监听：探测像素 Alpha 通道并动态切换鼠标光标手型
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const data = wmsLayer.getData(evt.pixel);
  const hit = data && data[3] > 0; // transparent pixels have zero for data[3]
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
