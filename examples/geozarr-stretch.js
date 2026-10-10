import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
} from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoZarr from '../src/ol/source/GeoZarr.js';
import OSM from '../src/ol/source/OSM.js';

// Define the 3 RGB output color channels and bind UI event listeners
// 定义红、绿、蓝三个输出颜色通道，并为对应的下拉选择框和拉伸滑块绑定事件监听
const channels = ['red', 'green', 'blue'];
for (const channel of channels) {
  const selector = document.getElementById(channel);
  selector.addEventListener('change', update);

  const input = document.getElementById(`${channel}Max`);
  input.addEventListener('input', update);
}

/**
 * Read current band selection and contrast stretch max thresholds (float values 0.2~0.5) from DOM
 * 从页面 DOM 控件中读取当前用户选择的波段序号以及各通道的对比度拉伸上限（0.2~0.5 浮点数）
 * @return {Object<string, number>} Style variables object / 样式变量键值对象
 */
function getVariables() {
  const variables = {};
  for (const channel of channels) {
    const selector = document.getElementById(channel);
    variables[channel] = parseFloat(selector.value);

    const inputId = `${channel}Max`;
    const input = document.getElementById(inputId);
    variables[inputId] = parseFloat(input.value);
  }
  return variables;
}

// Create a GeoZarr source loading 4 bands from ESA Copernicus EOPF Sentinel-2 L2A reflectance store
// 创建 GeoZarr 数据源，从欧空局哥白尼 EOPF 哨兵 2 号 L2A 级地表反射率存储中按需加载 4 个波段：
// b04 (红光 -> band 1), b03 (绿光 -> band 2), b02 (蓝光 -> band 3), b11 (短波红外 SWIR -> band 4)
const source = new GeoZarr({
  url: 'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance',
  bands: ['b04', 'b03', 'b02', 'b11'],
});

// Create a WebGLTile layer to render the GeoZarr bands on GPU with gamma correction and contrast stretch
// 创建 WebGLTile 图层，在 GPU 着色器中应用伽马校正（gamma: 1.5）与动态对比度拉伸表达式
const layer = new TileLayer({
  style: {
    variables: getVariables(),
    gamma: 1.5, // Apply gamma correction to brighten mid-tones / 应用 1.5 倍伽马校正以提亮遥感影像中间调
    color: [
      'array',
      ['/', ['band', ['var', 'red']], ['var', 'redMax']],
      ['/', ['band', ['var', 'green']], ['var', 'greenMax']],
      ['/', ['band', ['var', 'blue']], ['var', 'blueMax']],
      1,
    ],
  },
  source,
});

/**
 * Update WebGL shader uniform variables in real-time without recompiling the shader
 * 实时更新 WebGL 着色器中的 uniform 样式变量（无需重新编译 Shader 或重新请求分块）
 */
function update() {
  layer.updateStyleVariables(getVariables());
}

// Initialize the map with an OSM basemap and resolve the view asynchronously from the GeoZarr source
// 初始化地图（叠加在 OSM 底图之上），并通过函数式管道从 GeoZarr 数据源自动推导视图配置：
// - withHigherResolutions(2): 追加 2 个更高分辨率层级以支持超分辨率放大
// - withExtentCenter(): 将中心点对准数据范围中心，并解除范围锁定以便自由浏览周边底图
const map = new Map({
  target: 'map',
  layers: [new TileLayer({source: new OSM()}), layer],
  view: getView(source, withHigherResolutions(2), withExtentCenter()),
});
