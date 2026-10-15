---
title: OpenLayers 新一代 OGC API 现代服务标准全景实战架构指南 (Maps, Tiles & Features)
layout: default.hbs
head:
  - '<link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css" crossorigin="anonymous"><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js" crossorigin="anonymous"></script><script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js" crossorigin="anonymous" onload="renderMathInElement(document.body, {delimiters: [{left: ''$$'', right: ''$$'', display: true},{left: ''$'', right: ''$'', display: false}], throwOnError: false});"></script><script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script><script>document.addEventListener("DOMContentLoaded", function() { if (window.mermaid) { mermaid.initialize({startOnLoad: false}); document.querySelectorAll("pre code.language-mermaid").forEach(function(el) { const pre = el.parentElement; const div = document.createElement("div"); div.className = "mermaid"; div.textContent = el.textContent; pre.parentElement.replaceChild(div, pre); }); mermaid.run(); } });</script>'
---

<nav aria-label="breadcrumb"><ol class="breadcrumb mb-4"><li class="breadcrumb-item"><a href="../">Home</a></li><li class="breadcrumb-item"><a href="./">Summary</a></li><li class="breadcrumb-item active" aria-current="page">OGC API 现代标准指南</li></ol></nav>

# OpenLayers 新一代 OGC API 现代服务标准全景实战架构指南

> 近年来，开放地理空间信息联盟（OGC）推动了一场彻底的现代 Web 标准重构，推出了以 OpenAPI 3.0、JSON/GeoJSON 与 RESTful 原生语义为核心的 **OGC API 系列国际标准**，旨在全面升级替代已有二十余年历史的传统 XML/OWS 架构（WMS、WFS、WMTS）。
>
> OpenLayers 率先在核心包中提供了原生的 **`ol/source/OGCMapTile`** 与 **`ol/source/OGCVectorTile`** 数据源，深度支持 OGC API - Maps、OGC API - Tiles 与 OGC API - Features。本文基于 6 个核心官方示例，系统解构新一代 OGC API 的服务拓扑、切片矩阵集合（TileMatrixSet）映射与生产实践。

---

## 1. 架构总览：从传统 OWS 到 OGC API 的代际演进

### 1.1 传统 OWS vs 新一代 OGC API 架构对比

```mermaid
flowchart TD
    subgraph LegacyOWS [传统 OWS 时代 (1999-2015)]
        direction TB
        WMS["WMS 1.3.0 (复杂 Key-Value-Pair / XML)"]
        WMTS["WMTS 1.0.0 (庞大 GetCapabilities XML)"]
        WFS["WFS 2.0 (Filter Encoding XML POST)"]
    end

    subgraph ModernOGCAPI [现代 OGC API 时代 (OpenAPI / RESTful)]
        direction TB
        OGCMaps["OGC API - Maps (/collections/{id}/map)"]
        OGCTiles["OGC API - Tiles (/collections/{id}/tiles/{matrixSet}/{z}/{y}/{x})"]
        OGCFeatures["OGC API - Features (/collections/{id}/items?bbox=...)"]
    end

    subgraph OpenLayersClient [OpenLayers 客户端支持]
        SourceMapTile["ol/source/OGCMapTile (栅格切片)"]
        SourceVectorTile["ol/source/OGCVectorTile (MVT/GeoJSON 矢量切片)"]
        SourceVector["ol/source/Vector + GeoJSON (要素集合)"]
    end

    OGCMaps -.-> SourceMapTile
    OGCTiles --> SourceMapTile
    OGCTiles --> SourceVectorTile
    OGCFeatures --> SourceVector
```

### 1.2 6 个核心 OGC API 官方示例矩阵

| 分类             | 示例标识                                                                                | 核心机制 / 关键 API                                 | 解决的典型生产场景                                   |
| :--------------- | :-------------------------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------- |
| **现代栅格切片** | [`ogc-map-tiles`](../en/latest/examples/ogc-map-tiles.html)                             | `ol/source/OGCMapTile` + `url`                      | 声明式对接标准 OGC API - Tiles 栅格切片服务          |
|                  | [`ogc-map-tiles-geographic`](../en/latest/examples/ogc-map-tiles-geographic.html)       | `OGCMapTile` + `WorldCRS84Quad` 矩阵集              | 直接使用 EPSG:4326 经纬度地理切片金字塔              |
| **现代动态制图** | [`ogc-maps`](../en/latest/examples/ogc-maps.html)                                       | `OGCMapTile` 动态渲染模式                           | 基于 OGC API - Maps 标准的动态多尺度出图             |
| **现代矢量切片** | [`ogc-vector-tiles`](../en/latest/examples/ogc-vector-tiles.html)                       | `ol/source/OGCVectorTile` + `format: new MVT()`     | OGC API 矢量切片加载与客户端自适应样式渲染           |
|                  | [`ogc-vector-tiles-geographic`](../en/latest/examples/ogc-vector-tiles-geographic.html) | `OGCVectorTile` + `WorldCRS84Quad` 经纬度矩阵       | 全球等矩投影下的 OGC 矢量切片直读                    |
| **现代要素服务** | [`mapserver-ogc-features`](../en/latest/examples/mapserver-ogc-features.html)           | `ol/source/Vector` + OGC API - Features (ISO 19168) | 通过 MapServer 提供标准化 RESTful 要素检索与范围过滤 |

---

## 2. OGC API - Tiles 接入范式：`ol/source/OGCMapTile`

传统 WMTS 接入需要先网络请求数百 KB 的 XML Capabilities 文档进行本地解析，而 OGC API - Tiles 采用标准化 URI 模板与 JSON 元数据，开销极大降低。

