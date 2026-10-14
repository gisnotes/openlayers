import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import Draw from '../src/ol/interaction/Draw.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {get} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

const raster = new TileLayer({
  source: new OSM(),
});

const source = new VectorSource();

// 动态样式函数：为折线本身配置描边样式，并遍历每个子线段在其终点放置按航向角旋转的箭头
const styleFunction = function (feature) {
  const geometry = feature.getGeometry();
  const styles = [
    // 折线基础描边样式
    new Style({
      stroke: new Stroke({
        color: '#ffcc33',
        width: 2,
      }),
    }),
  ];

  // 遍历折线的每个子线段，计算两点夹角并在终点生成旋转箭头图标
  geometry.forEachSegment(function (start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    // 箭头指示样式
    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          src: 'data/arrow.png',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation,
        }),
      }),
    );
  });

  return styles;
};
const vector = new VectorLayer({
  source: source,
  style: styleFunction,
});

// 限制多世界循环平移范围在真实世界东西各延伸一个世界副本内
const extent = get('EPSG:3857').getExtent().slice();
extent[0] += extent[0];
extent[2] += extent[2];

const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [-11000000, 4600000],
    zoom: 4,
    extent,
  }),
});

map.addInteraction(
  new Draw({
    source: source,
    type: 'LineString',
  }),
);
