import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ZoomSlider from '../src/ol/control/ZoomSlider.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

/**
 * 创建地图并挂载 ZoomSlider 缩放滑块控件的通用工厂函数。
 * 注意：三个地图在 JS 层的代码完全一致，滑块的位置、外观以及垂直/水平滑动方向均由 zoomslider.css 控制。
 *
 * @param {string} divId 地图目标容器 DOM 的 id（'map1' | 'map2' | 'map3'）
 * @return {Map} 创建完成的 OpenLayers Map 实例
 */
function createMap(divId) {
  const source = new OSM();
  const layer = new TileLayer({
    source: source,
  });
  const map = new Map({
    layers: [layer],
    target: divId,
    view: new View({
      center: [0, 0],
      zoom: 2,
    }),
  });
  // 实例化缩放滑块控件并添加到地图上
  const zoomslider = new ZoomSlider();
  map.addControl(zoomslider);
  return map;
}

// 1. 默认垂直滑块样式
const map1 = createMap('map1');
// 2. 嵌入在放大（+）和缩小（-）按钮之间的垂直滑块样式
const map2 = createMap('map2');
// 3. 右上角自定义橙色水平滑块样式（通过 CSS 设置 width > height 自动触发水平滑动）
const map3 = createMap('map3');
