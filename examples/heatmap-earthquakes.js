import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import KML from '../src/ol/format/KML.js';
import HeatmapLayer from '../src/ol/layer/Heatmap.js';
import TileLayer from '../src/ol/layer/Tile.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';

// 获取页面中的“模糊大小（blur）”和“半径大小（radius）”滑块 DOM 元素
const blur = document.getElementById('blur');
const radius = document.getElementById('radius');

// 创建基于 WebGL 渲染的热力图图层（ol/layer/Heatmap）
const vector = new HeatmapLayer({
  source: new VectorSource({
    url: 'data/kml/2012_Earthquakes_Mag5.kml',
    format: new KML({
      // 忽略 KML 文件内置的图标样式，仅提取点几何与属性用于热力图渲染
      extractStyles: false,
    }),
  }),
  // 初始羽化模糊像素宽度（10 进制整数）
  blur: parseInt(blur.value, 10),
  // 初始热力点核心像素半径（10 进制整数）
  radius: parseInt(radius.value, 10),
  // 权重计算函数：返回值应在 [0, 1] 区间内（超出区间的值会被底层自动截断到 0~1）
  weight: function (feature) {
    // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
    // standards-violating <magnitude> tag in each Placemark.  We extract it from
    // the Placemark's name instead.
    // 2012_Earthquakes_Mag5.kml 将每次地震的震级保存在了不符合 KML 标准的 <magnitude> 标签中，
    // 因此我们改为直接从 Placemark 的 name 属性（如 "M 5.8 - ..."）中截取解析震级数值。
    const name = feature.get('name');
    const magnitude = parseFloat(name.substr(2));
    // 将 5.0 ~ 6.0+ 的震级减去 5，归一化映射到 [0, 1] 权重区间
    return magnitude - 5;
  },
});

// 创建 StadiaMaps (Stamen Toner 黑白底图) 瓦片图层，突出彩色热力分布
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// 监听模糊度滑块拖动：实时更新 WebGL 着色器中的 blur uniform 参数并重绘
blur.addEventListener('input', function () {
  vector.setBlur(parseInt(blur.value, 10));
});

// 监听半径滑块拖动：实时更新 WebGL 着色器中的 radius uniform 参数并重绘
radius.addEventListener('input', function () {
  vector.setRadius(parseInt(radius.value, 10));
});
