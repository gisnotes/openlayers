import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import TileJSON from '../src/ol/source/TileJSON.js';

// Mapbox API public access token
// Mapbox API 访问令牌
const key =
  'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ';

/**
 * Create the map with multi-scale resolution-controlled layers.
 * 初始化具有多尺度分辨率控制区间的地图实例。
 */
const map = new Map({
  layers: [
    // OpenStreetMap layer: visible only at high zoom levels (resolution: 200 to 2000 m/px)
    // OpenStreetMap 街道图层：仅在较高缩放级别（分辨率在 200 至 2000 米/像素之间）可见
    new TileLayer({
      source: new OSM(),
      minResolution: 200,
      maxResolution: 2000,
    }),
    // MapBox Natural Earth layer: visible only at low/continental zoom levels (resolution: 2000 to 20000 m/px)
    // MapBox 自然地貌宏观图层：仅在宏观/大洲缩放级别（分辨率在 2000 至 20000 米/像素之间）可见
    new TileLayer({
      source: new TileJSON({
        url:
          'https://api.tiles.mapbox.com/v4/mapbox.natural-earth-hypso-bathy.json?secure&access_token=' +
          key,
        crossOrigin: 'anonymous',
      }),
      minResolution: 2000,
      maxResolution: 20000,
    }),
  ],
  target: 'map',
  view: new View({
    center: [653600, 5723680],
    zoom: 5,
  }),
});
