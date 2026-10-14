import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {applyTransform} from '../src/ol/extent.js';
import Graticule from '../src/ol/layer/Graticule.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {get as getProjection, getTransform} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import OSM from '../src/ol/source/OSM.js';
import TileDebug from '../src/ol/source/TileDebug.js';
import Stroke from '../src/ol/style/Stroke.js';

// MapTiler 访问密钥（本示例专用公用演示 key）
const key = 'EPhPi7Zr1GTS500UybLu';

// 基础 OSM 数据源（原始投影为 EPSG:3857 Web 墨卡托）
const osmSource = new OSM();

// 瓦片调试网格图层：用于直观观察原始 EPSG:3857 瓦片的请求编号与网格边界
const debugLayer = new TileLayer({
  source: new TileDebug({
    tileGrid: osmSource.getTileGrid(),
    projection: osmSource.getProjection(),
  }),
  visible: false,
});

// 经纬网（Graticule）图层：在当前投影坐标系下动态绘制等经纬线及度数标签
const graticule = new Graticule({
  // 经纬网线条样式配置
  strokeStyle: new Stroke({
    color: 'rgba(255,120,0,0.9)',
    width: 2,
    lineDash: [0.5, 4],
  }),
  showLabels: true,
  visible: false,
  wrapX: false,
});

// 初始化地图实例
const map = new Map({
  layers: [
    new TileLayer({
      source: osmSource,
    }),
    debugLayer,
    graticule,
  ],
  target: 'map',
  view: new View({
    projection: 'EPSG:3857',
    center: [0, 0],
    zoom: 1,
  }),
});

// DOM UI 元素引用
const queryInput = document.getElementById('epsg-query');
const searchButton = document.getElementById('epsg-search');
const resultSpan = document.getElementById('epsg-result');
const renderEdgesCheckbox = document.getElementById('render-edges');
const showTilesCheckbox = document.getElementById('show-tiles');
const showGraticuleCheckbox = document.getElementById('show-graticule');

/**
 * 动态配置并切换地图的目标投影
 * @param {string|null} code 投影代号 (例如 'EPSG:27700')
 * @param {string|null} name 投影名称 (例如 'OSGB36 / British National Grid')
 * @param {string|null} proj4def WKT 格式或 Proj4 格式的坐标系定义字符串
 * @param {Array<number>|null} bbox 经纬度地理范围 [minLon, minLat, maxLon, maxLat]
 */
function setProjection(code, name, proj4def, bbox) {
  if (code === null || name === null || proj4def === null || bbox === null) {
    resultSpan.innerHTML = '未检索到有效坐标系定义，恢复使用 EPSG:3857...';
    map.setView(
      new View({
        projection: 'EPSG:3857',
        center: [0, 0],
        zoom: 1,
      }),
    );
    return;
  }

  resultSpan.innerHTML = '(' + code + ') ' + name;

  // 1. 将检索到的投影定义注入 proj4
  proj4.defs(code, proj4def);
  // 2. 注册并同步至 OpenLayers 投影表
  register(proj4);
  const newProj = getProjection(code);
  // 3. 构建经纬度 (EPSG:4326) 至新投影的正算转换函数
  const fromLonLat = getTransform('EPSG:4326', newProj);

  // 设置该投影在 WGS84 经纬度体系下的全球有效范围
  newProj.setWorldExtent(bbox);

  // 估算目标投影下的平面外接矩形范围（Extent）；
  // 检查有效范围是否跨越国际日界线（180°经线），若跨越则对最大经度做 +360° 补偿
  if (bbox[0] > bbox[2]) {
    bbox[2] += 360;
  }
  // 关键参数：第四个参数 8 表示在每条边上密集插入 8 个采样点。
  // 因为经纬度矩形经过非线性投影转换后通常会变为弯曲弧形，
  // 必须通过密集插值采样计算目标投影下的精准外接矩形范围。
  const extent = applyTransform(bbox, fromLonLat, undefined, 8);
  newProj.setExtent(extent);

  // 4. 重设 View，触发客户端栅格重投影引擎自动重绘
  const newView = new View({
    projection: newProj,
  });
  map.setView(newView);
  newView.fit(extent);
}

/**
 * 请求 MapTiler Cloud Coordinates API 检索坐标系定义
 * @param {string} query 用户输入的查询关键词
 */
function search(query) {
  resultSpan.innerHTML = '正在检索坐标系 ...';
  fetch(
    `https://api.maptiler.com/coordinates/search/${query}.json?exports=true&key=${key}`,
  )
    .then(function (response) {
      return response.json();
    })
    .then(function (json) {
      const results = json['results'];
      if (results && results.length > 0) {
        for (let i = 0, ii = results.length; i < ii; i++) {
          const result = results[i];
          if (result) {
            const id = result['id'];
            const code = id['authority'] + ':' + id['code'];
            const name = result['name'];
            const proj4def = result['exports']['wkt'];
            const bbox = result['bbox'];
            if (
              code &&
              code.length > 0 &&
              proj4def &&
              proj4def.length > 0 &&
              bbox &&
              bbox.length == 4
            ) {
              setProjection(code, name, proj4def, bbox);
              return;
            }
          }
        }
      }
      setProjection(null, null, null, null);
    });
}

/**
 * 处理搜索按钮点击事件
 * @param {Event} event 事件对象
 */
searchButton.onclick = function (event) {
  search(queryInput.value);
  event.preventDefault();
};

/**
 * 处理调试选项的勾选切换事件
 */
function onReprojectionChange() {
  // 开启/关闭重投影自适应三角网边缘绘制
  osmSource.setRenderReprojectionEdges(renderEdgesCheckbox.checked);
}
function onGraticuleChange() {
  // 切换经纬网图层的显示/隐藏
  graticule.setVisible(showGraticuleCheckbox.checked);
}
function onTilesChange() {
  // 切换瓦片坐标调试图层的显示/隐藏
  debugLayer.setVisible(showTilesCheckbox.checked);
}
showGraticuleCheckbox.addEventListener('change', onGraticuleChange);
renderEdgesCheckbox.addEventListener('change', onReprojectionChange);
showTilesCheckbox.addEventListener('change', onTilesChange);

// 初始化各控件状态
onReprojectionChange();
onGraticuleChange();
onTilesChange();
