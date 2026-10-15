import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';
import {createXYZ} from '../src/ol/tilegrid.js';

const worker = self;

// Create 512x512 tile grid
// 创建 512×512 像素瓦片网格
const tileGrid = createXYZ({
  tileSize: [512, 512],
});

// Create offscreen canvas as headless map render target
// 创建离屏画布作为无头地图的渲染容器
const canvas = new OffscreenCanvas(512, 512);

// Initialize headless map inside worker
// 在 Worker 内部初始化无头地图
const map = new Map({
  target: canvas,
  layers: [
    new TileLayer({
      source: new OSM({
        // No need to fade in tiles in the worker
        // Worker 中单帧截取无需开启瓦片淡入过渡动画
        transition: 0,
      }),
    }),
  ],
});

// Handle render message from main thread
// 处理来自主线程的瓦片渲染消息
worker.addEventListener('message', async ({data: {action, tile}}) => {
  if (action !== 'render') {
    return;
  }
  // Set view centered on tile extent and resolution
  // 将视图定位到当前瓦片中心与对应层级分辨率
  const view = new View({
    center: tileGrid.getTileCoordCenter(tile),
    resolution: tileGrid.getResolution(tile[0]),
  });
  map.setView(view);

  // Capture rendered frame and transfer to ImageBitmap
  // 监听渲染完成事件，截取离屏帧并通过 ImageBitmap 零拷贝传回
  map.once('rendercomplete', () => {
    const imageData = canvas.transferToImageBitmap();
    worker.postMessage({action: 'rendered', imageData: imageData}, [imageData]);
  });
});
