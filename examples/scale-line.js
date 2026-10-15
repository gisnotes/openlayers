import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

const scaleBarOptionsContainer = document.getElementById('scaleBarOptions');
const unitsSelect = document.getElementById('units');
const typeSelect = document.getElementById('type');
const stepsRange = document.getElementById('steps');
const scaleTextCheckbox = document.getElementById('showScaleText');
const invertColorsCheckbox = document.getElementById('invertColors');

let control;

// Factory function to create ScaleLine control based on current form options
// 根据表单当前配置项创建比例尺/分段比例条控件的工厂函数
function scaleControl() {
  if (typeSelect.value === 'scaleline') {
    control = new ScaleLine({
      units: unitsSelect.value,
    });
    scaleBarOptionsContainer.style.display = 'none';
  } else {
    control = new ScaleLine({
      units: unitsSelect.value,
      bar: true,
      steps: parseInt(stepsRange.value, 10),
      text: scaleTextCheckbox.checked,
      minWidth: 140,
    });
    onInvertColorsChange();
    scaleBarOptionsContainer.style.display = 'block';
  }
  return control;
}

// Initialize map with scale control
// 初始化地图并挂载比例尺控件
const map = new Map({
  controls: defaultControls().extend([scaleControl()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Reconfigure and replace scale line control
// 重新配置并替换比例尺控件实例
function reconfigureScaleLine() {
  map.removeControl(control);
  map.addControl(scaleControl());
}

// Handle unit changes
// 处理单位体系切换
function onChangeUnit() {
  control.setUnits(unitsSelect.value);
}

// Handle scale bar color inversion
// 处理分段比例条反相颜色切换
function onInvertColorsChange() {
  control.element.classList.toggle(
    'ol-scale-bar-inverted',
    invertColorsCheckbox.checked,
  );
}

unitsSelect.addEventListener('change', onChangeUnit);
typeSelect.addEventListener('change', reconfigureScaleLine);
stepsRange.addEventListener('input', reconfigureScaleLine);
scaleTextCheckbox.addEventListener('change', reconfigureScaleLine);
invertColorsCheckbox.addEventListener('change', onInvertColorsChange);
