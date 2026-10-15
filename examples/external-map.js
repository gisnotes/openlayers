import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Control from '../src/ol/control/Control.js';
import FullScreen from '../src/ol/control/FullScreen.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

// Custom mask control to overlay when map is in external window
// 自定义遮罩控件：当底层地图移入外部子窗口时展示提示遮罩
class UnusableMask extends Control {
  constructor() {
    super({
      element: document.createElement('div'),
    });
    this.element.setAttribute('hidden', 'hidden');
    this.element.className = 'ol-mask';
    this.element.innerHTML =
      '<div>Map in external window / 地图正在外部窗口运行</div>';
  }
}

const localMapTarget = document.getElementById('map');

// Initialize main map
// 初始化主地图实例
const map = new Map({
  target: localMapTarget,
  controls: defaultControls().extend([new FullScreen(), new UnusableMask()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: fromLonLat([37.41, 8.82]),
    zoom: 4,
  }),
});

let mapWindow;
// Close external window helper
// 关闭外部子窗口辅助函数
function closeMapWindow() {
  if (mapWindow) {
    mapWindow.close();
    mapWindow = undefined;
  }
}
// Close external window in case the main page is closed or reloaded
// 主页面关闭或重新加载时协同关闭外部子窗口
window.addEventListener('pagehide', closeMapWindow);

const button = document.getElementById('external-map-button');

// Reset map target back to the local container
// 将地图挂载目标重置还原回主窗口本地容器
function resetMapTarget() {
  localMapTarget.style.height = '';
  map.setTarget(localMapTarget);
  button.disabled = false;
}

// Update overlay and focus based on visibility
// 根据可见性状态同步更新遮罩层与焦点
function updateOverlay() {
  if (!mapWindow) {
    return;
  }
  const externalMapTarget = mapWindow.document.getElementById('map');
  if (!externalMapTarget) {
    return;
  }
  if (document.visibilityState === 'visible') {
    // Show controls and enable keyboard input
    // 显示控件并启用键盘输入焦点
    externalMapTarget.classList.remove('unusable');
    externalMapTarget.setAttribute('tabindex', '0');
    externalMapTarget.focus();
  } else {
    // Hide all controls and disable keyboard input
    // 隐藏控件并禁用键盘输入
    externalMapTarget.removeAttribute('tabindex');
    externalMapTarget.classList.add('unusable');
  }
}
window.addEventListener('visibilitychange', updateOverlay);

// Handle opening external map window
// 处理打开外部独立地图窗口
button.addEventListener('click', function () {
  const blockerNotice = document.getElementById('blocker-notice');
  blockerNotice.setAttribute('hidden', 'hidden');
  button.disabled = true;

  // Reset button and map target in case window did not load or open
  // 若子窗口未成功加载或被拦截，超时自动重置
  let timeoutKey = setTimeout(function () {
    closeMapWindow();
    resetMapTarget();
    blockerNotice.removeAttribute('hidden');
    timeoutKey = undefined;
  }, 3000);

  mapWindow = window.open(
    'resources/external-map-map.html',
    'MapWindow',
    'toolbar=0,location=0,menubar=0,width=800,height=600',
  );
  mapWindow.addEventListener('DOMContentLoaded', function () {
    const externalMapTarget = mapWindow.document.getElementById('map');
    localMapTarget.style.height = '0px';
    // Dynamically transfer map target to the child window's DOM container
    // 动态将地图目标重定向挂载至外部子窗口的 DOM 容器
    map.setTarget(externalMapTarget);

    if (timeoutKey) {
      clearTimeout(timeoutKey);
      timeoutKey = undefined;
    }
    mapWindow.addEventListener('pagehide', function () {
      resetMapTarget();
      // Close window in case user does a page reload
      // 页面重载时关闭窗口
      closeMapWindow();
    });

    updateOverlay();
  });
});
