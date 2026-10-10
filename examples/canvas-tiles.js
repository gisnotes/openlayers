import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as TileDebug } from "./TileDebug.js";
//#region examples/canvas-tiles.js
new Map({
	layers: [new TileLayer({ source: new OSM() }), new TileLayer({ source: new TileDebug() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
//#endregion

//# sourceMappingURL=canvas-tiles.js.map