import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoTIFF from '../src/ol/source/GeoTIFF.js';

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
 * Read current band selection and contrast stretch max thresholds from DOM inputs
 * 从页面 DOM 控件中读取当前用户选择的波段编号以及各通道的对比度拉伸上限值
 * @return {Object<string, number>} Style variables object / 样式变量键值对象
 */
function getVariables() {
  const variables = {};
  for (const channel of channels) {
    const selector = document.getElementById(channel);
    variables[channel] = parseInt(selector.value, 10);

    const inputId = `${channel}Max`;
    const input = document.getElementById(inputId);
    variables[inputId] = parseInt(input.value, 10);
  }
  return variables;
}

// Create a WebGLTile layer to render 16-bit Sentinel-2 Cloud-Optimized GeoTIFF (COG) on GPU
// 创建 WebGLTile 瓦片图层，利用 GPU 着色器实时渲染 16 位哨兵 2 号云优化 GeoTIFF 遥感影像
const layer = new TileLayer({
  style: {
    // Initialize dynamic uniform variables passed into the WebGL fragment shader
    // 初始化传入 WebGL 片元着色器的动态 uniform 变量字典
    variables: getVariables(),
    // Construct a 4-element RGBA color array [R, G, B, Alpha] with values normalized to [0.0, 1.0]
    // 构造 [R, G, B, Alpha] 四维颜色数组，通过除法 ['/', 波段原始值, 拉伸上限] 将反射率线性拉伸到 [0, 1] 区间
    color: [
      'array',
      ['/', ['band', ['var', 'red']], ['var', 'redMax']],
      ['/', ['band', ['var', 'green']], ['var', 'greenMax']],
      ['/', ['band', ['var', 'blue']], ['var', 'blueMax']],
      1,
    ],
  },
  source: new GeoTIFF({
    // Disable default [0, 65535] -> [0, 1] auto-normalization to preserve raw 16-bit reflectance values
    // 关闭默认的自动归一化，保留原始 16 位传感器反射率数值（0~3000+），以便在上面的着色器中手动执行对比度拉伸
    normalize: false,
    sources: [
      {
        url: 'https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/exploitation-ready-epsg-4326/exploitation-ready_eoxcloudless-sentinel-2-2025_zoom-4_4bands_16bit.tif',
      },
    ],
  }),
});

/**
 * Update WebGL shader uniform variables in real-time without recompiling the shader
 * 实时更新 WebGL 着色器中的样式变量（无需重新编译 Shader 或重新请求瓦片）
 */
function update() {
  layer.updateStyleVariables(getVariables());
}

// Initialize the map in EPSG:4326 geographic projection matching the COG source
// 初始化地图，使用与源 GeoTIFF 一致的 EPSG:4326 经纬度投影坐标系
const map = new Map({
  target: 'map',
  layers: [layer],
  view: new View({
    projection: 'EPSG:4326',
    center: [0, 0],
    zoom: 2,
    maxZoom: 6,
  }),
});
