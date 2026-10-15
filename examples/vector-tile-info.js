import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import MVT from '../src/ol/format/MVT.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';

// Initialize the map with an ArcGIS Vector Tile Basemap
// 初始化包含 ArcGIS 矢量切片底图的地图实例
const map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
  layers: [
    new VectorTileLayer({
      source: new VectorTileSource({
        format: new MVT(),
        url: 'https://basemaps.arcgis.com/arcgis/rest/services/World_Basemap_v2/VectorTileServer/tile/{z}/{y}/{x}.pbf',
      }),
    }),
  ],
});

// Bind pointer leave event to clear info panel when cursor exits map container
// 绑定鼠标移出事件，当光标离开地图容器时清空信息面板
const mapTarget = map.getTargetElement();
mapTarget.addEventListener('pointerleave', showInfo);

// Listen to pointer move to query features beneath cursor
// 监听鼠标指针移动事件，查询光标正下方的地理要素
map.on('pointermove', (evt) => {
  // Do not query when dragging/panning the map
  // 地图处于拖拽平移状态时不执行要素探测
  if (evt.dragging) {
    return;
  }
  showInfo(evt);
});

const info = document.getElementById('info');

/**
 * Display properties of the top-most feature at current pointer position
 * 显示当前鼠标指针位置顶层要素的属性信息
 * @param {import('../src/ol/MapBrowserEvent.js').default|PointerEvent} event Event object / 事件对象
 */
function showInfo(event) {
  const features =
    event.type === 'pointerleave' ? [] : map.getFeaturesAtPixel(event.pixel);
  if (features.length === 0) {
    info.innerText = '';
    info.style.opacity = '0';
    return;
  }
  // Retrieve properties of the first intersecting feature
  // 提取首个相交图元的属性字典并格式化为 JSON 文本
  const properties = features[0].getProperties();
  info.innerText = JSON.stringify(properties, null, 2);
  info.style.opacity = '1';
}
