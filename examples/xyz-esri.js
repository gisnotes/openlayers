import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Layer from '../src/ol/layer/WebGLTile.js';
import {useGeographic} from '../src/ol/proj.js';
import Source from '../src/ol/source/ImageTile.js';

// Enable geographic coordinates (longitude/latitude) across all APIs
// 全局启用地理坐标（经纬度 [lon, lat]）模式，简化中心点配置
useGeographic();

// Initialize map with WebGLTile accelerated ArcGIS cached topographic layer
// 初始化地图实例：采用 WebGLTile 硬件加速图层加载 Esri ArcGIS 预切片地形底图
const map = new Map({
  target: 'map',
  layers: [
    new Layer({
      source: new Source({
        attributions:
          'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
          'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
        // Standard ArcGIS REST cached tile URL template: /tile/{z}/{y}/{x}
        // 标准 ArcGIS REST 静态缓存切片 URL 寻址模板：/tile/{z}/{y}/{x}
        url:
          'https://server.arcgisonline.com/ArcGIS/rest/services/' +
          'World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      }),
    }),
  ],
  view: new View({
    // Geographic center [longitude, latitude] near Cascade Mountains, WA
    // 经纬度地理中心点：位于美国华盛顿州喀斯喀特山脉附近
    center: [-121.1, 47.5],
    zoom: 7,
  }),
});
