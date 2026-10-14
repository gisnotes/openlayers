import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import Zoomify from '../src/ol/source/Zoomify.js';

// 超高分辨率图像原始像素尺寸（宽度 4000px，高度 3000px）
const imgWidth = 4000;
const imgHeight = 3000;

// Zoomify 瓦片金字塔服务根路径
const zoomifyUrl = 'https://ol-zoomify.surge.sh/zoomify/';

// 1. 标准 Zoomify 数据源（针对 1x 普通屏幕）
const source = new Zoomify({
  url: zoomifyUrl,
  size: [imgWidth, imgHeight],
  crossOrigin: 'anonymous',
  // zDirection: -1 确保在缩放过渡中优先选取分辨率等于或高于当前屏幕像素的瓦片层级，避免模糊
  zDirection: -1,
});
// 提取切片网格对应的像素有效外包范围
const extent = source.getTileGrid().getExtent();

// 2. 高清 Retina 数据源（针对 2x 视网膜高清屏）
const retinaPixelRatio = 2;
const retinaSource = new Zoomify({
  url: zoomifyUrl,
  size: [imgWidth, imgHeight],
  crossOrigin: 'anonymous',
  zDirection: -1,
  // 指定瓦片像素比为 2x，并让逻辑瓦片尺寸减半为 128px，
  // 这样 OpenLayers 会从更高一级的金字塔拉取 256px 图像并在 128px 空间内渲染，呈现极佳细节
  tilePixelRatio: retinaPixelRatio,
  tileSize: 256 / retinaPixelRatio,
});

// 创建瓦片图层并挂载标准数据源
const layer = new TileLayer({
  source: source,
});

// 初始化地图实例
const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    // 将视图的缩放级别精准对齐到 Zoomify 切片金字塔提供的物理分辨率阶梯
    resolutions: layer.getSource().getTileGrid().getResolutions(),
    // 约束范围：将漫游限制在整幅图像有效像素外包盒内
    extent: extent,
    // 仅限制中心点不移出范围，允许图片边角移至屏幕视口边缘
    constrainOnlyCenter: true,
  }),
});
// 自动缩放自适应整个图像视野
map.getView().fit(extent);

// 监听高清模式切换下拉菜单
const control = document.getElementById('zoomifyProtocol');
control.addEventListener('change', function (event) {
  const value = event.currentTarget.value;
  if (value === 'zoomify') {
    layer.setSource(source);
  } else if (value === 'zoomifyretina') {
    layer.setSource(retinaSource);
  }
});
