import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {platformModifierKeyOnly} from '../src/ol/events/condition.js';
import {getWidth} from '../src/ol/extent.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import DragBox from '../src/ol/interaction/DragBox.js';
import Select from '../src/ol/interaction/Select.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

const vectorSource = new VectorSource({
  url: 'https://openlayers.org/data/vector/ecoregions.json',
  format: new GeoJSON(),
});

const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});

const map = new Map({
  layers: [
    new VectorLayer({
      source: vectorSource,
      background: '#1a2b39',
      style: function (feature) {
        const color = feature.get('COLOR_BIO') || '#eeeeee';
        style.getFill().setColor(color);
        return style;
      },
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    constrainRotation: 16,
  }),
});

const selectedStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.6)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

// a normal select interaction to handle click
// 常规 Select 交互用于处理点击选择与高亮样式过滤
const select = new Select({
  filter: function (feature) {
    return !(feature.get('COLOR_BIO') === '#CC6767');
  },
  style: function (feature) {
    const color = feature.get('COLOR_BIO') || '#eeeeee';
    selectedStyle.getFill().setColor(color);
    return selectedStyle;
  },
});
map.addInteraction(select);

// a DragBox interaction used to select features by drawing boxes
// DragBox 交互：通过修饰键（Ctrl/Command+拖拽）拉框框选要素
const dragBox = new DragBox({
  condition: platformModifierKeyOnly,
});

map.addInteraction(dragBox);

dragBox.on('boxend', function () {
  const boxExtent = dragBox.getGeometry().getExtent();

  // if the extent crosses the antimeridian process each world separately
  // 若外包矩形跨越了 180° 反子午线，则对每一个世界副本分别计算
  const worldExtent = map.getView().getProjection().getExtent();
  const worldWidth = getWidth(worldExtent);
  const startWorld = Math.floor((boxExtent[0] - worldExtent[0]) / worldWidth);
  const endWorld = Math.floor((boxExtent[2] - worldExtent[0]) / worldWidth);

  for (let world = startWorld; world <= endWorld; ++world) {
    const left = Math.max(boxExtent[0] - world * worldWidth, worldExtent[0]);
    const right = Math.min(boxExtent[2] - world * worldWidth, worldExtent[2]);
    const extent = [left, boxExtent[1], right, boxExtent[3]];

    const boxFeatures = vectorSource
      .getFeaturesInExtent(extent)
      .filter((feature) => feature.getGeometry().intersectsExtent(extent));

    // features that intersect the box geometry are added to the
    // collection of selected features
    // 与拉框几何相交的要素将被添加到选中要素集合中

    // if the view is not obliquely rotated the box geometry and
    // its extent are equalivalent so intersecting features can
    // be added directly to the collection
    // 如果视图未旋转（或为直角旋转），拉框几何与其外包矩形等价，可直接将相交要素添加至选中集合
    const rotation = map.getView().getRotation();
    const oblique = rotation % (Math.PI / 2) !== 0;

    // when the view is obliquely rotated the box extent will
    // exceed its geometry so both the box and the candidate
    // feature geometries are rotated around a common anchor
    // to confirm that, with the box geometry aligned with its
    // extent, the geometries intersect
    // 当视图处于倾斜旋转时，拉框的外包矩形会大于几何本身，
    // 需绕原点反向旋转拉框几何与候选要素几何，对齐后再判定相交
    if (oblique) {
      const anchor = [0, 0];
      const geometry = dragBox.getGeometry().clone();
      geometry.translate(-world * worldWidth, 0);
      geometry.rotate(-rotation, anchor);
      const extent = geometry.getExtent();
      boxFeatures.forEach(function (feature) {
        const geometry = feature.getGeometry().clone();
        geometry.rotate(-rotation, anchor);
        if (geometry.intersectsExtent(extent)) {
          select.selectFeature(feature);
        }
      });
    } else {
      boxFeatures.forEach(select.selectFeature.bind(select));
    }
  }
});

// clear selection when drawing a new box and when clicking on the map
// 开始新拉框绘制时清空之前的选择
dragBox.on('boxstart', function () {
  select.clearSelection();
});

const infoBox = document.getElementById('info');

select.on('select', function () {
  const names = select
    .getFeatures()
    .getArray()
    .map((feature) => {
      return feature.get('ECO_NAME');
    });
  if (names.length > 0) {
    infoBox.innerHTML = names.join(', ');
  } else {
    infoBox.innerHTML = 'None / 无';
  }
});
