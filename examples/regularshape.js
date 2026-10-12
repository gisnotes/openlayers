import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import RegularShape from '../src/ol/style/RegularShape.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// 定义所有符号共用的基础黑色描边（宽 2px）与红色填充
const stroke = new Stroke({color: 'black', width: 2});
const fill = new Fill({color: 'red'});

// 预定义 7 种 RegularShape 几何符号样式字典（供 250 个要素共享复用）
const styles = {
  // 1. 正方形（□）：4 个顶点，起始角旋转 45°（Math.PI / 4）使四条边水平/垂直正放
  'square': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4,
    }),
  }),
  // 2. 长方形（▭）：构造正方形包络后，通过 scale: [1, 0.5] 将垂直方向（Y 轴）压缩一半
  'rectangle': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      radius: 10 / Math.SQRT2,
      radius2: 10,
      points: 4,
      angle: 0,
      scale: [1, 0.5],
    }),
  }),
  // 3. 三角形（△）：3 个顶点，angle: 0 生成正立等边三角形，再通过 rotation 整体顺时针旋转 45°
  'triangle': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 3,
      radius: 10,
      rotation: Math.PI / 4,
      angle: 0,
    }),
  }),
  // 4. 五角星（☆）：points: 5，同时指定外圆半径 radius (10) 和内凹顶点半径 radius2 (4)
  'star': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 5,
      radius: 10,
      radius2: 4,
      angle: 0,
    }),
  }),
  // 5. 十字丝（+）：points: 4 且内半径 radius2: 0（内顶点坍缩至中心点），angle: 0 时指向正上下左右
  'cross': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      radius2: 0,
      angle: 0,
    }),
  }),
  // 6. 叉号（×）：与十字丝相同（points: 4, radius2: 0），仅将起始角旋转 45°（Math.PI / 4）
  'x': new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      radius2: 0,
      angle: Math.PI / 4,
    }),
  }),
  // 7. 堆叠组合符号（stacked）：使用 Style 数组叠加两个正方形
  'stacked': [
    // 上方小正方形（radius: 5），通过 displacement: [0, 10] 向正上方偏移 10 像素
    new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 5,
        angle: Math.PI / 4,
        displacement: [0, 10],
      }),
    }),
    // 下方基准大正方形（radius: 10），位于要素原始坐标点
    new Style({
      image: new RegularShape({
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: 10,
        angle: Math.PI / 4,
      }),
    }),
  ],
};

// 样式键名列表，用于随机分配给生成的测试点要素
const styleKeys = [
  'x',
  'cross',
  'star',
  'triangle',
  'square',
  'rectangle',
  'stacked',
];

// 在 [-4500000, 4500000] 坐标范围内随机生成 250 个点要素，并随机绑定上述 7 种样式之一
const count = 250;
const features = new Array(count);
const e = 4500000;
for (let i = 0; i < count; ++i) {
  const coordinates = [2 * e * Math.random() - e, 2 * e * Math.random() - e];
  features[i] = new Feature(new Point(coordinates));
  features[i].setStyle(
    styles[styleKeys[Math.floor(Math.random() * styleKeys.length)]],
  );
}

// 创建矢量数据源与矢量图层
const source = new VectorSource({
  features: features,
});

const vectorLayer = new VectorLayer({
  source: source,
});

// 初始化地图实例
const map = new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// 定义待轮换的填充颜色列表
const colors = ['blue', 'green', 'yellow', 'aqua', 'red'];
let currentColor = 0;

// 监听按钮点击事件：原地更新 styles.square 的填充色，并调用 vectorLayer.changed() 触发批量重绘
document.getElementById('color-changer').addEventListener('click', function () {
  styles.square
    .getImage()
    .setFill(new Fill({color: colors[currentColor % colors.length]}));
  // 通知矢量图层样式已发生内部变更，触发地图重绘使所有正方形同步变色
  vectorLayer.changed();
  currentColor++;
});
