import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import ImageTileSource from '../src/ol/source/ImageTile.js';

// Initialize Web Worker for offscreen tile rendering
// 初始化用于离屏瓦片渲染的 Web Worker
const worker = new Worker(
  new URL(
    './tiled-layer-rendering-in-offscreen-canvas.worker.js',
    import.meta.url,
  ),
  {type: 'module'},
);

const tileQueue = [];

// Initialize map with custom tile loader delegated to worker
// 初始化地图，使用委托给 Worker 的自定义瓦片加载器
new Map({
  layers: [
    new TileLayer({
      source: new ImageTileSource({
        tileSize: 512,
        loader: (z, x, y) => {
          return new Promise((resolve) => {
            const loadTile = () => {
              const handleMessage = ({data: {action, imageData}}) => {
                if (action !== 'rendered') {
                  return;
                }
                worker.removeEventListener('message', handleMessage);
                resolve(imageData);
                tileQueue.shift();
                const loadNextTile = tileQueue[0];
                loadNextTile?.();
              };
              worker.addEventListener('message', handleMessage);
              worker.postMessage({action: 'render', tile: [z, x, y]});
            };
            if (tileQueue.length === 0) {
              loadTile();
            }
            tileQueue.push(loadTile);
          });
        },
        attributions: [
          '<a href="https://www.openstreetmap.org/copyright" target="_blank">© OpenStreetMap contributors</a>',
        ],
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
