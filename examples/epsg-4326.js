import { B as TileWMS, Dr as Map, Ni as View, bi as defaults, yr as TileLayer } from "./common.js";
import { t as ScaleLine } from "./ScaleLine.js";
//#region examples/epsg-4326.js
var layers = [new TileLayer({ source: new TileWMS({
	url: "https://ahocevar.com/geoserver/wms",
	params: {
		"LAYERS": "ne:NE1_HR_LC_SR_W_DR",
		"TILED": true
	}
}) })];
new Map({
	controls: defaults().extend([new ScaleLine({ units: "degrees" })]),
	layers,
	target: "map",
	view: new View({
		projection: "EPSG:4326",
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=epsg-4326.js.map