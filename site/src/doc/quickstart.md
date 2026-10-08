---
title: Quick Start
layout: default.hbs
---

# Quick Start

# 快速入门

This primer shows you how to put a map on a web page.  The development setup uses [Node](https://nodejs.org/) (14 or higher) and requires that you have [`git`](https://github.com/git-guides/install-git) installed.

本入门指南将向您展示如何在网页中嵌入地图。开发环境基于 [Node](https://nodejs.org/)（14 或更高版本），并需要安装 [`git`](https://github.com/git-guides/install-git)。

## Set up a new project

## 创建新项目

The easiest way to start building a project with OpenLayers is to run `npm create ol-app`:

使用 OpenLayers 构建项目最简单的方法是运行 `npm create ol-app`：

```bash
npm create ol-app my-app
cd my-app
npm start
```

The first command will create a directory called `my-app` (you can use a different name if you wish), install OpenLayers and a development server, and set up a basic app with `index.html`, `main.js`, and `style.css` files.

第一条命令将创建一个名为 `my-app` 的目录（您可以按需使用其他名称），安装 OpenLayers 和开发服务器，并使用 `index.html`、`main.js` 和 `style.css` 文件搭建一个基础应用。

The second command (`cd my-app`) changes the working directory to your new `my-app` project so you can start working with it.

第二条命令（`cd my-app`）将当前工作目录切换到新建的 `my-app` 项目中，以便开始开发。

The third command (`npm start`) starts a development server so you can view your application in a browser while working on it.  After running `npm start`, you'll see output that tells you the URL to open.  Open http://localhost:5173/ (or whatever URL is displayed) to see your new application.

第三条命令（`npm start`）将启动一个开发服务器，以便在开发过程中于浏览器中实时查看应用。运行 `npm start` 后，终端输出将提示需要打开的 URL。打开 http://localhost:5173/ （或终端中显示的 URL）即可查看您的新应用。

## Exploring the parts

## 探究各组成部分

An OpenLayers application is composed of three basic parts:

一个 OpenLayers 应用程序由三个基本部分组成：

 * The HTML markup with an element to contain the map (`index.html`)

   包含承载地图元素的 HTML 标记文件（`index.html`）

 * The JavaScript that initializes the map (`main.js`)

   用于初始化地图的 JavaScript 文件（`main.js`）

 * The CSS styles that determine the map size and any other customizations (`style.css`)

   用于决定地图尺寸及其他自定义样式的 CSS 样式文件（`style.css`）

### The markup

### HTML 标记

Open the `index.html` file in a text editor.  It should look something like this:

在文本编辑器中打开 `index.html` 文件，其内容大致如下：

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Quick Start</title>
  </head>
  <body>
    <div id="map"></div>
    <script type="module" src="./main.js"></script>
  </body>
</html>
```

The two important parts in the markup are the `<div>` element to contain the map and the `<script>` tag to pull in the JavaScript.  The map container or target should be a block level element (like a `<div>`) and it must appear in the document before the `<script>` tag that initializes the map.

标记中两个重要的部分是承载地图的 `<div>` 元素和引入 JavaScript 的 `<script>` 标签。地图容器（目标元素）应该是一个块级元素（例如 `<div>`），且它在文档中的位置必须先于初始化地图的 `<script>` 标签。

## The script

## 脚本逻辑

Open the `main.js` file in a text editor.  It should look something like this:

在文本编辑器中打开 `main.js` 文件，其内容大致如下：

```js
import './style.css';
import Map from 'ol/Map.js';
import OSM from 'ol/source/OSM.js';
import TileLayer from 'ol/layer/Tile.js';
import View from 'ol/View.js';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: new View({
    center: [0, 0],
    zoom: 2,
  }),
});
```

OpenLayers is packaged as a collection of [ES modules](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/).  The `import` lines are used to pull in the modules that your application needs.  Take a look through the [examples](/en/latest/examples/) and [API docs](/en/latest/apidoc/) to understand which modules you might want to use.

OpenLayers 是作为一系列 [ES 模块](https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/) 进行打包分发的。其中的 `import` 语句用于引入应用程序所需的各个模块。您可以浏览[示例](/en/latest/examples/)和 [API 文档](/en/latest/apidoc/)，以了解可能需要使用的模块。

The `import './style.css';` line might be a bit unexpected.  In this example, we're using [Vite](https://vitejs.dev/) as a development server.  Vite allows CSS to be imported from JavaScript modules.  If you were using a different development server, you might include the `style.css` in a `<link>` tag in the `index.html` instead.

`import './style.css';` 这一行可能让人稍感意外。在本示例中，我们使用 [Vite](https://vitejs.dev/) 作为开发服务器。Vite 支持直接在 JavaScript 模块中导入 CSS。如果您使用其他开发服务器，则可以改在 `index.html` 中通过 `<link>` 标签引入 `style.css`。

The `main.js` module serves as an entry point for your application.  It initializes a new map, giving it a single layer with an OSM source and a view describing the center and zoom level.  Read through the [Basic Concepts tutorial](./tutorials/concepts.html) to learn more about `Map`, `View`, `Layer`, and `Source` components.

`main.js` 模块是应用程序的入口点。它初始化了一个新地图，为其配置了一个带有 OSM 数据源的单一图层，以及一个定义了中心点和缩放级别的视图。阅读[基本概念教程](./tutorials/concepts.html)可深入了解 `Map`、`View`、`Layer` 和 `Source` 组件。

## The style

## 样式设计

Open the `style.css` file in a text editor.  It should look something like this:

在文本编辑器中打开 `style.css` 文件，其内容大致如下：

```css
@import "node_modules/ol/ol.css";

