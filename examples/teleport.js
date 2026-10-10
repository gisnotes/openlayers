import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/teleport.js
var map = new Map({
	layers: [new TileLayer({ source: new OSM() })],
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
map.setTarget("map1");
document.getElementById("teleport").addEventListener("click", function() {
	const target = map.getTarget() === "map1" ? "map2" : "map1";
	map.setTarget(target);
}, false);
//#endregion

//# sourceMappingURL=teleport.js.map