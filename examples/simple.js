import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/simple.js
new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=simple.js.map