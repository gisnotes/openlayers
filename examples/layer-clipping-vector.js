import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import {getVectorContext} from '../src/ol/render.js';
import OSM from '../src/ol/source/OSM.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Style from '../src/ol/style/Style.js';

// A distinct className is required to force OpenLayers to use a separate HTML5 canvas for the background layer
// 必须指定独立的 className，强制 OpenLayers 为背景图层分配独立的 HTML5 Canvas 画布，避免被后续混合模式污染
const background = new TileLayer({
  className: 'toner',
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

// OSM tile layer that will be masked/clipped by the vector boundary
// 待裁切的 OSM 瓦片图层：将被限制在瑞士国界几何多边形内部
const base = new TileLayer({
  source: new OSM(),
});

// Vector layer holding Switzerland's boundary polygon (style: null prevents default rendering)
// 矢量图层：加载瑞士国界 GeoJSON 多边形，设置 style: null 避免在主管线中冗余绘制
const clipLayer = new VectorLayer({
  style: null,
  source: new VectorSource({
    url: './data/geojson/switzerland.geojson',
    format: new GeoJSON(),
  }),
});

// Giving the clipped layer an extent is necessary to avoid requesting/rendering tiles outside the feature's viewport
// 为待裁切图层设置地理范围，避免在矢量要素包围盒之外请求多余的瓦片，节约带宽与显存
clipLayer.getSource().on('addfeature', function () {
  base.setExtent(clipLayer.getSource().getExtent());
});

// Mask fill style (color does not matter, only alpha/coverage is used by destination-in)
// 蒙版填充样式（颜色不影响结果，destination-in 仅依据绘制像素的 Alpha 覆盖率进行遮罩）
const style = new Style({
  fill: new Fill({
    color: 'black',
  }),
});

// Hook into postrender on the base tile layer to stamp the vector mask
// 监听待裁切底图的 postrender 事件：利用 destination-in 混合模式执行矢量要素冲压裁切
base.on('postrender', function (e) {
  const vectorContext = getVectorContext(e);
  // Only preserve base layer pixels where the newly drawn vector feature exists
  // 设置 Canvas 混合模式为 destination-in：仅保留与新绘制矢量图形重合的像素
  e.context.globalCompositeOperation = 'destination-in';
  clipLayer.getSource().forEachFeature(function (feature) {
    vectorContext.drawFeature(feature, style);
  });
  // Reset composite operation back to normal
  // 恢复默认的源图形置顶合成模式
  e.context.globalCompositeOperation = 'source-over';
});

// Initialize map centered on Switzerland
// 初始化地图实例：中心定位至瑞士上空，包含背景图层、待裁切底图与矢量蒙版图层
const map = new Map({
  layers: [background, base, clipLayer],
  target: 'map',
  view: new View({
    center: fromLonLat([8.23, 46.86]),
    zoom: 7,
  }),
});
