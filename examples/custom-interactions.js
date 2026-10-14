import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import Polygon from '../src/ol/geom/Polygon.js';
import PointerInteraction from '../src/ol/interaction/Pointer.js';
import {defaults as defaultInteractions} from '../src/ol/interaction/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OGCMapTile from '../src/ol/source/OGCMapTile.js';
import VectorSource from '../src/ol/source/Vector.js';

// Custom Drag interaction subclassing PointerInteraction
// 通过继承 PointerInteraction 自定义实现的要素平移拖拽交互类
class Drag extends PointerInteraction {
  constructor() {
    super({
      handleDownEvent: handleDownEvent,
      handleDragEvent: handleDragEvent,
      handleMoveEvent: handleMoveEvent,
      handleUpEvent: handleUpEvent,
    });

    /**
     * @type {import('../src/ol/coordinate.js').Coordinate}
     * @private
     */
    this.coordinate_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.cursor_ = 'pointer';

    /**
     * @type {Feature}
     * @private
     */
    this.feature_ = null;

    /**
     * @type {string|undefined}
     * @private
     */
    this.previousCursor_ = undefined;
  }
}

/**
 * Handle pointer down event. Return true to claim the drag sequence.
 * 处理指针按下事件。返回 true 声明接管后续的拖拽事件序列。
 * @param {import('../src/ol/MapBrowserEvent.js').default} evt Map browser event.
 * @return {boolean} `true` to start the drag sequence.
 */
function handleDownEvent(evt) {
  const map = evt.map;

  const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
    return feature;
  });

  if (feature) {
    this.coordinate_ = evt.coordinate;
    this.feature_ = feature;
  }

  return !!feature;
}

/**
 * Handle pointer drag event: calculate coordinate delta and translate the feature.
 * 处理指针拖拽事件：计算坐标偏移量并实时平移要素几何。
 * @param {import('../src/ol/MapBrowserEvent.js').default} evt Map browser event.
 */
function handleDragEvent(evt) {
  const deltaX = evt.coordinate[0] - this.coordinate_[0];
  const deltaY = evt.coordinate[1] - this.coordinate_[1];

  const geometry = this.feature_.getGeometry();
  geometry.translate(deltaX, deltaY);

  this.coordinate_[0] = evt.coordinate[0];
  this.coordinate_[1] = evt.coordinate[1];
}

/**
 * Handle pointer move event: update cursor style on hover.
 * 处理指针悬停移动事件：鼠标悬停在要素上方时动态更新光标样式为手型。
 * @param {import('../src/ol/MapBrowserEvent.js').default} evt Event.
 */
function handleMoveEvent(evt) {
  if (this.cursor_) {
    const map = evt.map;
    const feature = map.forEachFeatureAtPixel(evt.pixel, function (feature) {
      return feature;
    });
    const element = evt.map.getTargetElement();
    if (feature) {
      if (element.style.cursor != this.cursor_) {
        this.previousCursor_ = element.style.cursor;
        element.style.cursor = this.cursor_;
      }
    } else if (this.previousCursor_ !== undefined) {
      element.style.cursor = this.previousCursor_;
      this.previousCursor_ = undefined;
    }
  }
}

/**
 * Handle pointer up event: finish the drag sequence and release references.
 * 处理指针抬起事件：结束当前拖拽手势生命周期并释放引用。
 * @return {boolean} `false` to stop the drag sequence.
 */
function handleUpEvent() {
  this.coordinate_ = null;
  this.feature_ = null;
  return false;
}

const pointFeature = new Feature(new Point([0, 0]));

const lineFeature = new Feature(
  new LineString([
    [-1e7, 1e6],
    [-1e6, 3e6],
  ]),
);

const polygonFeature = new Feature(
  new Polygon([
    [
      [-3e6, -1e6],
      [-3e6, 1e6],
      [-1e6, 1e6],
      [-1e6, -1e6],
      [-3e6, -1e6],
    ],
  ]),
);

const map = new Map({
  interactions: defaultInteractions().extend([new Drag()]),
  layers: [
    new TileLayer({
      source: new OGCMapTile({
        url: 'https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad',
        crossOrigin: '',
      }),
    }),
    new VectorLayer({
      source: new VectorSource({
        features: [pointFeature, lineFeature, polygonFeature],
      }),
      style: {
        'icon-src': 'data/icon.png',
        'icon-opacity': 0.95,
        'icon-anchor': [0.5, 46],
        'icon-anchor-x-units': 'fraction',
        'icon-anchor-y-units': 'pixels',
        'stroke-width': 3,
        'stroke-color': [255, 0, 0, 1],
        'fill-color': [0, 0, 255, 0.6],
      },
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
