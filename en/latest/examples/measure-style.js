import { $n as VectorLayer, Ar as Style, Dr as Map, Fa as getArea, Fr as CircleStyle, Ir as RegularShape, Ki as Point, La as getLength, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, Xn as LineString, kr as Text, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
import { t as Modify } from "./Modify.js";
//#region examples/measure-style.js
var typeSelect = document.getElementById("type");
var showSegments = document.getElementById("segments");
var clearPrevious = document.getElementById("clear");
/**
* 1. 基础几何图形样式（用于渲染被测量的折线、多边形以及绘制时的光标圆点）
*/
var style = new Style({
	fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" }),
	stroke: new Stroke({
		color: "rgba(0, 0, 0, 0.5)",
		lineDash: [10, 10],
		width: 2
	}),
	image: new CircleStyle({
		radius: 5,
		stroke: new Stroke({ color: "rgba(0, 0, 0, 0.7)" }),
		fill: new Fill({ color: "rgba(255, 255, 255, 0.2)" })
	})
});
/**
* 2. 总测量结果（总长度 / 总面积）的主气泡标签样式
* 巧妙地利用 Text（带黑底背景框，向上偏移 15px）+ RegularShape（旋转 180° 的倒正三角形，向上位移 10px）
* 在纯 Canvas 中拼合成带底部指示尖角的气泡标签（Callout Bubble）
*/
var labelStyle = new Style({
	text: new Text({
		font: "14px Calibri,sans-serif",
		fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
		backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.7)" }),
		padding: [
			3,
			3,
			3,
			3
		],
		textBaseline: "bottom",
		offsetY: -15
	}),
	image: new RegularShape({
		radius: 8,
		points: 3,
		angle: Math.PI,
		displacement: [0, 10],
		fill: new Fill({ color: "rgba(0, 0, 0, 0.7)" })
	})
});
/**
* 3. 绘制过程中的鼠标跟随操作提示样式（如“Click to start measuring”）
*/
var tipStyle = new Style({ text: new Text({
	font: "12px Calibri,sans-serif",
	fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
	backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
	padding: [
		2,
		2,
		2,
		2
	],
	textAlign: "left",
	offsetX: 15
}) });
/**
* 4. 顶点编辑（Modify 交互）时的捕捉点与操作提示样式（“Drag to modify”）
*/
var modifyStyle = new Style({
	image: new CircleStyle({
		radius: 5,
		stroke: new Stroke({ color: "rgba(0, 0, 0, 0.7)" }),
		fill: new Fill({ color: "rgba(0, 0, 0, 0.4)" })
	}),
	text: new Text({
		text: "Drag to modify",
		font: "12px Calibri,sans-serif",
		fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
		backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.7)" }),
		padding: [
			2,
			2,
			2,
			2
		],
		textAlign: "left",
		offsetX: 15
	})
});
/**
* 5. 每一条线段（或边）中点处的分段长度小气泡标签样式模板
*/
var segmentStyle = new Style({
	text: new Text({
		font: "12px Calibri,sans-serif",
		fill: new Fill({ color: "rgba(255, 255, 255, 1)" }),
		backgroundFill: new Fill({ color: "rgba(0, 0, 0, 0.4)" }),
		padding: [
			2,
			2,
			2,
			2
		],
		textBaseline: "bottom",
		offsetY: -12
	}),
	image: new RegularShape({
		radius: 6,
		points: 3,
		angle: Math.PI,
		displacement: [0, 8],
		fill: new Fill({ color: "rgba(0, 0, 0, 0.4)" })
	})
});
var segmentStyles = [segmentStyle];
/**
* 计算并格式化折线的球面大圆距离（使用 ol/sphere 的 getLength）
* @param {LineString} line 折线几何对象
* @return {string} 格式化后的长度字符串（m 或 km）
*/
var formatLength = function(line) {
	const length = getLength(line);
	let output;
	if (length > 100) output = Math.round(length / 1e3 * 100) / 100 + " km";
	else output = Math.round(length * 100) / 100 + " m";
	return output;
};
/**
* 计算并格式化多边形的球面真实面积（使用 ol/sphere 的 getArea）
* @param {import("../src/ol/geom/Polygon.js").default} polygon 多边形几何对象
* @return {string} 格式化后的面积字符串（m² 或 km²）
*/
var formatArea = function(polygon) {
	const area = getArea(polygon);
	let output;
	if (area > 1e4) output = Math.round(area / 1e6 * 100) / 100 + " km²";
	else output = Math.round(area * 100) / 100 + " m²";
	return output;
};
var raster = new TileLayer({ source: new OSM() });
var source = new VectorSource();
var modify = new Modify({
	source,
	style: modifyStyle
});
var tipPoint;
/**
* 核心动态样式函数（同时服务于已完成的 VectorLayer 和正在绘制的 Draw 交互草图图层）
* @param {import("../src/ol/Feature.js").FeatureLike} feature 当前渲染的要素
* @param {boolean} segments 是否显示每条线段的分段长度
* @param {string} [drawType] 当前正在绘制的几何类型（仅在 Draw 样式回调中传入）
* @param {string} [tip] 当前鼠标跟随提示文本（仅在 Draw 样式回调中传入）
* @return {Array<Style>} 叠加渲染的样式数组
*/
function styleFunction(feature, segments, drawType, tip) {
	const styles = [];
	const geometry = feature.getGeometry();
	const type = geometry.getType();
	let point, label, line;
	if (!drawType || drawType === type || type === "Point") {
		styles.push(style);
		if (type === "Polygon") {
			point = geometry.getInteriorPoint();
			label = formatArea(geometry);
			line = new LineString(geometry.getCoordinates()[0]);
		} else if (type === "LineString") {
			point = new Point(geometry.getLastCoordinate());
			label = formatLength(geometry);
			line = geometry;
		}
	}
	if (segments && line) {
		let count = 0;
		line.forEachSegment(function(a, b) {
			const segment = new LineString([a, b]);
			const label = formatLength(segment);
			if (segmentStyles.length - 1 < count) segmentStyles.push(segmentStyle.clone());
			const segmentPoint = new Point(segment.getCoordinateAt(.5));
			segmentStyles[count].setGeometry(segmentPoint);
			segmentStyles[count].getText().setText(label);
			styles.push(segmentStyles[count]);
			count++;
		});
	}
	if (label) {
		labelStyle.setGeometry(point);
		labelStyle.getText().setText(label);
		styles.push(labelStyle);
	}
	if (tip && type === "Point" && !modify.getOverlay().getSource().getFeatures().length) {
		tipPoint = geometry;
		tipStyle.getText().setText(tip);
		styles.push(tipStyle);
	}
	return styles;
}
var vector = new VectorLayer({
	source,
	style: function(feature) {
		return styleFunction(feature, showSegments.checked);
	}
});
var map = new Map({
	layers: [raster, vector],
	target: "map",
	view: new View({
		center: [-11e6, 46e5],
		zoom: 15
	})
});
map.addInteraction(modify);
var draw;
function addInteraction() {
	const drawType = typeSelect.value;
	const activeTip = "Click to continue drawing the " + (drawType === "Polygon" ? "polygon" : "line");
	const idleTip = "Click to start measuring";
	let tip = idleTip;
	draw = new Draw({
		source,
		type: drawType,
		style: function(feature) {
			return styleFunction(feature, showSegments.checked, drawType, tip);
		}
	});
	draw.on("drawstart", function() {
		if (clearPrevious.checked) source.clear();
		modify.setActive(false);
		tip = activeTip;
	});
	draw.on("drawend", function() {
		modifyStyle.setGeometry(tipPoint);
		modify.setActive(true);
		map.once("pointermove", function() {
			modifyStyle.setGeometry(null);
		});
		tip = idleTip;
	});
	modify.setActive(true);
	map.addInteraction(draw);
}
typeSelect.onchange = function() {
	map.removeInteraction(draw);
	addInteraction();
};
addInteraction();
showSegments.onchange = function() {
	vector.changed();
	draw.getOverlay().changed();
};
//#endregion

//# sourceMappingURL=measure-style.js.map