import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import Draw from '../src/ol/interaction/Draw.js';
import Modify from '../src/ol/interaction/Modify.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import {getArea, getLength} from '../src/ol/sphere.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import RegularShape from '../src/ol/style/RegularShape.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// 获取页面表单控件：测量几何类型下拉框、是否显示分段长度复选框、是否清除上次测量复选框
const typeSelect = document.getElementById('type');
const showSegments = document.getElementById('segments');
const clearPrevious = document.getElementById('clear');

/**
 * 1. 基础几何图形样式（用于渲染被测量的折线、多边形以及绘制时的光标圆点）
 */
const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.5)',
    lineDash: [10, 10], // 10px 实线 + 10px 空白的虚线描边
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

/**
 * 2. 总测量结果（总长度 / 总面积）的主气泡标签样式
 * 巧妙地利用 Text（带黑底背景框，向上偏移 15px）+ RegularShape（旋转 180° 的倒正三角形，向上位移 10px）
 * 在纯 Canvas 中拼合成带底部指示尖角的气泡标签（Callout Bubble）
 */
const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3, // 正三角形
    angle: Math.PI, // 旋转 180°，使三角形尖角朝下指向锚点
    displacement: [0, 10], // 向上平移 10px，与上方 Text 背景框底部无缝衔接
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

/**
 * 3. 绘制过程中的鼠标跟随操作提示样式（如“Click to start measuring”）
 */
const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15, // 在光标右侧 15px 处显示提示文字
  }),
});

/**
 * 4. 顶点编辑（Modify 交互）时的捕捉点与操作提示样式（“Drag to modify”）
 */
const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: 'Drag to modify',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

/**
 * 5. 每一条线段（或边）中点处的分段长度小气泡标签样式模板
 */
const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

// 分段长度样式对象池：避免在每帧重绘时重复 new Style() 造成垃圾回收抖动
const segmentStyles = [segmentStyle];

/**
 * 计算并格式化折线的球面大圆距离（使用 ol/sphere 的 getLength）
 * @param {LineString} line 折线几何对象
 * @return {string} 格式化后的长度字符串（m 或 km）
 */
const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

/**
 * 计算并格式化多边形的球面真实面积（使用 ol/sphere 的 getArea）
 * @param {import("../src/ol/geom/Polygon.js").default} polygon 多边形几何对象
 * @return {string} 格式化后的面积字符串（m² 或 km²）
 */
const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

// 底图图层（OSM）
const raster = new TileLayer({
  source: new OSM(),
});

// 存放已完成测量的矢量要素源
const source = new VectorSource();

// 创建 Modify 交互，允许用户随时拖拽已绘制测量图形的顶点或边，实时重算测量值
const modify = new Modify({source: source, style: modifyStyle});

// 记录绘制结束瞬间光标所在的 Point 几何，用于平滑交接 Modify 提示框位置
let tipPoint;

/**
 * 核心动态样式函数（同时服务于已完成的 VectorLayer 和正在绘制的 Draw 交互草图图层）
 * @param {import("../src/ol/Feature.js").FeatureLike} feature 当前渲染的要素
 * @param {boolean} segments 是否显示每条线段的分段长度
 * @param {string} [drawType] 当前正在绘制的几何类型（仅在 Draw 样式回调中传入）
 * @param {string} [tip] 当前鼠标跟随提示文本（仅在 Draw 样式回调中传入）
 * @return {Array<Style>} 叠加渲染的样式数组
 */
function styleFunction(feature, segments, drawType, tip) {
  const styles = [];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type || type === 'Point') {
    styles.push(style);
    if (type === 'Polygon') {
      // 多边形：总面积气泡锚定在内部代表点（Interior Point），并提取外环作为折线用于分段测距
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      // 折线：总长度气泡锚定在最后一个顶点，自身直接用于分段测距
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  // 若勾选了“显示分段长度”，遍历每条线段并在其中点（0.5 处）添加分段长度小气泡
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      // 样式对象池容量不足时，通过 clone() 扩容
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.5));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  // 添加总长度 / 总面积主气泡样式
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  // 添加鼠标跟随提示：仅在当前要素是光标点（Point）且 Modify 交互未吸附到任何已有顶点时才显示，避免两个提示框重叠
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

// 承载已完成测量图形的矢量图层
const vector = new VectorLayer({
  source: source,
  style: function (feature) {
    return styleFunction(feature, showSegments.checked);
  },
});

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 15,
  }),
});

map.addInteraction(modify);

let draw; // global so we can remove it later（保存当前 Draw 交互实例的全局引用，以便切换测量类型时移除重建）

function addInteraction() {
  const drawType = typeSelect.value;
  const activeTip =
    'Click to continue drawing the ' +
    (drawType === 'Polygon' ? 'polygon' : 'line');
  const idleTip = 'Click to start measuring';
  let tip = idleTip;
  draw = new Draw({
    source: source,
    type: drawType,
    style: function (feature) {
      return styleFunction(feature, showSegments.checked, drawType, tip);
    },
  });
  draw.on('drawstart', function () {
    if (clearPrevious.checked) {
      source.clear();
    }
    // 绘制过程中暂时禁用 Modify 交互，防止误触已有顶点拖拽
    modify.setActive(false);
    tip = activeTip;
  });
  draw.on('drawend', function () {
    // 绘制完成瞬间，将 Modify 提示框暂时固定在结束点，并重新启用 Modify 交互
    modifyStyle.setGeometry(tipPoint);
    modify.setActive(true);
    // 下一次鼠标移动时解除固定几何，恢复 Modify 默认的捕捉点跟随行为
    map.once('pointermove', function () {
      modifyStyle.setGeometry(null);
    });
    tip = idleTip;
  });
  modify.setActive(true);
  map.addInteraction(draw);
}

// 切换测量类型（长度 LineString / 面积 Polygon）时重建 Draw 交互
typeSelect.onchange = function () {
  map.removeInteraction(draw);
  addInteraction();
};

addInteraction();

// 切换“显示分段长度”复选框时，立即触发已完成矢量图层和正在绘制的草图图层重绘
showSegments.onchange = function () {
  vector.changed();
  draw.getOverlay().changed();
};
