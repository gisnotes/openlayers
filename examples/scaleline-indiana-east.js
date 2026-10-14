import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat, transformExtent} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import OSM from '../src/ol/source/OSM.js';

// 向 Proj4js 注册美国北美 1983 大地基准印第安纳州东区投影坐标系 (NAD83 Indiana East)
// 投影特性：
// - 椭球体：GRS 1980
// - 投影类型：横轴墨卡托 (Transverse Mercator)
// - 中央子午线：-85°40' (-85.666667°)
// - 原点纬度：37°30' (37.5°)
// - 长度单位：美国测量英尺 (Foot_US，1 英尺 ≈ 0.3048006 米)
proj4.defs(
  'Indiana-East',
  'PROJCS["IN83-EF",GEOGCS["LL83",DATUM["NAD83",' +
    'SPHEROID["GRS1980",6378137.000,298.25722210]],PRIMEM["Greenwich",0],' +
    'UNIT["Degree",0.017453292519943295]],PROJECTION["Transverse_Mercator"],' +
    'PARAMETER["false_easting",328083.333],' +
    'PARAMETER["false_northing",820208.333],' +
    'PARAMETER["scale_factor",0.999966666667],' +
    'PARAMETER["central_meridian",-85.66666666666670],' +
    'PARAMETER["latitude_of_origin",37.50000000000000],' +
    'UNIT["Foot_US",0.30480060960122]]',
);
// 将 Proj4js 投影定义同步注册到 OpenLayers 投影表
register(proj4);

// 初始化地图实例
const map = new Map({
  layers: [
    // 基础 OSM 瓦片图层（原生投影为 EPSG:3857 Web 墨卡托，米制单位）
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    // 将视图设置为刚注册的 Indiana-East 投影（美国测量英尺单位）
    projection: 'Indiana-East',
    // 将经纬度点 [-85.685°W, 39.891°N]（印第安纳州首府印第安纳波利斯以东）转换为目标投影平面英尺坐标
    center: fromLonLat([-85.685, 39.891], 'Indiana-East'),
    zoom: 7,
    // 限制视图有效平移漫游范围，防止超出横轴墨卡托投影的定义域产生数学奇异
    extent: transformExtent(
      [-172.54, 23.81, -47.74, 86.46],
      'EPSG:4326',
      'Indiana-East',
    ),
    minZoom: 6,
  }),
});

// 添加比例尺控件，并配置美制单位（units: 'us'，自动显示英里 miles 或英尺 ft）
map.addControl(new ScaleLine({units: 'us'}));
