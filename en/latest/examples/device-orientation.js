import { Dr as Map, Mo as toRadians, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/device-orientation.js
var view = new View({
	center: [0, 0],
	zoom: 2
});
new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view
});
function el(id) {
	return document.getElementById(id);
}
var gn = new GyroNorm();
gn.init().then(function() {
	gn.start(function(event) {
		const center = view.getCenter();
		const resolution = view.getResolution();
		const alpha = toRadians(event.do.alpha);
		const beta = toRadians(event.do.beta);
		const gamma = toRadians(event.do.gamma);
		el("alpha").innerText = alpha + " [rad]";
		el("beta").innerText = beta + " [rad]";
		el("gamma").innerText = gamma + " [rad]";
		center[0] -= resolution * gamma * 25;
		center[1] += resolution * beta * 25;
		view.setCenter(center);
	});
}, function(e) {
	el("unsupported").innerText = typeof e === "string" ? e : "Could not initialize sensors";
});
//#endregion

//# sourceMappingURL=device-orientation.js.map