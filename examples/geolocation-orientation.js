import Geolocation from '../src/ol/Geolocation.js';
import Map from '../src/ol/Map.js';
import Overlay from '../src/ol/Overlay.js';
import View from '../src/ol/View.js';
import LineString from '../src/ol/geom/LineString.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {fromLonLat} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

// Creating the view initialized over France
// 初始化地图视图：初始中心定位至法国罗讷-阿尔卑斯地区，初始层级为 19
const view = new View({
  center: fromLonLat([5.8713, 45.6452]),
  zoom: 19,
});

const tileLayer = new TileLayer({
  source: new OSM(),
});

// Creating the map instance
// 创建地图实例并挂载 OSM 瓦片图层
const map = new Map({
  layers: [tileLayer],
  target: 'map',
  view: view,
});

// Geolocation marker overlay (DOM image element anchored to map coordinates)
// 定位图标覆盖物（Overlay）：绑定 DOM 图片元素并居中锚定在当前坐标上
const markerEl = document.getElementById('geolocation_marker');
const marker = new Overlay({
  positioning: 'center-center',
  element: markerEl,
  stopEvent: false,
});
map.addOverlay(marker);

// LineString to store the different geolocation positions. This LineString is time aware.
// The Z dimension is actually used to store the rotation (heading).
// 4D 折线几何体（XYZM 布局）：用于存储时序定位坐标，其中 Z 存储航向角（弧度），M 存储时间戳（毫秒）
const positions = new LineString([], 'XYZM');

// Geolocation Control with high accuracy tracking
// 地理定位控制器：配置高精度硬件 GPS 跟踪与超时选项
const geolocation = new Geolocation({
  projection: view.getProjection(),
  trackingOptions: {
    maximumAge: 10000,
    enableHighAccuracy: true,
    timeout: 600000,
  },
});

let deltaMean = 500; // the geolocation sampling period mean in ms / GPS 采样周期滑动平均值（毫秒）

// Listen to position changes
// 监听位置及运动指标变更事件
geolocation.on('change', function () {
  const position = geolocation.getPosition();
  const accuracy = geolocation.getAccuracy();
  const heading = geolocation.getHeading() || 0;
  const speed = geolocation.getSpeed() || 0;
  const m = Date.now();

  addPosition(position, heading, m, speed);

  const coords = positions.getCoordinates();
  const len = coords.length;
  if (len >= 2) {
    deltaMean = (coords[len - 1][3] - coords[0][3]) / (len - 1);
  }

  const html = [
    'Position: ' + position[0].toFixed(2) + ', ' + position[1].toFixed(2),
    'Accuracy: ' + accuracy,
    'Heading: ' + Math.round(radToDeg(heading)) + '&deg;',
    'Speed: ' + (speed * 3.6).toFixed(1) + ' km/h',
    'Delta: ' + Math.round(deltaMean) + 'ms',
  ].join('<br />');
  document.getElementById('info').innerHTML = html;
});

geolocation.on('error', function () {
  alert('geolocation error');
  // FIXME we should remove the coordinates in positions
});

