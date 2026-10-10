import { Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource, kn as ImageTileSource, ni as defaults, yr as TileLayer } from "./common.js";
import { t as KML } from "./KML2.js";
import { t as GPX } from "./GPX2.js";
import { t as IGC } from "./IGC2.js";
import { t as TopoJSON } from "./TopoJSON2.js";
import { t as DragAndDrop } from "./DragAndDrop.js";
import { t as VectorImageLayer } from "./VectorImage.js";
//#region examples/drag-and-drop-image-vector.js
var dragAndDropInteraction = new DragAndDrop({ formatConstructors: [
	GPX,
	GeoJSON,
	IGC,
	KML,
	TopoJSON
] });
var map = new Map({
	interactions: defaults().extend([dragAndDropInteraction]),
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
dragAndDropInteraction.on("addfeatures", function(event) {
	const vectorSource = new VectorSource({ features: event.features });
	map.addLayer(new VectorImageLayer({ source: vectorSource }));
	map.getView().fit(vectorSource.getExtent());
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
		document.getElementById("info").innerHTML = info.join(", ") || "&nbsp";
	} else document.getElementById("info").innerHTML = "&nbsp;";
};
map.on("pointermove", function(evt) {
	if (evt.dragging) return;
	displayFeatureInfo(evt.pixel);
});
map.on("click", function(evt) {
	displayFeatureInfo(evt.pixel);
});
//#endregion

//# sourceMappingURL=drag-and-drop-image-vector.js.map