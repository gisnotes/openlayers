import { Dr as Map, Ni as View, at as WebGLTileLayer, kn as ImageTileSource } from "./common.js";
//#region examples/webgl-tiles.js
new Map({
	target: "map",
	layers: [new WebGLTileLayer({ source: new ImageTileSource({
		url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
		attributions: "&#169; <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">OpenStreetMap</a> contributors."
	}) })],
	view: new View({
		center: [0, 0],
		zoom: 0
	})
});
//#endregion

//# sourceMappingURL=webgl-tiles.js.map