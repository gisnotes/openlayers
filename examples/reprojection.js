import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {getCenter, getWidth} from '../src/ol/extent.js';
import WMTSCapabilities from '../src/ol/format/WMTSCapabilities.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {get as getProjection, transformExtent} from '../src/ol/proj.js';
import {register} from '../src/ol/proj/proj4.js';
import OSM from '../src/ol/source/OSM.js';
import TileImage from '../src/ol/source/TileImage.js';
import TileWMS from '../src/ol/source/TileWMS.js';
import WMTS, {optionsFromCapabilities} from '../src/ol/source/WMTS.js';
import {createXYZ} from '../src/ol/tilegrid.js';
import TileGrid from '../src/ol/tilegrid/TileGrid.js';

// Register representative map projection definitions with Proj4js:
// 向 Proj4js 注册多种典型地理投影坐标系：
// 1. EPSG:27700 - British National Grid (Transverse Mercator / Airy ellipsoid)
// 1. EPSG:27700 - 英国国家格网 (British National Grid, 横轴墨卡托 / Airy 椭球)
proj4.defs(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 ' +
    '+x_0=400000 +y_0=-100000 +ellps=airy ' +
    '+towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 ' +
    '+units=m +no_defs',
);
// 2. EPSG:23032 - European Datum 1950 UTM Zone 32N
// 2. EPSG:23032 - 欧洲 1950 基准 UTM 32N 分带 (ED50 / UTM zone 32N)
proj4.defs(
  'EPSG:23032',
  '+proj=utm +zone=32 +ellps=intl ' +
    '+towgs84=-87,-98,-121,0,0,0,0 +units=m +no_defs',
);
// 3. EPSG:5479 - Ross Sea Region Geodetic Datum Lambert Conformal Conic
// 3. EPSG:5479 - 罗斯海属地南极兰勃特等角圆锥投影 (RSRGD2000 / MSLC2000)
proj4.defs(
  'EPSG:5479',
  '+proj=lcc +lat_1=-76.66666666666667 +lat_2=' +
    '-79.33333333333333 +lat_0=-78 +lon_0=163 +x_0=7000000 +y_0=5000000 ' +
    '+ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
);
// 4. EPSG:21781 - Swiss Oblique Mercator (CH1903 / LV03)
// 4. EPSG:21781 - 瑞士旧国家投影 (CH1903 / LV03，斜轴等角圆柱投影 / 贝塞尔椭球)
proj4.defs(
  'EPSG:21781',
  '+proj=somerc +lat_0=46.95240555555556 ' +
    '+lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel ' +
    '+towgs84=674.4,15.1,405.3,0,0,0,0 +units=m +no_defs',
);
// 5. EPSG:3413 - NSIDC Polar Stereographic North
// 5. EPSG:3413 - 美国冰雪数据中心北极极射赤平投影 (NSIDC Polar Stereographic North)
proj4.defs(
  'EPSG:3413',
  '+proj=stere +lat_0=90 +lat_ts=70 +lon_0=-45 +k=1 ' +
    '+x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs',
);
// 6. EPSG:2163 - US National Atlas Equal Area
// 6. EPSG:2163 - 美国国家地图集兰勃特方位等积投影 (US National Atlas Equal Area)
proj4.defs(
  'EPSG:2163',
  '+proj=laea +lat_0=45 +lon_0=-100 +x_0=0 +y_0=0 ' +
    '+a=6370997 +b=6370997 +units=m +no_defs',
);
// 7. ESRI:54009 - World Mollweide equal-area projection
// 7. ESRI:54009 - 全球摩尔威特等面积伪圆柱投影 (World Mollweide)
proj4.defs(
  'ESRI:54009',
  '+proj=moll +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 ' + '+units=m +no_defs',
);
// Synchronize definitions with OpenLayers projection registry
// 同步注册到 OpenLayers 投影表
register(proj4);

// Set valid geographic bounding boxes (Extent) for each projection to avoid out-of-domain errors
// 设置各投影在地理上的合法有效包围盒（Extent），避免超出投影数学定义域
const proj27700 = getProjection('EPSG:27700');
proj27700.setExtent([-650000, -150000, 1350000, 1450000]);

const proj23032 = getProjection('EPSG:23032');
proj23032.setExtent([-1206118.71, 4021309.92, 1295389.0, 8051813.28]);

const proj5479 = getProjection('EPSG:5479');
proj5479.setExtent([6825737.53, 4189159.8, 9633741.96, 5782472.71]);

const proj21781 = getProjection('EPSG:21781');
proj21781.setExtent([485071.54, 75346.36, 828515.78, 299941.84]);

