import { $n as VectorLayer, Ar as Style, Dr as Map, Fr as CircleStyle, Ki as Point, Mr as Stroke, Ni as View, Nr as Icon, Pr as Fill, Un as VectorSource, kr as Text, rr as Feature, yr as TileLayer } from "./common.js";
import { t as OGCMapTile } from "./OGCMapTile.js";
//#region examples/icon-scale.js
var iconFeature = new Feature({ geometry: new Point([0, 0]) });
var iconStyle = new Style({
	image: new Icon({
		anchor: [.5, 1],
		src: "data/world.png"
	}),
	text: new Text({
		text: "World\nText",
		font: "bold 30px Calibri,sans-serif",
		fill: new Fill({ color: "black" }),
		stroke: new Stroke({
			color: "white",
			width: 2
		})
	})
});
var pointStyle = new Style({ image: new CircleStyle({
	radius: 7,
	fill: new Fill({ color: "black" }),
	stroke: new Stroke({
		color: "white",
		width: 2
	})
}) });
iconFeature.setStyle([pointStyle, iconStyle]);
var vectorLayer = new VectorLayer({ source: new VectorSource({ features: [iconFeature] }) });
var map = new Map({
	layers: [new TileLayer({ source: new OGCMapTile({
		url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
		crossOrigin: ""
	}) }), vectorLayer],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 3
	})
});
var textAlignments = [
	"left",
	"center",
	"right"
];
var textBaselines = [
	"top",
	"middle",
	"bottom"
];
var controls = {};
[
	"rotation",
	"rotateWithView",
	"scaleX",
	"scaleY",
	"anchorX",
	"anchorY",
	"displacementX",
	"displacementY",
	"textRotation",
	"textRotateWithView",
	"textScaleX",
	"textScaleY",
	"textAlign",
	"textBaseline",
	"textOffsetX",
	"textOffsetY"
].forEach(function(id) {
	const control = document.getElementById(id);
	const output = document.getElementById(id + "Out");
	function setOutput() {
		const value = parseFloat(control.value);
		if (control.type === "checkbox") output.innerText = String(control.checked);
		else if (id === "textAlign") output.innerText = textAlignments[value];
		else if (id === "textBaseline") output.innerText = textBaselines[value];
		else output.innerText = control.step.startsWith("0.") ? value.toFixed(2) : String(value);
	}
	control.addEventListener("input", function() {
		setOutput();
		updateStyle();
	});
	setOutput();
	controls[id] = control;
});
/**
* Apply all current UI control values to the Icon and Text styles, then trigger feature re-render
* 将所有 UI 控件的当前值同步设置到 Icon 和 Text 样式对象上，并通知要素触发重绘
*/
function updateStyle() {
	iconStyle.getImage().setRotation(parseFloat(controls["rotation"].value) * Math.PI);
	iconStyle.getImage().setRotateWithView(controls["rotateWithView"].checked);
	iconStyle.getImage().setScale([parseFloat(controls["scaleX"].value), parseFloat(controls["scaleY"].value)]);
	iconStyle.getImage().setAnchor([parseFloat(controls["anchorX"].value), parseFloat(controls["anchorY"].value)]);
	iconStyle.getImage().setDisplacement([parseFloat(controls["displacementX"].value), parseFloat(controls["displacementY"].value)]);
	iconStyle.getText().setRotation(parseFloat(controls["textRotation"].value) * Math.PI);
	iconStyle.getText().setRotateWithView(controls["textRotateWithView"].checked);
	iconStyle.getText().setScale([parseFloat(controls["textScaleX"].value), parseFloat(controls["textScaleY"].value)]);
	iconStyle.getText().setTextAlign(textAlignments[parseFloat(controls["textAlign"].value)]);
	iconStyle.getText().setTextBaseline(textBaselines[parseFloat(controls["textBaseline"].value)]);
	iconStyle.getText().setOffsetX(parseFloat(controls["textOffsetX"].value));
	iconStyle.getText().setOffsetY(parseFloat(controls["textOffsetY"].value));
	iconFeature.changed();
}
updateStyle();
map.on("pointermove", function(e) {
	const hit = map.hasFeatureAtPixel(e.pixel);
	map.getTargetElement().style.cursor = hit ? "pointer" : "";
});
//#endregion

//# sourceMappingURL=icon-scale.js.map