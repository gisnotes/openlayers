# OGC 空间服务高级交互：WMS GetFeatureInfo 属性穿透与 WFS 矢量过滤实战指南

> 在企业级 WebGIS 系统的空间数据服务架构中，开放地理空间信息联盟（OGC）制定的 **WMS（Web Map Service）** 与 **WFS（Web Feature Service）** 是最基础且最重要的工业标准。
>
> 许多开发者往往只将 WMS 用于底图展示，忽视了其基于像素坐标穿透查询要素属性的 **`GetFeatureInfo`** 协议；而在需要精准查询实体几何并进行客户端高亮分析时，**WFS `GetFeature`** 结合 **OGC Filter Encoding（空间与属性复合过滤）** 则构成了最强有力的矢量交互武器。本文基于 3 个核心官方示例（`getfeatureinfo-image.html`、`getfeatureinfo-tile.html`、`vector-wfs-getfeature.html`），全面解构 WMS 属性穿透与 WFS 矢量过滤查询的技术原理与生产实践。

---

## 1. 架构总览：OGC WebGIS 空间交互的两大范式

```mermaid
flowchart TD
    subgraph ClientLayer [客户端交互与展示]
        MapClick["用户鼠标点击地图 (单点坐标)"]
        MapHover["用户鼠标光标悬停 (像素拾取)"]
        WFSQuery["复杂属性/空间条件检索"]
    end

    subgraph WMSPipeline [范式一：WMS 栅格渲染与属性穿透]
        GetPixel["layer.getData(pixel)<br/>Alpha 通道检测 (零网络开销)"]
        GetInfoUrl["wmsSource.getFeatureInfoUrl()<br/>计算切片/视口局部 BBOX 与 (I, J)"]
    end

    subgraph WFSPipeline [范式二：WFS 矢量实体几何获取]
        FilterBuilder["ol/format/filter 复合过滤器<br/>andFilter(like, equalTo)"]
        WFSXML["new WFS().writeGetFeature()<br/>XML 序列化"]
    end

    subgraph GISServer [GIS 服务器 (GeoServer / MapServer)]
        RasterEngine["WMS 渲染引擎<br/>出图 PNG/JPEG"]
        FeatureEngine["WFS 空间数据引擎<br/>查询 PostGIS 返回 GeoJSON"]
    end

    MapHover --> GetPixel -->|data[3] > 0| HandCursor["光标切换为 pointer 手型"]
    MapClick --> GetInfoUrl -->|HTTP GET GetFeatureInfo| RasterEngine
    RasterEngine -->|返回 HTML/JSON 属性详情| InfoWindow["展示要素属性弹窗"]

    WFSQuery --> FilterBuilder --> WFSXML -->|HTTP POST XML| FeatureEngine
    FeatureEngine -->|返回标准 GeoJSON| VectorLayer["动态注入 VectorSource<br/>view.fit() 自动聚焦"]
```

### 1.1 两种 OGC 交互模式综合特征对比

| 维度 / 特征 | WMS GetFeatureInfo (单图 / 瓦片) | WFS GetFeature (矢量过滤查询) |
| :--- | :--- | :--- |
| **典型示例** | `getfeatureinfo-image.html`、`getfeatureinfo-tile.html` | `vector-wfs-getfeature.html` |
| **底层传输内容** | 服务端直接返回 HTML 富文本表格或 JSON 属性 | 包含真实点/线/面坐标的完整 GeoJSON 几何体 |
| **客户端几何存在** | **无**（客户端只有图像像素，无矢量对象） | **有**（完整的 `ol/Feature` 对象，可二次编辑/计算） |
| **交互能力** | 纯信息展示，无法高亮局部折线或面边界 | 可在客户端按需动态修改样式、选中高亮、缓冲区分析 |
| **网络吞吐压力** | 极小（单次仅返回几 KB 的属性文本） | 视要素复杂度而定（复杂多边形可达数百 KB） |
| **光标悬停感应** | 结合 `layer.getData(pixel)` 探测非透明像素 | 结合 `map.forEachFeatureAtPixel` 命中检测 |

---

## 2. WMS GetFeatureInfo 属性穿透与像素探测实战

### 2.1 坐标与局部像素反算机理
在 WMS 规范中，服务端无法直接理解前端传入的经纬度，必须提供：
1. 当前出图的包围盒（`BBOX`）；
2. 图像的总宽高（`WIDTH`, `HEIGHT`）；
3. 点击点在当前图片内的像素坐标（`X, Y` 或 1.3.0 规范中的 `I, J`）。

OpenLayers 的 `getFeatureInfoUrl()` 内部将地理空间投影坐标与当前缩放层级分辨率无缝换算：
```javascript
map.on('singleclick', function (evt) {
  const viewResolution = view.getResolution();
  const url = wmsSource.getFeatureInfoUrl(
    evt.coordinate,
    viewResolution,
    'EPSG:3857',
    {'INFO_FORMAT': 'text/html'} // 或 'application/json'
  );
  if (url) {
    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        document.getElementById('info').innerHTML = html;
      });
  }
});
```

