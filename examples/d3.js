import {json} from 'd3-fetch';
import {geoBounds, geoMercator, geoPath} from 'd3-geo';
import {select} from 'd3-selection';
import {feature} from 'topojson-client';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getCenter, getWidth} from '../src/ol/extent.js';
import Layer from '../src/ol/layer/Layer.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat, toLonLat} from '../src/ol/proj.js';
import StadiaMaps from '../src/ol/source/StadiaMaps.js';

/**
 * Custom OpenLayers Layer integrating D3.js SVG rendering pipeline
 * 自定义 OpenLayers 图层类，集成 D3.js 的 SVG 渲染管线
 */
class CanvasLayer extends Layer {
  constructor(options) {
    super(options);

    this.features = options.features;

    // Create an absolute positioned SVG DOM node wrapped with D3 selection
    // 创建一个通过 D3 选择器包装的绝对定位 SVG DOM 节点
    this.svg = select(document.createElement('div'))
      .append('svg')
      .style('position', 'absolute');

    this.svg.append('path').datum(this.features).attr('class', 'boundary');
  }

  getSourceState() {
    return 'ready';
  }

  /**
   * Render function called on each map render frame
   * 每帧地图渲染时触发的核心渲染函数，同步 OpenLayers 视口状态到 D3 投影器
   * @param {import('../src/ol/Map.js').FrameState} frameState Frame state / 帧渲染状态
   * @return {HTMLElement} SVG DOM node / SVG 根节点
   */
  render(frameState) {
    const width = frameState.size[0];
    const height = frameState.size[1];
    const projection = frameState.viewState.projection;
    const d3Projection = geoMercator().scale(1).translate([0, 0]);
    let d3Path = geoPath().projection(d3Projection);

    // Calculate pixel bounds in D3 base projection
    // 在 D3 基准投影空间中计算要素的像素包围盒
    const pixelBounds = d3Path.bounds(this.features);
    const pixelBoundsWidth = pixelBounds[1][0] - pixelBounds[0][0];
    const pixelBoundsHeight = pixelBounds[1][1] - pixelBounds[0][1];

    // Calculate geographical bounds in OpenLayers projection
    // 在 OpenLayers 地图投影坐标系中计算要素的实际空间包围盒
    const bounds = geoBounds(this.features);
    const geoBoundsLeftBottom = fromLonLat(bounds[0], projection);
    const geoBoundsRightTop = fromLonLat(bounds[1], projection);
    let geoBoundsWidth = geoBoundsRightTop[0] - geoBoundsLeftBottom[0];
    if (geoBoundsWidth < 0) {
      geoBoundsWidth += getWidth(projection.getExtent());
    }
    const geoBoundsHeight = geoBoundsRightTop[1] - geoBoundsLeftBottom[1];

    // Compute scale factor matching current view resolution
    // 计算匹配当前视口分辨率的缩放因子
    const widthResolution = geoBoundsWidth / pixelBoundsWidth;
    const heightResolution = geoBoundsHeight / pixelBoundsHeight;
    const r = Math.max(widthResolution, heightResolution);
    const scale = r / frameState.viewState.resolution;

    // Convert view center to longitude/latitude and rotation to degrees
    // 将视口中心转为经纬度，并将旋转弧度换算为角度
    const center = toLonLat(getCenter(frameState.extent), projection);
    const angle = (-frameState.viewState.rotation * 180) / Math.PI;

    // Synchronize D3 Mercator projection parameters with OpenLayers view state
    // 将 OpenLayers 视口参数注入 D3 墨卡托投影器中
    d3Projection
      .scale(scale)
      .center(center)
      .translate([width / 2, height / 2])
      .angle(angle);

    d3Path = d3Path.projection(d3Projection);
    d3Path(this.features);

    this.svg.attr('width', width);
    this.svg.attr('height', height);

    this.svg.select('path').attr('d', d3Path);

    return this.svg.node();
  }
}

// Main map instance with Stamen watercolor basemap
// 地图主实例，加载 Stamen 水彩底图
const map = new Map({
  layers: [
    new TileLayer({
      source: new StadiaMaps({
        layer: 'stamen_watercolor',
      }),
    }),
  ],
  target: 'map',
  view: new View({
    center: fromLonLat([-97, 38]),
    zoom: 4,
  }),
});

/**
 * Load TopoJSON data and instantiate the custom D3 layer
 * 加载 TopoJSON 数据并实例化自定义 D3 SVG 图层挂载至地图
 */
json('data/topojson/us.json').then(function (us) {
  const layer = new CanvasLayer({
    features: feature(us, 'counties'),
  });

  map.addLayer(layer);
});
