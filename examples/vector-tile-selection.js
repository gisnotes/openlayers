import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import MVT from '../src/ol/format/MVT.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Lookup dictionary for selected features, keyed by unique feature ID (e.g., iso_a3)
// 选中要素的哈希查找字典，以要素唯一 ID（如 iso_a3）为键
let selection = {};

// Default styling for countries
// 国家的默认底图样式
const country = new Style({
  stroke: new Stroke({
    color: 'gray',
    width: 1,
  }),
  fill: new Fill({
    color: 'rgba(20,20,20,0.9)',
  }),
});

// Highlight styling for selected countries
// 选中高亮国家的着色样式
const selectedCountry = new Style({
  stroke: new Stroke({
    color: 'rgba(200,20,20,0.8)',
    width: 2,
  }),
  fill: new Fill({
    color: 'rgba(200,20,20,0.4)',
  }),
});

// Base vector tile layer
// 基础矢量切片图层
const vtLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    maxZoom: 15,
    format: new MVT({
      idProperty: 'iso_a3',
    }),
    url:
      'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
      'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
  }),
  style: country,
});

// Main map instance
// 地图主实例
const map = new Map({
  layers: [vtLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    multiWorld: true,
  }),
});

// Dedicated selection layer sharing the source with base layer
// 独立的选择高亮图层，直接共享底层数据源，配置纯矢量渲染模式
const selectionLayer = new VectorTileLayer({
  map: map,
  renderMode: 'vector',
  source: vtLayer.getSource(),
  style: function (feature) {
    if (feature.getId() in selection) {
      return selectedCountry;
    }
  },
});

const selectElement = document.getElementById('type');

// Handle both click and pointermove based on current selection mode
// 根据当前下拉框选定的交互模式，统筹处理点击与悬浮移动事件
map.on(['click', 'pointermove'], function (event) {
  if (
    (selectElement.value === 'singleselect-hover' &&
      event.type !== 'pointermove') ||
    (selectElement.value !== 'singleselect-hover' &&
      event.type === 'pointermove')
  ) {
    return;
  }
  // Query features asynchronously from the vector tile layer at pixel
  // 异步获取当前像素位置命中的矢量切片要素集合
  vtLayer.getFeatures(event.pixel).then(function (features) {
    if (!features.length) {
      selection = {};
      selectionLayer.changed();
      return;
    }
    const feature = features[0];
    if (!feature) {
      return;
    }
    const fid = feature.getId();

    // Reset selection in single select modes
    // 在单选模式下清空既有选择字典
    if (selectElement.value.startsWith('singleselect')) {
      selection = {};
    }
    // Add selected feature to lookup
    // 将选中的要素存入选择字典并发出重绘通知
    selection[fid] = feature;

    selectionLayer.changed();
  });
});
