import monotoneChainConvexHull from 'monotone-chain-convex-hull';
import Feature from '../src/ol/Feature.js';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {createEmpty, extend, getHeight, getWidth} from '../src/ol/extent.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import LineString from '../src/ol/geom/LineString.js';
import Point from '../src/ol/geom/Point.js';
import Polygon from '../src/ol/geom/Polygon.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import {fromLonLat} from '../src/ol/proj.js';
import Cluster from '../src/ol/source/Cluster.js';
import ImageTile from '../src/ol/source/ImageTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import CircleStyle from '../src/ol/style/Circle.js';
import Fill from '../src/ol/style/Fill.js';
import Icon from '../src/ol/style/Icon.js';
import Stroke from '../src/ol/style/Stroke.js';
import Style from '../src/ol/style/Style.js';
import Text from '../src/ol/style/Text.js';

// 环形蛛网展开（Spiderfier）算法的几何常量：间距倍数、相邻图标圆周弧长间距（28px）、起始角度（90° 正上方）
const circleDistanceMultiplier = 1;
const circleFootSeparation = 28;
const circleStartAngle = Math.PI / 2;

// 1. 预定义复用的填充、描边、同心圆与图标样式实例
// 悬停凸包多边形（Convex Hull）的半透明橙色填充与深橙色描边（该描边也复用于蛛网展开牵引线）
const convexHullFill = new Fill({
  color: 'rgba(255, 153, 0, 0.4)',
});
const convexHullStroke = new Stroke({
  color: 'rgba(204, 85, 0, 1)',
  width: 1.5,
});
// 聚合点双层同心圆（外圈浅橙色半径 20px + 内圈深橙色半径 14px）与中心数字样式
const outerCircleFill = new Fill({
  color: 'rgba(255, 153, 102, 0.3)',
});
const innerCircleFill = new Fill({
  color: 'rgba(255, 165, 0, 0.7)',
});
const textFill = new Fill({
  color: '#fff',
});
const textStroke = new Stroke({
  color: 'rgba(0, 0, 0, 0.6)',
  width: 3,
});
const innerCircle = new CircleStyle({
  radius: 14,
  fill: innerCircleFill,
});
const outerCircle = new CircleStyle({
  radius: 20,
  fill: outerCircleFill,
});
// 单个光伏设施图标：装机功率 > 5kW 使用深色实心笑脸图标，<= 5kW 使用浅色轮廓笑脸图标
const darkIcon = new Icon({
  src: 'data/icons/emoticon-cool.svg',
});
const lightIcon = new Icon({
  src: 'data/icons/emoticon-cool-outline.svg',
});

/**
 * Single feature style, users for clusters with 1 feature and cluster circles.
 * 单个要素的图标样式函数（同时服务于仅含 1 个要素的聚合点，以及环形蛛网展开后的每个子要素点）
 * @param {Feature} clusterMember A feature from a cluster.
 * @return {Style} An icon style for the cluster member's location.
 */
function clusterMemberStyle(clusterMember) {
  return new Style({
    geometry: clusterMember.getGeometry(),
    image: clusterMember.get('LEISTUNG') > 5 ? darkIcon : lightIcon,
  });
}

let clickFeature, clickResolution;
/**
 * Style for clusters with features that are too close to each other, activated on click.
 * 针对内部子要素距离过近（或同址重叠）的聚合点的环形展开样式函数（点击时激活）
 * @param {Feature} cluster A cluster with overlapping members.
 * @param {number} resolution The current view resolution.
 * @return {Array<Style>|null} A style to render an expanded view of the cluster members.
 */
