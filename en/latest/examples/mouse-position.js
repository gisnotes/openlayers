import { Dr as Map, Ni as View, Wa as createStringXY, bi as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as MousePosition } from "./MousePosition.js";
//#region examples/mouse-position.js
var mousePositionControl = new MousePosition({
	coordinateFormat: createStringXY(4),
	projection: "EPSG:4326",
	className: "custom-mouse-position",
	target: document.getElementById("mouse-position")
});
new Map({
	controls: defaults().extend([mousePositionControl]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
document.getElementById("projection").addEventListener("change", function(event) {
	mousePositionControl.setProjection(event.target.value);
});
document.getElementById("precision").addEventListener("change", function(event) {
	const format = createStringXY(event.target.valueAsNumber);
	mousePositionControl.setCoordinateFormat(format);
});
//#endregion

//# sourceMappingURL=mouse-position.js.map