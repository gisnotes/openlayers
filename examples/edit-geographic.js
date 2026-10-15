import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Draw from '../src/ol/interaction/Draw.js';
import Modify from '../src/ol/interaction/Modify.js';
import Select from '../src/ol/interaction/Select.js';
import Snap from '../src/ol/interaction/Snap.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {useGeographic} from '../src/ol/proj.js';
import VectorSource from '../src/ol/source/Vector.js';

// Enable geographic coordinates (longitude/latitude) across all OpenLayers APIs
// 全局启用地理坐标（经纬度 [lon, lat]）模式，简化输入与交互坐标处理
useGeographic();

// Vector data source loading US state boundaries in GeoJSON format
// 矢量数据源：加载 GeoJSON 格式的美国各州多边形边界
const source = new VectorSource({
  url: 'https://openlayers.org/data/vector/us-states.json',
  format: new GeoJSON(),
});

// Initialize map with a vector layer and geographic view
// 初始化地图：配置矢量图层与基于经纬度坐标的初始视图
const map = new Map({
  target: 'map',
  layers: [
    new VectorLayer({
      background: 'white',
      source: source,
    }),
  ],
  view: new View({
    // Geographic center [longitude, latitude]
    // 地理中心点 [经度, 纬度]
    center: [-100, 38.5],
    zoom: 4,
  }),
});

// Select interaction to pick features for modification
// 选择交互：点击要素以建立选区供修改交互操作
const select = new Select();

// Modify interaction linked to the selected features collection
// 修改交互：直接绑定已选中的要素集合，允许拖动或增删几何节点
const modify = new Modify({
  features: select.getFeatures(),
});

// Draw interaction for digitizing new polygons in geographic coordinates
// 绘制交互：使用地理坐标数字化采集新的面状多边形要素
const draw = new Draw({
  type: 'Polygon',
  source: source,
});

// Snap interaction to align vertices and edges during drawing/modifying
// 捕捉交互：在绘制与修改过程中将光标自动吸附到数据源中要素的顶点和边缘
const snap = new Snap({
  source: source,
});

// Helper function to remove all active editing interactions
// 辅助函数：卸载当前所有的编辑与选择交互，避免事件流冲突
function removeInteractions() {
  map.removeInteraction(modify);
  map.removeInteraction(select);
  map.removeInteraction(draw);
  map.removeInteraction(snap);
}

// Mode selector element for toggling between draw and modify modes
// 模式选择下拉框：用于在“修改要素”与“绘制新要素”之间切换
const mode = document.getElementById('mode');
function onChange() {
  removeInteractions();
  switch (mode.value) {
    case 'draw': {
      // Add draw and snap interactions in drawing mode
      // 绘制模式下：激活绘制交互与顶点吸附交互
      map.addInteraction(draw);
      map.addInteraction(snap);
      break;
    }
    case 'modify': {
      // Add select, modify, and snap interactions in modification mode
      // 修改模式下：激活要素选择、节点修改与顶点吸附交互
      map.addInteraction(select);
      map.addInteraction(modify);
      map.addInteraction(snap);
      break;
    }
    default: {
      // pass / 忽略其他未定义模式
    }
  }
}
mode.addEventListener('change', onChange);
onChange();
