import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import MVT from '../src/ol/format/MVT.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import TileDebug from '../src/ol/source/TileDebug.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// Base styling for country polygon boundary and label text
// 国家多边形边界与文本标注的基础样式
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: '#319FD3',
    width: 1,
  }),
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: '#000',
    }),
    stroke: new Stroke({
      color: '#fff',
      width: 3,
    }),
  }),
});

// Vector tile layer consuming TMS-indexed MVT tiles from GeoServer GWC
// 矢量切片图层，消费来自 GeoServer GWC 的 TMS 坐标规范 MVT 矢量切片
const vtLayer = new VectorTileLayer({
  declutter: true,
  source: new VectorTileSource({
    maxZoom: 15,
    format: new MVT(),
    url:
      'https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/' +
      'ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf',
  }),
  style: function (feature) {
    style.getText().setText(feature.get('name'));
    return style;
  },
});

// Debug layer rendering client-side canvas grid with TMS coordinates
// 调试图层，使用客户端 Canvas 实时绘制包含 TMS 坐标编号的网格
const debugLayer = new TileLayer({
  source: new TileDebug({
    template: 'z:{z} x:{x} y:{-y}',
    projection: vtLayer.getSource().getProjection(),
    tileGrid: vtLayer.getSource().getTileGrid(),
    zDirection: 1,
  }),
});

// Initialize map with vector tile layer and debug overlay
// 初始化包含矢量切片与调试覆盖网格的地图实例
const map = new Map({
  layers: [vtLayer, debugLayer],
  target: 'map',
  view: new View({
    center: [0, 6000000],
    zoom: 4,
  }),
});
