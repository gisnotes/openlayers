import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import EsriJSON from '../src/ol/format/EsriJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {tile as tileStrategy} from '../src/ol/loadingstrategy.js';
import {fromLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import {createXYZ} from '../src/ol/tilegrid.js';

// ArcGIS Online Land Use feature service URL / ArcGIS Online 土地利用要素服务地址
const serviceUrl =
  'https://services-eu1.arcgis.com/NPIbx47lsIiu2pqz/ArcGIS/rest/services/' +
  'Neptune_Coastline_Campaign_Open_Data_Land_Use_2014/FeatureServer/';
const layer = '0';

// Land use classification color map / 土地利用分类颜色映射表
const fillColors = {
  'Lost To Sea Since 1965': [0, 0, 0, 1],
  'Urban/Built-up': [104, 104, 104, 1],
  'Shacks': [115, 76, 0, 1],
  'Industry': [230, 0, 0, 1],
  'Wasteland': [230, 0, 0, 1],
  'Caravans': [0, 112, 255, 0.5],
  'Defence': [230, 152, 0, 0.5],
  'Transport': [230, 152, 0, 1],
  'Open Countryside': [255, 255, 115, 1],
  'Woodland': [38, 115, 0, 1],
  'Managed Recreation/Sport': [85, 255, 0, 1],
  'Amenity Water': [0, 112, 255, 1],
  'Inland Water': [0, 38, 115, 1],
};

// Base style object reused across features / 可复用的多边形基础样式对象
const style = new Style({
  fill: new Fill(),
  stroke: new Stroke({
    color: [0, 0, 0, 1],
    width: 0.5,
  }),
});

// Vector source configured with EsriJSON and tile strategy / 配置 EsriJSON 格式与空间切片加载策略的矢量数据源
const vectorSource = new VectorSource({
  format: new EsriJSON(),
  url: function (extent, resolution, projection) {
    // ArcGIS Server only wants the numeric portion of the projection ID. / ArcGIS Server 仅接收纯数字投影标识符
    const srid = projection
      .getCode()
      .split(/:(?=\d+$)/)
      .pop();

    const url =
      serviceUrl +
      layer +
      '/query/?f=json&' +
      'returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=' +
      encodeURIComponent(
        '{"xmin":' +
          extent[0] +
          ',"ymin":' +
          extent[1] +
          ',"xmax":' +
          extent[2] +
          ',"ymax":' +
          extent[3] +
          ',"spatialReference":{"wkid":' +
          srid +
          '}}',
      ) +
      '&geometryType=esriGeometryEnvelope&inSR=' +
      srid +
      '&outFields=*' +
      '&outSR=' +
      srid;

    return url;
  },
  strategy: tileStrategy(
    createXYZ({
      tileSize: 512,
    }),
  ),
  attributions:
    'University of Leicester (commissioned by the ' +
    '<a href="https://www.arcgis.com/home/item.html?id=' +
    'd5f05b1dc3dd4d76906c421bc1727805">National Trust</a>)',
});

// Vector layer with dynamic style function / 采用动态样式函数的矢量图层
const vector = new VectorLayer({
  source: vectorSource,
  style: function (feature) {
    const classify = feature.get('LU_2014');
    const color = fillColors[classify] || [0, 0, 0, 0];
    style.getFill().setColor(color);
    return style;
  },
  opacity: 0.7,
});

// ArcGIS Topographic basemap layer / ArcGIS 世界地形底图瓦片图层
const raster = new TileLayer({
  source: new ImageTile({
    attributions:
      'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
      'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
    url:
      'https://server.arcgisonline.com/ArcGIS/rest/services/' +
      'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  }),
});

// Initialize map centered on UK coastline / 初始化地图实例并定位至英国东部海岸
const map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([1.72, 52.4]),
    zoom: 14,
  }),
});

/**
 * Display feature attributes under the mouse cursor. / 探测并展示光标所在要素的属性信息
 * @param {import('../src/ol/pixel.js').Pixel} pixel Screen coordinates / 屏幕像素坐标
 */
const displayFeatureInfo = function (pixel) {
  const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
    return feature;
  });
  if (feature) {
    const info =
      '2014 Land Use: ' +
      feature.get('LU_2014') +
      '<br>1965 Land Use: ' +
      feature.get('LU_1965');
    document.getElementById('info').innerHTML = info;
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    document.getElementById('info').innerHTML = '&nbsp;<br>&nbsp;';
    map.getTargetElement().style.cursor = '';
  }
};

// Pointer move and click listener for hit detection / 监听光标移动与点击事件执行像素拾取
map.on(['click', 'pointermove'], function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});