### 2.2 单图模式（ImageWMS）vs 瓦片模式（TileWMS）的区别
- **`ImageWMS`**：直接以当前浏览器视口的几何包围盒为基准，计算相对于屏幕左上角的点击偏移；
- **`TileWMS`**：内部算法首先利用切片网格定位出点击点落在具体的哪一块 $256 \times 256$ 切片中，然后以该切片的局部 BBOX 和 $[0, 256]$ 的局部像素位置发起请求，并利用服务端切片缓存（如 GeoWebCache）加速响应。

### 2.3 零开销客户端光标手型切换（`layer.getData`）
为了在鼠标划过要素时显示手型，若频繁向后端发送 GetFeatureInfo 会导致服务器崩溃。OpenLayers 提供了毫秒级本地像素读取：
```javascript
map.on('pointermove', function (evt) {
  if (evt.dragging) return;
  // 直接从 Canvas 显存读取当前像素 RGBA
  const data = wmsLayer.getData(evt.pixel);
  const hit = data && data[3] > 0; // Alpha 通道大于 0 说明非透明、有要素
  map.getTargetElement().style.cursor = hit ? 'pointer' : '';
});
```

---

## 3. OGC WFS 矢量要素过滤与动态查询（`vector-wfs-getfeature.html`）

当需要对河流、水系、道路进行复杂的 SQL 级复合条件过滤并获取真实几何体时，必须借助 WFS：

### 3.1 链式构建 OGC 复合过滤器
```javascript
import WFS from 'ol/format/WFS.js';
import {and as andFilter, equalTo as equalToFilter, like as likeFilter} from 'ol/format/filter.js';

// 动态构建 OGC 标准 Filter XML
const featureRequest = new WFS().writeGetFeature({
  srsName: 'EPSG:3857',                 // 目标坐标投影
  featureNS: 'http://openstreemap.org', // GeoServer 工作区命名空间
  featurePrefix: 'osm',                 // 图层前缀
  featureTypes: ['water_areas'],        // 图层名称
  outputFormat: 'application/json',     // 要求返回 GeoJSON
  filter: andFilter(
    likeFilter('name', 'Mississippi*'), // 名称以 Mississippi 开头
    equalToFilter('waterway', 'riverbank') // 且属性 waterway 为河岸
  ),
});
```

### 3.2 HTTP POST 提交与视口自适应
```javascript
fetch('https://ahocevar.com/geoserver/wfs', {
  method: 'POST',
  body: new XMLSerializer().serializeToString(featureRequest),
})
  .then((res) => res.json())
  .then((json) => {
    // 将返回的 GeoJSON 反序列化为矢量要素集合
    const features = new GeoJSON().readFeatures(json);
    vectorSource.addFeatures(features);
    // 自动平滑缩放至要素结果包围盒范围
    map.getView().fit(vectorSource.getExtent());
  });
```

---

## 4. 生产级工程踩坑与避坑指南

### 4.1 CORS 跨域污染画布（Tainted Canvas）
- **现象**：调用 `layer.getData(pixel)` 时抛出 `SecurityError: Failed to execute 'getImageData' on 'CanvasRenderingContext2D'`。
- **原因**：WMS 图片未携带跨域许可头。
- **解决办法**：在 `ImageWMS` 或 `TileWMS` 初始化时显式声明 `crossOrigin: 'anonymous'`，且服务端必须配置 `Access-Control-Allow-Origin: *`。

### 4.2 点要素与细线要素点击难命中的容差配置（Buffer）
- **痛点**：对于 1 像素宽度的细线道路或单点水文监测井，用户点击时若偏移 2 个像素，WMS 服务端默认返回空查询结果。
- **优化**：在 `getFeatureInfoUrl` 的额外参数中注入服务端的专属缓冲容差：
  ```javascript
  const url = wmsSource.getFeatureInfoUrl(evt.coordinate, res, proj, {
    'INFO_FORMAT': 'application/json',
    'BUFFER': 10, // GeoServer: 像素外扩缓冲 10px
    'FEATURE_COUNT': 5, // 最多返回 5 个重叠要素
  });
  ```

### 4.3 WFS 大数据量分页保护（Pagination & MaxFeatures）
- **风险**：若模糊查询匹配到整个省份的数万条道路线段，WFS 一次性返回数十兆明文 JSON，前端浏览器解析会发生长时间假死（UI Freezing）。
- **优化**：生产调用必须显式设置 `maxFeatures`，或结合客户端 BBOX 空间过滤器只查询当前屏幕视野内的数据：
  ```javascript
  new WFS().writeGetFeature({
    maxFeatures: 50,
    bbox: map.getView().calculateExtent(),
    // ...
  });
  ```
