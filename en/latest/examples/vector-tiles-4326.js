import { A as applyStyle, Dr as Map, Ni as View, Rt as VectorTile, k as applyBackground, mr as createXYZ, zt as VectorTileLayer } from "./common.js";
//#region examples/vector-tiles-4326.js
var url = "https://api.maptiler.com/maps/basic-4326/style.json?key=EPhPi7Zr1GTS500UybLu";
var tileGrid = createXYZ({
	extent: [
		-180,
		-90,
		180,
		90
	],
	tileSize: 512,
	maxResolution: 180 / 512,
	maxZoom: 13
});
var layer = new VectorTileLayer({
	declutter: true,
	source: new VectorTile({
		projection: "EPSG:4326",
		tileGrid
	})
});
applyStyle(layer, url, { resolutions: tileGrid.getResolutions() });
applyBackground(layer, url);
new Map({
	target: "map",
	layers: [layer],
	view: new View({
		projection: "EPSG:4326",
		zoom: 0,
		center: [0, 30]
	})
});
//#endregion

//# sourceMappingURL=vector-tiles-4326.js.map