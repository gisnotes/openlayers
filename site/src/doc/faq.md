---
title: Frequently Asked Questions (FAQ)
layout: default.hbs
---

# Frequently Asked Questions (FAQ)

# 常见问题解答（FAQ）

Certain questions arise more often than others when users ask for help. This
document tries to list some of the common questions that frequently get asked,
e.g. on [Stack Overflow](https://stackoverflow.com/questions/tagged/openlayers).

在用户寻求帮助时，某些问题被提及的频率明显高于其他问题。本文档旨在列出一些最常见的受关注问题，例如在 [Stack Overflow](https://stackoverflow.com/questions/tagged/openlayers) 上经常被问到的问题。

If you think a question (and naturally its answer) should be added here, feel
free to ping us or to send a pull request enhancing this document.

如果您认为应该在此处添加某个问题（及其对应的解答），欢迎联系我们或提交 Pull Request 来完善本文档。

Table of contents:

目录：

* [What projection is OpenLayers using?](#what-projection-is-openlayers-using-)

  [OpenLayers 使用什么投影？](#what-projection-is-openlayers-using-)

* [How do I change the projection of my map?](#how-do-i-change-the-projection-of-my-map-)

  [如何更改地图的投影？](#how-do-i-change-the-projection-of-my-map-)

* [Why is my map centered on the gulf of guinea (or africa, the ocean, null-island)?](#why-is-my-map-centered-on-the-gulf-of-guinea-or-africa-the-ocean-null-island-)

  [为什么我的地图中心显示在几内亚湾（或非洲、海洋、零度岛/Null Island）？](#why-is-my-map-centered-on-the-gulf-of-guinea-or-africa-the-ocean-null-island-)

* [Why is the order of a coordinate [lon,lat], and not [lat,lon]?](#why-is-the-order-of-a-coordinate-lon-lat-and-not-lat-lon-)

  [为什么坐标顺序是 [lon, lat]，而不是 [lat, lon]？](#why-is-the-order-of-a-coordinate-lon-lat-and-not-lat-lon-)

* [Why aren't there any features in my source?](#why-aren-t-there-any-features-in-my-source-)

  [为什么我的数据源中没有要素？](#why-aren-t-there-any-features-in-my-source-)

* [How do I force a re-render of the map?](#how-do-i-force-a-re-render-of-the-map-)

  [如何强制重新渲染地图？](#how-do-i-force-a-re-render-of-the-map-)

* [Why are my features not found?](#why-are-my-features-not-found-)

  [为什么找不到我的要素？](#why-are-my-features-not-found-)

## What projection is OpenLayers using?

## OpenLayers 使用什么投影？

Every map that you'll create with OpenLayers will have a view, and every view
will have a projection. As the earth is three-dimensional and round but the 2D
view of a map isn't, we need a mathematical expression to represent it. Enter
projections.

使用 OpenLayers 创建的每个地图都有一个视图（View），而每个视图都会有一个投影（Projection）。由于地球是三维圆球体，而地图的二维视图并不是，因此我们需要一种数学表达方式来进行展示。这就是地图投影。

There isn't only one projection, but there are many common ones. Each projection
has different properties, in that it accurately represents distances, angles or
areas. Certain projections are better suited for different regions in the world.

投影不止一种，而是存在许多常用投影。每种投影具有不同的特性，分别能在距离、角度或面积上保持准确。特定投影更适合世界上特定的区域。

Back to the original question: OpenLayers is capable of dealing with most
projections. If you do not explicitly set one, your map is going to use our
default which is the Web Mercator projection (EPSG:3857). The same projection is
used e.g. for the maps of the OpenStreetMap-project and commercial products such
as Bing Maps or Google Maps.

回到最初的问题：OpenLayers 能够处理绝大多数投影。如果您未显式设置投影，地图将采用默认的 Web 墨卡托投影（EPSG:3857）。OpenStreetMap 项目以及 Bing Maps 或 Google Maps 等商业产品均采用该投影。

This projection is a good choice if you want a map which shows the whole world,
and you may need to have this projection if you want to e.g. use the
OpenStreetMap or Bing tiles.

如果您需要展示全世界范围的地图，该投影是一个不错的选择；如果您想要使用 OpenStreetMap 或 Bing 瓦片等数据源，也通常需要使用该投影。


## How do I change the projection of my map?

## 如何更改地图的投影？

There is a good chance that you want to change the default projection of
OpenLayers to something more appropriate for your region or your specific data.

在很多情况下，您可能希望将 OpenLayers 的默认投影更改为更适合您所在区域或特定数据的投影。

The projection of your map can be set through the `view`-property. Here are some
examples:

可以通过 `view` 属性来设置地图的投影。以下是一些示例：

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';

// OpenLayers comes with support for the World Geodetic System 1984, EPSG:4326:
// OpenLayers 内置支持 1984 世界大地坐标系，即 EPSG:4326：
const map = new Map({
  view: new View({
    projection: 'EPSG:4326'
    // other view properties like map center etc.
    // 其他视图属性，如地图中心点等
  })
  // other properties for your map like layers etc.
  // 其他地图属性，如图层等
});
```

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import proj4 from 'proj4';
import {register} from 'ol/proj/proj4.js';
import {get as getProjection} from 'ol/proj.js';

// To use other projections, you have to register the projection in OpenLayers.
// This can easily be done with [http://proj4js.org/](proj4)
// 若要使用其他投影，必须在 OpenLayers 中注册该投影。
// 可以通过 [http://proj4js.org/](proj4) 轻松完成。
//
// By default OpenLayers does not know about the EPSG:21781 (Swiss) projection.
// So we create a projection instance for EPSG:21781 and pass it to
// register to make it available to the library for lookup by its
// code.
// 默认情况下，OpenLayers 并不识别 EPSG:21781（瑞士坐标系）投影。
// 因此我们为 EPSG:21781 创建一个投影定义，并传给 register 函数，
// 使库能够通过其代码进行查找和使用。
proj4.defs('EPSG:21781',
  '+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 ' +
  '+x_0=600000 +y_0=200000 +ellps=bessel ' +
  '+towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs');
register(proj4);
const swissProjection = getProjection('EPSG:21781');

// we can now use the projection:
// 现在我们就可以使用该投影了：
const map = new Map({
  view: new View({
    projection: swissProjection
    // other view properties like map center etc.
    // 其他视图属性，如地图中心点等
  })
  // other properties for your map like layers etc.
  // 其他地图属性，如图层等
});
```

We recommend to lookup parameters of your projection (like the validity extent)
over at [spatialreference.org](https://spatialreference.org/).

建议在 [spatialreference.org](https://spatialreference.org/) 上查阅投影的相关参数（例如有效范围）。


## Why is my map centered on the gulf of guinea (or africa, the ocean, null-island)?

## 为什么我的地图中心显示在几内亚湾（或非洲、海洋、零度岛/Null Island）？

If you have set a center in your map view, but don't see a real change in visual
output, chances are that you have provided the coordinates of the map center in
the wrong (a non-matching) projection.

如果您在地图视图中设置了中心点，但视觉输出没有发生预期的变化，很可能是因为您提供的地图中心坐标所采用的投影不正确（或不匹配）。

As the default projection in OpenLayers is Web Mercator (see above), the
coordinates for the center have to be provided in that projection. Chances are
that your map looks like this:

由于 OpenLayers 的默认投影是 Web 墨卡托（见上文），中心点坐标必须以该投影下的坐标值提供。您的代码可能类似于这样：

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';

const washingtonLonLat = [-77.036667, 38.895];
const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: washingtonLonLat,
    zoom: 12
  })
});
```

Here `[-77.036667, 38.895]` is provided as the center of the view. But as Web
Mercator is a metric projection, you are currently telling OpenLayers that the
center shall be some meters (~77m and ~39m respectively) away from `[0, 0]`. In
the Web Mercator projection the coordinate is right in the gulf of guinea.

在此处，`[-77.036667, 38.895]` 被设置为视图的中心。但由于 Web 墨卡托是以米为单位的投影，这样做实际上是在告诉 OpenLayers 中心点距离 `[0, 0]` 仅有几十米（分别约 -77 米和 39 米）。在 Web 墨卡托投影中，该坐标正处于几内亚湾（经纬度 0, 0 附近的“零度岛”）。

The solution is easy: Provide the coordinates projected into Web Mercator.
OpenLayers has some helpful utility methods to assist you:

解决方法很简单：提供投影到 Web 墨卡托之后的坐标。OpenLayers 提供了一些实用的工具方法来帮助您：

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj.js';

const washingtonLonLat = [-77.036667, 38.895];
const washingtonWebMercator = fromLonLat(washingtonLonLat);

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: washingtonWebMercator,
    zoom: 8
  })
});
```

The method `fromLonLat()` is available from version 3.5 onwards.

`fromLonLat()` 方法自 3.5 版本起可用。

If you told OpenLayers about a custom projection (see above), you can use the
following method to transform a coordinate from WGS84 to your projection:

如果您在 OpenLayers 中配置了自定义投影（见上文），可以使用以下方法将坐标从 WGS84 转换为您的投影：

```javascript
import {transform} from 'ol/proj.js';
// assuming that OpenLayers knows about EPSG:21781, see above
// 假设 OpenLayers 已注册 EPSG:21781，见上文
const swissCoord = transform([8.23, 46.86], 'EPSG:4326', 'EPSG:21781');
```


## Why is the order of a coordinate [lon,lat], and not [lat,lon]?

## 为什么坐标顺序是 [lon, lat]，而不是 [lat, lon]？

Because of two different and incompatible conventions. Latitude and longitude
are normally given in that order. Maps are 2D representations/projections
of the earth's surface, with coordinates expressed in the `x,y` grid of the
[Cartesian system](https://en.wikipedia.org/wiki/Cartesian_coordinate_system).
As they are by convention drawn with west on the left and north at the top,
this means that `x` represents longitude, and `y` latitude. As stated above,
OpenLayers is designed to handle all projections, but the default view is in
projected Cartesian coordinates. It would make no sense to have duplicate
functions to handle coordinates in both the Cartesian `x,y` and `lat,lon`
systems, so the degrees of latitude and longitude should be entered as though
they were Cartesian, in other words, they are `lon,lat`.

这是因为存在两种不同且不兼容的惯用表示方式。口语和日常通常按“纬度、经度”的顺序表达。而地图是地球表面的二维表示/投影，其坐标表达在[笛卡尔坐标系](https://en.wikipedia.org/wiki/Cartesian_coordinate_system)的 `x,y` 网格中。按照绘图惯例，通常左西右东、上北下南，这意味着 `x` 代表经度，而 `y` 代表纬度。如前所述，OpenLayers 旨在处理所有投影，但默认视图采用的是投影笛卡尔坐标。分别针对笛卡尔 `x,y` 与 `lat,lon` 系统编写重复的处理函数毫无意义，因此经度和纬度的度数应按照笛卡尔坐标格式传入，换句话说，其顺序即为 `[lon, lat]`（经度在前，纬度在后）。

If you have difficulty remembering which way round it is, use the language code
for English, `en`, as a mnemonic: East before North.

如果您觉得记忆该顺序有些困难，可以将英语语言代码 `en` 作为助记口诀：East（东/经度）在 North（北/纬度）之前。

#### A practical example

#### 实际示例

So you want to center your map on a certain place on the earth and obviously you
need to have its coordinates for this. Let's assume you want your map centered
on Schladming, a beautiful place in Austria. Head over to the wikipedia
page for [Schladming](https://en.wikipedia.org/wiki/Schladming). In the top-right
corner there is a link to [GeoHack](https://geohack.toolforge.org/geohack.php?pagename=Schladming&params=47_23_39_N_13_41_21_E_type:city(4565)_region:AT-6),
which effectively tells you the coordinates are:

假设您想将地图中心定位在地球上的某个特定位置，显然您需要获取该地点的坐标。假设您想将地图居中显示在奥地利美丽的施拉德明（Schladming）。打开维基百科的 [Schladming](https://en.wikipedia.org/wiki/Schladming) 词条页面。在右上角有一个指向 [GeoHack](https://geohack.toolforge.org/geohack.php?pagename=Schladming&params=47_23_39_N_13_41_21_E_type:city(4565)_region:AT-6) 的链接，它告诉我们该处的坐标为：

    WGS84:
    47° 23′ 39″ N, 13° 41′ 21″ E
    47.394167, 13.689167

So the next step would be to put the decimal coordinates into an array and use
it as center:

接下来的步骤就是将十进制坐标放入数组中，并将其作为中心点：

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj.js';

const schladming = [47.394167, 13.689167]; // caution partner, read on... 注意，请继续往下读……
// since we are using OSM, we have to transform the coordinates...
// 因为使用的是 OSM，我们需要对坐标进行转换……
const schladmingWebMercator = fromLonLat(schladming);

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: schladmingWebMercator,
    zoom: 9
  })
});
```

Running the above example will possibly surprise you, since we are not centered
on Schladming, Austria, but instead on Abyan, a region in Yemen (possibly also a
nice place). So what happened?

运行上述示例可能会让您大吃一惊，因为地图中心并没有落在奥地利的施拉德明，而是定位在也门的阿比扬（Abyan）地区（或许那里风景也不错）。那么究竟发生了什么？

Many people mix up the order of longitude and latitude in a coordinate array.
Don't worry if you get it wrong at first, many OpenLayers developers have to
think twice about whether to put the longitude or the latitude first when they
e.g. try to change the map center.

许多人都会弄混坐标数组中经度和纬度的顺序。如果您刚开始弄错了也不必担心，很多 OpenLayers 开发者在更改地图中心等操作时，也常常需要仔细确认究竟是经度在前还是纬度在前。

Ok, then let's flip the coordinates:

好的，那我们调换一下坐标顺序：

```javascript
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import {fromLonLat} from 'ol/proj.js';

const schladming = [13.689167, 47.394167]; // longitude first, then latitude 经度在前，纬度在后
// since we are using OSM, we have to transform the coordinates...
// 因为使用的是 OSM，我们需要对坐标进行转换……
const schladmingWebMercator = fromLonLat(schladming);

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  target: 'map',
  view: new View({
    center: schladmingWebMercator,
    zoom: 9
  })
});
```

Schladming is now correctly displayed in the center of the map.

现在施拉德明已正确显示在地图中心。

So when you deal with EPSG:4326 coordinates in OpenLayers, put the longitude
first, and then the latitude. This behaviour is the same as we had in OpenLayers
2, and it actually makes sense because of the natural axis order in WGS84.

因此，当您在 OpenLayers 中处理 EPSG:4326 坐标时，请将经度放在前面，纬度放在后面。这种行为与 OpenLayers 2 保持一致，并且符合 WGS84 中的自然坐标轴顺序。

If you cannot remember the correct order, just have a look at the method name
we used: `fromLonLat`; even there we hint that we expect longitude
first, and then latitude.

如果您记不清正确的顺序，只需看一下我们使用的方法名：`fromLonLat`；即使在方法名中，我们也明确提示了经度（Lon）在前、纬度（Lat）在后。


## Why aren't there any features in my source?

## 为什么我的数据源中没有要素？

Suppose you want to load a KML file and display the contained features on the
map. Code like the following could be used:

假设您想要加载一个 KML 文件并在地图上显示其中包含的要素。可能会编写类似如下的代码：

```javascript
import VectorLayer from 'ol/layer/Vector.js';
import KMLSource from 'ol/source/KML.js';

const vector = new VectorLayer({
  source: new KMLSource({
    projection: 'EPSG:3857',
    url: 'data/kml/2012-02-10.kml'
  })
});
```

You may ask yourself how many features are in that KML, and try something like
the following:

您可能会好奇该 KML 文件中有多少个要素，并尝试如下代码：

```javascript
import VectorLayer from 'ol/layer/Vector.js';
import KMLSource from 'ol/source/KML.js';

const vector = new VectorLayer({
  source: new KMLSource({
    projection: 'EPSG:3857',
    url: 'data/kml/2012-02-10.kml'
  })
});
const numFeatures = vector.getSource().getFeatures().length;
console.log("Count right after construction: " + numFeatures);
```

This will log a count of `0` features to be in the source. This is because the
loading of the KML-file will happen in an asynchronous manner. To get the count
as soon as possible (right after the file has been fetched and the source has
been populated with features), you should use an event listener function on the
`source`:

这将在控制台中输出数据源中的要素数量为 `0`。这是因为 KML 文件的加载过程是异步进行的。为了尽快获取要素数量（在文件请求完成且数据源被要素填充完毕后），您应该在 `source` 上使用事件监听函数：

```javascript
vector.getSource().on('change', function(evt){
  const source = evt.target;
  if (source.getState() === 'ready') {
    const numFeatures = source.getFeatures().length;
    console.log("Count after change: " + numFeatures);
  }
});
```

This will correctly report the number of features, `1119` in that particular
case.

此时便会正确报告要素的数量，在本例中为 `1119`。


## How do I force a re-render of the map?

## 如何强制重新渲染地图？

Usually the map is automatically re-rendered, once a source changes (for example
when a remote source has loaded).

通常情况下，一旦数据源发生改变（例如远程数据源加载完成），地图会自动重新渲染。

If you actually want to manually trigger a rendering, you could use

如果您确实需要手动触发渲染，可以使用：

```javascript
map.render();
```

...or its companion method

……或者其同步执行方法：

```javascript
map.renderSync();
```

## Why are my features not found?

## 为什么找不到我的要素？

You are using `Map#forEachFeatureAtPixel` or `Map#hasFeatureAtPixel`, but
it sometimes does not work for large icons or labels? The *hit detection* only
checks features that are within a certain distance of the given position. For large
icons, the actual geometry of a feature might be too far away and is not considered.

当您使用 `Map#forEachFeatureAtPixel` 或 `Map#hasFeatureAtPixel` 时，是否发现对于大尺寸图标或标签有时无法生效？这是因为*点击检测（Hit detection）*仅检查位于指定位置一定距离范围内的要素。对于大图标，要素的实际几何坐标可能相距过远，从而未被纳入检测范围。

In this case, set the `renderBuffer` property of `VectorLayer` (the default value is 100px):

在这种情况下，可以设置 `VectorLayer` 的 `renderBuffer` 属性（默认值为 100px）：

```javascript
import VectorLayer from 'ol/layer/Vector.js';

const vectorLayer = new VectorLayer({
  ...
  renderBuffer: 200
});
```

The recommended value is the size of the largest symbol, line width or label.

建议将该值设置为最大符号尺寸、线宽或标签大小。