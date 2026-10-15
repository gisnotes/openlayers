import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTile from '../src/ol/source/ImageTile.js';

/**
 * Renders a progress bar. / 渲染并管理瓦片加载进度条状态的组件类
 * @param {HTMLElement} el The target element. / 目标 DOM 容器元素
 * @class
 */
function Progress(el) {
  this.el = el;
  this.loading = 0;
  this.loaded = 0;
}

/**
 * Increment the count of loading tiles. / 递增加载中瓦片计数并重算进度
 */
Progress.prototype.addLoading = function () {
  ++this.loading;
  this.update();
};

/**
 * Increment the count of loaded tiles. / 递增已完成（成功或失败）瓦片计数并重算进度
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
 * Hide the progress bar. / 延迟隐藏并重置进度条
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

// MapTiler key and attributions / MapTiler 密钥与版权信息
const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

// Configure ImageTile source / 配置栅格瓦片数据源
const source = new ImageTile({
  attributions: attributions,
  url: 'https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=' + key,
  tileSize: 512,
});

// Listen for tile load start / 监听单张瓦片发起请求事件
source.on('tileloadstart', function () {
  progress.addLoading();
});

// Listen for tile load end or error / 监听单张瓦片加载完成或出错事件
source.on(['tileloadend', 'tileloaderror'], function () {
  progress.addLoaded();
});

// Initialize map instance / 初始化地图实例
const map = new Map({
  layers: [new TileLayer({source: source})],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Show progress bar on global map load start / 地图开始加载时展示进度条
map.on('loadstart', function () {
  progress.show();
});

// Hide progress bar on global map load completion / 地图全部加载完成时隐藏进度条
map.on('loadend', function () {
  progress.hide();
});
