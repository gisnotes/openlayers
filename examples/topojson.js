import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, kn as ImageTileSource, yr as TileLayer } from "./common.js";
import { t as TopoJSON } from "./TopoJSON2.js";
//#region examples/topojson.js
new Map({
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512
	}) }), new VectorLayer({
		source: new VectorSource({
			url: "data/topojson/world-110m.json",
			format: new TopoJSON({ layers: ["countries"] }),
			overlaps: false
		}),
		style: {
			"stroke-color": "white",
			"stroke-width": 1.5
		}
	})],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
//#endregion

//# sourceMappingURL=topojson.js.map