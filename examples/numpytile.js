import NumpyLoader from '@planet/ol-numpytiles';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {fromLonLat} from '../src/ol/proj.js';
import DataTileSource from '../src/ol/source/DataTile.js';

// 16-bit Cloud Optimized GeoTIFF (COG) served as NumpyTiles
// 作为 NumpyTiles 瓦片进行分发的 16 位云原生 GeoTIFF
const COG =
  'https://storage.googleapis.com/open-cogs/stac-examples/20201211_223832_CS2_analytic.tif';

// Custom data tile loader fetching .npy binary array buffers
// 自定义瓦片加载器：拉取 .npy 二进制数组并解包为 Float32Array
function numpyTileLoader(z, x, y) {
  const url = `https://titiler.xyz/cog/tiles/WebMercatorQuad/${z}/${x}/${y}?format=npy&url=${encodeURIComponent(
    COG,
  )}`;

  return fetch(url)
    .then((r) => r.arrayBuffer())
    .then((buffer) => NumpyLoader.fromArrayBuffer(buffer))
    .then((numpyData) => {
      // Flatten multi-band numpy data into interleaved array
      // 将多波段 numpy 多维数组展平为适合 WebGL 纹理上传的交错数组
      const dataTile = new Float32Array(256 * 256 * 5);
      const bandSize = 256 * 256;
      for (let x = 0; x < 256; x++) {
        for (let y = 0; y < 256; y++) {
          const px = x + y * 256;
          dataTile[px * 5 + 0] = numpyData.data[y * 256 + x];
          dataTile[px * 5 + 1] = numpyData.data[bandSize + y * 256 + x];
          dataTile[px * 5 + 2] = numpyData.data[bandSize * 2 + y * 256 + x];
          dataTile[px * 5 + 3] = numpyData.data[bandSize * 3 + y * 256 + x];
          dataTile[px * 5 + 4] =
            numpyData.data[bandSize * 4 + y * 256 + x] > 0 ? 1.0 : 0;
        }
      }
      return dataTile;
    });
}

// Linear contrast stretch interpolation expression for band
// 单波段线性对比度拉伸插值表达式
const interpolateBand = (bandIdx) => [
  'interpolate',
  ['linear'],
  ['band', bandIdx],
  ['var', 'bMin'],
  0,
  ['var', 'bMax'],
  1,
];

const initialMin = 3000;
const initialMax = 18000;

// WebGL tile layer with dynamic variables for real-time contrast stretching
// WebGL 瓦片图层：配置动态样式变量以实现 GPU 级对比度实时拉伸
const numpyLayer = new TileLayer({
  style: {
    color: [
      'array',
      interpolateBand(3),
      interpolateBand(2),
      interpolateBand(1),
      ['band', 5],
    ],
    variables: {
      'bMin': initialMin,
      'bMax': initialMax,
    },
  },
  source: new DataTileSource({
    loader: numpyTileLoader,
    bandCount: 5,
  }),
});

const map = new Map({
  target: 'map',
  layers: [numpyLayer],
  view: new View({
    center: fromLonLat([172.933, 1.3567]),
    zoom: 15,
  }),
});

// Slider controls for min and max stretch values / 最小/最大拉伸值滑块监听
const inputMin = document.getElementById('input-min');
const inputMax = document.getElementById('input-max');
const outputMin = document.getElementById('output-min');
const outputMax = document.getElementById('output-max');

inputMin.addEventListener('input', (evt) => {
  numpyLayer.updateStyleVariables({
    'bMin': parseFloat(evt.target.value),
    'bMax': parseFloat(inputMax.value),
  });
  outputMin.innerText = evt.target.value;
});

inputMax.addEventListener('input', (evt) => {
  numpyLayer.updateStyleVariables({
    'bMin': parseFloat(inputMin.value),
    'bMax': parseFloat(evt.target.value),
  });
  outputMax.innerText = evt.target.value;
});

inputMin.value = String(initialMin);
inputMax.value = String(initialMax);
outputMin.innerText = String(initialMin);
outputMax.innerText = String(initialMax);
