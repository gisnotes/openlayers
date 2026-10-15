import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
} from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Remote COG file URL (Sentinel-2 L2A true color image)
// 远程云优化 GeoTIFF 文件地址（Sentinel-2 哨兵 2 号 L2A 级真彩色影像）
const dataUrl =
  'https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/36/Q/WD/2020/7/S2A_36QWD_20200701_0_L2A/TCI.tif';

const source = new GeoTIFF({
  sources: [
    {
      url: dataUrl,
      // Use a custom loader function to control how data is fetched.
      // The function receives the URL, request headers, and an abort signal.
      // 使用自定义 loader 函数精确控制数据的拉取过程。
      // 该函数接收请求 URL、默认请求头（含 Range 头）以及请求中止信号。
      loader: (url, headers, abortSignal) => {
        // Add custom headers (e.g., authentication tokens or tracking IDs)
        // 注入自定义请求头（例如认证 Token 或业务追踪标识）
        const customHeaders = {
          ...headers,
          // Example / 示例: 'Authorization': 'Bearer your-token-here',
        };

        // Optionally add custom logic (logging, retry logic, caching, etc.)
        // 可选扩展业务逻辑（如访问审计日志、网络重试策略、前端本地缓存等）

        // Return the native fetch Response promise
        // 返回原生 fetch 请求的 Promise（传递自定义头与中止信号）
        return fetch(url, {
          headers: customHeaders,
          signal: abortSignal,
        });
      },
    },
  ],
});

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: source,
    }),
  ],
  view: getView(source, withHigherResolutions(1), withExtentCenter()),
});
