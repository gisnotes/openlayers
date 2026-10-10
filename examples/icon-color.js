import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OGCMapTile from '../src/ol/source/OGCMapTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Style from '../src/ol/style/Style.js';

// Create 5 point features for European capitals (converting [lon, lat] to EPSG:3857 via fromLonLat)
// 创建 5 个欧洲首都城市的点要素（使用 fromLonLat 将 WGS84 经纬度转换为默认的 EPSG:3857 墨卡托坐标）
const rome = new Feature({
  geometry: new Point(fromLonLat([12.5, 41.9])), // Rome / 罗马
});

const london = new Feature({
  geometry: new Point(fromLonLat([-0.12755, 51.507222])), // London / 伦敦
});

const madrid = new Feature({
  geometry: new Point(fromLonLat([-3.683333, 40.4])), // Madrid / 马德里
});
const paris = new Feature({
  geometry: new Point(fromLonLat([2.353, 48.8566])), // Paris / 巴黎
});
const berlin = new Feature({
  geometry: new Point(fromLonLat([13.3884, 52.5169])), // Berlin / 柏林
});

// 1. Rome: Tint white square.svg with hex color '#BADA55' (yellow-green)
// 1. 罗马：将纯白底图 square.svg 动态染成 '#BADA55'（黄绿色）
rome.setStyle(
  new Style({
    image: new Icon({
      color: '#BADA55',
      crossOrigin: 'anonymous', // Required for pixel manipulation when using CORS images / 像素级染色需开启跨域匿名声明
      src: 'data/square.svg',
    }),
  }),
);

// 2. London: Tint white bigdot.png with semi-transparent red 'rgba(255, 0, 0, .5)'
// 2. 伦敦：将纯白底图 bigdot.png 动态染成半透明红色（同时控制了颜色与 50% 透明度）
london.setStyle(
  new Style({
    image: new Icon({
      color: 'rgba(255, 0, 0, .5)',
      crossOrigin: 'anonymous',
      src: 'data/bigdot.png',
      scale: 0.2,
    }),
  }),
);

// 3. Madrid: Control group using the same bigdot.png WITHOUT 'color' (renders original white icon)
// 3. 马德里：对照组，使用同一张 bigdot.png 但不配置 color 属性（保持原图默认的纯白色外观）
madrid.setStyle(
  new Style({
    image: new Icon({
      crossOrigin: 'anonymous',
      src: 'data/bigdot.png',
      scale: 0.2,
    }),
  }),
);

// 4. Paris: Tint white dot.svg with purple '#8959A8'
// 4. 巴黎：将纯白底图 dot.svg 动态染成 '#8959A8'（紫罗兰色）
paris.setStyle(
  new Style({
    image: new Icon({
      color: '#8959A8',
      crossOrigin: 'anonymous',
      src: 'data/dot.svg',
    }),
  }),
);

// 5. Berlin: Control group using the same dot.svg WITHOUT 'color' (renders original white icon)
// 5. 柏林：对照组，使用同一张 dot.svg 但不配置 color 属性（保持原图默认的纯白色外观）
berlin.setStyle(
  new Style({
    image: new Icon({
      crossOrigin: 'anonymous',
      src: 'data/dot.svg',
    }),
  }),
);

// Create vector source and layer containing all 5 city features
// 创建包含上述 5 个城市要素的矢量数据源与矢量图层
const vectorSource = new VectorSource({
  features: [rome, london, madrid, paris, berlin],
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

// Create OGC Map Tile raster basemap layer
// 创建基于 OGC API - Tiles 规范的 NaturalEarth 自然地貌栅格底图
const rasterLayer = new TileLayer({
  source: new OGCMapTile({
    url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
    crossOrigin: '',
  }),
});

// Initialize map centered over Western Europe
// 初始化地图并将视野中心定位在西欧上空
const map = new Map({
  layers: [rasterLayer, vectorLayer],
  target: document.getElementById('map'),
  view: new View({
    center: fromLonLat([2.896372, 44.6024]),
    zoom: 3,
  }),
});
