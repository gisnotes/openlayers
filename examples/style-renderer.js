import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getBottomLeft, getHeight, getWidth} from '../src/ol/extent.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {toContext} from '../src/ol/render.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// Fill and stroke for the country outline
// 国家边界轮廓的填充与描边样式
const fill = new Fill();
const stroke = new Stroke({
  color: 'rgba(255,255,255,0.8)',
  width: 2,
});

// Custom style with a canvas renderer function
// 带有自定义 Canvas 渲染器函数（renderer）的样式
const style = new Style({
  renderer: function (pixelCoordinates, state) {
    const context = state.context;
    const geometry = state.geometry.clone();
    geometry.setCoordinates(pixelCoordinates);
    const extent = geometry.getExtent();
    const width = getWidth(extent);
    const height = getHeight(extent);
    const flag = state.feature.get('flag');
    if (!flag || height < 1 || width < 1) {
      return;
    }

    // Stitch out country shape from the blue canvas
    // 绘制国家几何图形边界，作为 Canvas 剪裁路径（Clip Path）
    context.save();
    const renderContext = toContext(context, {
      pixelRatio: 1,
    });
    renderContext.setFillStrokeStyle(fill, stroke);
    renderContext.drawGeometry(geometry);
    context.clip();

    // Fill transparent country with the flag image
    // 在剪裁区域内绘制国旗图片，实现图片填充国家多边形
    const bottomLeft = getBottomLeft(extent);
    const left = bottomLeft[0];
    const bottom = bottomLeft[1];
    context.drawImage(flag, left, bottom, width, height);
    context.restore();
  },
});

// Vector layer with GeoJSON source
// 使用 GeoJSON 格式世界国家数据的矢量图层
const vectorLayer = new VectorLayer({
  source: new VectorSource({
    url: 'https://openlayersbook.github.io/openlayers_book_samples/assets/data/countries.geojson',
    format: new GeoJSON(),
  }),
  style: style,
});

// Load country flags and set them as `flag` attribute on the country feature
// 异步加载对应国家的国旗图片，并将其设置为国家要素的 `flag` 属性
vectorLayer.getSource().on('addfeature', function (event) {
  const feature = event.feature;
  const img = new Image();
  img.onload = function () {
    feature.set('flag', img);
  };
  img.src =
    'https://flagcdn.com/w320/' + feature.get('iso_a2').toLowerCase() + '.png';
});

// Initialize the map
// 初始化地图
new Map({
  layers: [vectorLayer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});
