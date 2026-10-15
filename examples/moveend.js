import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getBottomLeft, getTopRight} from '../src/ol/extent.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {toLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

// Initialize map with OpenStreetMap base layer
// 初始化地图并加载 OpenStreetMap 底图瓦片
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Helper function to display coordinate values in input fields
// 辅助函数：将保留两位小数的数值展示在指定 input 输入框中
function display(id, value) {
  document.getElementById(id).value = value.toFixed(2);
}

// Wrap longitude to ensure it remains within the [-180, 180] degree range
// 跨反子午线经度规整：将持续漫游累加的经度折叠限制在 [-180, 180] 度区间内
function wrapLon(value) {
  const worlds = Math.floor((value + 180) / 360);
  return value - worlds * 360;
}

// Handler for the map's moveend event
// 地图漫游结束 (moveend) 事件处理器
function onMoveEnd(evt) {
  const map = evt.map;
  // Calculate current extent in projected coordinate space
  // 计算当前视口在投影坐标系下的四至包围盒范围
  const extent = map.getView().calculateExtent(map.getSize());
  // Transform corner coordinates to WGS84 longitude/latitude
  // 将西南角与东北角投影坐标转换为 WGS84 经纬度
  const bottomLeft = toLonLat(getBottomLeft(extent));
  const topRight = toLonLat(getTopRight(extent));
  display('left', wrapLon(bottomLeft[0]));
  display('bottom', bottomLeft[1]);
  display('right', wrapLon(topRight[0]));
  display('top', topRight[1]);
}

// Register listener on moveend event
// 注册地图漫游结束事件监听器
map.on('moveend', onMoveEnd);
