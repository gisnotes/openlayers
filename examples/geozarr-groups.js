import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
} from '../src/ol/View.js';
import Link from '../src/ol/interaction/Link.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoZarr from '../src/ol/source/GeoZarr.js';
import OSM from '../src/ol/source/OSM.js';

// GeoZarr source reading bands from multiple Zarr groups (measurements and quality)
// GeoZarr 数据源：从多个不同 Zarr 群组（光谱测量与数据质量）中组合提取波段
const source = new GeoZarr({
  url: 'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr',
  bands: [
    {name: 'b04', group: 'measurements/reflectance'}, // Red / 红光 (Band 1)
    {name: 'b03', group: 'measurements/reflectance'}, // Green / 绿光 (Band 2)
    {name: 'b02', group: 'measurements/reflectance'}, // Blue / 蓝光 (Band 3)
    {name: 'cld', group: 'quality/probability'}, // Cloud probability / 云覆盖概率 (Band 4)
  ],
});

// Tile layer with dynamic cloud threshold masking in WebGL shader
// 挂载 WebGLTile 图层，在片元着色器中应用动态云概率阈值遮罩
const layer = new TileLayer({
  style: {
    variables: {threshold: 50},
    gamma: 1.5,
    color: [
      'color',
      ['interpolate', ['linear'], ['band', 1], 0, 0, 0.5, 255],
      ['interpolate', ['linear'], ['band', 2], 0, 0, 0.5, 255],
      ['interpolate', ['linear'], ['band', 3], 0, 0, 0.5, 255],
      // Hide pixels whose cloud probability exceeds the threshold / 云概率超过阈值时将 Alpha 设为 0 (透明)
      ['case', ['>', ['band', 4], ['var', 'threshold']], 0, 1],
    ],
  },
  source,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    layer,
  ],
  target: 'map',
  view: getView(source, withHigherResolutions(2), withExtentCenter()),
});

// Sync map viewport state with URL hash
// 同步地图视口状态至 URL hash
map.addInteraction(new Link());

// Update threshold variable on slider input
// 监听滑块拖拽事件，动态更新 WebGL 样式变量
const thresholdSlider = document.getElementById('threshold');
const thresholdValue = document.getElementById('threshold-value');
thresholdSlider.addEventListener('input', function () {
  thresholdValue.textContent = thresholdSlider.value;
  layer.updateStyleVariables({threshold: parseFloat(thresholdSlider.value)});
});
