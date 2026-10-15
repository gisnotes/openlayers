import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// default zoom, center and rotation
// 默认缩放级别、中心点坐标以及旋转角度
let zoom = 2;
let center = [0, 0];
let rotation = 0;

if (window.location.hash !== '') {
  // try to restore center, zoom-level and rotation from the URL
  // 尝试从浏览器 URL Hash 中恢复中心点、缩放级别与旋转角度
  const hash = window.location.hash.replace('#map=', '');
  const parts = hash.split('/');
  if (parts.length === 4) {
    zoom = parseFloat(parts[0]);
    center = [parseFloat(parts[1]), parseFloat(parts[2])];
    rotation = parseFloat(parts[3]);
  }
}

// Create map instance with initialized or restored view
// 创建地图实例，并应用初始或还原后的视图配置
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: center,
    zoom: zoom,
    rotation: rotation,
  }),
});

// Guard flag to prevent loop updates during browser back/forward navigation
// 状态同步互斥锁：防止在浏览器前进/后退触发 popstate 时重复触发 pushState 导致历史死循环
let shouldUpdate = true;
const view = map.getView();
const updatePermalink = function () {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler
    // 当视图是由 popstate 监听器驱动更新时，不向历史栈重复写入，重置标志位后退出
    shouldUpdate = true;
    return;
  }

  const center = view.getCenter();
  const hash =
    '#map=' +
    view.getZoom().toFixed(2) +
    '/' +
    center[0].toFixed(2) +
    '/' +
    center[1].toFixed(2) +
    '/' +
    view.getRotation();
  const state = {
    zoom: view.getZoom(),
    center: view.getCenter(),
    rotation: view.getRotation(),
  };
  // Push state to browser history with updated hash
  // 将最新的状态快照与 Hash 编码推入浏览器历史记录栈
  window.history.pushState(state, 'map', hash);
};

// Bind permalink update to moveend event
// 监听地图漫游结束事件，更新永久链接
map.on('moveend', updatePermalink);

// restore the view state when navigating through the history, see
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
// 监听浏览器历史导航（前进/后退）事件，还原视图状态
window.addEventListener('popstate', function (event) {
  if (event.state === null) {
    return;
  }
  map.getView().setCenter(event.state.center);
  map.getView().setZoom(event.state.zoom);
  map.getView().setRotation(event.state.rotation);
  // Mark shouldUpdate as false so the subsequent moveend event does not push another history entry
  // 将互斥锁置为 false，阻断随后的 moveend 事件再次向历史栈灌入重复记录
  shouldUpdate = false;
});
