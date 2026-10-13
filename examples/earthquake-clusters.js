import { $n as VectorLayer, Ar as Style, Dr as Map, Fr as CircleStyle, Ir as RegularShape, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, _o as getHeight, kr as Text, ni as defaults, oo as createEmpty, uo as extend, xo as getWidth, yr as TileLayer } from "./common.js";
import { t as StadiaMaps } from "./StadiaMaps.js";
import { t as Select } from "./Select.js";
import { t as KML } from "./KML2.js";
import { t as Cluster } from "./Cluster2.js";
//#region examples/earthquake-clusters.js
var earthquakeFill = new Fill({ color: "rgba(255, 153, 0, 0.8)" });
var earthquakeStroke = new Stroke({
	color: "rgba(255, 204, 0, 0.2)",
	width: 1
});
var textFill = new Fill({ color: "#fff" });
var textStroke = new Stroke({
	color: "rgba(0, 0, 0, 0.6)",
	width: 3
});
var invisibleFill = new Fill({ color: "rgba(255, 255, 255, 0.01)" });
/**
* 为单个原始地震要素创建五角星样式（外接圆半径随震级线性放大）
* @param {import("../src/ol/Feature.js").default} feature 单个原始地震要素
* @return {Style} 五角星样式
*/
function createEarthquakeStyle(feature) {
	const name = feature.get("name");
	const radius = 5 + 20 * (parseFloat(name.substr(2)) - 5);
	return new Style({
		geometry: feature.getGeometry(),
		image: new RegularShape({
			radius,
			radius2: 3,
			points: 5,
			angle: Math.PI,
			fill: earthquakeFill,
			stroke: earthquakeStroke
		})
	});
}
var maxFeatureCount;
var vector = null;
/**
* 在当前分辨率下遍历所有聚合要素，计算：
* 1. 全局最大子要素数量 maxFeatureCount（用于归一化计算圆圈透明度）
* 2. 每个聚合包内部所有原始点位的地理包围盒跨度，并换算为屏幕像素半径缓存到 feature.set('radius', radius)
* @param {number} resolution 当前地图视图分辨率（地图单位/像素）
*/
var calculateClusterInfo = function(resolution) {
	maxFeatureCount = 0;
	const features = vector.getSource().getFeatures();
	let feature, radius;
	for (let i = features.length - 1; i >= 0; --i) {
		feature = features[i];
		const originalFeatures = feature.get("features");
		const extent = createEmpty();
		let j, jj;
		for (j = 0, jj = originalFeatures.length; j < jj; ++j) extend(extent, originalFeatures[j].getGeometry().getExtent());
		maxFeatureCount = Math.max(maxFeatureCount, jj);
		radius = .25 * (getWidth(extent) + getHeight(extent)) / resolution;
		feature.set("radius", radius);
	}
};
var currentResolution;
/**
* 聚合矢量图层的默认样式函数
* @param {import("../src/ol/Feature.js").FeatureLike} feature 聚合要素
* @param {number} resolution 当前视图分辨率
* @return {Style} 渲染样式
*/
function styleFunction(feature, resolution) {
	if (resolution != currentResolution) {
		calculateClusterInfo(resolution);
		currentResolution = resolution;
	}
	let style;
	const size = feature.get("features").length;
	if (size > 1) style = new Style({
		image: new CircleStyle({
			radius: feature.get("radius"),
			fill: new Fill({ color: [
				255,
				153,
				0,
				Math.min(.8, .4 + size / maxFeatureCount)
			] })
		}),
		text: new Text({
			text: size.toString(),
			fill: textFill,
			stroke: textStroke
		})
	});
	else {
		const originalFeature = feature.get("features")[0];
		style = createEarthquakeStyle(originalFeature);
	}
	return style;
}
/**
* 鼠标悬停或点击选中聚合要素时的动态散开样式函数
* @param {import("../src/ol/Feature.js").FeatureLike} feature 被选中的聚合要素
* @return {Array<Style>} 包含隐形碰撞热区圆与所有底层原始地震五角星的样式数组
*/
function selectStyleFunction(feature) {
	const styles = [new Style({ image: new CircleStyle({
		radius: feature.get("radius"),
		fill: invisibleFill
	}) })];
	const originalFeatures = feature.get("features");
	let originalFeature;
	for (let i = originalFeatures.length - 1; i >= 0; --i) {
		originalFeature = originalFeatures[i];
		styles.push(createEarthquakeStyle(originalFeature));
	}
	return styles;
}
vector = new VectorLayer({
	source: new Cluster({
		distance: 40,
		source: new VectorSource({
			url: "data/kml/2012_Earthquakes_Mag5.kml",
			format: new KML({ extractStyles: false })
		})
	}),
	style: styleFunction
});
new Map({
	layers: [new TileLayer({ source: new StadiaMaps({ layer: "stamen_toner" }) }), vector],
	interactions: defaults().extend([new Select({
		condition: function(evt) {
			return evt.type == "pointermove" || evt.type == "singleclick";
		},
		style: selectStyleFunction
	})]),
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=earthquake-clusters.js.map