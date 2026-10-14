import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import ScaleLine from '../src/ol/control/ScaleLine.js';
import {defaults as defaultControls} from '../src/ol/control/defaults.js';
import TileLayer from '../src/ol/layer/Tile.js';
import {
  getPointResolution,
  get as getProjection,
  transform,
} from '../src/ol/proj.js';
import OSM from '../src/ol/source/OSM.js';

// Get projection selector element and initial projection
// 获取页面上的投影下拉选择框元素以及初始选中的投影对象
const viewProjSelect = document.getElementById('view-projection');
const projection = getProjection(viewProjSelect.value);

// Configure a segmented metric scale bar control with text labels
// 配置带分段刻度和距离数值标注的公制比例尺控件
const scaleControl = new ScaleLine({
  units: 'metric',
  bar: true,
  steps: 4,
  text: true,
  minWidth: 140,
});

// Initialize the map with default controls + ScaleLine and OpenStreetMap base layer
// 初始化地图实例，配置默认控件并挂载比例尺控件，底图使用标准 OSM 瓦片
const map = new Map({
  controls: defaultControls().extend([scaleControl]),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  target: 'map',
  view: new View({
    // Transform coordinates [0, 52] from EPSG:4326 to the initial projection
    // 将坐标点 [0, 52] 从 EPSG:4326 转换为当前视图初始投影下的坐标
    center: transform([0, 52], 'EPSG:4326', projection),
    zoom: 6,
    projection: projection,
  }),
});

/**
 * Handle projection change while keeping the physical ground scale identical
 * 监听投影切换事件，在转换视图坐标系的同时精准维持地表真实比例尺不变
 */
function onChangeProjection() {
  const currentView = map.getView();
  const currentProjection = currentView.getProjection();
  const newProjection = getProjection(viewProjSelect.value);
  const currentResolution = currentView.getResolution();
  const currentCenter = currentView.getCenter();
  const currentRotation = currentView.getRotation();

  // 1. Transform view center coordinates to the target projection
  // 1. 将当前视图中心点坐标转换到目标投影坐标系
  const newCenter = transform(currentCenter, currentProjection, newProjection);

  // 2. Read meters per nominal projection unit (e.g., 1 for EPSG:3857, ~111319.49 for EPSG:4326)
  // 2. 获取新旧投影每个标称单位对应的米数（例如 EPSG:3857 为 1，EPSG:4326 赤道处约为 111319.49）
  const currentMPU = currentProjection.getMetersPerUnit();
  const newMPU = newProjection.getMetersPerUnit();

  // 3. Compute real-world ground meters per nominal map unit at the respective center latitudes
  // 3. 分别计算当前中心点与目标中心点在真实地表处的点分辨率（消除投影纬度形变影响）
  const currentPointResolution =
    getPointResolution(currentProjection, 1 / currentMPU, currentCenter, 'm') *
    currentMPU;
  const newPointResolution =
    getPointResolution(newProjection, 1 / newMPU, newCenter, 'm') * newMPU;

  // 4. Derive new nominal resolution to maintain the exact same ground scale on screen
  // 4. 计算使屏幕上物理比例尺保持不变的新标称分辨率：(旧标称分辨率 × 旧点分辨率系数) / 新点分辨率系数
  const newResolution =
    (currentResolution * currentPointResolution) / newPointResolution;

  // 5. Construct and apply the new View instance
  // 5. 构造新的 View 实例并替换地图当前视图
  const newView = new View({
    center: newCenter,
    resolution: newResolution,
    rotation: currentRotation,
    projection: newProjection,
  });
  map.setView(newView);
}

// Bind change event to the projection dropdown
// 为投影下拉选择框绑定切换事件
viewProjSelect.addEventListener('change', onChangeProjection);
