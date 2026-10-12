import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TopoJSON from '../src/ol/format/TopoJSON.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';

// MapTiler API 密钥与地图版权归属HTML说明
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// 1. 创建深色数据可视化栅格瓦片底图（瓦片规格为 512x512 像素）
const raster = new TileLayer({
  source: new ImageTile({
    attributions: attributions,
    url:
      'https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=' + key,
    tileSize: 512,
  }),
});

// 2. 创建 TopoJSON 矢量图层：加载全球 1:1.1亿 比例尺拓扑国家边界数据
const vector = new VectorLayer({
  source: new VectorSource({
    url: 'data/topojson/world-110m.json',
    format: new TopoJSON({
      // world-110m.json 的 objects 中同时包含 'land'（全球陆地外轮廓）和 'countries'（各国边界）两层，
      // 此处指定仅提取 'countries' 图层，避免与整个陆地多边形重复叠加绘制
      layers: ['countries'],
    }),
    // 性能优化：告知数据源各国家多边形之间满足拓扑不重叠关系，可加速空间索引查询与渲染
    overlaps: false,
  }),
  // 使用声明式扁平样式（FlatStyle）将国家边界渲染为 1.5px 宽的纯白色线条
  style: {
    'stroke-color': 'white',
    'stroke-width': 1.5,
  },
});

// 3. 初始化地图实例
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});
