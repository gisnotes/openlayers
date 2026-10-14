import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

/**
 * OpenLayers 客户端栅格重投影示例 (EPSG:3857 -> EPSG:4326)
 *
 * 核心原理解析：
 * 1. OSM 数据源（ol/source/OSM）原生的投影为 EPSG:3857 (Web 墨卡托)；
 * 2. 地图视图（ol/View）被配置为 EPSG:4326 (WGS84 经纬度投影)；
 * 3. OpenLayers 内部自动检测到源投影与视图投影不一致，且核心库已内置 3857 与 4326 之间的互转公式；
 * 4. 底层透明启用 ol/reproj/Tile 瓦片重采样管线，通过三角剖分和双线性插值在客户端实时渲染出扁平的经纬度世界地图。
 */

// 初始化地图实例
const map = new Map({
  layers: [
    // 基础 OSM 瓦片图层（源数据投影为 EPSG:3857）
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    // 将视图设置为等经纬度投影 EPSG:4326 (Plate Carrée)
    projection: 'EPSG:4326',
    // 经纬度中心点 [经度 0°, 纬度 0°]（几内亚湾对准中心）
    center: [0, 0],
    zoom: 2,
  }),
});
