import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import {createEmpty, extend, getCenter} from '../src/ol/extent.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {transformExtent} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

// Register two adjacent UTM projection coordinate systems with Proj4js:
// 向 Proj4js 注册两个相邻的 UTM 投影坐标系：
// EPSG:32631 (WGS 84 / UTM zone 31N, central meridian 3°E)
// EPSG:32632 (WGS 84 / UTM zone 32N, central meridian 9°E)
proj4.defs('EPSG:32631', '+proj=utm +zone=31 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:32632', '+proj=utm +zone=32 +datum=WGS84 +units=m +no_defs');
register(proj4);

// RGB channel selector identifiers / RGB 通道选择器标识列表
const channels = ['red', 'green', 'blue'];
for (const channel of channels) {
  const selector = document.getElementById(channel);
  selector.addEventListener('change', update);
}

/**
 * Get current band mappings from dropdown selectors
 * 读取当前下拉框所选取的波段通道映射变量
 * @return {Object<string, number>} Variables object containing band index for red, green, and blue / 包含 red、green、blue 对应波段索引的对象
 */
function getVariables() {
  const variables = {};
  for (const channel of channels) {
    const selector = document.getElementById(channel);
    variables[channel] = parseInt(selector.value, 10);
  }
  return variables;
}

// Sentinel-2 L2A band names / 哨兵 2 号（Sentinel-2 L2A）单波段文件名：
// B04: Red (665nm, 10m) / 红光
// B03: Green (560nm, 10m) / 绿光
// B02: Blue (490nm, 10m) / 蓝光
// B08: Near Infrared (842nm, 10m) / 近红外
const sourceNames = ['B04', 'B03', 'B02', 'B08'];

// Create two adjacent COG sources:
// 创建两个相邻分区的 COG 数据源：
// Source 1: Located in UTM 31N zone (tile id: 31TGJ) / 第 1 个数据源：位于 UTM 31N 分带
// Source 2: Located in UTM 32N zone (tile id: 32TLP) / 第 2 个数据源：位于 UTM 32N 分带
const sources = [
  new GeoTIFF({
    sources: sourceNames.map(function (name) {
      return {
        url: `https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/31/T/GJ/2022/7/S2A_31TGJ_20220703_0_L2A/${name}.tif`,
        max: 3000,
      };
    }),
  }),
  new GeoTIFF({
    sources: sourceNames.map(function (name) {
      return {
        url: `https://sentinel-cogs.s3.us-west-2.amazonaws.com/sentinel-s2-l2a-cogs/32/T/LP/2022/7/S2A_32TLP_20220703_0_L2A/${name}.tif`,
        max: 3000,
      };
    }),
  }),
];

// Create WebGL tile layer:
// 1. sources: mounts two COG sources from different zones, WebGL renderer reprojects and merges them seamlessly
// 2. style: dynamic WebGL expression mapping RGB channels to band variables, band 5 is alpha mask
// 创建 WebGL 瓦片图层：
// 1. sources: 同时挂载两个不同分区的 COG 数据源，WebGL 渲染器会自动分别重采样并无缝拼合；
// 2. style: 使用 WebGL 动态表达式，将红绿蓝三通道映射到对应的波段索引变量，波段 5 为 Alpha 透明度掩模。
const layer = new TileLayer({
  sources: sources,
  style: {
    variables: getVariables(),
    color: [
      'array',
      ['band', ['var', 'red']],
      ['band', ['var', 'green']],
      ['band', ['var', 'blue']],
      ['band', 5],
    ],
  },
});

/**
 * Update style variables when dropdown selection changes to trigger real-time GPU redraw
 * 当用户更改波段选择时，更新 WebGL 图层样式变量，触发 GPU 实时重绘
 */
function update() {
  layer.updateStyleVariables(getVariables());
}

// Initialize map instance / 初始化地图实例
const map = new Map({
  target: 'map',
  layers: [layer],
  // Asynchronously merge bounding boxes of both sources and initialize view
  // 异步合并两个数据源的包围盒范围并初始化视图
  view: Promise.all(
    sources.map(function (source) {
      return source.getView();
    }),
  ).then(function (options) {
    const projection = 'EPSG:3857';
    const extent = createEmpty();
    for (let i = 0; i < options.length; ++i) {
      extend(
        extent,
        transformExtent(options[i].extent, options[i].projection, projection),
      );
    }
    return {
      projection: projection,
      center: getCenter(extent),
      zoom: 0,
      extent: extent,
    };
  }),
});
