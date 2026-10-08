---
title: Errors
layout: default.hbs
---

# Errors

# 错误代码

### 1

The view center is not defined.

视图中心点（center）未定义。

### 2

The view resolution is not defined.

视图分辨率（resolution）未定义。

### 3

The view rotation is not defined.

视图旋转角度（rotation）未定义。

### 4

`image` and `src` cannot be provided at the same time.

不能同时提供 `image` 和 `src`。

### 5

`imgSize` must be set when `image` is provided.

提供 `image` 时必须设置 `imgSize`。

### 6

A defined and non-empty `src` or `image` must be provided.

必须提供已定义且非空的 `src` 或 `image`。

### 7

`format` must be set when `url` is set.

设置了 `url` 时必须设置 `format`。

### 8

Unknown `serverType` configured.

配置了未知的 `serverType`。

### 9

`url` must be configured or set using `#setUrl()`.

必须配置 `url` 或使用 `#setUrl()` 进行设置。

### 10

The default `geometryFunction` can only handle `ol/geom/Point` geometries.

默认的 `geometryFunction` 只能处理 `ol/geom/Point` 类型的几何图形。

### 11

`options.featureTypes` must be an Array.

`options.featureTypes` 必须是一个数组（Array）。

### 12

`options.geometryName` must also be provided when `options.bbox` is set.

设置了 `options.bbox` 时，必须同时提供 `options.geometryName`。

### 13

Invalid corner. Valid corners are `top-left`, `top-right`, `bottom-right` and `bottom-left`.

无效的角（corner）。有效的角为 `top-left`、`top-right`、`bottom-right` 和 `bottom-left`。

### 14

