import Map from '../src/ol/Map.js';
import {
  getView,
  withExtentCenter,
  withHigherResolutions,
  withLowerResolutions,
  withZoom,
} from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/WebGLTile.js';
import GeoZarr from '../src/ol/source/GeoZarr.js';
import OSM from '../src/ol/source/OSM.js';

// Point the url straight at the cube's `descending` orbit group, which keeps
// this a plain single-group source whose only non-spatial dimension is time.
// 将 URL 直接指向数据立方体的 `descending`（降轨）群组，使其成为单群组数据源且仅包含时间这一非空间维度
const url =
  'https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-1-grd-rtc-staging/s1-rtc-28RBS.zarr/descending';
const source = new GeoZarr({url, bands: ['vv', 'vh']});

// Dual-polarization composite from two geo-bands: VV -> red, VH -> green, and
// their ratio VV/VH -> blue. Radar backscatter is a small float, so each
// channel is rescaled from a fixed [low, high] range to the 0-255 display range.
// 双极化雷达波段合成：VV 极化 -> 红通道，VH 极化 -> 绿通道，比值 VV/VH -> 蓝通道。
// 雷达后向散射系数为微小浮点数，因此每个通道线性拉伸重缩放到 0-255 显示区间。
const style = {
  color: [
    'color',
    ['interpolate', ['linear'], ['band', 1], 0, 0, 0.4, 255], // VV
    ['interpolate', ['linear'], ['band', 2], 0, 0, 0.1, 255], // VH
    ['interpolate', ['linear'], ['/', ['band', 1], ['band', 2]], 1, 0, 15, 255], // VV/VH
  ],
};

const map = new Map({
  target: 'map',
  layers: [new TileLayer({source: new OSM()}), new TileLayer({style, source})],
  view: getView(
    source,
    withLowerResolutions(1),
    withHigherResolutions(2),
    withExtentCenter(),
    withZoom(2),
  ),
});

const slider = document.getElementById('time');
const label = document.getElementById('time-label');

// Read time dimension metadata, sort chronological slices, and bind to slider
// 读取时间维度元数据，按时序排序各个切片，并与时间滑块交互绑定
source
  .getDimensions()
  .then(async ({time}) => {
    const {units} = time.attributes;
    // Units string is formatted as "nanoseconds since 1970-01-01"
    // 单位字符串格式形如 "nanoseconds since 1970-01-01"
    const epoch = Date.parse(units.split(' since ')[1]);
    const toDate = (value) => new Date(epoch + Number(value) / 1e6);

    const slices = await Promise.all(
      [...Array(time.size).keys()].map(async (index) => ({
        index,
        date: toDate(await source.getValue('time', index)),
      })),
    );
    // The cube stores its time slices out of chronological order, so sort them.
    // 数据立方体存储的时间切片可能未按时序排列，执行客户端升序排序
    slices.sort((a, b) => a.date - b.date);

    function showSlice(position) {
      const {index, date} = slices[position];
      // Reload the chosen time slice in place
      // 原地更新数据源时间维度切片（无需重建图层）
      source.updateDimensions({time: index});
      label.textContent = date.toISOString().slice(0, 16).replace('T', ' ');
    }

    slider.max = String(time.size - 1);
    slider.disabled = false;
    slider.addEventListener('input', () => showSlice(Number(slider.value)));
    showSlice(0);
  })
  .catch(
    () =>
      (label.textContent =
        'Failed to load the GeoZarr store. / 加载 GeoZarr 存储失败。'),
  );
