import { B as TileWMS, Dr as Map, Ni as View, va as get, vr as TileGrid, xo as getWidth, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/wms-custom-tilegrid-512x256.js
var startResolution = getWidth(get("EPSG:3857").getExtent()) / 256;
var resolutions = new Array(22);
for (let i = 0, ii = resolutions.length; i < ii; ++i) resolutions[i] = startResolution / Math.pow(2, i);
var tileGrid = new TileGrid({
	extent: [
		-13884991,
		2870341,
		-7455066,
		6338219
	],
	resolutions,
	tileSize: [512, 256]
});
new Map({
	layers: [new TileLayer({ source: new OSM() }), new TileLayer({ source: new TileWMS({
		url: "https://ahocevar.com/geoserver/wms",
		params: {
			"LAYERS": "topp:states",
			"TILED": true
		},
		serverType: "geoserver",
		tileGrid
	}) })],
	target: "map",
	view: new View({
		center: [-10997148, 4569099],
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=wms-custom-tilegrid-512x256.js.map