const proj3413 = getProjection('EPSG:3413');
proj3413.setExtent([-4194304, -4194304, 4194304, 4194304]);

const proj2163 = getProjection('EPSG:2163');
proj2163.setExtent([-8040784.5135, -2577524.921, 3668901.4484, 4785105.1096]);

const proj54009 = getProjection('ESRI:54009');
proj54009.setExtent([-18e6, -9e6, 18e6, 9e6]);

// Layer dictionary
// 图层对象字典
const layers = {};

// Base layer 1: OSM standard Spherical Mercator tiles (EPSG:3857)
// 底图 1：OSM 标准墨卡托瓦片 (EPSG:3857)
layers['osm'] = new TileLayer({
  source: new OSM(),
});

// Base layer 2: GeoServer global Natural Earth WMS tiles in WGS 84 (EPSG:4326)
// 底图 2：GeoServer 全球 Natural Earth 地表切片 WMS (EPSG:4326)
layers['wms4326'] = new TileLayer({
  source: new TileWMS({
    url: 'https://ahocevar.com/geoserver/gwc/service/wms',
    crossOrigin: '',
    params: {
      'LAYERS': 'ne:NE1_HR_LC_SR_W_DR',
      'TILED': true,
      'VERSION': '1.1.1',
    },
    projection: 'EPSG:4326',
    // Source tile grid definition before reprojection (512px tiles)
    // 重投影前的源切片网格定义（512 像素大瓦片，全经纬范围）
    tileGrid: createXYZ({
      extent: [-180, -90, 180, 90],
      maxResolution: 360 / 512,
      maxZoom: 10,
    }),
    // Reprojection error tolerance in pixels (higher tolerance reduces triangular mesh subdivisions)
    // 重投影误差容限设为 2 像素（调大容限可显著减少三角形网格细分，提升重投影性能）
    reprojectionErrorThreshold: 2,
  }),
});

// Overlay 1: Swisstopo 1:1,000,000 WMS tiles in Swiss national grid (EPSG:21781)
// 叠加层 1：瑞士联邦地形局 1:1,000,000 彩色切片地图 (EPSG:21781)
layers['wms21781'] = new TileLayer({
  source: new TileWMS({
    attributions:
      '© <a href="https://shop.swisstopo.admin.ch/en/products/maps/national/lk1000"' +
      'target="_blank">Pixelmap 1:1000000 / geo.admin.ch</a>',
    crossOrigin: 'anonymous',
    params: {
      'LAYERS': 'ch.swisstopo.pixelkarte-farbe-pk1000.noscale',
      'FORMAT': 'image/jpeg',
    },
    url: 'https://wms.geo.admin.ch/',
    projection: 'EPSG:21781',
  }),
});

// Overlay 2: NASA Earthdata Arctic WMTS imagery (EPSG:3413)
// 叠加层 2：NASA Earthdata 北极冰貌 WMTS 影像 (EPSG:3413)
const parser = new WMTSCapabilities();
layers['wmts3413'] = new TileLayer();
const urlA =
  'https://map1.vis.earthdata.nasa.gov/wmts-arctic/' +
  'wmts.cgi?SERVICE=WMTS&request=GetCapabilities';
fetch(urlA)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    // Asynchronously parse GetCapabilities XML to configure WMTS source
    // 异步解析 GetCapabilities XML 并根据指定图层与矩阵集推导配置
    const result = parser.read(text);
    const options = optionsFromCapabilities(result, {
      layer: 'OSM_Land_Mask',
      matrixSet: 'EPSG3413_250m',
    });
    options.crossOrigin = '';
    options.projection = 'EPSG:3413';
    options.wrapX = false;
    layers['wmts3413'].setSource(new WMTS(options));
  });

// Overlay 3: Ordnance Survey Open Raster WMTS (EPSG:27700)
// 叠加层 3：英国国家测绘局 ArcGIS WMTS 开放栅格图 (EPSG:27700)
layers['bng'] = new TileLayer();
const urlB =
  'https://tiles.arcgis.com/tiles/qHLhLQrcvEnxjtPr/arcgis/rest/services/OS_Open_Raster/MapServer/WMTS';
fetch(urlB)
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    const result = parser.read(text);
    const options = optionsFromCapabilities(result, {
      layer: 'OS_Open_Raster',
    });
    options.attributions =
      'Contains OS data © Crown Copyright and database right ' +
      new Date().getFullYear();
    options.crossOrigin = '';
    options.projection = 'EPSG:27700';
    options.wrapX = false;
    layers['bng'].setSource(new WMTS(options));
  });

