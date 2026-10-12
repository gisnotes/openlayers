import colormap from 'colormap';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import {DEVICE_PIXEL_RATIO} from '../src/ol/has.js';
import Flow from '../src/ol/layer/Flow.js';
import WebGLVectorLayer from '../src/ol/layer/WebGLVector.js';
import {get as getProjection, transform} from '../src/ol/proj.js';
import DataTileSource from '../src/ol/source/DataTile.js';
import VectorSource from '../src/ol/source/Vector.js';
import {createXYZ, wrapX} from '../src/ol/tilegrid.js';

// 1. 异步加载编码了全球风速场的 PNG 图像（360x180 像素，R 通道存东西向风速 U，G 通道存南北向风速 V），
// 并通过离屏 Canvas 提取其底层的 RGBA 像素字节数组（Uint8ClampedArray）
const windData = new Promise((resolve, reject) => {
  const image = new Image();
  image.onload = () => {
    const canvas = document.createElement('canvas');
    const width = image.width;
    const height = image.height;
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    const data = context.getImageData(0, 0, width, height).data;
    resolve({data, width, height});
  };
  image.onerror = () => {
    reject(new Error('failed to load'));
  };
  image.src = './data/wind.png';
});

/**
 * 标量双线性插值函数：根据水平与垂直方向的小数偏移权重（xAlong, yAlong），对四个相邻格点值进行平滑插值
 * @param {number} xAlong 水平方向距离左格点的小数比例 [0, 1)
 * @param {number} yAlong 垂直方向距离上格点的小数比例 [0, 1)
 * @param {number} v11 左上角格点值
 * @param {number} v21 右上角格点值
 * @param {number} v12 左下角格点值
 * @param {number} v22 右下角格点值
 * @return {number} 插值后的平滑数值
 */
function bilinearInterpolation(xAlong, yAlong, v11, v21, v12, v22) {
  const q11 = (1 - xAlong) * (1 - yAlong) * v11;
  const q21 = xAlong * (1 - yAlong) * v21;
  const q12 = (1 - xAlong) * yAlong * v12;
  const q22 = xAlong * yAlong * v22;
  return q11 + q21 + q12 + q22;
}

/**
 * 对多波段像素数组（如 [R, G]）的每个通道分别执行双线性插值
 * @param {number} xAlong 水平插值权重
 * @param {number} yAlong 垂直插值权重
 * @param {Array<number>} p11 左上像素通道数组
 * @param {Array<number>} p21 右上像素通道数组
 * @param {Array<number>} p12 左下像素通道数组
 * @param {Array<number>} p22 右下像素通道数组
 * @return {Array<number>} 插值后的通道数组
 */
function interpolatePixels(xAlong, yAlong, p11, p21, p12, p22) {
  return p11.map((_, i) =>
    bilinearInterpolation(xAlong, yAlong, p11[i], p21[i], p12[i], p22[i]),
  );
}

// 定义数据瓦片的标准 XYZ 瓦片网格与尺寸（256x256）
const dataTileGrid = createXYZ();
const dataTileSize = 256;

// 输入 PNG 风场图为等经纬度投影（EPSG:4326），输出的数据瓦片为 Web Mercator 投影（EPSG:3857）
const inputImageProjection = getProjection('EPSG:4326');
const dataTileProjection = getProjection('EPSG:3857');

const inputBands = 4; // Canvas getImageData 提取的输入数组每个像素含 R, G, B, A 共 4 个字节
const dataBands = 3; // 输出给 DataTile 的每个像素含 3 个 Float32 通道（前两个通道存 U 和 V）

// 物理风速范围常量（单位：m/s）：
// 在 ./data/wind.png 中，这些真实物理风速被线性压缩映射到了 0 ~ 255 的整数区间
const minU = -21.32; // 最小东西向风速（负值代表向西吹）
const maxU = 26.8; // 最大东西向风速（正值代表向东吹）
const deltaU = maxU - minU;
const minV = -21.57; // 最小南北向风速（负值代表向南吹）
const maxV = 21.42; // 最大南北向风速（正值代表向北吹）
const deltaV = maxV - minV;

