import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import Point from '../src/ol/geom/Point.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import RegularShape from '../src/ol/style/RegularShape.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';

// 1. 定义风向标的“箭杆（shaft）”符号：
// 使用 points: 2 在半径为 5 的圆上取上下两个顶点，生成一条总长为 10px 的垂直线段
const shaft = new RegularShape({
  points: 2,
  radius: 5,
  stroke: new Stroke({
    width: 2,
    color: 'black',
  }),
  rotateWithView: true, // 必须开启：风向属于地理真北方位，地图旋转时箭头需同步跟随旋转
});

// 2. 定义风向标的“箭头（head）”符号：
// 使用 points: 3 生成一个半径为 5、顶点朝向正上方的实心等边三角形
const head = new RegularShape({
  points: 3,
  radius: 5,
  fill: new Fill({
    color: 'black',
  }),
  rotateWithView: true,
});

// 预创建包含箭杆与箭头的复合样式数组（全局复用，避免在渲染循环中重复 new 对象）
const styles = [new Style({image: shaft}), new Style({image: head})];

// 3. 创建气象站点矢量数据源
const source = new VectorSource({
  attributions:
    'Weather data by <a href="https://openweathermap.org/current">OpenWeather</a>',
});

// 4. 初始化地图与动态风向标矢量图层
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
    new VectorLayer({
      source: source,
      // 动态样式函数：根据每个气象站点的风向（deg）与风速（speed）实时调整箭杆长度与箭头位置
      style: function (feature) {
        const wind = feature.get('wind');
        // 气象学风向 deg 是“风吹来的方向”，减去 180° 转换为“风吹去的方向（箭头指向）”，并转为弧度
        const angle = ((wind.deg - 180) * Math.PI) / 180;
        // 根据风速计算箭杆的纵向拉伸倍率
        const scale = wind.speed / 10;
        // 仅沿 Y 轴拉伸箭杆长度，保持 X 轴宽度为 1（使箭杆线条粗细保持恒定 2px）
        shaft.setScale([1, scale]);
        shaft.setRotation(angle);

        // 将不缩放的三角形箭头沿 Y 轴向上推移至拉伸后的箭杆顶端：
        // 偏移量 = 等边三角形中心到底边的距离 (radius / 2) + 箭杆上半截拉伸后的长度 (radius * scale)
        head.setDisplacement([
          0,
          head.getRadius() / 2 + shaft.getRadius() * scale,
        ]);
        head.setRotation(angle);
        return styles;
      },
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// 5. 异步加载 OpenWeather 实况气象站点数据，构造点要素并自动缩放视图至数据范围
fetch('data/openweather/weather.json')
  .then(function (response) {
    return response.json();
  })
  .then(function (data) {
    const features = [];
    data.list.forEach(function (report) {
      // 将经纬度坐标 [lon, lat] 转换为 Web Mercator 投影坐标创建点要素
      const feature = new Feature(
        new Point(fromLonLat([report.coord.lon, report.coord.lat])),
      );
      // 将站点气象报告的所有字段（包含 wind: { speed, deg } 等）批量写入要素属性
      feature.setProperties(report);
      features.push(feature);
    });
    source.addFeatures(features);
    // 自动缩放和平移地图视图，使所有气象站点完整呈现在视野内
    map.getView().fit(source.getExtent());
  });
