import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OGCMapTile from '../src/ol/source/OGCMapTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Circle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// Create a single point feature at [0, 0] (Null Island)
// 在地理坐标 [0, 0] 处创建一个点要素
const iconFeature = new Feature({
  geometry: new Point([0, 0]),
});

// Style 1: Combined Icon (image) and Text (label) style to be dynamically transformed
// 样式 1：包含图片图标（Icon）与多行文本标注（Text）的主样式，后续将通过滑块动态调整其各项空间变换参数
const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1], // Default anchor at bottom-center (0.5, 1) / 初始锚点位于图标底部正中心
    src: 'data/world.png',
  }),
  text: new Text({
    text: 'World\nText', // Multi-line text / 双行文本标注
    font: 'bold 30px Calibri,sans-serif',
    fill: new Fill({
      color: 'black',
    }),
    stroke: new Stroke({
      color: 'white',
      width: 2,
    }),
  }),
});

// Style 2: Fixed black circle at [0, 0] acting as the visual reference origin (pivot point)
// 样式 2：固定在 [0, 0] 原点处的黑底白边圆点，作为观察图标/文字锚点、位移、缩放与旋转的视觉基准靶心
const pointStyle = new Style({
  image: new Circle({
    radius: 7,
    fill: new Fill({
      color: 'black',
    }),
    stroke: new Stroke({
      color: 'white',
      width: 2,
    }),
  }),
});

// Apply composite style array: render the reference point first, then the icon and text on top
// 应用复合样式数组：先绘制底层基准黑点，再在上方叠加绘制图标与文字
iconFeature.setStyle([pointStyle, iconStyle]);

const vectorSource = new VectorSource({
  features: [iconFeature],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// Basemap layer using OGC API - Tiles (NaturalEarth raster)
// 使用符合 OGC API - Tiles 标准的 NaturalEarth 全球自然地貌栅格瓦片作为底图
const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
    crossOrigin: '',
  }),
});

const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 3,
  }),
});

// Lookup arrays mapping slider indices (0, 1, 2) to Canvas textAlign and textBaseline enum strings
// 将滑块数值（0, 1, 2）映射为 Canvas 文本水平对齐（textAlign）和垂直基线（textBaseline）枚举字符串
const textAlignments = ['left', 'center', 'right'];
const textBaselines = ['top', 'middle', 'bottom'];
const controls = {};
const controlIds = [
  'rotation',
  'rotateWithView',
  'scaleX',
  'scaleY',
  'anchorX',
  'anchorY',
  'displacementX',
  'displacementY',
  'textRotation',
  'textRotateWithView',
  'textScaleX',
  'textScaleY',
  'textAlign',
  'textBaseline',
  'textOffsetX',
  'textOffsetY',
];

// Bind 'input' events to all 16 DOM controls and synchronize their display labels
// 遍历绑定全部 16 个 DOM 控件的 input 事件，并实时更新右侧的数值显示标签
controlIds.forEach(function (id) {
  const control = document.getElementById(id);
  const output = document.getElementById(id + 'Out');
  function setOutput() {
    const value = parseFloat(control.value);
    if (control.type === 'checkbox') {
      output.innerText = String(control.checked);
    } else if (id === 'textAlign') {
      output.innerText = textAlignments[value];
    } else if (id === 'textBaseline') {
      output.innerText = textBaselines[value];
    } else {
      output.innerText = control.step.startsWith('0.')
        ? value.toFixed(2)
        : String(value);
    }
  }
  control.addEventListener('input', function () {
    setOutput();
    updateStyle();
  });
  setOutput();
  controls[id] = control;
});

/**
 * Apply all current UI control values to the Icon and Text styles, then trigger feature re-render
 * 将所有 UI 控件的当前值同步设置到 Icon 和 Text 样式对象上，并通知要素触发重绘
 */
function updateStyle() {
  // --- 1. Update Icon (Image) transformations / 更新图标（Icon）变换属性 ---
  // Rotation in radians (slider value * π) / 旋转弧度（滑块值 * π）
  iconStyle
    .getImage()
    .setRotation(parseFloat(controls['rotation'].value) * Math.PI);

  // Whether icon rotates with map view (Alt+Shift+Drag) / 是否随地图视图一起旋转
  iconStyle.getImage().setRotateWithView(controls['rotateWithView'].checked);

  // 2D non-uniform scale [scaleX, scaleY] (negative values flip the image around anchor)
  // 二维独立缩放 [scaleX, scaleY]（负值会围绕锚点发生镜像翻转）
  iconStyle
    .getImage()
    .setScale([
      parseFloat(controls['scaleX'].value),
      parseFloat(controls['scaleY'].value),
    ]);

  // Normalized anchor point [anchorX, anchorY] in range [0, 1] / 归一化锚点坐标 [0~1]
  iconStyle
    .getImage()
    .setAnchor([
      parseFloat(controls['anchorX'].value),
      parseFloat(controls['anchorY'].value),
    ]);

  // Pixel displacement [dx, dy] (Note: +Y is UPWARDS for Icon!)
  // 图标像素位移 [dx, dy]（注意：Icon 的 Y 轴正方向是向上的！）
  iconStyle
    .getImage()
    .setDisplacement([
      parseFloat(controls['displacementX'].value),
      parseFloat(controls['displacementY'].value),
    ]);

  // --- 2. Update Text (Label) transformations / 更新文本（Text）变换属性 ---
  iconStyle
    .getText()
    .setRotation(parseFloat(controls['textRotation'].value) * Math.PI);

  iconStyle.getText().setRotateWithView(controls['textRotateWithView'].checked);

  // 2D scale for text [scaleX, scaleY] (negative values flip text around align/baseline pivot)
  // 文本二维独立缩放 [scaleX, scaleY]（负值会围绕对齐基点镜像翻转文字）
  iconStyle
    .getText()
    .setScale([
      parseFloat(controls['textScaleX'].value),
      parseFloat(controls['textScaleY'].value),
    ]);

  iconStyle
    .getText()
    .setTextAlign(textAlignments[parseFloat(controls['textAlign'].value)]);

  iconStyle
    .getText()
    .setTextBaseline(textBaselines[parseFloat(controls['textBaseline'].value)]);

  // Pixel offset for text (Note: +Y is DOWNWARDS for Text!)
  // 文本像素偏移（注意：与 Icon 相反，Text 的 OffsetY 正方向是向下的！）
  iconStyle.getText().setOffsetX(parseFloat(controls['textOffsetX'].value));
  iconStyle.getText().setOffsetY(parseFloat(controls['textOffsetY'].value));

  // CRITICAL: Mutating style sub-objects does not automatically notify the feature/layer.
  // Call feature.changed() to increment revision and trigger a vector layer re-render!
  // 关键步骤：直接调用 Style 子对象的 setter 不会自动触发重绘，必须调用 changed() 通知要素更新版本号并重绘！
  iconFeature.changed();
}
updateStyle();

// Change mouse cursor to pointer when hovering over the feature
// 当鼠标悬停在要素（图标或文字碰撞盒）上方时，将鼠标指针切换为手型（pointer）
map.on('pointermove', function (e) {
  const hit = map.hasFeatureAtPixel(e.pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
