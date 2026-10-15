import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import HeatmapLayer from '../src/ol/layer/Heatmap.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';

// DOM input elements / 控制滑块与筛选器 DOM 元素
const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

// WebGL Heatmap layer for trajectories / 轨迹热力图层配置
const heatmap = new HeatmapLayer({
  source: new VectorSource({
    url: 'data/geojson/ship-trajectories.json',
    format: new GeoJSON(),
    attributions: 'Danish Maritime Authority',
  }),
  blur: ['/', ['var', 'blur'], 2],
  radius: ['/', ['var', 'radius'], 2],
  variables: {
    blur: parseInt(blur.value, 10),
    radius: parseInt(radius.value, 10),
    shipType: 'All',
  },
  filter: [
    'any',
    ['==', ['var', 'shipType'], 'All'],
    ['==', ['var', 'shipType'], ['get', 'ShipType']],
  ],
  weight: () => 0.1,
});

const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'alidade_smooth_dark',
  }),
});

const map = new Map({
  layers: [raster, heatmap],
  target: 'map',
  view: new View({
    center: fromLonLat([11.86, 57.67]),
    zoom: 12,
  }),
});

// Event listeners for blur and radius sliders / 监听模糊度与核半径滑块输入
blur.addEventListener('input', function () {
  heatmap.updateStyleVariables({blur: parseInt(blur.value, 10)});
});

radius.addEventListener('input', function () {
  heatmap.updateStyleVariables({radius: parseInt(radius.value, 10)});
});

// Ship type selector event listener / 监听船舶类型下拉菜单切换
const shipTypeSelect = document.getElementById('shiptype-filter');
shipTypeSelect.addEventListener('input', function () {
  heatmap.updateStyleVariables({shipType: shipTypeSelect.value});
  map.render();
});
