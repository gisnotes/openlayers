---
title: Background
layout: default.hbs
---

# Background

# 背景知识

## Overview

## 概述

OpenLayers is a modular, high-performance, feature-packed library for displaying and interacting with maps and geospatial data.

OpenLayers 是一个模块化、高性能、全功能的 JavaScript 库，用于展示地图和地理空间数据并与其进行交互。

The library comes with built-in support for a wide range of commercial and free image and vector tile sources, and the most popular open and proprietary vector data formats. With OpenLayers's map projection support, data can be in any projection.

该库内置支持多种商业与免费的图像及矢量瓦片数据源，以及主流的开源与专有矢量数据格式。得益于 OpenLayers 强大的地图投影支持，数据可以采用任意投影坐标系。

## Public API

## 公共 API

OpenLayers is available as [`ol` npm package](https://npmjs.com/package/ol), which provides all modules of the officially supported [API](../../apidoc).

OpenLayers 以 [`ol` npm 软件包](https://npmjs.com/package/ol) 的形式发布，提供了官方支持的 [API](../../apidoc) 的所有模块。

## Browser Support

## 浏览器支持

OpenLayers runs on all modern browsers (with greater than 1% global usage).  This includes Chrome, Firefox, Safari and Edge. For older browsers, polyfills ([Fastly](https://polyfill-fastly.io) or [Cloudflare](https://cdnjs.cloudflare.com/polyfill)) will likely need to be added.

OpenLayers 可在所有现代浏览器（全球使用率大于 1% 的浏览器）上运行。这包括 Chrome、Firefox、Safari 和 Edge。对于较旧的浏览器，可能需要添加 Polyfill（如 [Fastly](https://polyfill-fastly.io) 或 [Cloudflare](https://cdnjs.cloudflare.com/polyfill)）。

The library is intended for use on both desktop/laptop and mobile devices, and supports pointer and touch interactions.

该库既可用于桌面/笔记本电脑，也适用于移动设备，并支持指针与触摸交互。

## Module and Naming Conventions

## 模块与命名规范

OpenLayers modules with CamelCase names provide classes as default exports, and may contain additional constants or functions as named exports:

采用驼峰命名法（CamelCase）的 OpenLayers 模块将其类作为默认导出（default exports），并且可能包含其他常量或函数作为具名导出（named exports）：

```js
import Map from 'ol/Map.js';
import View from 'ol/View.js';
```

Class hierarchies grouped by their parent are provided in a subfolder of the package, e.g. `layer/`.

按父类分组的类层次结构存放于包的子文件夹中，例如 `layer/`。

For convenience, these are also available as named exports, e.g.

为了使用方便，这些类也可作为具名导出直接导入，例如：

```js
import {Map, View} from 'ol';
import {Tile, Vector} from 'ol/layer.js';
```

In addition to these re-exported classes, modules with lowercase names also provide constants or functions as named exports:

除了这些重导出的类之外，采用小写名称的模块通常提供常量或函数作为具名导出：

```js
import {getUid} from 'ol';
import {fromLonLat} from 'ol/proj.js';
```
