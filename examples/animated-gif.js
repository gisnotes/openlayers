import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

// Create a point feature at [0, 0] (Null Island) to hold the animated GIF icon
// 创建一个位于坐标 [0, 0] 的点要素，用于挂载动态 GIF 图标
const iconFeature = new Feature({
  geometry: new Point([0, 0]),
});

// Create vector source and add the point feature
// 创建矢量数据源并加入该点要素
const vectorSource = new VectorSource({
  features: [iconFeature],
});

// Create vector layer to host the vector icon
// 创建矢量图层用于承载矢量图标
const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// Create raster tile layer using Stadia Maps (Stamen Toner monochrome style) as basemap
// 创建栅格瓦片底图图层，使用 Stadia Maps 的 Stamen Toner 黑白极简风格
const rasterLayer = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

// Initialize the map, mount to 'map' container, and configure center and zoom
// 初始化地图并挂载到 target 'map' DOM 容器，设置中心点与缩放级别
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// URL to the animated GIF asset
// 动态 GIF 动图资源的相对路径
const gifUrl = 'data/globe.gif';

// Initialize the Gifler decoder instance (global variable loaded via HTML resources)
// 初始化 Gifler GIF 解码器实例（注意：gifler 是通过 HTML resources 全局脚本引入的）
const gif = gifler(gifUrl);

// Decode and render each frame into an offscreen canvas
// 逐帧解码并绘制到一个离屏（内存中的）Canvas 画布上
gif.frames(
  document.createElement('canvas'),
  function (ctx, frame) {
    // Initialize the icon style only once on the first frame to avoid GC pressure
    // 仅在第一帧初始化要素样式，避免在动画播放循环中频繁创建 Style 实例造成内存垃圾回收压力
    if (!iconFeature.getStyle()) {
      iconFeature.setStyle(
        new Style({
          image: new Icon({
            img: ctx.canvas, // Use the offscreen canvas as the dynamic image source / 将离屏 Canvas 作为图标的数据源
            opacity: 0.8,
          }),
        }),
      );
    }
    // Clear previous frame and draw the new frame onto the offscreen canvas
    // 清除离屏画布上一帧的内容，并将新解码的帧绘制到画布指定位置
    ctx.clearRect(0, 0, frame.width, frame.height);
    ctx.drawImage(frame.buffer, frame.x, frame.y);

    // Request OpenLayers to re-render the map to reflect the new frame on screen
    // 请求 OpenLayers 重绘地图，将离屏 Canvas 的最新一帧同步更新到屏幕上
    map.render();
  },
  true, // Loop the animation continuously / 循环无限次播放动画
);

// Change mouse cursor to pointer when hovering over the icon feature
// 监听鼠标指针移动事件：当鼠标悬停在要素上方时切换光标为手型（pointer），离开时恢复默认
map.on('pointermove', function (e) {
  const hit = map.hasFeatureAtPixel(e.pixel);
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
