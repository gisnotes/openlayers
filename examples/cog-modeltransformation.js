import proj4 from 'proj4';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import {transformExtent} from '../src/ol/proj.js';
import {fromEPSGCode, register} from '../src/ol/proj/proj4.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';
import OSM from '../src/ol/source/OSM.js';
import TileDebug from '../src/ol/source/TileDebug.js';

// Register proj4 with OpenLayers projection system
// 将 proj4 实例注册到 OpenLayers 投影体系
register(proj4);

// Create GeoTIFF source pointing to Umbra synthetic aperture radar (SAR) GEC image.
// This image contains a ModelTransformation tag defining affine skew/rotation.
// 创建 COG 数据源，加载来自 Umbra 开放数据目录的高分辨率合成孔径雷达（SAR）GEC 级影像。
// 该 GeoTIFF 文件内部嵌入了 ModelTransformation 标签，定义了包含旋转与倾斜的像元仿射映射关系。
const cogSource = new GeoTIFF({
  sources: [
    {
      url:
        'https://umbra-open-data-catalog.s3.amazonaws.com/sar-data/tasks/Tanna%20Island,%20Vanuatu/' +
        '9c76a918-9247-42bf-b9f6-3b4f672bc148/2023-02-12-21-33-56_UMBRA-04/2023-02-12-21-33-56_UMBRA-04_GEC.tif',
    },
  ],
});

// Tile debug layer: by providing source: cogSource, TileDebug adopts the affine matrix of the COG,
// rendering rotated tile boundaries and indices directly on the map.
// 瓦片调试图层：通过传入 source: cogSource，TileDebug 将自动应用 COG 的 ModelTransformation 仿射矩阵，
// 在倾斜旋转的瓦片边界上精准绘制原始网格及层级编号。
const showTilesCheckbox = document.getElementById('show-tiles');
const debugLayer = new TileLayer({
  source: new TileDebug({source: cogSource}),
  visible: showTilesCheckbox.checked,
});
showTilesCheckbox.addEventListener('change', () => {
  debugLayer.setVisible(showTilesCheckbox.checked);
});

// Initialize map instance
// 初始化地图实例
const map = new Map({
  target: 'map',
  layers: [
    // Base OSM layer / 基础 OSM 底图
    new TileLayer({
      source: new OSM(),
    }),
    // WebGL accelerated COG layer / WebGL 硬件加速 COG 图层
    new TileLayer({
      source: cogSource,
      opacity: 0.8,
    }),
    debugLayer,
  ],
  view: new View(),
});

// Asynchronously resolve COG metadata and fit view to the image extent
// 异步解析 COG 元数据并自动将视口调整至影像外包范围
cogSource.getView().then((viewConfig) =>
  fromEPSGCode(viewConfig.projection.getCode()).then(() => {
    const view = map.getView();
    view.fit(
      transformExtent(
        viewConfig.extent,
        viewConfig.projection,
        view.getProjection(),
      ),
    );
  }),
);
