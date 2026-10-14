import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import Modify from '../src/ol/interaction/Modify.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OGCMapTile from '../src/ol/source/OGCMapTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

// Create a point feature at [0, 0] with attributes
// 在本初子午线与赤道交点 [0, 0] 创建带有业务属性的点要素
const iconFeature = new Feature({
  geometry: new Point([0, 0]),
  name: 'Null Island',
  population: 4000,
  rainfall: 500,
});

// Configure icon style with custom anchor (bottom-center)
// 配置图标样式，指定锚点位于底部中心针尖位置
const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46],
    anchorXUnits: 'fraction',
    anchorYUnits: 'pixels',
    src: 'data/icon.png',
  }),
});

iconFeature.setStyle(iconStyle);

const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
    crossOrigin: '',
  }),
});

const target = document.getElementById('map');
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: target,
  view: new View({
    center: [0, 0],
    zoom: 3,
  }),
});

// Configure Modify interaction with hitDetection enabled on the vectorLayer
// 构造 Modify 交互，为 vectorLayer 启用 hitDetection 像素级命中测试
const modify = new Modify({
  hitDetection: vectorLayer,
  source: vectorSource,
});

// Update cursor style when dragging starts and ends
// 监听修改开始与结束事件，切换抓手与普通手型光标
modify.on(['modifystart', 'modifyend'], function (evt) {
  target.style.cursor = evt.type === 'modifystart' ? 'grabbing' : 'pointer';
});

// Listen to internal overlay features to toggle pointer cursor on hover
// 监听修改交互内部覆盖层要素的添加与移除，在鼠标悬停在图标上时提示手型
const overlaySource = modify.getOverlay().getSource();
overlaySource.on(['addfeature', 'removefeature'], function (evt) {
  target.style.cursor = evt.type === 'addfeature' ? 'pointer' : '';
});

map.addInteraction(modify);
