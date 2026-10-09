// Import the ol-mapbox-style helper function (commonly aliased as olms)
// 导入 ol-mapbox-style 辅助库核心入口函数（通常约定简写别名为 olms）
import olms from 'ol-mapbox-style';

// Import the FullScreen control from OpenLayers
// 导入 OpenLayers 的全屏控件组件
import FullScreen from '../src/ol/control/FullScreen.js';

// The olms() function automatically creates an ol/Map instance, creates an ol/View from the style metadata,
// fetches and parses the Mapbox style.json, and compiles all layers and styling rules into OpenLayers vector tile layers.
// olms() 函数会全自动完成以下工作：
// 1. 创建目标 ol/Map 实例；
// 2. 根据样式元数据（中心点、缩放级别等）自动创建对应的 ol/View；
// 3. 异步获取并解析 Mapbox style.json 规范文件；
// 4. 将样式中定义的所有数据源和渲染图层编译转换为 OpenLayers 的 VectorTileLayer 矢量切片图层。
olms(
  'map', // Target HTML element ID / 挂载地图的目标 DOM 容器 ID
  'https://api.maptiler.com/maps/outdoor-v2/style.json?key=EPhPi7Zr1GTS500UybLu', // Mapbox Style JSON URL / Mapbox 样式规范 JSON 链接
).then(function (map) {
  // Once the style is fully loaded and the map is initialized, the Promise resolves with the created ol/Map instance.
  // We can then seamlessly use any standard OpenLayers APIs on this map (such as adding controls).
  // 异步加载并初始化完成后，Promise 回调返回已构建就绪的 ol/Map 实例。
  // 此时可以像操作常规 OpenLayers 地图一样自由调用所有原生 API（例如添加全屏控件）。
  map.addControl(new FullScreen());
});
