import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {createEmpty, extend, getHeight, getWidth} from '../src/ol/extent.js';
import KML from '../src/ol/format/KML.js';
import Select from '../src/ol/interaction/Select.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import Cluster from '../src/ol/source/Cluster.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import RegularShape from '../src/ol/style/RegularShape.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// 1. 预定义复用的基础填充与描边样式实例（避免在渲染循环中重复创建）
// 单个地震五角星的橙色半透明填充与浅黄描边
const earthquakeFill = new Fill({
  color: 'rgba(255, 153, 0, 0.8)',
});
const earthquakeStroke = new Stroke({
  color: 'rgba(255, 204, 0, 0.2)',
  width: 1,
});
// 聚合圆圈中心数字的白色填充与深黑半透明外发光描边
const textFill = new Fill({
  color: '#fff',
});
const textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3,
});
// 悬停/选中聚合点时的隐形垫底填充（alpha=0.01 肉眼不可见，但可保持整个聚合圆区域的鼠标碰撞热区不丢失）
const invisibleFill = new Fill({
  color: 'rgba(255, 255, 255, 0.01)',
});

/**
 * 为单个原始地震要素创建五角星样式（外接圆半径随震级线性放大）
 * @param {import("../src/ol/Feature.js").default} feature 单个原始地震要素
 * @return {Style} 五角星样式
 */
function createEarthquakeStyle(feature) {
  // 2012_Earthquakes_Mag5.kml stores the magnitude of each earthquake in a
  // standards-violating <magnitude> tag in each Placemark.  We extract it
  // from the Placemark's name instead.
  // 2012_Earthquakes_Mag5.kml 将每次地震的震级保存在了不符合 KML 标准的 <magnitude> 标签中，
  // 因此我们改为直接从 Placemark 的 name 属性（例如 "M 5.8 - ..."）中截取解析震级数值。
  const name = feature.get('name');
  const magnitude = parseFloat(name.substr(2));
  // 震级 M5.0 对应基础半径 5px，每增加 1 级半径增加 20px
  const radius = 5 + 20 * (magnitude - 5);

  return new Style({
    // 关键：显式绑定原始地震点的真实几何坐标，这样即使在聚合要素（Cluster）的选中样式中调用，也能画在真实的震中位置上
    geometry: feature.getGeometry(),
    image: new RegularShape({
      radius: radius,
      radius2: 3, // 内顶点半径固定为 3px，配合 points: 5 形成尖锐的五角星
      points: 5,
      angle: Math.PI,
      fill: earthquakeFill,
      stroke: earthquakeStroke,
    }),
  });
}

let maxFeatureCount;
let vector = null;

/**
 * 在当前分辨率下遍历所有聚合要素，计算：
 * 1. 全局最大子要素数量 maxFeatureCount（用于归一化计算圆圈透明度）
 * 2. 每个聚合包内部所有原始点位的地理包围盒跨度，并换算为屏幕像素半径缓存到 feature.set('radius', radius)
 * @param {number} resolution 当前地图视图分辨率（地图单位/像素）
 */
const calculateClusterInfo = function (resolution) {
  maxFeatureCount = 0;
  const features = vector.getSource().getFeatures();
  let feature, radius;
  for (let i = features.length - 1; i >= 0; --i) {
    feature = features[i];
    const originalFeatures = feature.get('features');
    const extent = createEmpty();
    let j, jj;
    for (j = 0, jj = originalFeatures.length; j < jj; ++j) {
      extend(extent, originalFeatures[j].getGeometry().getExtent());
    }
    maxFeatureCount = Math.max(maxFeatureCount, jj);
    // 将子要素包围盒的（宽 + 高）乘以 0.25（即平均边长的一半），再除以分辨率换算为屏幕像素半径
    radius = (0.25 * (getWidth(extent) + getHeight(extent))) / resolution;
    feature.set('radius', radius);
  }
};

let currentResolution;

/**
 * 聚合矢量图层的默认样式函数
 * @param {import("../src/ol/Feature.js").FeatureLike} feature 聚合要素
 * @param {number} resolution 当前视图分辨率
 * @return {Style} 渲染样式
 */
function styleFunction(feature, resolution) {
  // 仅当缩放级别（分辨率）发生变化时才重新统计所有聚合点的半径和最大数量
  if (resolution != currentResolution) {
    calculateClusterInfo(resolution);
    currentResolution = resolution;
  }
  let style;
  const size = feature.get('features').length;
  if (size > 1) {
    // 聚合包内包含多个地震点：渲染为橙色圆圈（半径代表地理分布跨度，透明度代表点位密集程度）+ 中心数字
    style = new Style({
      image: new CircleStyle({
        radius: feature.get('radius'),
        fill: new Fill({
          color: [255, 153, 0, Math.min(0.8, 0.4 + size / maxFeatureCount)],
        }),
      }),
      text: new Text({
        text: size.toString(),
        fill: textFill,
        stroke: textStroke,
      }),
    });
  } else {
    // 聚合包内只有 1 个地震点：直接渲染为代表该地震震级的五角星
    const originalFeature = feature.get('features')[0];
    style = createEarthquakeStyle(originalFeature);
  }
  return style;
}

/**
 * 鼠标悬停或点击选中聚合要素时的动态散开样式函数
 * @param {import("../src/ol/Feature.js").FeatureLike} feature 被选中的聚合要素
 * @return {Array<Style>} 包含隐形碰撞热区圆与所有底层原始地震五角星的样式数组
 */
function selectStyleFunction(feature) {
  const styles = [
    // 第 1 层：绘制一个与原聚合圆同半径、透明度 0.01 的隐形圆，防止鼠标移入五角星之间的缝隙时丢失 pointermove 选中状态导致闪烁
    new Style({
      image: new CircleStyle({
        radius: feature.get('radius'),
        fill: invisibleFill,
      }),
    }),
  ];
  // 第 2 层：遍历聚合包内的所有原始地震要素，利用 Style.geometry 将每颗五角星绘制在各自的真实震中坐标上
  const originalFeatures = feature.get('features');
  let originalFeature;
  for (let i = originalFeatures.length - 1; i >= 0; --i) {
    originalFeature = originalFeatures[i];
    styles.push(createEarthquakeStyle(originalFeature));
  }
  return styles;
}

// 创建聚合矢量图层：加载 2012 年 5 级以上地震 KML 数据（关闭 KML 内置样式提取），按 40px 屏幕间距聚合
vector = new VectorLayer({
  source: new Cluster({
    distance: 40,
    source: new VectorSource({
      url: 'data/kml/2012_Earthquakes_Mag5.kml',
      format: new KML({
        extractStyles: false,
      }),
    }),
  }),
  style: styleFunction,
});

// 创建 StadiaMaps (Stamen Toner 黑白底图) 瓦片图层，衬托橙色地震点位
const raster = new TileLayer({
  source: new StadiaMaps({
    layer: 'stamen_toner',
  }),
});

const map = new Map({
  layers: [raster, vector],
  // 在默认交互基础上扩展 Select 交互：同时响应鼠标悬停（pointermove）和单击（singleclick），触发聚合点原地散开预览
  interactions: defaultInteractions().extend([
    new Select({
      condition: function (evt) {
        return evt.type == 'pointermove' || evt.type == 'singleclick';
      },
      style: selectStyleFunction,
    }),
  ]),
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
