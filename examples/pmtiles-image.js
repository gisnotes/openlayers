import {PMTiles} from 'pmtiles';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Layer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import Source from '../src/ol/source/ImageTile.js';

// Use geographic coordinates for view center and inputs / 启用全局经纬度坐标输入模式
useGeographic();

// Initialize PMTiles client pointing to cloud-native archive / 初始化指向云原生归档文件的 PMTiles 客户端
const tiles = new PMTiles(
  'https://pmtiles.io/stamen_toner(raster)CC-BY+ODbL_z3.pmtiles',
);

/**
 * Load image from URL into HTMLImageElement. / 从指定 URL 异步加载图像元素
 * @param {string} src The image source URL. / 图像源 URL
 * @return {Promise<HTMLImageElement>} Resolves with the loaded image. / 承载加载完成图像的 Promise
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () => reject(new Error('load failed')));
    img.src = src;
  });
}

// Configure ImageTile source using custom PMTiles loader / 配置使用 PMTiles 异步加载器的光栅瓦片数据源
const source = new Source({
  async loader(z, x, y, {signal}) {
    // Issue HTTP Range request for tile z, x, y / 发起精确的 HTTP Range 字节范围请求获取切片
    const response = await tiles.getZxy(z, x, y, signal);
    const blob = new Blob([response.data]);
    const src = URL.createObjectURL(blob);
    const image = await loadImage(src);
    // Revoke object URL immediately to prevent memory leak / 立即释放内存对象 URL 句柄防止内存积压
    URL.revokeObjectURL(src);
    return image;
  },
  attributions:
    'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/4.0">CC BY 4.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.',
});

// Initialize map with WebGLTile layer / 初始化包含 WebGL 瓦片图层的地图实例
const map = new Map({
  layers: [new Layer({source})],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    maxZoom: 4,
  }),
});
