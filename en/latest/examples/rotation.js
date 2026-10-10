import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/rotation.js
new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [142e5, 413e4],
		rotation: Math.PI / 6,
		zoom: 10
	})
});
//#endregion

//# sourceMappingURL=rotation.js.map