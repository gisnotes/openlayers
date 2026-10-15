import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Multi-source GeoTIFF combining two images of different spatial resolutions (10m and 60m)
// 多源 GeoTIFF，融合两幅不同空间分辨率的卫星影像（10 米与 60 米）
const source = new GeoTIFF({
  sources: [
    {
      // 10m resolution image containing Red and NIR bands
      // 10 米分辨率影像，包含红光和近红外波段
      url: 'https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/OpenLayers_Sentinel-2_samples/R10m.tif',
      bands: [3, 4],
      nodata: 0,
    },
    {
      // 60m resolution image containing Shortwave Infrared (SWIR) band
      // 60 米分辨率影像，包含短波红外 (SWIR) 波段
      url: 'https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/OpenLayers_Sentinel-2_samples/R60m.tif',
      bands: [9],
      nodata: 0,
    },
  ],
  normalize: false,
});
source.setAttributions(
  "<a href='https://s2maps.eu'>Sentinel-2 cloudless</a> by <a href='https://eox.at/'>EOX IT Services GmbH</a> (Contains modified Copernicus Sentinel data 2019)",
);

// NDVI expression: (NIR - Red) / (NIR + Red)
// NDVI 表达式：(近红外 - 红光) / (近红外 + 红光)
const ndvi = [
  '/',
  ['-', ['band', 2], ['band', 1]],
  ['+', ['band', 2], ['band', 1]],
];

// NDWI expression: (SWIR - Red) / (SWIR + Red)
// NDWI 表达式：(短波红外 - 红光) / (短波红外 + 红光)
const ndwi = [
  '/',
  ['-', ['band', 3], ['band', 1]],
  ['+', ['band', 3], ['band', 1]],
];

// WebGL layer with combined multi-band shader: Red = |NDVI - NDWI|, Green = NDVI, Blue = NDWI
// WebGL 图层，采用复合多波段着色器：红通道 = |NDVI - NDWI|，绿通道 = NDVI，蓝通道 = NDWI
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      style: {
        color: [
          'case',
          [
            'any',
            ['==', ['band', 1], 0],
            ['==', ['band', 2], 0],
            ['==', ['band', 3], 0],
          ],
          [0, 0, 0, 0],
          [
            'color',
            // red: | NDVI - NDWI | / 红通道：植被与水体指数差异绝对值
            ['*', 255, ['abs', ['-', ndvi, ndwi]]],
            // green: NDVI / 绿通道：NDVI 植被指数
            ['*', 255, ndvi],
            // blue: NDWI / 蓝通道：NDWI 水体指数
            ['*', 255, ndwi],
          ],
        ],
      },
      source,
    }),
  ],
  view: new View({
    center: [1447120, 6165360],
    zoom: 11,
  }),
});
