import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Select from '../src/ol/interaction/Select.js';
import Translate from '../src/ol/interaction/Translate.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import VectorSource from '../src/ol/source/Vector.js';

const vector = new VectorLayer({
  background: 'white',
  source: new VectorSource({
    url: 'https://openlayers.org/data/vector/us-states.json',
    format: new GeoJSON(),
  }),
});

// Select interaction to pick single or multiple features (with Shift key)
// 选择交互：支持单选或按住 Shift 键复选要素
const select = new Select();

// Translate interaction bound to selected features
// 平移交互：将其绑定至选择交互的选中要素集合，实现选中要素拖拽移动
const translate = new Translate({
  features: select.getFeatures(),
});

const map = new Map({
  interactions: defaultInteractions().extend([select, translate]),
  layers: [vector],
  target: 'map',
  view: new View({
    center: fromLonLat([-100, 38.5]),
    zoom: 4,
  }),
});
