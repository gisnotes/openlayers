import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Instantiate map with constrained zoom range (minZoom: 9, maxZoom: 13)
// 初始化带有缩放级别硬约束（minZoom: 9, maxZoom: 13）的地图与视图
const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
  view: new View({
    center: [-13553864, 5918250],
    zoom: 11,
    minZoom: 9, // Clamped minimum zoom level (broadest view) / 允许缩放的最小级别（最宽视野）
    maxZoom: 13, // Clamped maximum zoom level (most detailed view) / 允许缩放的最大级别（最高精细度）
  }),
});
