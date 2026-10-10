import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource, kn as ImageTileSource, yr as TileLayer } from "./common.js";
import { t as KML } from "./KML2.js";
import { t as GPX } from "./GPX2.js";
import { t as IGC } from "./IGC2.js";
import { t as TopoJSON } from "./TopoJSON2.js";
import { t as DragAndDrop } from "./DragAndDrop.js";
//#region examples/drag-and-drop.js
var map = new Map({
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
var extractStyles = document.getElementById("extractstyles");
var dragAndDropInteraction;
function setInteraction() {
	if (dragAndDropInteraction) map.removeInteraction(dragAndDropInteraction);
	dragAndDropInteraction = new DragAndDrop({ formatConstructors: [
		GPX,
		GeoJSON,
		IGC,
		new KML({ extractStyles: extractStyles.checked }),
		TopoJSON
	] });
	dragAndDropInteraction.on("addfeatures", function(event) {
		const vectorSource = new VectorSource({ features: event.features });
		map.addLayer(new VectorLayer({ source: vectorSource }));
		map.getView().fit(vectorSource.getExtent());
	});
	map.addInteraction(dragAndDropInteraction);
}
setInteraction();
extractStyles.addEventListener("change", setInteraction);
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
var link = document.getElementById("download");
function download(fullpath, filename) {
	fetch(fullpath).then(function(response) {
		return response.blob();
	}).then(function(blob) {
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	});
}
document.getElementById("download-gpx").addEventListener("click", function() {
	download("data/gpx/fells_loop.gpx", "fells_loop.gpx");
});
document.getElementById("download-geojson").addEventListener("click", function() {
	download("data/geojson/roads-seoul.geojson", "roads-seoul.geojson");
});
document.getElementById("download-igc").addEventListener("click", function() {
	download("data/igc/Ulrich-Prinz.igc", "Ulrich-Prinz.igc");
});
document.getElementById("download-kml").addEventListener("click", function() {
	download("data/kml/states.kml", "states.kml");
});
document.getElementById("download-topojson").addEventListener("click", function() {
	download("data/topojson/fr-departments.json", "fr-departments.json");
});
//#endregion

//# sourceMappingURL=drag-and-drop.js.map