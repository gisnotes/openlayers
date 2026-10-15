import {zip} from 'fflate';
import {writeArrayBuffer as writeGeotiff} from 'geotiff';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import {asArray} from '../src/ol/color.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import HeatmapLayer from '../src/ol/layer/Heatmap.js';
import VectorLayer from '../src/ol/layer/Vector.js';
import VectorSource from '../src/ol/source/Vector.js';
import Fill from '../src/ol/style/Fill.js';
import Style from '../src/ol/style/Style.js';

const style = new Style({
  fill: new Fill({
    color: '#eeeeee',
  }),
});

const map = new Map({
  layers: [
    new VectorLayer({
      source: new VectorSource({
        url: 'https://openlayers.org/data/vector/ecoregions.json',
        format: new GeoJSON(),
      }),
      background: 'white',
      style: function (feature) {
        const color = asArray(feature.get('COLOR_NNH') || '#eeeeee');
        color[3] = 0.75;
        style.getFill().setColor(color);
        return style;
      },
    }),
    new HeatmapLayer({
      source: new VectorSource({
        url: 'data/geojson/world-cities.geojson',
        format: new GeoJSON(),
      }),
      weight: function (feature) {
        return feature.get('population') / 1e7;
      },
      radius: 15,
      blur: 15,
      opacity: 0.75,
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Handle export button click by redirecting map rendering to an offscreen canvas
// 点击导出按钮时，将地图渲染重定向到离屏 Canvas 画布中
document.getElementById('export-map').addEventListener('click', () => {
  const format = document.getElementById('export-format').value;
  const mapCanvas = document.createElement('canvas');
  const size = map.getSize();
  mapCanvas.width = size[0];
  mapCanvas.height = size[1];

  map.setTarget(mapCanvas);
  map.once('rendercomplete', () => {
    const view = map.getView();
    const extent = view.calculateExtent(size);
    const resolution = view.getResolution();
    const projection = view.getProjection();

    if (format === 'geotiff') {
      exportGeoTIFF(mapCanvas, size, extent, resolution, projection);
    } else if (format === 'png') {
      exportPNG(mapCanvas);
    } else if (format === 'png-world') {
      exportPNGWithWorldfile(mapCanvas, extent, resolution);
    }

    // Restore map rendering back to DOM element
    // 将地图重新挂载回 DOM 元素
    map.setTarget('map');
  });
});

// Export canvas as georeferenced GeoTIFF with projection and tiepoint metadata
// 将 Canvas 画布导出为内嵌投影和控制点元数据的 GeoTIFF 文件
function exportGeoTIFF(canvas, size, extent, resolution, projection) {
  const context = canvas.getContext('2d');
  const imageData = context.getImageData(0, 0, size[0], size[1]);
  const epsgCode = projection.getCode().split(':')[1];

  const tiff = writeGeotiff(imageData.data, {
    width: size[0],
    height: size[1],
    ModelPixelScale: [resolution, resolution, 0],
    ModelTiepoint: [0, 0, 0, extent[0], extent[3], 0],
    GTRasterTypeGeoKey: 1,
    ProjectedCSTypeGeoKey: parseInt(epsgCode),
  });

  const blob = new Blob([tiff], {type: 'image/tiff'});
  downloadFile(blob, 'map-export.tiff');
}

// Export canvas as standard PNG image
// 将 Canvas 画布导出为标准 PNG 图片
function exportPNG(canvas) {
  const link = document.createElement('a');
  link.href = canvas.toDataURL('image/png');
  link.download = 'map-export.png';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export canvas as PNG along with a 6-parameter Worldfile (.pgw) compressed into ZIP
// 将 Canvas 导出为 PNG 并附加包含 6 参数的 Worldfile (.pgw)，打包为 ZIP
function exportPNGWithWorldfile(canvas, extent, resolution) {
  // Create worldfile content (A, D, B, E, C, F affine parameters)
  // 创建 Worldfile 纯文本定标内容（A, D, B, E, C, F 仿射六参数）
  const worldfileContent = [
    resolution.toFixed(6), // pixel width / X 方向像素宽度
    '0.000000', // rotation / 旋转项
    '0.000000', // rotation / 旋转项
    (-resolution).toFixed(6), // pixel height (negative) / Y 方向像素高度（负值）
    extent[0].toFixed(6), // upper-left X / 左上角 X 坐标
    extent[3].toFixed(6), // upper-left Y / 左上角 Y 坐标
  ].join('\n');

  // Convert canvas to blob and create zip
  // 将 Canvas 转换为 Blob 并构建 ZIP 压缩文件
  canvas.toBlob((pngBlob) => {
    pngBlob.arrayBuffer().then((pngBuffer) => {
      const files = {
        'map-export.png': [new Uint8Array(pngBuffer), {level: 0}], // level 0 = no compression for PNG
        'map-export.pgw': [
          new TextEncoder().encode(worldfileContent),
          {level: 6},
        ],
      };

      zip(files, (err, data) => {
        if (err) {
          alert('Error creating zip:', err);
          return;
        }
        const zipBlob = new Blob([data], {type: 'application/zip'});
        downloadFile(zipBlob, 'map-export.zip');
      });
    });
  });
}

// Helper to trigger browser file download from Blob
// 辅助函数：触发浏览器从 Blob 下载文件
function downloadFile(blob, filename) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
