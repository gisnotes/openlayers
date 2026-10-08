---
title: Basic Concepts
layout: default.hbs
---

# Basic Concepts

# 基本概念

## Map

## 地图（Map）

The core component of OpenLayers is the map (from the `ol/Map` module). It is rendered to a `target` container (e.g. a `div` element on the web page that contains the map). All map properties can either be configured at construction time, or by using setter methods, e.g. `setTarget()`.

OpenLayers 的核心组件是地图（来自 `ol/Map` 模块）。它被渲染到一个 `target` 容器中（例如网页上包含地图的 `div` 元素）。所有的地图属性都可以在构造时进行配置，或者通过使用 setter 方法（例如 `setTarget()`）进行设置。

The markup below could be used to create a `<div>` that contains your map.

下面的 HTML 标记可用于创建一个承载地图的 `<div>`。

```xml
<div id="map" style="width: 100%; height: 400px"></div>
```

The script below constructs a map that is rendered in the `<div>` above, using the `map` id of the element as a selector.

下面的脚本构建了一个渲染在上述 `<div>` 中的地图，使用该元素的 `map` id 作为选择器。

```js
import Map from 'ol/Map.js';

const map = new Map({target: 'map'});
```

## View

## 视图（View）

The map is not responsible for things like center, zoom level and projection of the map. Instead, these are properties of a `ol/View` instance.

地图本身并不负责地图的中心点、缩放级别和投影等属性。相反，这些是 `ol/View` 实例的属性。

```js
import View from 'ol/View.js';

map.setView(new View({
  center: [0, 0],
  zoom: 2,
}));
```

A `View` also has a `projection`. The projection determines the coordinate system of the `center` and the units for map resolution calculations. If not specified (like in the above snippet), the default projection is Spherical Mercator (EPSG:3857), with meters as map units.

`View` 还包含一个投影（`projection`）。投影决定了中心点（`center`）的坐标系统以及用于地图分辨率计算的单位。如果未显式指定（如上文代码片段所示），默认投影为球形墨卡托（Spherical Mercator，EPSG:3857），地图单位为米。

The `zoom` option is a convenient way to specify the map resolution. The available zoom levels are determined by `maxZoom` (default: 28), `zoomFactor` (default: 2) and `maxResolution` (default is calculated in such a way that the projection's validity extent fits in a 256x256 pixel tile). Starting at zoom level 0 with a resolution of `maxResolution` units per pixel, subsequent zoom levels are calculated by dividing the previous zoom level's resolution by `zoomFactor`, until zoom level `maxZoom` is reached.

`zoom` 选项是一种指定地图分辨率的便捷方式。可用的缩放级别由 `maxZoom`（默认值：28）、`zoomFactor`（默认值：2）和 `maxResolution` 共同决定（默认的 `maxResolution` 计算方式是使投影的有效范围恰好适应一个 256x256 像素的瓦片）。从缩放级别 0（分辨率为每像素 `maxResolution` 单位）开始，后续缩放级别的分辨率是通过将上一级缩放分辨率除以 `zoomFactor` 计算得出，直到达到 `maxZoom` 缩放级别。


## Source

## 数据源（Source）

To get remote data for a layer, OpenLayers uses `ol/source/Source` subclasses. These are available for free and commercial map tile services like OpenStreetMap or Bing, for OGC sources like WMS or WMTS, and for vector data in formats like GeoJSON or KML.

为了获取图层的远程数据，OpenLayers 使用了 `ol/source/Source` 的子类。这些数据源适用于免费和商业地图瓦片服务（如 OpenStreetMap 或 Bing）、OGC 数据源（如 WMS 或 WMTS），以及常见格式的矢量数据（如 GeoJSON 或 KML）。

```js
import OSM from 'ol/source/OSM.js';

const source = new OSM();
```

## Layer

## 图层（Layer）

A layer is a visual representation of data from a source. OpenLayers has four basic types of layers:

图层是数据源中数据的可视化呈现。OpenLayers 提供了四种基本类型的图层：

 * `ol/layer/Tile` - Renders sources that provide tiled images in grids that are organized by zoom levels for specific resolutions.

   `ol/layer/Tile` - 渲染以网格形式提供瓦片图片的数据源，这些网格按特定分辨率的缩放级别进行组织。

 * `ol/layer/Image` - Renders sources that provide map images at arbitrary extents and resolutions.

   `ol/layer/Image` - 渲染提供任意范围和分辨率的单张地图图像的数据源。

 * `ol/layer/Vector` - Renders vector data client-side.

   `ol/layer/Vector` - 在客户端渲染矢量数据。

 * `ol/layer/VectorTile` - Renders data that is provided as vector tiles.

   `ol/layer/VectorTile` - 渲染以矢量瓦片格式提供的数据。

```js
import TileLayer from 'ol/layer/Tile.js';

// ...
const layer = new TileLayer({source: source});
map.addLayer(layer);
```

## Putting it all together

## 综合示例

The above snippets can be combined into a single script that renders a map with a single tile layer:

上述代码片段可以组合成一个完整的脚本，渲染出一个包含单一瓦片图层的地图：

```js
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';

new Map({
  layers: [
    new TileLayer({source: new OSM()}),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
  target: 'map',
});
```
