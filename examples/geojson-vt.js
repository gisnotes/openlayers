import geojsonvt from 'geojson-vt';
import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import VectorTileLayer from '../src/ol/layer/VectorTile.js';
import Projection from '../src/ol/proj/Projection.js';
import VectorTileSource from '../src/ol/source/VectorTile.js';

/**
 * Converts geojson-vt internal data structure to GeoJSON standard format.
 * 将 geojson-vt 内部切片几何结构转换为标准 GeoJSON 格式的 JSON 替换器
 * @param {string} key Property key / 属性键名
 * @param {*} value Property value / 属性值
 * @return {*} Transformed value / 转换后的值
 */
const replacer = function (key, value) {
  if (!value || !value.geometry) {
    return value;
  }

  let type;
  const rawType = value.type;
  let geometry = value.geometry;
  if (rawType === 1) {
    type = 'MultiPoint';
    if (geometry.length === 1) {
      type = 'Point';
      geometry = geometry[0];
    }
  } else if (rawType === 2) {
    type = 'MultiLineString';
    if (geometry.length === 1) {
      type = 'LineString';
      geometry = geometry[0];
    }
  } else if (rawType === 3) {
    type = 'Polygon';
    if (geometry.length > 1) {
      type = 'MultiPolygon';
      geometry = [geometry];
    }
  }

  return {
    'type': 'Feature',
    'geometry': {
      'type': type,
      'coordinates': geometry,
    },
    'properties': value.tags,
  };
};

// Vector tile layer with attribute-driven fill color / 带有属性驱动填充样式的矢量瓦片图层
const layer = new VectorTileLayer({
  background: '#1a2b39',
  style: {
    'fill-color': ['string', ['get', 'COLOR'], '#eee'],
  },
});

// Initialize map instance / 初始化地图实例
const map = new Map({
  layers: [layer],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});

// Fetch ecoregions GeoJSON and build client-side tile index / 获取生态区数据并在前端构建切片索引
const url = 'https://openlayers.org/data/vector/ecoregions.json';
fetch(url)
  .then(function (response) {
    return response.json();
  })
  .then(function (json) {
    // Build geojson-vt index with 4096px extent / 初始化 geojson-vt 空间索引
    const tileIndex = geojsonvt(json, {
      extent: 4096,
      debug: 1,
    });

    // Custom format handling 4096x4096 tile pixel coordinates / 自定义处理切片像素单位的 GeoJSON 解析器
    const format = new GeoJSON({
      // Data returned from geojson-vt is in tile pixel units / geojson-vt 返回的数据基于局部切片像素单位
      dataProjection: new Projection({
        code: 'TILE_PIXELS',
        units: 'tile-pixels',
        extent: [0, 0, 4096, 4096],
      }),
    });

    // Vector tile source reading from client-side index / 从前端索引即时切片的矢量瓦片数据源
    const vectorSource = new VectorTileSource({
      tileUrlFunction: function (tileCoord) {
        // Use the tile coordinate as a pseudo URL for caching purposes / 使用切片坐标作为内存缓存的伪 URL 键
        return JSON.stringify(tileCoord);
      },
      tileLoadFunction: function (tile, url) {
        const tileCoord = JSON.parse(url);
        const data = tileIndex.getTile(
          tileCoord[0],
          tileCoord[1],
          tileCoord[2],
        );
        const geojson = JSON.stringify(
          {
            type: 'FeatureCollection',
            features: data ? data.features : [],
          },
          replacer,
        );
        const features = format.readFeatures(geojson, {
          extent: vectorSource.getTileGrid().getTileCoordExtent(tileCoord),
          featureProjection: map.getView().getProjection(),
        });
        tile.setFeatures(features);
      },
    });

    layer.setSource(vectorSource);
  });
