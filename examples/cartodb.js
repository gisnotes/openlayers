import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import CartoDB from '../src/ol/source/CartoDB.js';
import OSM from '../src/ol/source/OSM.js';

// CartoDB Anonymous Map configuration object with CartoCSS styling
// CartoDB 匿名地图配置对象，定义基于 CartoCSS 的多边形渲染样式（红色填充）
const mapConfig = {
  'layers': [
    {
      'type': 'cartodb',
      'options': {
        'cartocss_version': '2.1.1',
        'cartocss': '#layer { polygon-fill: #F00; }',
      },
    },
  ],
};

// Helper function: dynamically construct SQL spatial query based on area threshold
// 辅助函数：根据用户选择的国土面积阈值，动态拼接 PostGIS 空间过滤 SQL 语句
function setArea(n) {
  mapConfig.layers[0].options.sql =
    'select * from european_countries_e where area > ' + n;
}
const areaSelect = document.getElementById('country-area');
setArea(areaSelect.value);

// Initialize CartoDB tile source pointing to the documentation account
// 初始化 CartoDB 切片数据源，指向官方公开的 documentation 租户空间
const cartoDBSource = new CartoDB({
  account: 'documentation',
  config: mapConfig,
});

// Listen to select change event, update SQL query and trigger cloud re-tiling via setConfig
// 监听下拉菜单变更事件，更新 SQL 查询并通过 setConfig 触发云端即时重新切片
areaSelect.addEventListener('change', function () {
  setArea(this.value);
  cartoDBSource.setConfig(mapConfig);
});

// Initialize map with OpenStreetMap base layer and CartoDB overlay layer
// 初始化地图，叠加 OpenStreetMap 底图与 CartoDB 空间分析业务图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new TileLayer({
      source: cartoDBSource,
    }),
  ],
  target: 'map',
  view: new View({
    center: [8500000, 8500000],
    zoom: 2,
  }),
});
