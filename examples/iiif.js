import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import IIIFInfo from '../src/ol/format/IIIFInfo.js';
import TileLayer from '../src/ol/layer/Tile.js';
import IIIF from '../src/ol/source/IIIF.js';

const layer = new TileLayer(),
  map = new Map({
    layers: [layer],
    target: 'map',
  }),
  notifyDiv = document.getElementById('iiif-notification'),
  urlInput = document.getElementById('imageInfoUrl'),
  displayButton = document.getElementById('display');

function refreshMap(imageInfoUrl) {
  fetch(imageInfoUrl)
    .then(function (response) {
      response
        .json()
        .then(function (imageInfo) {
          const options = new IIIFInfo(imageInfo).getTileSourceOptions();
          if (options === undefined || options.version === undefined) {
            notifyDiv.textContent =
              '数据似乎不是有效的 IIIF 图像元数据。(Data seems to be no valid IIIF image information.)';
            return;
          }
          options.zDirection = -1;
          const iiifTileSource = new IIIF(options);
          layer.setSource(iiifTileSource);
          map.setView(
            new View({
              resolutions: iiifTileSource.getTileGrid().getResolutions(),
              extent: iiifTileSource.getTileGrid().getExtent(),
              constrainOnlyCenter: true,
            }),
          );
          map.getView().fit(iiifTileSource.getTileGrid().getExtent());
          notifyDiv.textContent = '';
        })
        .catch(function (body) {
          notifyDiv.textContent =
            '无法读取图像 info.json 元数据。(Could not read image info json.) ' +
            body;
        });
    })
    .catch(function () {
      notifyDiv.textContent =
        '无法从指定 URL 获取数据。(Could not read data from URL.)';
    });
}

displayButton.addEventListener('click', function () {
  refreshMap(urlInput.value);
});

refreshMap(urlInput.value);