function clusterCircleStyle(cluster, resolution) {
  // 仅对当前点击选中的那个聚合点生效；一旦点击其他要素或地图发生缩放（resolution 改变），立即收起展开视图
  if (cluster !== clickFeature || resolution !== clickResolution) {
    return null;
  }
  const clusterMembers = cluster.get('features');
  const centerCoordinates = cluster.getGeometry().getCoordinates();
  return generatePointsCircle(
    clusterMembers.length,
    cluster.getGeometry().getCoordinates(),
    resolution,
  ).reduce((styles, coordinates, i) => {
    const point = new Point(coordinates);
    const line = new LineString([centerCoordinates, coordinates]);
    // 使用 unshift 将牵引线（LineString）插入数组头部，确保牵引线先绘制在底层
    styles.unshift(
      new Style({
        geometry: line,
        stroke: convexHullStroke,
      }),
    );
    // 使用 push 将展开到圆周上的子要素图标追加到数组尾部，确保图标后绘制并覆盖在牵引线末端之上
    styles.push(
      clusterMemberStyle(
        new Feature({
          ...clusterMembers[i].getProperties(),
          geometry: point,
        }),
      ),
    );
    return styles;
  }, []);
}

/**
 * From
 * https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
 * Arranges points in a circle around the cluster center, with a line pointing from the center to
 * each point.
 * 借鉴自 Leaflet.markercluster 的蛛网展开算法：将聚合包内的所有子要素围绕聚合中心按圆周均匀排列
 * @param {number} count Number of cluster members.
 * @param {Array<number>} clusterCenter Center coordinate of the cluster.
 * @param {number} resolution Current view resolution.
 * @return {Array<Array<number>>} An array of coordinates representing the cluster members.
 */
function generatePointsCircle(count, clusterCenter, resolution) {
  const circumference =
    circleDistanceMultiplier * circleFootSeparation * (2 + count);
  let legLength = circumference / (Math.PI * 2); //radius from circumference（由圆周长反推像素半径）
  const angleStep = (Math.PI * 2) / count;
  const res = [];
  let angle;

  legLength = Math.max(legLength, 35) * resolution; // Minimum distance to get outside the cluster icon.（最小半径 35px，确保展开点落在聚合圆外部，并乘以分辨率换算为地图坐标长度）

  for (let i = 0; i < count; ++i) {
    // Clockwise, like spiral.（按角度步长围绕中心均匀计算圆周坐标）
    angle = circleStartAngle + i * angleStep;
    res.push([
      clusterCenter[0] + legLength * Math.cos(angle),
      clusterCenter[1] + legLength * Math.sin(angle),
    ]);
  }

  return res;
}

let hoverFeature;
/**
 * Style for convex hulls of clusters, activated on hover.
 * 聚合包的凸包（Convex Hull）多边形样式函数（鼠标悬停时激活）
 * @param {Feature} cluster The cluster feature.
 * @return {Style|null} Polygon style for the convex hull of the cluster.
 */
function clusterHullStyle(cluster) {
  if (cluster !== hoverFeature) {
    return null;
  }
  const originalFeatures = cluster.get('features');
  const points = originalFeatures.map((feature) =>
    feature.getGeometry().getCoordinates(),
  );
  // 使用 monotoneChainConvexHull 计算包络所有子要素坐标的最小凸多边形外环顶点
  return new Style({
    geometry: new Polygon([monotoneChainConvexHull(points)]),
    fill: convexHullFill,
    stroke: convexHullStroke,
  });
}

/**
 * 常规聚合图层样式函数：多要素显示为双层同心圆 + 数量文本，单要素直接显示光伏电站图标
 * @param {import("../src/ol/Feature.js").FeatureLike} feature 聚合要素
 * @return {Array<Style>|Style} 渲染样式
 */
function clusterStyle(feature) {
  const size = feature.get('features').length;
  if (size > 1) {
    return [
      new Style({
        image: outerCircle,
      }),
      new Style({
        image: innerCircle,
        text: new Text({
          text: size.toString(),
          fill: textFill,
          stroke: textStroke,
        }),
      }),
    ];
  }
  const originalFeature = feature.get('features')[0];
  return clusterMemberStyle(originalFeature);
}

