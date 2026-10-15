import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import Layer from '../src/ol/layer/Layer.js';
import Vector from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import {composeCssTransform} from '../src/ol/transform.js';

// Initialize map with EPSG:4326 projection matching the world SVG extent
// 初始化采用 EPSG:4326 投影坐标系的地图实例，契合全球 SVG 的经纬度范围
const map = new Map({
  target: 'map',
  view: new View({
    center: [0, 0],
    extent: [-180, -90, 180, 90],
    projection: 'EPSG:4326',
    zoom: 2,
  }),
});

// Container element for holding the interactive SVG DOM
// 存放交互式 SVG DOM 节点的容器元素
const svgContainer = document.createElement('div');
const xhr = new XMLHttpRequest();
xhr.open('GET', 'data/world.svg');
xhr.addEventListener('load', function () {
  const svg = xhr.responseXML.documentElement;
  svgContainer.ownerDocument.importNode(svg);
  svgContainer.appendChild(svg);
});
xhr.send();

// Native SVG dimensions and base geographic resolution (360 degrees / width)
// SVG 原始物理像素尺寸以及基准地理分辨率（360度 / 像素宽度）
const width = 2560;
const height = 1280;
const svgResolution = 360 / width;
svgContainer.style.width = width + 'px';
svgContainer.style.height = height + 'px';
svgContainer.style.transformOrigin = 'top left';
svgContainer.className = 'svg-layer';
svgContainer.style.position = 'absolute';

// Add custom Layer with render function computing CSS transform matrix every frame
// 添加自定义 Layer 图层，每帧根据 frameState 动态解算 CSS 仿射变换矩阵
map.addLayer(
  new Layer({
    render: function (frameState) {
      const scale = svgResolution / frameState.viewState.resolution;
      const center = frameState.viewState.center;
      const size = frameState.size;
      const cssTransform = composeCssTransform(
        size[0] / 2,
        size[1] / 2,
        scale,
        scale,
        frameState.viewState.rotation,
        -center[0] / svgResolution - width / 2,
        center[1] / svgResolution - height / 2,
      );
      svgContainer.style.transform = cssTransform;
      svgContainer.style.opacity = String(this.getOpacity());
      return svgContainer;
    },
  }),
);

// Overlay a standard vector layer on top of the SVG layer
// 在 SVG 图层上方叠加常规 OpenLayers 矢量图层以验证多层对齐
map.addLayer(
  new Vector({
    source: new VectorSource({
      features: [new Feature(new Point([0, 0]))],
    }),
    style: {
      'circle-fill-color': 'blue',
      'circle-radius': 10,
      'circle-stroke-color': 'white',
    },
  }),
);