// Calculate standard resolution steps in EPSG:3857 for 22 zoom levels
// 计算 3857 投影下的标准切片分辨率阶梯（共 22 级）
const startResolution = getWidth(getProjection('EPSG:3857').getExtent()) / 256;
const resolutions = new Array(22);
for (let i = 0, ii = resolutions.length; i < ii; ++i) {
  resolutions[i] = startResolution / Math.pow(2, i);
}

// Overlay 4: GeoServer US States WMS tile layer (EPSG:3857)
// 叠加层 4：GeoServer 美国本土州界 WMS 切片图层 (EPSG:3857)
layers['states'] = new TileLayer({
  source: new TileWMS({
    url: 'https://ahocevar.com/geoserver/wms',
    crossOrigin: '',
    params: {'LAYERS': 'topp:states'},
    serverType: 'geoserver',
    tileGrid: new TileGrid({
      extent: [-13884991, 2870341, -7455066, 6338219],
      resolutions: resolutions,
      tileSize: [512, 256],
    }),
    projection: 'EPSG:3857',
  }),
});

// Initialize map instance (default base: OSM, default overlay: British National Grid WMTS)
// 初始化地图实例（默认底图为 OSM，默认叠加层为英国国家格网 WMTS）
const map = new Map({
  layers: [layers['osm'], layers['bng']],
  target: 'map',
  view: new View({
    projection: 'EPSG:3857',
    center: [0, 0],
    zoom: 2,
  }),
});

// UI DOM element references
// UI DOM 元素引用
const baseLayerSelect = document.getElementById('base-layer');
const overlayLayerSelect = document.getElementById('overlay-layer');
const viewProjSelect = document.getElementById('view-projection');
const renderEdgesCheckbox = document.getElementById('render-edges');
let renderEdges = false;

/**
 * Dynamically update map view target projection.
 * Creates a new View and bounds local overlays when switching to global projections to avoid wrapping artifacts.
 * 动态更新地图视图的目标投影
 * 根据用户选取的投影创建全新的 View，并对局域图层设置范围裁剪以防全球视角下产生重影
 */
function updateViewProjection() {
  const newProj = getProjection(viewProjSelect.value);
  const newProjExtent = newProj.getExtent();
  const newView = new View({
    projection: newProj,
    center: getCenter(newProjExtent || [0, 0, 0, 0]),
    zoom: 0,
    extent: newProjExtent || undefined,
  });
  map.setView(newView);

  // When target projection is global, clip local layer extent to prevent multi-world wrapping
  // 关键技巧：当目标投影为全球投影（isGlobal() 为真）时，
  // 将局域图层（英国格网）的外包范围限制为其在目标投影下的转换矩形，防止出现跨球循环重影
  if (newProj.isGlobal()) {
    layers['bng'].setExtent(
      transformExtent(proj27700.getExtent(), proj27700, newProj, 2),
    );
  } else {
    layers['bng'].setExtent(undefined);
  }
}

// Listen to view projection changes
// 监听视图投影下拉切换
viewProjSelect.onchange = function () {
  updateViewProjection();
};

// Initialize view projection
// 初始化视图投影
updateViewProjection();

/**
 * Synchronize renderReprojectionEdges setting on a tile layer
 * 同步更新图层上的重投影三角网边缘渲染开关
 * @param {TileLayer} layer Tile layer instance / 瓦片图层对象
 */
const updateRenderEdgesOnLayer = function (layer) {
  if (layer instanceof TileLayer) {
    const source = layer.getSource();
    if (source instanceof TileImage) {
      source.setRenderReprojectionEdges(renderEdges);
    }
  }
};

// Listen to base layer selection
// 监听底图切换
baseLayerSelect.onchange = function () {
  const layer = layers[baseLayerSelect.value];
  if (layer) {
    layer.setOpacity(1);
    updateRenderEdgesOnLayer(layer);
    map.getLayers().setAt(0, layer);
  }
};

// Listen to overlay layer selection
// 监听叠加业务图层切换
overlayLayerSelect.onchange = function () {
  const layer = layers[overlayLayerSelect.value];
  if (layer) {
    layer.setOpacity(0.7);
    updateRenderEdgesOnLayer(layer);
    map.getLayers().setAt(1, layer);
  }
};

// Toggle reprojection mesh edges
// 监听重投影三角网边缘显示复选框
renderEdgesCheckbox.onchange = function () {
  renderEdges = renderEdgesCheckbox.checked;
  map.getLayers().forEach(function (layer) {
    updateRenderEdgesOnLayer(layer);
  });
};
