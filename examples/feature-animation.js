import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import {unByKey} from '../src/ol/Observable.js';
import View from '../src/ol/View.js';
import {easeOut} from '../src/ol/easing.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import {getVectorContext} from '../src/ol/render.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

const tileLayer = new TileLayer({
  source: new OSM({
    wrapX: false,
  }),
});

const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [tileLayer, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
    multiWorld: true,
  }),
});

/**
 * Add a random point feature across the globe.
 * 在全球范围内随机生成并添加点要素。
 */
function addRandomFeature() {
  const x = Math.random() * 360 - 180;
  const y = Math.random() * 170 - 85;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

const duration = 3000;

/**
 * Trigger a 3-second animated radar pulse/flash wave on the given feature.
 * 对指定要素触发为期 3 秒的雷达波纹扩散动效。
 * @param {Feature} feature Target feature to flash.
 */
function flash(feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  // Listen to tile layer's postrender event to draw directly on canvas
  // 监听底图图层的 postrender 渲染完成事件，直接向当前帧 Canvas 绘制过渡图形
  const listenerKey = tileLayer.on('postrender', animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      // Unsubscribe listener when animation completes
      // 动画超时，解绑注销事件，停止无谓重绘
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    // Radius expands from 5 to 30px with easeOut
    // 半径从 5px 随缓动函数扩展至 30px
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: 'rgba(255, 0, 0, ' + opacity + ')',
          width: 0.25 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    // Tell OpenLayers to continue postrender animation loop
    // 告知地图引擎继续请求下一渲染帧推进动画
    map.render();
  }
}

// Automatically trigger flash animation whenever a new feature is added
// 监听数据源 addfeature 事件，自动触发光晕动画
source.on('addfeature', function (e) {
  flash(e.feature);
});

// Periodically generate a random feature every 1 second
// 定时器：每秒自动生成一个新点要素
window.setInterval(addRandomFeature, 1000);
