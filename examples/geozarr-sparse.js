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

// GeoZarr source combining 20m SWIR (b11) with 10m visible bands (b03, b02)
// GeoZarr 数据源：融合 20 米分辨率短波红外 (b11) 与 10 米分辨率可见光波段 (b03, b02)
const source = new GeoZarr({
  url: 'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance',
  bands: ['b11', 'b03', 'b02'],
});

const map = new Map({
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
  view: getView(source, withHigherResolutions(2), withExtentCenter()),
});

// Maintain zoom and center state in the URL
// 在 URL 中持久化保存缩放和中心点位置状态
map.addInteraction(new Link());
