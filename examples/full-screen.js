import { Dr as Map, Ni as View, at as WebGLTileLayer, bi as defaults, kn as ImageTileSource } from "./common.js";
import { t as FullScreen } from "./FullScreen.js";
//#region examples/full-screen.js
var view = new View({
	center: [-9101767, 2822912],
	zoom: 14
});
new Map({
	controls: defaults().extend([new FullScreen()]),
	layers: [new WebGLTileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) })],
	target: "map",
	view
});
//#endregion

//# sourceMappingURL=full-screen.js.map