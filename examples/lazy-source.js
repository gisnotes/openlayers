import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/lazy-source.js
var source = new OSM();
var layer = new TileLayer();
new Map({
	layers: [layer],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
document.getElementById("set-source").onclick = function() {
	layer.setSource(source);
};
document.getElementById("unset-source").onclick = function() {
	layer.setSource(null);
};
//#endregion

//# sourceMappingURL=lazy-source.js.map