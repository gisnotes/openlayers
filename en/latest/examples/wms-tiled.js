import { B as TileWMS, Dr as Map, Ni as View, at as WebGLTileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/wms-tiled.js
new Map({
	layers: [new WebGLTileLayer({ source: new OSM() }), new WebGLTileLayer({
		extent: [
			-13884991,
			2870341,
			-7455066,
			6338219
		],
		source: new TileWMS({
			url: "https://ahocevar.com/geoserver/wms",
			params: {
				"LAYERS": "topp:states",
				"TILED": true
			},
			serverType: "geoserver",
			transition: 0
		})
	})],
	target: "map",
	view: new View({
		center: [-10997148, 4569099],
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=wms-tiled.js.map