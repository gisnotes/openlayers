import Map from '../src/ol/Map.js';
import Overlay from '../src/ol/Overlay.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import TileJSON from '../src/ol/source/TileJSON.js';
import UTFGrid from '../src/ol/source/UTFGrid.js';

const key =
  'pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ';

// Visual tile layer loading rendered map tiles
// 可视化切片图层：加载渲染好的地理底图
const mapLayer = new TileLayer({
  source: new TileJSON({
    url:
      'https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=' +
      key,
  }),
});

// UTFGrid source loading compact attribute character matrix tiles
// UTFGrid 数据源：同步加载紧凑的字符编码要素属性矩阵切片
const gridSource = new UTFGrid({
  url:
    'https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=' +
    key,
});

const gridLayer = new TileLayer({source: gridSource});

const view = new View({
  center: [0, 0],
  zoom: 1,
});

const mapElement = document.getElementById('map');
const map = new Map({
  layers: [mapLayer, gridLayer],
  target: mapElement,
  view: view,
});

const infoElement = document.getElementById('country-info');
const flagElement = document.getElementById('country-flag');
const nameElement = document.getElementById('country-name');

// Overlay displaying hovered country name and flag icon
// 悬停浮层：展示鼠标悬停处的国家名称与国旗图标
const infoOverlay = new Overlay({
  element: infoElement,
  offset: [15, 15],
  stopEvent: false,
});
map.addOverlay(infoOverlay);

/**
 * Query UTFGrid attribute dictionary by coordinate and update overlay.
 * 根据空间地理坐标与分辨率向 UTFGrid 检索属性数据并更新提示浮层。
 * @param {import("../src/ol/coordinate.js").Coordinate} coordinate Map coordinate.
 */
const displayCountryInfo = function (coordinate) {
  const viewResolution = /** @type {number} */ (view.getResolution());
  gridSource.forDataAtCoordinateAndResolution(
    coordinate,
    viewResolution,
    function (data) {
      mapElement.style.cursor = data ? 'pointer' : '';
      if (data) {
        flagElement.src = 'data:image/png;base64,' + data['flag_png'];
        nameElement.innerHTML = data['admin'];
      }
      infoOverlay.setPosition(data ? coordinate : undefined);
    },
  );
};

// Pointermove listener for instant hover inspection
// 指针移动监听：实现毫秒级属性跟随探测
map.on('pointermove', function (evt) {
  if (evt.dragging) {
    return;
  }
  const coordinate = map.getEventCoordinate(evt.originalEvent);
  displayCountryInfo(coordinate);
});

// Click listener to pin or inspect attributes
// 点击事件：同理反查要素属性
map.on('click', function (evt) {
  displayCountryInfo(evt.coordinate);
});
