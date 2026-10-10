import { Dr as Map, Ni as View, bi as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as ScaleLine } from "./ScaleLine.js";
//#region examples/scale-line.js
var scaleBarOptionsContainer = document.getElementById("scaleBarOptions");
var unitsSelect = document.getElementById("units");
var typeSelect = document.getElementById("type");
var stepsRange = document.getElementById("steps");
var scaleTextCheckbox = document.getElementById("showScaleText");
var invertColorsCheckbox = document.getElementById("invertColors");
var control;
function scaleControl() {
	if (typeSelect.value === "scaleline") {
		control = new ScaleLine({ units: unitsSelect.value });
		scaleBarOptionsContainer.style.display = "none";
	} else {
		control = new ScaleLine({
			units: unitsSelect.value,
			bar: true,
			steps: parseInt(stepsRange.value, 10),
			text: scaleTextCheckbox.checked,
			minWidth: 140
		});
		onInvertColorsChange();
		scaleBarOptionsContainer.style.display = "block";
	}
	return control;
}
var map = new Map({
	controls: defaults().extend([scaleControl()]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
function reconfigureScaleLine() {
	map.removeControl(control);
	map.addControl(scaleControl());
}
function onChangeUnit() {
	control.setUnits(unitsSelect.value);
}
function onInvertColorsChange() {
	control.element.classList.toggle("ol-scale-bar-inverted", invertColorsCheckbox.checked);
}
unitsSelect.addEventListener("change", onChangeUnit);
typeSelect.addEventListener("change", reconfigureScaleLine);
stepsRange.addEventListener("input", reconfigureScaleLine);
scaleTextCheckbox.addEventListener("change", reconfigureScaleLine);
invertColorsCheckbox.addEventListener("change", onInvertColorsChange);
//#endregion

//# sourceMappingURL=scale-line.js.map