import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
  withLowerResolutions,
  withZoom,
} from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoZarr from '../src/ol/source/GeoZarr.js';
import OSM from '../src/ol/source/OSM.js';

const select = document.getElementById('url-select');
const input = document.getElementById('custom-url');
const button = document.getElementById('load-url');

function getUrl() {
  return select.value === 'custom' ? input.value : select.value;
}

select.addEventListener('change', () => {
  if (select.value === 'custom') {
    input.style.display = '';
    input.focus();
  } else {
    input.style.display = 'none';
  }
});

let map;

// Render GeoZarr source with WebGL true-color composite and gamma correction
// 加载并渲染 GeoZarr 数据源，使用 WebGL 真彩色波段合成与伽马校正
function render() {
  const url = getUrl();
  if (!url) {
    return;
  }

  // Request specific bands by name from the remote Zarr store
  // 按波段名称从远程 Zarr 存储中按需加载特定波段
  const source = new GeoZarr({
    url: url,
    bands: ['b04', 'b03', 'b02'],
  });

  if (map) {
    map.setTarget(null);
  }

  // Initialize Map with OSM base and WebGLTile GeoZarr layer
  // 初始化地图实例，配置基础 OSM 图层与 WebGLTile GeoZarr 遥感图层
  map = new Map({
    layers: [
      new TileLayer({
        source: new OSM(),
      }),
      new TileLayer({
        style: {
          gamma: 1.5,
          color: [
            'color',
            ['interpolate', ['linear'], ['band', 1], 0, 0, 0.5, 255],
            ['interpolate', ['linear'], ['band', 2], 0, 0, 0.5, 255],
            ['interpolate', ['linear'], ['band', 3], 0, 0, 0.5, 255],
          ],
        },
        source,
      }),
    ],
    target: 'map',
    view: getView(
      source,
      withLowerResolutions(1),
      withHigherResolutions(2),
      withExtentCenter(),
      withZoom(2),
    ),
  });
}

button.addEventListener('click', render);

render();
