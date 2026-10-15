import Map from '../src/ol/Map.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Fetch the TIFF file as a binary Blob
// 发起网络请求并将 TIFF 文件获取为二进制 Blob 对象
fetch('data/example.tif')
  .then((response) => response.blob())
  .then((blob) => {
    // Construct a GeoTIFF source from the in-memory Blob
    // 使用内存中的 Blob 对象构建 GeoTIFF 数据源
    const source = new GeoTIFF({
      sources: [
        {
          blob: blob,
        },
      ],
    });

    // Initialize the Map with WebGL Tile Layer and an asynchronously resolved view
    // 初始化地图实例，挂载 WebGL 瓦片图层并使用异步解析的视口配置
    const map = new Map({
      target: 'map',
      layers: [
        new TileLayer({
          source: source,
        }),
      ],
      // source.getView() returns a Promise resolving to View options based on TIFF metadata
      // source.getView() 返回一个 Promise，解析出与 TIFF 元数据相匹配的视图选项
      view: source.getView().then((viewConfig) => {
        // Constrain view to show the full extent
        // 约束视图以完整展示影像范围
        viewConfig.showFullExtent = true;
        return viewConfig;
      }),
    });
  });
