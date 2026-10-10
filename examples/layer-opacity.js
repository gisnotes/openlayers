import { Dr as Map, Ni as View, at as WebGLTileLayer, kn as ImageTileSource } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/layer-opacity.js
var imagery = new WebGLTileLayer({
	className: "ol-layer-imagery",
	source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> ",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	})
});
var osm = new WebGLTileLayer({ source: new OSM() });
new Map({
	layers: [imagery, osm],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
var opacityInput = document.getElementById("opacity-input");
var opacityOutput = document.getElementById("opacity-output");
function update() {
	const opacity = parseFloat(opacityInput.value);
	osm.setOpacity(opacity);
	opacityOutput.innerText = opacity.toFixed(2);
}
opacityInput.addEventListener("input", update);
update();
//#endregion

//# sourceMappingURL=layer-opacity.js.map