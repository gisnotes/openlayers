import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, kn as ImageTileSource, yr as TileLayer } from "./common.js";
import { t as KML } from "./KML2.js";
//#region examples/kml.js
var map = new Map({
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) }), new VectorLayer({ source: new VectorSource({
		url: "data/kml/2012-02-10.kml",
		format: new KML()
	}) })],
	target: document.getElementById("map"),
	view: new View({
		center: [876970.8463461736, 5859807.853963373],
		projection: "EPSG:3857",
		zoom: 10
	})
});
var displayFeatureInfo = function(pixel) {
	const features = [];
	map.forEachFeatureAtPixel(pixel, function(feature) {
		features.push(feature);
	});
	if (features.length > 0) {
		const info = [];
		let i, ii;
		for (i = 0, ii = features.length; i < ii; ++i) info.push(features[i].get("name"));
		document.getElementById("info").innerHTML = info.join(", ") || "(unknown)";
		map.getTargetElement().style.cursor = "pointer";
	} else {
		document.getElementById("info").innerHTML = "&nbsp;";
		map.getTargetElement().style.cursor = "";
	}
};
map.on("pointermove", function(evt) {
	if (evt.dragging) return;
	displayFeatureInfo(evt.pixel);
});
map.on("click", function(evt) {
	displayFeatureInfo(evt.pixel);
});
//#endregion

//# sourceMappingURL=kml.js.map