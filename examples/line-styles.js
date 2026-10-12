import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Draw from '../src/ol/interaction/Draw.js';
import Modify from '../src/ol/interaction/Modify.js';
import Snap from '../src/ol/interaction/Snap.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// 1. 创建矢量数据源：加载预置的测试线条与多边形 GeoJSON 数据
const source = new VectorSource({
  url: 'data/geojson/line-samples.geojson',
  format: new GeoJSON(),
});

// 2. 创建矢量图层
const vector = new VectorLayer({source: source});

// 3. 获取样式配置表单，并定义响应式更新图层样式的函数
const styleOptionsForm = document.getElementById('line-style-options-form');
function updateStyles() {
  // 使用浏览器原生 FormData 一次性读取表单中所有控件的当前值
  const formData = new FormData(styleOptionsForm);
  const styles = [
    new Style({
      stroke: new Stroke({
        color: formData.get('color'), // 线条颜色
        lineCap: formData.get('lineCap'), // 线端帽样式：'butt' | 'round' | 'square'
        lineJoin: formData.get('lineJoin'), // 转角连接样式：'bevel' | 'round' | 'miter'
        // 将逗号分隔的字符串（如 "1, 3"）解析为数字数组 [1, 3] 作为虚线排列模式
        lineDash: formData
          .get('lineDash')
          ?.split(',')
          ?.map((value) => Number(value)),
        lineDashOffset: formData.get('lineDashOffset'), // 虚线起始相位偏移量（px）
        miterLimit: formData.get('miterLimit'), // 尖角斜接长度限制比值（仅在 lineJoin 为 'miter' 时生效）
        width: formData.get('width'), // 线条像素宽度（px）
        offset: formData.get('offset'), // 平行法向偏移像素值（正负值控制向左/向右或向内/向外偏移）
      }),
    }),
  ];

  // 如果设置了非零的法向偏移（offset），则追加第二个灰色细虚线样式
  // 用于在原始几何位置绘制一条无偏移的基准参考线，方便直观对比偏移前后的位置关系
  if (Math.abs(formData.get('offset')) > 0) {
    styles.push(
      new Style({
        stroke: new Stroke({
          color: '#aaa',
          width: 1,
          lineDash: [3, 3],
        }),
      }),
    );
  }

  // 将样式数组应用到矢量图层（图层会按数组顺序依次叠加渲染每个 Style）
  vector.setStyle(styles);
}

// 初始化执行一次样式设置，并监听表单整体的 change 事件实现实时更新
updateStyles();
styleOptionsForm.addEventListener('change', updateStyles);

// 4. 创建编辑与绘制交互：支持拖拽修改现有顶点（Modify）、绘制新多边形（Draw）及顶点吸附（Snap）
const modify = new Modify({source});
const draw = new Draw({source, type: 'Polygon'});
const snap = new Snap({source: source});

// 5. 初始化地图实例，并将 Modify / Draw / Snap 扩展到默认交互集合中
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    vector,
  ],
  target: 'map',
  view: new View({
    center: [-8161939, 6095025],
    zoom: 8,
  }),
  interactions: defaultInteractions().extend([modify, draw, snap]),
});