// 原始光伏电站 GeoJSON 矢量数据源
const vectorSource = new VectorSource({
  format: new GeoJSON(),
  url: 'data/geojson/photovoltaic.json',
});

// 聚合数据源（聚合像素距离 35px），同时供给下方 3 个不同职责的 VectorLayer 共享使用
const clusterSource = new Cluster({
  attributions:
    'Data: <a href="https://www.data.gv.at/auftritte/?organisation=stadt-wien">Stadt Wien</a>',
  distance: 35,
  source: vectorSource,
});

// Layer displaying the convex hull of the hovered cluster.
// 第 1 层（底层）：用于渲染鼠标悬停聚合包的凸包（Convex Hull）多边形
const clusterHulls = new VectorLayer({
  source: clusterSource,
  style: clusterHullStyle,
});

// Layer displaying the clusters and individual features.
// 第 2 层（中层）：用于渲染常规聚合同心圆徽章与单个光伏电站图标
const clusters = new VectorLayer({
  source: clusterSource,
  style: clusterStyle,
});

// Layer displaying the expanded view of overlapping cluster members.
// 第 3 层（顶层）：用于渲染点击重叠聚合点时的环形蛛网展开视图（Spiderfier）
const clusterCircles = new VectorLayer({
  source: clusterSource,
  style: clusterCircleStyle,
});

// 维也纳官方灰色底图（basemap.at）
const raster = new TileLayer({
  source: new ImageTile({
    attributions:
      'Base map: <a target="_blank" href="https://basemap.at/">basemap.at</a>',
    url: 'https://maps{1-4}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png',
  }),
});

const map = new Map({
  layers: [raster, clusterHulls, clusters, clusterCircles],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
    maxZoom: 19,
    // 限制视图范围为维也纳市区，并允许查看完整范围
    extent: [
      ...fromLonLat([16.1793, 48.1124]),
      ...fromLonLat([16.5559, 48.313]),
    ],
    showFullExtent: true,
  }),
});

// 监听鼠标移动：异步碰撞检测当前像素下的聚合点，悬停时绘制底层凸包并切换手型光标
map.on('pointermove', (event) => {
  clusters.getFeatures(event.pixel).then((features) => {
    if (features[0] !== hoverFeature) {
      // Display the convex hull on hover.
      hoverFeature = features[0];
      clusterHulls.setStyle(clusterHullStyle);
      // Change the cursor style to indicate that the cluster is clickable.
      map.getTargetElement().style.cursor =
        hoverFeature && hoverFeature.get('features').length > 1
          ? 'pointer'
          : '';
    }
  });
});

// 监听鼠标点击：智能判断是“平滑缩放至子要素范围”还是“原地触发环形蛛网展开”
map.on('click', (event) => {
  clusters.getFeatures(event.pixel).then((features) => {
    if (features.length > 0) {
      const clusterMembers = features[0].get('features');
      if (clusterMembers.length > 1) {
        // Calculate the extent of the cluster members.
        // 计算该聚合包内所有子要素的地理包围盒（Extent）
        const extent = createEmpty();
        clusterMembers.forEach((feature) =>
          extend(extent, feature.getGeometry().getExtent()),
        );
        const view = map.getView();
        const resolution = map.getView().getResolution();
        if (
          view.getZoom() === view.getMaxZoom() ||
          (getWidth(extent) < resolution && getHeight(extent) < resolution)
        ) {
          // Show an expanded view of the cluster members.
          // 若已达最大缩放级别，或所有子要素间距不足 1 像素（同址重叠），则触发环形蛛网展开视图
          clickFeature = features[0];
          clickResolution = resolution;
          clusterCircles.setStyle(clusterCircleStyle);
        } else {
          // Zoom to the extent of the cluster members.
          // 否则平滑缩放至子要素包围盒范围（500ms 动画，四周留白 50px）
          view.fit(extent, {duration: 500, padding: [50, 50, 50, 50]});
        }
      }
    }
  });
});
