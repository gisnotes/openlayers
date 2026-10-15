import Map from '../src/ol/Map.js';
import Overlay from '../src/ol/Overlay.js';
import View from '../src/ol/View.js';
import {toStringHDMS} from '../src/ol/coordinate.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {toLonLat} from '../src/ol/proj.js';
import ImageTile from '../src/ol/source/ImageTile.js';

/**
 * Elements that make up the popup.
 * 构成弹出框的 DOM 元素。
 */
const container = document.getElementById('popup');
const content = document.getElementById('popup-content');
const closer = document.getElementById('popup-closer');

/**
 * Create an overlay to anchor the popup to the map.
 * 创建 Overlay 覆盖物以将弹出框锚定到地图上。
 */
const overlay = new Overlay({
  element: container,
  autoPan: {
    animation: {
      duration: 250,
    },
  },
});

/**
 * Add a click handler to hide the popup.
 * 添加点击处理函数以隐藏弹出框。
 * @return {boolean} Don't follow the href. / 阻止 a 标签默认跳转行为。
 */
closer.onclick = function () {
  overlay.setPosition(undefined);
  closer.blur();
  return false;
};

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

/**
 * Create the map.
 * 创建地图实例。
 */
const map = new Map({
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
  overlays: [overlay],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

/**
 * Add a click handler to the map to render the popup.
 * 为地图添加单击事件监听器以渲染弹出框。
 */
map.on('singleclick', function (evt) {
  const coordinate = evt.coordinate;
  const hdms = toStringHDMS(toLonLat(coordinate));

  content.innerHTML =
    '<p>You clicked here / 您点击的位置是：</p><code>' + hdms + '</code>';
  overlay.setPosition(coordinate);
});