### 2.1 标准栅格切片代码范式（`ogc-map-tiles`）

```javascript
import TileLayer from "ol/layer/Tile";
import OGCMapTile from "ol/source/OGCMapTile";

const layer = new TileLayer({
  source: new OGCMapTile({
    // 指向 OGC API - Tiles 的基础 URL
    url: "https://maps.ecere.com/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries/tiles/WebMercatorQuad",
  }),
});
```

OpenLayers 内部会自动识别 `WebMercatorQuad` 矩阵规范，并在请求切片时自动拼接标准化 RESTful 路径：
`.../tiles/WebMercatorQuad/{z}/{y}/{x}?f=image/png`

### 2.2 经纬度切片矩阵支持（`ogc-map-tiles-geographic`）

若服务端切片以全球地理坐标（`EPSG:4326`）发布，则矩阵标识通常为 **`WorldCRS84Quad`**：

```javascript
import TileLayer from "ol/layer/Tile";
import OGCMapTile from "ol/source/OGCMapTile";
import View from "ol/View";

const map = new Map({
  target: "map",
  layers: [
    new TileLayer({
      source: new OGCMapTile({
        url: "https://server.com/ogcapi/collections/dataset/tiles/WorldCRS84Quad",
      }),
    }),
  ],
  view: new View({
    projection: "EPSG:4326", // 视图必须与 WorldCRS84Quad 对齐
    center: [0, 0],
    zoom: 1,
  }),
});
```

---

## 3. OGC API - Tiles 矢量切片：`ol/source/OGCVectorTile`

当需要对要素属性进行客户端动态样式过滤、悬停高亮或点击拾取时，采用矢量切片模式：

```javascript
import VectorTileLayer from "ol/layer/VectorTile";
import OGCVectorTile from "ol/source/OGCVectorTile";
import MVT from "ol/format/MVT";

const vectorTileLayer = new VectorTileLayer({
  source: new OGCVectorTile({
    url: "https://server.com/ogcapi/collections/topography/tiles/WebMercatorQuad",
    format: new MVT(), // 声明矢量切片反序列化格式为 Mapbox Vector Tile (PBF)
  }),
  style: (feature) => {
    // 客户端根据要素属性实时渲染
  },
});
```

---

## 4. OGC API - Features 接入：从 WFS 到 RESTful GeoJSON

在传统 WFS 2.0 中，空间检索需要手动构造 XML `<wfs:GetFeature>` 请求体；而在 OGC API - Features（ISO 19168-1）中，数据以纯 RESTful 路径获取。

### 4.1 结合 BBOX 动态视口加载要素（`mapserver-ogc-features`）

```javascript
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import GeoJSON from "ol/format/GeoJSON";
import { bbox as bboxStrategy } from "ol/loadingstrategy";

const vectorSource = new VectorSource({
  format: new GeoJSON(),
  // 结合视口包围盒动态按需拉取
  strategy: bboxStrategy,
  loader: function (extent, resolution, projection) {
    const projCode = projection.getCode();
    // 构造标准 OGC API - Features /items 查询 URL
    const url =
      `https://demo.mapserver.org/cgi-bin/mapserv/service/ogcapi/collections/countries/items?` +
      `bbox=${extent.join(",")}&bbox-crs=http://www.opengis.net/def/crs/EPSG/0/3857&limit=100`;

    fetch(url)
      .then((res) => res.json())
      .then((json) => {
        vectorSource.addFeatures(
          vectorSource.getFormat().readFeatures(json, {
            dataProjection: "EPSG:4326",
            featureProjection: projection,
          }),
        );
      });
  },
});
```

---

## 5. 生产避坑指南与架构建议

1. **矩阵标识匹配**：OGC API 规范对矩阵集名称有严格标准定义（`WebMercatorQuad`、`WorldCRS84Quad`、`WorldMercatorWGS84Quad`），URL 中的大小写必须完全匹配服务端元数据声明；
2. **内容协商（Content Negotiation）**：若服务端支持多种格式，可通过追加 `?f=application/vnd.mapbox-vector-tile` 或在请求头中配置 `Accept: application/geo+json` 明确返回格式；
3. **空间范围投影转换**：OGC API - Features 规范默认入参 `bbox` 的坐标系为 WGS 84，若传入 Web 墨卡托米制坐标，必须显式附加 `bbox-crs` 参数声明。

---

## 附录：6 个官方 OGC API 核心示例直达索引

1. [`ogc-maps`](../en/latest/examples/ogc-maps.html) &mdash; OGC API - Maps 现代动态出图标准集成
2. [`ogc-map-tiles`](../en/latest/examples/ogc-map-tiles.html) &mdash; OGC API - Tiles 现代栅格瓦片服务标准与集合接入
3. [`ogc-map-tiles-geographic`](../en/latest/examples/ogc-map-tiles-geographic.html) &mdash; OGC API - Tiles 经纬度地理切片矩阵集合（EPSG:4326）
4. [`ogc-vector-tiles`](../en/latest/examples/ogc-vector-tiles.html) &mdash; OGC API - Tiles 矢量切片服务与客户端样式映射
5. [`ogc-vector-tiles-geographic`](../en/latest/examples/ogc-vector-tiles-geographic.html) &mdash; OGC API 经纬度矢量切片与等矩投影渲染
6. [`mapserver-ogc-features`](../en/latest/examples/mapserver-ogc-features.html) &mdash; MapServer 驱动的 OGC API - Features 现代要素服务与 BBOX 加载
