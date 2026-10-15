import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Control from '../src/ol/control/Control.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

//
// Define the screen capture control.
// 定义屏幕截屏自定义控件。
//

const cameraIcon =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" ' +
  'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
  '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>' +
  '<circle cx="12" cy="13" r="4"/></svg>';

class ScreenCaptureControl extends Control {
  /**
   * @param {Object} [options] Control options.
   * @param {HTMLElement|string} [options.target] Specify a target if you want
   * the control to be rendered outside of the map's viewport.
   */
  constructor(options) {
    options = options || {};

    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Capture the map / 截取地图';
    button.innerHTML = cameraIcon;

    const element = document.createElement('div');
    element.className = 'screen-capture ol-unselectable ol-control';
    element.appendChild(button);

    super({
      element: element,
      target: options.target,
    });

    /**
     * The preview shown on top of the map after a capture.
     * 截屏后叠加在地图上方的预览 DOM 容器
     * @type {HTMLElement|null}
     * @private
     */
    this.preview_ = null;

    /**
     * Object URL of the captured image.
     * 捕获图片的临时 Blob 资源 URL
     * @type {string|null}
     * @private
     */
    this.imageUrl_ = null;

    button.addEventListener('click', this.handleCapture.bind(this), false);
  }

  /**
   * @param {import("../src/ol/Map.js").default|null} map Map.
   * @override
   */
  setMap(map) {
    this.closePreview_();
    super.setMap(map);
  }

  /**
   * Render the map into a canvas and show a preview.
   * 将地图重定向渲染至离屏 Canvas 并展示预览弹窗
   */
  handleCapture() {
    const map = this.getMap();
    const target = map.getTargetElement();
    const size = map.getSize();
    const canvas = document.createElement('canvas');
    canvas.width = size[0];
    canvas.height = size[1];

    // Listen to once-rendercomplete event for the offscreen canvas
    // 监听离屏画布渲染完成的单次事件
    map.once('rendercomplete', (event) => {
      const attributions = map
        .getAllLayers()
        .flatMap((layer) => layer.getAttributions(event.frameState));
      // Restore map target back to the original container
      // 将地图渲染目标立即还原回原始 DOM 容器并触发重绘
      map.setTarget(target);
      map.render();
      // Draw copyright attributions and convert to PNG Blob
      // 绘制版权文字并导出为 PNG 二进制 Blob
      Promise.all(attributions).then((resolved) => {
        drawAttributions(canvas, resolved);
        canvas.toBlob((blob) => this.showPreview_(blob, size), 'image/png');
      });
    });
    // Temporarily redirect map target to offscreen canvas
    // 临时将地图渲染目标切换到离屏 Canvas 触发一次性同步绘制
    map.setTarget(canvas);
  }

  /**
   * Show preview overlay over the map.
   * 在地图视口中呈现截屏预览浮层。
   * @param {Blob} blob PNG image.
   * @param {import("../src/ol/size.js").Size} size Map size.
   * @private
   */
  showPreview_(blob, size) {
    this.closePreview_();
    this.imageUrl_ = URL.createObjectURL(blob);

    const image = document.createElement('img');
    image.src = this.imageUrl_;
    image.width = size[0] / 2;
    image.height = size[1] / 2;
    image.alt = 'Map capture preview / 地图截屏预览';

    const download = document.createElement('button');
    download.type = 'button';
    download.textContent = 'Download picture / 下载截图';
    download.addEventListener('click', () => {
      this.download_(blob);
      this.closePreview_();
    });

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.textContent = 'Return to map / 返回地图';
    cancel.addEventListener('click', () => this.closePreview_());

    const buttons = document.createElement('div');
    buttons.appendChild(download);
    buttons.appendChild(cancel);

    const preview = document.createElement('div');
    preview.className = 'screen-capture-preview';
    preview.appendChild(image);
    preview.appendChild(buttons);

    this.getMap().getOverlayContainerStopEvent().appendChild(preview);
    this.preview_ = preview;
  }

  /**
   * Clean up preview overlay and revoke Object URL.
   * 移除预览浮层并注销 Object URL 释放内存
   * @private
   */
  closePreview_() {
    if (this.preview_) {
      this.preview_.remove();
      this.preview_ = null;
    }
    if (this.imageUrl_) {
      URL.revokeObjectURL(this.imageUrl_);
      this.imageUrl_ = null;
    }
  }

  /**
   * Save the image as a PNG file named after the current date and time.
   * 保存图片为带有当前时间戳命名的 PNG 文件
   * @param {Blob} blob PNG image.
   * @private
   */
  download_(blob) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'screencapture_' + timestamp() + '.png';
    link.click();
    URL.revokeObjectURL(link.href);
  }
}

/**
 * Draw the attributions in the lower right corner of the canvas.
 * 在画布右下角绘制半透明版权归属文字水印。
 * @param {HTMLCanvasElement} canvas Canvas.
 * @param {Array<string>} attributions Attributions (may contain HTML).
 */
function drawAttributions(canvas, attributions) {
  const element = document.createElement('div');
  element.innerHTML = attributions.join(' ');
  const text = element.textContent.trim();
  if (!text) {
    return;
  }
  const context = canvas.getContext('2d');
  const padding = 4;
  context.font = '12px sans-serif';
  context.textBaseline = 'bottom';
  context.textAlign = 'right';
  const width = context.measureText(text).width + 2 * padding;
  const height = 12 + 2 * padding;
  context.fillStyle = 'rgba(255, 255, 255, 0.75)';
  context.fillRect(canvas.width - width, canvas.height - height, width, height);
  context.fillStyle = 'black';
  context.fillText(text, canvas.width - padding, canvas.height - padding);
}

/**
 * Format local date and time as YYYY-MM-DD_HH-MM-SS.
 * 获取当前本地时间并格式化为 `YYYY-MM-DD_HH-MM-SS` 字符串
 * @return {string} The current local date and time as `YYYY-MM-DD_HH-MM-SS`.
 */
function timestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_` +
    `${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`
  );
}

//
// Create the map, giving it a screen capture control.
// 初始化地图实例，配置屏幕截屏自定义控件。
//

const map = new Map({
  controls: defaultControls().extend([new ScreenCaptureControl()]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([80.7, 7.8]),
    zoom: 7,
  }),
});
