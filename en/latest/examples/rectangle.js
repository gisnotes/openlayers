import { $n as VectorLayer, Dr as Map, Hi as fromExtent, Ni as View, Un as VectorSource, rr as Feature, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/rectangle.js
new Map({
	layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source: new VectorSource({ features: [new Feature(fromExtent([
		-1e6,
		5e6,
		3e6,
		7e6
	]))] }) })],
	target: "map",
	view: new View({
		center: [1e6, 6e6],
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=rectangle.js.map