// 2. 创建自定义风场数据瓦片源（DataTileSource）：按需为每个 (z, x, y) 瓦片生成浮点型 (U, V) 速度场矩阵
const wind = new DataTileSource({
  // 瓦片淡入过渡动画必须设为 0（参见 https://github.com/openlayers/openlayers/issues/16119）
  transition: 0,
  wrapX: true,
  async loader(z, x, y) {
    const {
      data: inputData,
      width: inputWidth,
      height: inputHeight,
    } = await windData;

    // 处理跨越 ±180° 日界线的瓦片坐标环绕，并获取当前瓦片的地理范围与分辨率
    const tileCoord = wrapX(dataTileGrid, [z, x, y], dataTileProjection);
    const extent = dataTileGrid.getTileCoordExtent(tileCoord);
    const resolution = dataTileGrid.getResolution(z);
    // 创建 Float32Array 存储 256x256 瓦片内所有像素的风速向量
    const data = new Float32Array(dataTileSize * dataTileSize * dataBands);

    // 逐行逐列遍历当前瓦片的 256x256 个像素
    for (let row = 0; row < dataTileSize; ++row) {
      let offset = row * dataTileSize * dataBands;
      const mapY = extent[3] - row * resolution;
      for (let col = 0; col < dataTileSize; ++col) {
        const mapX = extent[0] + col * resolution;
        // 将当前像素的 EPSG:3857 坐标反算为 EPSG:4326 经纬度 [lon, lat]
        const [lon, lat] = transform(
          [mapX, mapY],
          dataTileProjection,
          inputImageProjection,
        );

        // 根据经度 lon ∈ [-180, 180] 计算在输入图像水平方向上的浮点像素坐标 x 及左右相邻格点 x1, x2
        const x = (inputWidth * (lon + 180)) / 360;
        let x1 = Math.floor(x);
        let x2 = Math.ceil(x);
        const xAlong = x - x1;
        if (x1 < 0) {
          x1 += inputWidth;
        }
        if (x2 >= inputWidth) {
          x2 -= inputWidth;
        }

        // 根据纬度 lat ∈ [-90, 90] 计算在输入图像垂直方向上的浮点像素坐标 y 及上下相邻格点 y1, y2
        const y = (inputHeight * (90 - lat)) / 180;
        let y1 = Math.floor(y);
        let y2 = Math.ceil(y);
        const yAlong = y - y1;
        if (y1 < 0) {
          y1 = 0;
        }
        if (y2 >= inputHeight) {
          y2 = inputHeight - 1;
        }

        // 周围四个格点的像素坐标
        const corners = [
          [x1, y1],
          [x2, y1],
          [x1, y2],
          [x2, y2],
        ];

        // 读取四个角点像素的 R（对应 U）和 G（对应 V）通道值
        const pixels = corners.map(([cx, cy]) => {
          const inputOffset = (cy * 360 + cx) * inputBands;
          return [inputData[inputOffset], inputData[inputOffset + 1]];
        });

        // 执行双线性插值，并将 [0, 255] 的量化值线性还原为真实的物理风速 u, v（单位：m/s）
        const interpolated = interpolatePixels(xAlong, yAlong, ...pixels);
        const u = minU + (deltaU * interpolated[0]) / 255;
        const v = minV + (deltaV * interpolated[1]) / 255;

        // 写入数据瓦片的第 1 波段（u）和第 2 波段（v）
        data[offset] = u;
        data[offset + 1] = v;
        offset += dataBands;
      }
    }
    return data;
  },
});

// 3. 构建风速渐变色阶（使用 viridis 色带，将 0 ~ 20 m/s 的风速映射为 10 级渐变颜色）
const maxSpeed = 20;
const colors = colormap({
  colormap: 'viridis',
  nshades: 10,
  alpha: 0.75,
  format: 'rgba',
});
const colorStops = [];
for (let i = 0; i < colors.length; ++i) {
  colorStops.push((i * maxSpeed) / (colors.length - 1));
  colorStops.push(colors[i]);
}

// 4. 初始化地图：底层使用 WebGLVectorLayer 渲染深灰色全球海洋多边形，上层叠加 Flow 风场粒子图层
const map = new Map({
  target: 'map',
  pixelRatio: Math.min(DEVICE_PIXEL_RATIO, 2),
  layers: [
    new WebGLVectorLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ocean.json',
        format: new GeoJSON(),
      }),
      style: {
        'fill-color': '#555555',
      },
    }),
    new Flow({
      source: wind,
      maxSpeed,
      style: {
        // 根据 Flow 图层内部自动计算的合成标量风速 ['get', 'speed'] 进行线性颜色插值
        color: ['interpolate', ['linear'], ['get', 'speed'], ...colorStops],
      },
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 0,
  }),
});