html,
body {
  margin: 0;
  height: 100%;
}

#map {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 100%;
}
```

The first line imports the `ol.css` file that comes with the `ol` package (OpenLayers is published as the [`ol` package](https://www.npmjs.com/package/ol) in the npm registry).  The `ol` package was installed in the `npm create ol-app` step above.  If you were starting with an existing application instead of using `npm create ol-app`, you would install the package with `npm install ol`.  The `ol.css` stylesheet includes styles for the elements that OpenLayers creates – things like buttons for zooming in and out.

第一行导入了 `ol` 软件包自带的 `ol.css` 文件（OpenLayers 在 npm 仓库中以 [`ol` 软件包](https://www.npmjs.com/package/ol) 的形式发布）。`ol` 包已在上述 `npm create ol-app` 步骤中安装。如果您是在已有应用程序中集成，而非使用 `npm create ol-app`，则可以通过 `npm install ol` 安装该包。`ol.css` 样式表包含了 OpenLayers 所创建元素的样式——例如放大和缩小按钮等。

The remaining rules in the `style.css` file make it so the `<div id="map">` element that contains the map fills the entire page.

`style.css` 文件中的其余规则用于让承载地图的 `<div id="map">` 元素填满整个页面。

## Deploying your app

## 部署您的应用

You can make edits to the `index.html`, `main.js`, or `style.css` files and see the resulting change in your browser while running the development server (with `npm start`).  After you have finished making edits, it is time to bundle or build your application so that it can be deployed as a static website (without needing to run a development server like Vite).

在运行开发服务器（通过 `npm start`）期间，您可以编辑 `index.html`、`main.js` 或 `style.css` 文件，并在浏览器中实时查看相应的更改。完成编辑后，即可对应用程序进行打包或构建，以便将其作为静态网站部署（无需再运行像 Vite 这样的开发服务器）。

To build your application, run the following:

要构建您的应用程序，请运行以下命令：

```bash
npm run build
```

This will create a `dist` directory with a new `index.html` and assets that make up your application.  These `dist` files can be deployed with your production website.

这将创建一个 `dist` 目录，其中包含构成应用程序的新 `index.html` 和静态资产。您可以将这些 `dist` 文件部署到生产网站中。
