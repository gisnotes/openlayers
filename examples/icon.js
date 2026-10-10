import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import Overlay from '../src/ol/Overlay.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OGCMapTile from '../src/ol/source/OGCMapTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

// 1. 创建点要素：直接在构造函数中传入包含 geometry 和自定义业务属性的对象
const iconFeature = new Feature({
  geometry: new Point([0, 0]), // 坐标 [0, 0]（赤道与本初子午线交点，俗称“Null Island 虚无岛”）
  name: 'Null Island', // 自定义属性：地名
  population: 4000, // 自定义属性：人口
  rainfall: 500, // 自定义属性：降雨量
});

// 2. 创建图标样式（混用比例单位与像素单位定准针尖锚点）
const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 46], // 锚点坐标：X 轴为 0.5（居中），Y 轴为 46（针尖所在的第 46 像素行）
    anchorXUnits: 'fraction', // X 轴锚点单位：按图标宽度的比例（0.0 ~ 1.0）
    anchorYUnits: 'pixels', // Y 轴锚点单位：按图标高度的实际像素值（px）
    src: 'data/icon.png', // 图标图片路径（原图尺寸 32x48 像素）
  }),
});

// 将样式绑定到该点要素上
iconFeature.setStyle(iconStyle);

// 3. 创建矢量数据源与矢量图层
const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// 4. 创建底图图层（使用符合 OGC API - Tiles 标准的栅格瓦片源）
const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
    crossOrigin: '',
  }),
});

// 5. 初始化地图实例
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 3,
  }),
});

// 6. 创建 Overlay 覆盖物（用于承载 Bootstrap Popover 弹窗 DOM 容器）
const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  positioning: 'bottom-center', // 覆盖物底部中心对齐地理坐标点
  stopEvent: false, // 允许鼠标/触摸事件穿透弹窗传递到地图画布
});
map.addOverlay(popup);

// 销毁已存在的 Bootstrap Popover 实例的工具函数
let popover;
function disposePopover() {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
}

// 7. 监听地图点击事件：命中要素时在对应坐标处显示弹窗
map.on('click', function (evt) {
  // 检测点击像素处是否存在矢量要素，若有则返回最顶层的要素
  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });
  // 先清理上一次打开的弹窗
  disposePopover();
  if (!feature) {
    return;
  }
  // 将 Overlay 定位到点击处的地理坐标
  popup.setPosition(evt.coordinate);
  // 创建并显示 Bootstrap Popover，内容取自要素的 'name' 业务属性
  popover = new bootstrap.Popover(element, {
    placement: 'top',
    html: true,
    content: feature.get('name'),
  });
  popover.show();
});

// 8. 监听鼠标移动事件：当悬停在图标上方时将鼠标指针变为手型（pointer）
map.on('pointermove', function (e) {
  const hit = map.hasFeatureAtPixel(e.pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});

// 9. 当地图开始平移或缩放时，自动关闭弹窗
map.on('movestart', disposePopover);
