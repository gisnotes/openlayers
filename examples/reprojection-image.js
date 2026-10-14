import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getCenter} from '../src/ol/extent.js';
import ImageLayer from '../src/ol/layer/Image.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {transform} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import Static from '../src/ol/source/ImageStatic.js';
import OSM from '../src/ol/source/OSM.js';

// 向 Proj4js 注册英国国家格网坐标系（EPSG:27700，基于 Airy 1830 椭球体的横轴墨卡托投影）
proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs',
);
// 将 proj4 投影定义同步至 OpenLayers 投影注册表
register(proj4);

// 静态图片在源坐标系 EPSG:27700 下的有效范围 [minX, minY, maxX, maxY]（单位：米）
const imageExtent = [0, 0, 700000, 1300000];

// 创建用于承载重投影静态图像的单图像图层
const imageLayer = new ImageLayer();

// 初始化地图实例（视图投影默认为 EPSG:3857 Web 墨卡托）
const map = new Map({
  layers: [
    // 基础 OSM 瓦片底图（EPSG:3857）
    new TileLayer({
      source: new OSM(),
    }),
    imageLayer,
  ],
  target: 'map',
  view: new View({
    // 将图像在 EPSG:27700 下的几何中心点，转换为地图当前视图投影 EPSG:3857 坐标
    center: transform(getCenter(imageExtent), 'EPSG:27700', 'EPSG:3857'),
    zoom: 4,
  }),
});

// 获取插值开关复选框 DOM
const interpolate = document.getElementById('interpolate');

/**
 * 重新构建并设置静态图像源
 * 当切换 interpolate 状态时，重新创建 ImageStatic 数据源并更新图层
 */
function setSource() {
  const source = new Static({
    url:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/' +
      'British_National_Grid.svg/2000px-British_National_Grid.svg.png',
    crossOrigin: '',
    // 指定该图片本身的原始空间参考坐标系
    projection: 'EPSG:27700',
    // 指定该图片在源坐标系下的外包矩形范围
    imageExtent: imageExtent,
    // 是否启用双线性插值平滑（true 为双线性平滑，false 为最近邻离散像元采样）
    interpolate: interpolate.checked,
  });
  imageLayer.setSource(source);
}

// 首次执行初始化数据源
setSource();

// 监听插值开关切换事件
interpolate.addEventListener('change', setSource);
