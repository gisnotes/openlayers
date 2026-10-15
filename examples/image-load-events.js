import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ImageLayer from '../src/ol/layer/Image.js';
import ImageWMS from '../src/ol/source/ImageWMS.js';

/**
 * Renders a progress bar. / 渲染并管理进度条状态的组件类
 * @param {HTMLElement} el The target element. / 目标 DOM 容器元素
 * @class
 */
function Progress(el) {
  this.el = el;
  this.loading = 0;
  this.loaded = 0;
}

/**
 * Increment the count of loading tiles. / 递增加载中计数
 */
Progress.prototype.addLoading = function () {
  ++this.loading;
  this.update();
};

/**
 * Increment the count of loaded tiles. / 递增已完成（成功或失败）计数
 */
Progress.prototype.addLoaded = function () {
  ++this.loaded;
  this.update();
};

/**
 * Update the progress bar. / 更新进度条 DOM 宽度百分比
 */
Progress.prototype.update = function () {
  const width = ((this.loaded / this.loading) * 100).toFixed(1) + '%';
  this.el.style.width = width;
};

/**
 * Show the progress bar. / 显示进度条
 */
Progress.prototype.show = function () {
  this.el.style.visibility = 'visible';
};

/**
 * Hide the progress bar. / 隐藏并重置进度条
 */
Progress.prototype.hide = function () {
  const style = this.el.style;
  setTimeout(function () {
    style.visibility = 'hidden';
    style.width = '0px';
  }, 250);
};

// Initialize progress bar instance / 实例化进度条组件
const progress = new Progress(document.getElementById('progress'));

// Configure ImageWMS source / 配置单张图像 WMS 数据源
const source = new ImageWMS({
  url: 'https://ahocevar.com/geoserver/wms',
  params: {'LAYERS': 'topp:states'},
  serverType: 'geoserver',
});

// Listen for image load start / 监听单张图像开始请求
source.on('imageloadstart', function () {
  progress.addLoading();
});
// Listen for image load completion or error / 监听单张图像加载结束或异常
source.on(['imageloadend', 'imageloaderror'], function () {
  progress.addLoaded();
});

// Initialize map with single-image WMS layer / 初始化包含单张图像图层的地图实例
const map = new Map({
  layers: [new ImageLayer({source: source})],
  target: 'map',
  view: new View({
    center: [-10997148, 4569099],
    zoom: 4,
  }),
});

// Toggle progress bar visibility based on map load events / 结合地图视口级别加载事件控制进度条显隐
map.on('loadstart', function () {
  progress.show();
});
map.on('loadend', function () {
  progress.hide();
});
