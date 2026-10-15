import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';
import OSM from '../src/ol/source/OSM.js';

// Single image WMS source for US states
// 美国各州边界单图像 WMS 数据源
const wmsSource = new ImageWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: {'LAYERS': 'topp:states'},
  ratio: 1,
  serverType: 'geoserver',
});

// Update the legend image element using getLegendUrl with current resolution
// 使用当前分辨率调用 getLegendUrl 方法动态刷新图例图片地址
const updateLegend = function (resolution) {
  const graphicUrl = wmsSource.getLegendUrl(resolution);
  const img = document.getElementById('legend');
  img.src = graphicUrl;
};

const layers = [
  new TileLayer({
    source: new OSM(),
  }),
  new ImageLayer({
    extent: [-13884991, 2870341, -7455066, 6338219],
    source: wmsSource,
  }),
];

const map = new Map({
  layers: layers,
  target: 'map',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  }),
});

// Fetch initial legend for current view resolution
// 获取当前视图初始分辨率下的图例
const resolution = map.getView().getResolution();
updateLegend(resolution);

// Listen to resolution changes and update the scale-responsive legend
// 监听分辨率变化事件，实时更新支持比例尺响应式的图例
map.getView().on('change:resolution', function (event) {
  const currentRes = event.target.getResolution();
  updateLegend(currentRes);
});