Invalid color. Valid colors are all [CSS colors](https://developer.mozilla.org/en-US/docs/Web/CSS/color).

无效的颜色。有效的颜色为所有 [CSS 颜色](https://developer.mozilla.org/en-US/docs/Web/CSS/color)。

### 15

Tried to get a value for a key that does not exist in the cache.

尝试获取缓存中不存在的键的值。

### 16

Tried to set a value for a key that is used already.

尝试为已被占用的键设置值。

### 17

`resolutions` must be sorted in descending order.

`resolutions` 必须按降序排列。

### 18

Either `origin` or `origins` must be configured, never both.

只能配置 `origin` 或 `origins` 其中之一，不能同时配置两者。

### 19

Number of `tileSizes` and `resolutions` must be equal.

`tileSizes` 的数量必须与 `resolutions` 的数量相等。

### 20

Number of `origins` and `resolutions` must be equal.

`origins` 的数量必须与 `resolutions` 的数量相等。

### 22

Either `tileSize` or `tileSizes` must be configured, never both.

只能配置 `tileSize` 或 `tileSizes` 其中之一，不能同时配置两者。

### 24

Invalid extent or geometry provided as `geometry`.

作为 `geometry` 提供的范围（extent）或几何图形无效。

### 25

Cannot fit empty extent provided as `geometry`.

无法适应作为 `geometry` 提供的空范围（extent）。

### 26

Features for `deletes` must have an id set by the feature reader or  `ol.Feature#setId()`.

用于 `deletes` 的要素必须具有由要素读取器或 `ol.Feature#setId()` 设置的 id。

### 27

Features for `updates` must have an id set by the feature reader or `ol.Feature#setId()`.

用于 `updates` 的要素必须具有由要素读取器或 `ol.Feature#setId()` 设置的 id。

### 28

`renderMode` must be `'hybrid'` or `'vector'`.

`renderMode` 必须为 `'hybrid'` 或 `'vector'`。


### 30

The passed `feature` was already added to the source.

传入的要素（`feature`）已被添加到数据源中。

### 31

Tried to enqueue an `element` that was already added to the queue.

尝试将已存在于队列中的元素（`element`）入队。

### 32

Transformation matrix cannot be inverted.

变换矩阵不可逆。

### 33

Invalid `units`. `'degrees'`, `'imperial'`, `'nautical'`, `'metric'` or `'us'` required.

无效的单位（`units`）。必须为 `'degrees'`、`'imperial'`、`'nautical'`、`'metric'` 或 `'us'`。

### 34

Invalid geometry layout. Must be `XY`, `XYZ`, `XYM` or `XYZM`.

几何布局（geometry layout）无效。必须为 `XY`、`XYZ`、`XYM` 或 `XYZM`。

### 36

Unknown SRS type. Expected `"name"`.

未知的 SRS 类型。应为 `"name"`。

### 37

Unknown geometry type found. Expected `'Point'`, `'LineString'`, `'Polygon'` or `'GeometryCollection'`.

发现未知的几何图形类型。应为 `'Point'`、`'LineString'`、`'Polygon'` 或 `'GeometryCollection'`。

### 38

`styleMapValue` has an unknown type.

`styleMapValue` 的类型未知。

### 39

Unknown geometry type found. Expected `'GeometryCollection'`, `'MultiPoint'`, `'MultiLineString'` or `'MultiPolygon'`.

发现未知的几何图形类型。应为 `'GeometryCollection'`、`'MultiPoint'`、`'MultiLineString'` 或 `'MultiPolygon'`。

### 40

Expected `feature` to have a geometry.

要素（`feature`）必须包含几何图形（geometry）。

### 41

Expected an `ol.style.Style` or an array of `ol.style.Style`.

预期为 `ol.style.Style` 或 `ol.style.Style` 的数组。

### 43

Expected `layers` to be an array or an `ol.Collection`.

`layers` 预期为一个数组或 `ol.Collection`。

### 47

Expected `controls` to be an array or an `ol.Collection`.

`controls` 预期为一个数组或 `ol.Collection`。

### 48

Expected `interactions` to be an array or an `ol.Collection`.

`interactions` 预期为一个数组或 `ol.Collection`。

### 49

Expected `overlays` to be an array or an `ol.Collection`.

`overlays` 预期为一个数组或 `ol.Collection`。

### 50

Cannot determine Rest Service from url.

无法从 url 确定 REST 服务类型。

### 51

Either `url` or `tileJSON` options must be provided.

必须提供 `url` 或 `tileJSON` 选项之一。

### 52

Unknown `serverType` configured.

配置了未知的 `serverType`。

### 53

Unknown `tierSizeCalculation` configured.

配置了未知的 `tierSizeCalculation`。

### 55

The `{-y}` placeholder requires a tile grid with extent.

`{-y}` 占位符需要具有范围（extent）的瓦片网格（tile grid）。

### 56

`mapBrowserEvent` must originate from a pointer event.

`mapBrowserEvent` 必须源自指针事件（pointer event）。

### 57

At least 2 conditions are required.

至少需要 2 个条件。

### 58

Duplicate item added to a unique collection.  For example, it may be that you tried to add the same layer to a map twice.  Check for calls to `map.addLayer()` or other places where the map's layer collection is modified.

向唯一集合（unique collection）中添加了重复项。例如，可能是您尝试将同一个图层向地图中添加了两次。请检查 `map.addLayer()` 的调用或修改地图图层集合的其他位置。

### 59

Invalid command found in the PBF.  This indicates that the loaded vector tile may be corrupt.

在 PBF 中发现无效命令。这表明加载的矢量瓦片可能已损坏。

### 60

Missing or invalid `size`.

缺少 `size` 或 `size` 无效。

### 61

Cannot determine IIIF Image API version from provided image information JSON.

无法从提供的图像信息 JSON 中确定 IIIF Image API 版本。

### 62

A `WebGLArrayBuffer` must either be of type `ELEMENT_ARRAY_BUFFER` or `ARRAY_BUFFER`.

`WebGLArrayBuffer` 的类型必须为 `ELEMENT_ARRAY_BUFFER` 或 `ARRAY_BUFFER`。

### 64

Layer opacity must be a number.

图层不透明度（opacity）必须是一个数字。

### 66

`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has not been enabled.

如果未启用命中检测（hit detection）逻辑，则不能在 WebGL 图层上使用 `forEachFeatureAtCoordinate`。

### 67

A layer can only be added to the map once. Use either `layer.setMap()` or `map.addLayer()`, not both.

一个图层只能被添加到地图一次。请使用 `layer.setMap()` 或 `map.addLayer()` 之一，切勿同时使用两者。

### 68

Data from this source can only be rendered if it has a projection compatible with the view projection.

仅当该数据源的投影与视图投影兼容时，其数据才能被渲染。
