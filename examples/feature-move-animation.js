import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Polyline from '../src/ol/format/Polyline.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {getVectorContext} from '../src/ol/render.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

const key = 'EPhPi7Zr1GTS500UybLu';
const attributions =
  '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
  '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>';

const center = [-5639523.95, -3501274.52];
const map = new Map({
  target: document.getElementById('map'),
  view: new View({
    center: center,
    zoom: 10,
    minZoom: 2,
    maxZoom: 19,
  }),
  layers: [
    new TileLayer({
      source: new ImageTile({
        attributions: attributions,
        url: 'https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=' + key,
        tileSize: 512,
      }),
    }),
  ],
});

// The polyline string is read from a JSON similar to those returned
// by directions APIs such as Openrouteservice and Mapbox.
// 从类似 Openrouteservice 或 Mapbox 路径规划 API 返回的 JSON 中读取折线编码字符串
fetch('data/polyline/route.json').then(function (response) {
  response.json().then(function (result) {
    const polyline = result.routes[0].geometry;

    // Decode polyline to geometry (factor 1e6 for 6-decimal precision)
    // 解码 Google/Mapbox 算法压缩的折线几何
    const route = new Polyline({
      factor: 1e6,
    }).readGeometry(polyline, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857',
    });

    const routeFeature = new Feature({
      type: 'route',
      geometry: route,
    });
    const startMarker = new Feature({
      type: 'icon',
      geometry: new Point(route.getFirstCoordinate()),
    });
    const endMarker = new Feature({
      type: 'icon',
      geometry: new Point(route.getLastCoordinate()),
    });
    const position = startMarker.getGeometry().clone();
    const geoMarker = new Feature({
      type: 'geoMarker',
      geometry: position,
    });

    const styles = {
      'route': new Style({
        stroke: new Stroke({
          width: 6,
          color: [237, 212, 0, 0.8],
        }),
      }),
      'icon': new Style({
        image: new Icon({
          anchor: [0.5, 1],
          src: 'data/icon.png',
        }),
      }),
      'geoMarker': new Style({
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({color: 'black'}),
          stroke: new Stroke({
            color: 'white',
            width: 2,
          }),
        }),
      }),
    };

    const vectorLayer = new VectorLayer({
      source: new VectorSource({
        features: [routeFeature, geoMarker, startMarker, endMarker],
      }),
      style: function (feature) {
        return styles[feature.get('type')];
      },
    });

    map.addLayer(vectorLayer);

    const speedInput = document.getElementById('speed');
    const startButton = document.getElementById('start-animation');
    let animating = false;
    let distance = 0;
    let lastTime;

    /**
     * Postrender animation loop: interpolate position and draw with VectorContext.
     * 渲染后帧回调：基于时间差积分计算折线插值坐标，使用 VectorContext 瞬态绘制。
     * @param {import("../src/ol/render/Event.js").default} event Render event.
     */
    function moveFeature(event) {
      const speed = Number(speedInput.value);
      const time = event.frameState.time;
      const elapsedTime = time - lastTime;
      // Modulo 2 allows round-trip movement (0->1 forward, 1->2 backward)
      // 对 2 取模实现沿线往返往复运动（0~1 为正向，1~2 为反向折返）
      distance = (distance + (speed * elapsedTime) / 1e6) % 2;
      lastTime = time;

      const currentCoordinate = route.getCoordinateAt(
        distance > 1 ? 2 - distance : distance,
      );
      position.setCoordinates(currentCoordinate);
      const vectorContext = getVectorContext(event);
      vectorContext.setStyle(styles.geoMarker);
      vectorContext.drawGeometry(position);
      // tell OpenLayers to continue the postrender animation
      // 请求下一帧重绘继续推进动画
      map.render();
    }

    /**
     * Start animation: detach geometry from source and subscribe to postrender.
     * 启动动画：临时将 geoMarker 几何置空以优化性能，挂载 postrender 监听。
     */
    function startAnimation() {
      animating = true;
      lastTime = Date.now();
      startButton.textContent = 'Stop Animation / 停止动画';
      vectorLayer.on('postrender', moveFeature);
      // hide geoMarker and trigger map render through change event
      // 临时隐藏数据源中的要素，避免每帧触发 R-Tree 空间索引重构
      geoMarker.setGeometry(null);
    }

    /**
     * Stop animation: restore geometry to source and unsubscribe from postrender.
     * 停止动画：将最终位置赋回 geoMarker 并注销 postrender 监听。
     */
    function stopAnimation() {
      animating = false;
      startButton.textContent = 'Start Animation / 开始动画';

      // Keep marker at current animation position
      // 在当前动画停止位置还原要素几何
      geoMarker.setGeometry(position);
      vectorLayer.un('postrender', moveFeature);
    }

    startButton.addEventListener('click', function () {
      if (animating) {
        stopAnimation();
      } else {
        startAnimation();
      }
    });
  });
});
