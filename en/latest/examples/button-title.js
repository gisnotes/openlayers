import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/button-title.js
new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [-873e4, 593e4],
		rotation: Math.PI / 5,
		zoom: 8
	})
});
document.querySelectorAll(".ol-zoom-in, .ol-zoom-out, .ol-rotate-reset").forEach(function(el) {
	new bootstrap.Tooltip(el, { container: "#map" });
});
//#endregion

//# sourceMappingURL=button-title.js.map