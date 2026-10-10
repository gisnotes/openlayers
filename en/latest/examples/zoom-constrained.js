import { Dr as Map, Ni as View, kn as ImageTileSource, yr as TileLayer } from "./common.js";
//#region examples/zoom-constrained.js
new Map({
	target: "map",
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512
	}) })],
	view: new View({
		center: [-13553864, 5918250],
		zoom: 11,
		minZoom: 9,
		maxZoom: 13
	})
});
//#endregion

//# sourceMappingURL=zoom-constrained.js.map