// Convert radians to degrees
// 弧度转角度辅助函数
function radToDeg(rad) {
  return (rad * 360) / (Math.PI * 2);
}
// Convert degrees to radians
// 角度转弧度辅助函数
function degToRad(deg) {
  return (deg * Math.PI * 2) / 360;
}
// Modulo for negative values
// 负值取模求余（保证角度归一化在 [0, 2π) 之间）
function mod(n) {
  return ((n % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}

// Append new GPS sample to 4D LineString, handling angle wrapping across 0/2π boundary
// 向 4D 折线追加新的定位采样点，并处理跨越 0 与 2π 边界时的旋转角度跳跃
function addPosition(position, heading, m, speed) {
  const x = position[0];
  const y = position[1];
  const fCoords = positions.getCoordinates();
  const previous = fCoords[fCoords.length - 1];
  const prevHeading = previous && previous[2];
  if (prevHeading) {
    let headingDiff = heading - mod(prevHeading);

    // Force the rotation change to be less than 180° for shortest-path rotation interpolation
    // 强制旋转角度差在 [-π, π] 以内，实现最短路径平滑旋转插值
    if (Math.abs(headingDiff) > Math.PI) {
      const sign = headingDiff >= 0 ? 1 : -1;
      headingDiff = -sign * (2 * Math.PI - Math.abs(headingDiff));
    }
    heading = prevHeading + headingDiff;
  }
  positions.appendCoordinate([x, y, heading, m]);

  // Only keep the 20 last coordinates to maintain a lightweight sliding window
  // 维护滑动窗口：仅保留最近的 20 个时序采样点
  positions.setCoordinates(positions.getCoordinates().slice(-20));

  // Switch between heading arrow icon and stationary dot icon
  // 根据运动状态切换图标：移动时显示带箭头的航向车头图标，静止时显示普通圆点
  if (heading && speed) {
    markerEl.src = 'data/geolocation_marker_heading.png';
  } else {
    markerEl.src = 'data/geolocation_marker.png';
  }
}

// Recenters the view by putting the vehicle at 3/4 from the top of the screen (car navigation perspective)
// 车辆导航视角偏移：将车辆位置偏置在屏幕下方 1/4 处，前方保留 3/4 视野
function getCenterWithHeading(position, rotation, resolution) {
  const size = map.getSize();
  const height = size[1];

  return [
    position[0] - (Math.sin(rotation) * height * resolution * 1) / 4,
    position[1] + (Math.cos(rotation) * height * resolution * 1) / 4,
  ];
}

let previousM = 0;
// Frame-by-frame interpolation update hook triggered during map rendering
// 逐帧时间插值更新函数：挂载在图层的 postrender 钩子上以获得无卡顿平滑运动
function updateView() {
  // Use sampling period to get a smooth transition
  // 利用延迟 1.5 倍采样周期的时间戳执行历史轨迹插值，消除网络抖动引起的跳帧
  let m = Date.now() - deltaMean * 1.5;
  m = Math.max(m, previousM);
  previousM = m;
  // Interpolate position along the 4D positions LineString
  // 在 4D 折线几何体上根据时间戳 m 进行连续空间位置与航向角插值
  const c = positions.getCoordinateAtM(m, true);
  if (c) {
    view.setCenter(getCenterWithHeading(c, -c[2], view.getResolution()));
    view.setRotation(-c[2]);
    marker.setPosition(c);
    map.render();
  }
}

// Geolocate real device
// 点击“开启实时定位”按钮：启动物理硬件传感器并激活地图逐帧平滑刷新
const geolocateBtn = document.getElementById('geolocate');
geolocateBtn.addEventListener(
  'click',
  function () {
    geolocation.setTracking(true); // Start position tracking / 启动位置监听

    tileLayer.on('postrender', updateView);
    map.render();

    disableButtons();
  },
  false,
);

// Load recorded real GPS trace data for simulation testing
// 加载录制的真实 GPS 时序轨迹数据用于脱机模拟回放测试
let simulationData;
const client = new XMLHttpRequest();
client.open('GET', 'data/geolocation-orientation.json');

/**
 * Handle data loading.
 * 解析模拟轨迹 JSON 数据
 */
client.onload = function () {
  simulationData = JSON.parse(client.responseText).data;
};
client.send();

// Click "Simulate" to replay the recorded trajectory step by step
// 点击“轨迹模拟”按钮：按真实时间差逐步回放录制的驾驶轨迹
const simulateBtn = document.getElementById('simulate');
simulateBtn.addEventListener(
  'click',
  function () {
    const coordinates = simulationData;

    const first = coordinates.shift();
    simulatePositionChange(first);

    let prevDate = first.timestamp;
    function geolocate() {
      const position = coordinates.shift();
      if (!position) {
        return;
      }
      const newDate = position.timestamp;
      simulatePositionChange(position);
      window.setTimeout(
        function () {
          prevDate = newDate;
          geolocate();
        },
        (newDate - prevDate) / 0.5,
      );
    }
    geolocate();

    tileLayer.on('postrender', updateView);
    map.render();

    disableButtons();
  },
  false,
);

// Inject simulated GPS coordinates, heading and speed into the Geolocation instance
// 将模拟点位信息（经纬度投影坐标、航向角、精度、速度）注入 Geolocation 控制器
function simulatePositionChange(position) {
  const coords = position.coords;
  geolocation.set('accuracy', coords.accuracy);
  geolocation.set('heading', degToRad(coords.heading));
  const projectedPosition = fromLonLat([coords.longitude, coords.latitude]);
  geolocation.set('position', projectedPosition);
  geolocation.set('speed', coords.speed);
  geolocation.changed();
}

function disableButtons() {
  geolocateBtn.disabled = true;
  simulateBtn.disabled = true;
}
