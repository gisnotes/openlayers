import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {transformExtent} from '../src/ol/proj.js';
import TileJSON from '../src/ol/source/TileJSON.js';

/**
 * Transform extent from WGS84 (EPSG:4326) to Web Mercator (EPSG:3857).
 * 将 WGS84 经纬度包围盒转换为 Web 墨卡托投影坐标系包围盒。
 * @param {import("../src/ol/extent.js").Extent} extent WGS84 extent.
 * @return {import("../src/ol/extent.js").Extent} Projected extent.
 */
function transform(extent) {
  return transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
}

// Approximate country bounding boxes in EPSG:3857
// 各国近似空间包围盒范围定义
const extents = {
  India: transform([68.17665, 7.96553, 97.40256, 35.49401]),
  Argentina: transform([-73.41544, -55.25, -53.62835, -21.83231]),
  Nigeria: transform([2.6917, 4.24059, 14.57718, 13.86592]),
  Sweden: transform([11.02737, 55.36174, 23.90338, 69.10625]),
};

const key =
  'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ';

// Base map layer with full global extent
// 全球范围浅色底图
const base = new TileLayer({
  source: new TileJSON({
    url:
      'https://api.tiles.mapbox.com/v4/mapbox.world-light.json?secure&access_token=' +
      key,
    crossOrigin: 'anonymous',
  }),
});

// Overlay layer restricted by spatial extent
// 叠加层：限制仅在特定国家范围内部渲染黑色主题瓦片
const overlay = new TileLayer({
  extent: extents.India,
  source: new TileJSON({
    url:
      'https://api.tiles.mapbox.com/v4/mapbox.world-black.json?secure&access_token=' +
      key,
    crossOrigin: 'anonymous',
  }),
});

const map = new Map({
  layers: [base, overlay],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});

// Bind buttons to dynamically update overlay extent
// 绑定国家按钮点击事件，动态更新叠加图层的裁剪空间包围盒
for (const countryKey in extents) {
  document.getElementById(countryKey).onclick = function (event) {
    overlay.setExtent(extents[event.target.id]);
  };
}
