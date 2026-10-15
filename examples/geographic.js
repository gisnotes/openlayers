import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import Overlay from '../src/ol/Overlay.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {useGeographic} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Globally configure OpenLayers to use geographic coordinates (lon, lat in degrees)
// 全局配置 OpenLayers 启用地理坐标系模式（所有公开 API 直接使用经纬度数值）
useGeographic();

// Location in Yellowstone National Park: longitude -110, latitude 45
// 坐标点：西经 110 度，北纬 45 度（美国黄石国家公园附近）
const place = [-110, 45];

const point = new Point(place);

const map = new Map({
  target: 'map',
  view: new View({
    center: place, // Directly provide [longitude, latitude] / 直接使用经纬度居中
    zoom: 8,
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [new Feature(point)],
      }),
      style: {
        'circle-radius': 9,
        'circle-fill-color': 'red',
      },
    }),
  ],
});

const element = document.getElementById('popup');

const popup = new Overlay({
  element: element,
  stopEvent: false,
});
map.addOverlay(popup);

/**
 * Format longitude and latitude coordinates into an HTML table.
 * 将经纬度坐标格式化为 HTML 表格。
 * @param {Array<number>} coordinate Coordinate array [lon, lat].
 * @return {string} Formatted HTML.
 */
function formatCoordinate(coordinate) {
  return `
    <table>
      <tbody>
        <tr><th>lon / 经度</th><td>${coordinate[0].toFixed(2)}</td></tr>
        <tr><th>lat / 纬度</th><td>${coordinate[1].toFixed(2)}</td></tr>
      </tbody>
    </table>`;
}

const info = document.getElementById('info');
map.on('moveend', function () {
  const view = map.getView();
  const center = view.getCenter();
  info.innerHTML = formatCoordinate(center);
});

let popover;
// Click event returns event.coordinate directly in [lon, lat]
// 监听地图点击，通过 event.coordinate 直接获取鼠标点击处的经纬度
map.on('click', function (event) {
  if (popover) {
    popover.dispose();
    popover = undefined;
  }
  const feature = map.getFeaturesAtPixel(event.pixel)[0];
  if (!feature) {
    return;
  }
  const coordinate = feature.getGeometry().getCoordinates();
  // Compensate for world wrapping by shifting x by multiple of 360 degrees
  // 经度多世界平铺周期补偿：计算相近的 360 度整数倍平移，保证浮层在当前副本正常弹出
  popup.setPosition([
    coordinate[0] + Math.round(event.coordinate[0] / 360) * 360,
    coordinate[1],
  ]);

  popover = new bootstrap.Popover(element, {
    container: element.parentElement,
    content: formatCoordinate(coordinate),
    html: true,
    offset: [0, 20],
    placement: 'top',
    sanitize: false,
  });
  popover.show();
});

map.on('pointermove', function (event) {
  const type = map.hasFeatureAtPixel(event.pixel) ? 'pointer' : 'inherit';
  map.getViewport().style.cursor = type;
});
