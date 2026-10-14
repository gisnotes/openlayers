import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {
  altKeyOnly,
  click,
  never,
  pointerMove,
} from '../src/ol/events/condition.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Select from '../src/ol/interaction/Select.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});

const vector = new VectorLayer({
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/ecoregions.json',
    format: new GeoJSON(),
  }),
  background: 'white',
  style: function (feature) {
    const color = feature.get('COLOR') || '#eeeeee';
    style.getFill().setColor(color);
    return style;
  },
});

const map = new Map({
  layers: [vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

let select = null; // ref to currently selected interaction / 当前激活的 Select 交互实例引用

const selected = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 255, 0.7)',
    width: 2,
  }),
});

function selectStyle(feature) {
  const color = feature.get('COLOR') || '#eeeeee';
  selected.getFill().setColor(color);
  return selected;
}

// select interaction working on "singleclick"
// 基于 "singleclick"（延时防抖单选）事件的 Select 交互
const selectSingleClick = new Select({style: selectStyle});

// select interaction working on "click"
// 基于 "click"（即时响应点击）事件的 Select 交互
const selectClick = new Select({
  condition: click,
  style: selectStyle,
});

// select interaction working on "pointermove"
// 基于 "pointermove"（指针悬停移动）事件的 Select 交互
const selectPointerMove = new Select({
  condition: pointerMove,
  toggleCondition: never, // otherwise the move events cause the features to flicker when holding shift / 禁用 Shift 切换，避免移动时要素反复闪烁
  style: selectStyle,
});

// select interaction working on "Alt+Click"
// 基于 "Alt+Click" 复合按键事件的 Select 交互
const selectAltClick = new Select({
  style: selectStyle,
  condition: function (mapBrowserEvent) {
    return click(mapBrowserEvent) && altKeyOnly(mapBrowserEvent);
  },
});

const selectElement = document.getElementById('type');

const changeInteraction = function () {
  if (select !== null) {
    map.removeInteraction(select);
  }
  const value = selectElement.value;
  if (value == 'singleclick') {
    select = selectSingleClick;
  } else if (value == 'click') {
    select = selectClick;
  } else if (value == 'pointermove') {
    select = selectPointerMove;
  } else if (value == 'altclick') {
    select = selectAltClick;
  } else {
    select = null;
  }
  if (select !== null) {
    map.addInteraction(select);
    select.on('select', function (e) {
      document.getElementById('status').innerHTML =
        '&nbsp;' +
        e.target.getFeatures().getLength() +
        ' selected features (last operation selected ' +
        e.selected.length +
        ' and deselected ' +
        e.deselected.length +
        ' features) / 已选中 ' +
        e.target.getFeatures().getLength() +
        ' 个要素 (本次新增 ' +
        e.selected.length +
        ' 个，取消 ' +
        e.deselected.length +
        ' 个)';
    });
  }
};

/**
 * onchange callback on the select element.
 * 下拉选择框的 onchange 切换交互事件回调。
 */
selectElement.onchange = changeInteraction;
changeInteraction();
