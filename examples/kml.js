import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import KML from '../src/ol/format/KML.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';

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

// Vector layer loading and parsing KML data
// 加载并解析 KML 空间数据的矢量图层
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/kml/2012-02-10.kml',
    format: new KML(),
  }),
});

// Initialize map with imagery raster and KML vector layers
// 初始化地图并加载遥感底图与 KML 矢量图层
const map = new Map({
  layers: [raster, vector],
  target: document.getElementById('map'),
  view: new View({
    center: [876970.8463461736, 5859807.853963373],
    projection: 'EPSG:3857',
    zoom: 10,
  }),
});

// Inspect and display feature name at the given screen pixel
// 拾取并展示指定屏幕像素位置处的要素名称属性
const displayFeatureInfo = function (pixel) {
  const features = [];
  map.forEachFeatureAtPixel(pixel, function (feature) {
    features.push(feature);
  });
  if (features.length > 0) {
    const info = [];
    let i, ii;
    for (i = 0, ii = features.length; i < ii; ++i) {
      info.push(features[i].get('name'));
    }
    document.getElementById('info').innerHTML = info.join(', ') || '(unknown)';
    map.getTargetElement().style.cursor = 'pointer';
  } else {
    document.getElementById('info').innerHTML = '&nbsp;';
    map.getTargetElement().style.cursor = '';
  }
};

// Bind pointermove listener for hover inspection
// 监听鼠标移动事件，动态高亮拾取要素
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  displayFeatureInfo(evt.pixel);
});

// Bind click listener for click selection
// 监听点击事件，同步更新要素信息
map.on('click', function (evt) {
  displayFeatureInfo(evt.pixel);
});
