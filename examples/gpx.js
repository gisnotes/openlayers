import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GPX from '../src/ol/format/GPX.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// MapTiler API Key and attribution notices
// MapTiler API 访问密钥与版权信息
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Base raster imagery tile layer
// 底层高分辨率卫星影像瓦片图层
const raster = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url: 'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
    tileSize: 512,
    maxZoom: 20,
  }),
});

// Style dictionary mapped by geometry type
// 按几何图形类型（点、线段、多线段）区分的样式配置字典
const style = {
  'Point': new Style({
    image: new CircleStyle({
      fill: new Fill({
        color: 'rgba(255,255,0,0.4)',
      }),
      radius: 5,
      stroke: new Stroke({
        color: '#ff0',
        width: 1,
      }),
    }),
  }),
  'LineString': new Style({
    stroke: new Stroke({
      color: '#f00',
      width: 3,
    }),
  }),
  'MultiLineString': new Style({
    stroke: new Stroke({
      color: '#0f0',
      width: 3,
    }),
  }),
};

// Vector layer loading GPX data with dynamic style dispatcher
// 加载 GPX 文件的矢量图层，应用基于几何类型的样式分流器
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/gpx/fells_loop.gpx',
    format: new GPX(),
  }),
  style: function (feature) {
    return style[feature.getGeometry().getType()];
  },
});

// Initialize map instance stacking raster imagery and GPX track vector
// 初始化地图实例，叠加底图与 GPX 运动轨迹矢量图层
const map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: [-7916041.528716288, 5228379.045749711],
    zoom: 12,
  }),
});

// Display feature description at the given screen pixel
// 拾取并展示屏幕像素位置处要素的描述文本 (desc)
const displayFeatureInfo = function (pixel) {
  const features = [];
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);
  });
  if (features.length > 0) {
    const info = [];
    let i, ii;
    for (i = 0, ii = features.length; i < ii; ++i) {
      info.push(features[i].get('desc'));
    }
    document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
    map.getTargetElement().style.cursor = '';
  }
};

// Pointermove hover listener
// 鼠标悬停漫游事件监听
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});

// Click selection listener
// 鼠标点击选择事件监听
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
