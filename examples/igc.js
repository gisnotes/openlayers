import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import IGC from '../src/ol/format/IGC.js';
import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {getVectorContext} from '../src/ol/render.js';
import OSM, {ATTRIBUTION} from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Distinct line colors assigned to each paraglider pilot
// 为每位滑翔伞飞行员分配的专属半透明轨迹线条颜色
const colors = {
  'Clement Latour': 'rgba(0, 0, 255, 0.7)',
  'Damien de Baesnt': 'rgba(0, 215, 255, 0.7)',
  'Sylvain Dhonneur': 'rgba(0, 165, 255, 0.7)',
  'Tom Payne': 'rgba(0, 255, 255, 0.7)',
  'Ulrich Prinz': 'rgba(0, 215, 255, 0.7)',
};

// Style cache to ensure track styles are reused as singletons
// 样式单例缓存字典，避免近 5 万个顶点重复创建 Style 实例造成内存抖动
const styleCache = {};
const styleFunction = function (feature) {
  const color = colors[feature.get('PLT')];
  let style = styleCache[color];
  if (!style) {
    style = new Style({
      stroke: new Stroke({
        color: color,
        width: 3,
      }),
    });
    styleCache[color] = style;
  }
  return style;
};

// Vector source for paraglider track features
// 存储所有滑翔伞飞行轨迹要素的矢量数据源
const vectorSource = new VectorSource();

// IGC flight recording files for five pilots
// 5 位飞行员同一天的 IGC 航迹原始数据文件列表
const igcUrls = [
  'data/igc/Clement-Latour.igc',
  'data/igc/Damien-de-Baenst.igc',
  'data/igc/Sylvain-Dhonneur.igc',
  'data/igc/Tom-Payne.igc',
  'data/igc/Ulrich-Prinz.igc',
];

// Helper function to fetch text data via XMLHttpRequest
// 辅助函数：通过原生 XMLHttpRequest 异步拉取纯文本文件
function get(url, callback) {
  const client = new XMLHttpRequest();
  client.open('GET', url);
  client.onload = function () {
    callback(client.responseText);
  };
  client.send();
}

// Parse IGC flight tracks and add features into the vector source
// 实例化 IGC 格式解析器，将三维经纬度+时间戳文本解析为 Web 墨卡托要素
const igcFormat = new IGC();
for (let i = 0; i < igcUrls.length; ++i) {
  get(igcUrls[i], function (data) {
    const features = igcFormat.readFeatures(data, {
      featureProjection: 'EPSG:3857',
    });
    vectorSource.addFeatures(features);
  });
}

// Object tracking global start time, stop time, and total flight duration (in seconds)
// 全局时空状态对象：记录所有航线中最早起飞时刻、最晚降落时刻与总时间跨度
const time = {
  start: Infinity,
  stop: -Infinity,
  duration: 0,
};

// Update global time bounds on every feature added
// 监听要素添加事件，从坐标第三维度 (M) 动态提取起止时间戳
vectorSource.on('addfeature', function (event) {
  const geometry = event.feature.getGeometry();
  time.start = Math.min(time.start, geometry.getFirstCoordinate()[2]);
  time.stop = Math.max(time.stop, geometry.getLastCoordinate()[2]);
  time.duration = time.stop - time.start;
});

// Vector layer applying the pilot style function
// 绑定飞行员轨迹样式函数的矢量图层
const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM({
        attributions: [
          'All maps © <a href="https://www.opencyclemap.org/">OpenCycleMap</a>',
          ATTRIBUTION,
        ],
        url:
          'https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png' +
          '?apikey=0e6fc415256d4fbb9b5166a718591d71',
      }),
    }),
    vectorLayer,
  ],
  target: 'map',
  view: new View({
    center: [703365.7089403362, 5714629.865071137],
    zoom: 9,
  }),
});

// Geometric elements for closest point and snap connector line
// 用于表示最近垂足点和吸附连线的动态几何对象
let point = null;
let line = null;

