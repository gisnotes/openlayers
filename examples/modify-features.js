import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Modify from '../src/ol/interaction/Modify.js';
import Select from '../src/ol/interaction/Select.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import VectorSource from '../src/ol/source/Vector.js';

const vector = new VectorLayer({
  background: 'white',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/us-states.json',
    format: new GeoJSON(),
    wrapX: false,
  }),
});

// Select interaction to handle feature clicking
// 选择交互：负责要素点击拾取与高亮
const select = new Select();

// Modify interaction bound to the selected features collection
// 修改交互：直接绑定选择交互的选中要素集合，仅对选中要素生效
const modify = new Modify({
  features: select.getFeatures(),
});

const map = new Map({
  interactions: defaultInteractions().extend([select, modify]),
  layers: [vector],
  target: 'map',
  view: new View({
    center: fromLonLat([-100, 38.5]),
    zoom: 4,
  }),
});
