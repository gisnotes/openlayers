import {jsPDF} from 'jspdf';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import WKT from '../src/ol/format/WKT.js';
import TileLayer from '../src/ol/layer/Tile.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import OSM from '../src/ol/source/OSM.js';
import VectorSource from '../src/ol/source/Vector.js';

// Base raster layer
// 基础栅格瓦片图层
const raster = new TileLayer({
  source: new OSM(),
});

// Create vector feature from WKT
// 从 WKT 字符串创建矢量要素
const format = new WKT();
const feature = format.readFeature(
  'POLYGON((10.689697265625 -25.0927734375, 34.595947265625 ' +
    '-20.1708984375, 38.814697265625 -35.6396484375, 13.502197265625 ' +
    '-39.1552734375, 10.689697265625 -25.0927734375))',
);
feature.getGeometry().transform('EPSG:4326', 'EPSG:3857');

const vector = new VectorLayer({
  source: new VectorSource({
    features: [feature],
  }),
  opacity: 0.5,
});

// Initialize map
// 初始化地图
const map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Paper dimensions in millimeters
// 标准打印纸张尺寸（单位：毫米）
const dims = {
  a0: [1189, 841],
  a1: [841, 594],
  a2: [594, 420],
  a3: [420, 297],
  a4: [297, 210],
  a5: [210, 148],
};

const exportButton = document.getElementById('export-pdf');

// Handle export PDF click
// 处理导出 PDF 点击事件
exportButton.addEventListener(
  'click',
  function () {
    exportButton.disabled = true;
    document.body.style.cursor = 'progress';

    const format = document.getElementById('format').value;
    const resolution = Number(document.getElementById('resolution').value);
    const dim = dims[format];
    const width = Math.round((dim[0] * resolution) / 25.4);
    const height = Math.round((dim[1] * resolution) / 25.4);
    const size = map.getSize();
    const viewResolution = map.getView().getResolution();

    // Listen for render completion to export image
    // 监听渲染完成事件以导出离屏合成图像
    map.once('rendercomplete', function () {
      const mapCanvas = document.createElement('canvas');
      mapCanvas.width = width;
      mapCanvas.height = height;
      const mapContext = mapCanvas.getContext('2d');
      Array.prototype.forEach.call(
        document.querySelectorAll('.ol-layer canvas'),
        function (canvas) {
          if (canvas.width > 0) {
            const opacity = canvas.parentNode.style.opacity;
            mapContext.globalAlpha = opacity === '' ? 1 : Number(opacity);
            const transform = canvas.style.transform;
            // Get the transform parameters from the style's transform matrix
            // 从 DOM 样式的变换矩阵中提取仿射参数
            const matrix = transform
              .match(/^matrix\(([^\(]*)\)$/)[1]
              .split(',')
              .map(Number);
            // Apply the transform to the export map context
            // 将仿射变换应用到导出画布上下文
            CanvasRenderingContext2D.prototype.setTransform.apply(
              mapContext,
              matrix,
            );
            mapContext.drawImage(canvas, 0, 0);
          }
        },
      );
      mapContext.globalAlpha = 1;
      mapContext.setTransform(1, 0, 0, 1, 0, 0);
      const pdf = new jsPDF('landscape', undefined, format);
      pdf.addImage(
        mapCanvas.toDataURL('image/jpeg'),
        'JPEG',
        0,
        0,
        dim[0],
        dim[1],
      );
      pdf.save('map.pdf');

      // Reset original map size
      // 恢复原始地图尺寸与分辨率
      map.setSize(size);
      map.getView().setResolution(viewResolution);
      exportButton.disabled = false;
      document.body.style.cursor = 'auto';
    });

    // Set print size and scale
    // 临时应用高分辨率打印尺寸与缩放比
    const printSize = [width, height];
    map.setSize(printSize);
    const scaling = Math.min(width / size[0], height / size[1]);
    map.getView().setResolution(viewResolution / scaling);
  },
  false,
);