// Find closest feature and calculate orthogonal projection point on track
// 计算离鼠标最近的飞行轨迹，并求取线段上的空间正交垂足点与经过时刻
const displaySnap = function (coordinate) {
  const closestFeature = vectorSource.getClosestFeatureToCoordinate(coordinate);
  const info = document.getElementById('info');
  if (closestFeature === null) {
    point = null;
    line = null;
    info.innerHTML = '&nbsp;';
  } else {
    const geometry = closestFeature.getGeometry();
    const closestPoint = geometry.getClosestPoint(coordinate);
    if (point === null) {
      point = new Point(closestPoint);
    } else {
      point.setCoordinates(closestPoint);
    }
    // Extract timestamp from the 3rd coordinate dimension (M) and format as UTC date
    // 从坐标第三维度 (M) 提取经过秒数并转换为格式化的 UTC 时间文本
    const date = new Date(closestPoint[2] * 1000);
    info.innerHTML =
      closestFeature.get('PLT') + ' (' + date.toUTCString() + ')';
    const coordinates = [coordinate, [closestPoint[0], closestPoint[1]]];
    if (line === null) {
      line = new LineString(coordinates);
    } else {
      line.setCoordinates(coordinates);
    }
  }
  map.render();
};

// Pointermove listener for continuous snap line updating
// 鼠标悬停漫游事件：动态更新吸附垂足与引导线
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const coordinate = map.getEventCoordinate(evt.originalEvent);
  displaySnap(coordinate);
});

// Click event listener
// 点击事件：吸附至点击坐标
map.on('click', function (evt) {
  displaySnap(evt.coordinate);
});

// Style for the temporary snap target and dashed connector line
// 临时吸附引导线与垂足靶心的红色样式
const stroke = new Stroke({
  color: 'rgba(255,0,0,0.9)',
  width: 1,
});
const style = new Style({
  stroke: stroke,
  image: new CircleStyle({
    radius: 5,
    fill: null,
    stroke: stroke,
  }),
});

// Immediate rendering on vector layer postrender: draws snap point and line directly onto canvas
// 在矢量图层 postrender 周期中利用 VectorContext 即时绘制吸附图形，避免频繁修改数据源
vectorLayer.on('postrender', function (evt) {
  const vectorContext = getVectorContext(evt);
  vectorContext.setStyle(style);
  if (point !== null) {
    vectorContext.drawGeometry(point);
  }
  if (line !== null) {
    vectorContext.drawGeometry(line);
  }
});

// Unmanaged overlay layer for time-scrubbed glider position markers
// 用于展示时间滑块拖拽时各滑翔伞当前位置标记的浮层
const featureOverlay = new VectorLayer({
  source: new VectorSource(),
  map: map,
  style: new Style({
    image: new CircleStyle({
      radius: 5,
      fill: new Fill({
        color: 'rgba(255,0,0,0.9)',
      }),
    }),
  }),
});

// Time slider control: interpolate paraglider coordinates along 4D tracks using getCoordinateAtM
// 时间轴滑块控制：通过 getCoordinateAtM 在四维时空航迹上高效二分插值计算各滑翔伞位置
const control = document.getElementById('time');
control.addEventListener('input', function () {
  const value = parseInt(control.value, 10) / 100;
  const m = time.start + time.duration * value;
  vectorSource.forEachFeature(function (feature) {
    const geometry =
      /** @type {import('../src/ol/geom/LineString.js').default} */ (
        feature.getGeometry()
      );
    // Interpolate coordinate at time M
    // 依据时刻 M 插值计算当前经纬度坐标
    const coordinate = geometry.getCoordinateAtM(m, true);
    let highlight = feature.get('highlight');
    if (highlight === undefined) {
      highlight = new Feature(new Point(coordinate));
      feature.set('highlight', highlight);
      featureOverlay.getSource().addFeature(highlight);
    } else {
      highlight.getGeometry().setCoordinates(coordinate);
    }
  });
  map.render();
});
