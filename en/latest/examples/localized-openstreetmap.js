import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM, t as ATTRIBUTION } from "./OSM.js";
//#region examples/localized-openstreetmap.js
new Map({
	layers: [new TileLayer({ source: new OSM({
		attributions: ["All maps © <a href=\"https://www.opencyclemap.org/\">OpenCycleMap</a>", ATTRIBUTION],
		url: "https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0e6fc415256d4fbb9b5166a718591d71"
	}) }), new TileLayer({ source: new OSM({
		attributions: ["All maps © <a href=\"https://www.openseamap.org/\">OpenSeaMap</a>", ATTRIBUTION],
		url: "https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png"
	}) })],
	target: "map",
	view: new View({
		maxZoom: 18,
		center: [-244780.24508882355, 5986452.183179816],
		zoom: 15
	})
});
//#endregion

//# sourceMappingURL=localized-openstreetmap.js.map