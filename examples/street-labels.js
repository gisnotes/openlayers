import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getCenter} from '../src/ol/extent.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// Reusable text style configured for line-following rendering
// 可复用的沿线文本注记样式：启用 placement: 'line' 沿道路线段弯曲排布
const style = new Style({
  text: new Text({
    font: 'bold 11px "Open Sans", "Arial Unicode MS", "sans-serif"',
    placement: 'line',
    fill: new Fill({
      color: 'white',
    }),
  }),
});

// MapTiler API Key for satellite basemap tiles
// MapTiler API 密钥：用于加载高分辨率卫星影像底图
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Spatial extent constraining the view over Vienna city center
// 限制在奥地利维也纳市中心的特定空间坐标范围
const viewExtent = [1817379, 6139595, 1827851, 6143616];

// Initialize map containing satellite imagery basemap and street labels vector layer
// 初始化地图实例：包含卫星遥感底图与开启智能避让的维也纳街道名称矢量图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url:
          'https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
        maxZoom: 20,
      }),
    }),
    new VectorLayer({
      declutter: true,
      source: new VectorSource({
        format: new GeoJSON(),
        url: 'data/geojson/vienna-streets.geojson',
      }),
      style: function (feature) {
        // Dynamically assign street name from GeoJSON attributes
        // 动态读取 GeoJSON 要素中的 name 字段并赋给沿线样式
        style.getText().setText(feature.get('name'));
        return style;
      },
    }),
  ],
  target: 'map',
  view: new View({
    extent: viewExtent,
    center: getCenter(viewExtent),
    zoom: 17,
    minZoom: 14,
  }),
});
