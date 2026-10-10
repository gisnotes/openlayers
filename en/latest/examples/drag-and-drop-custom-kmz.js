import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Ni as View, T as unzipSync, Un as VectorSource, ni as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as KML } from "./KML2.js";
import { t as GPX } from "./GPX2.js";
import { t as IGC } from "./IGC2.js";
import { t as TopoJSON } from "./TopoJSON2.js";
import { t as DragAndDrop } from "./DragAndDrop.js";
//#region examples/drag-and-drop-custom-kmz.js
var zip;
function getKMLData(buffer) {
	zip = unzipSync(new Uint8Array(buffer));
	const kml = Object.keys(zip).find((key) => /\.kml$/i.test(key));
	if (!(kml in zip)) return null;
	return new TextDecoder().decode(zip[kml]);
}
function getKMLImage(href) {
	const index = window.location.href.lastIndexOf("/");
	if (index === -1) return href;
	const image = href.slice(index + 1);
	if (!(image in zip)) return href;
	return URL.createObjectURL(new Blob([zip[image]]));
}
var KMZ = class extends KML {
	constructor(opt_options) {
		const options = opt_options || {};
		options.iconUrlFunction = getKMLImage;
		super(options);
	}
	getType() {
		return "arraybuffer";
	}
	readFeature(source, options) {
		const kmlData = getKMLData(source);
		return super.readFeature(kmlData, options);
	}
	readFeatures(source, options) {
		const kmlData = getKMLData(source);
		return super.readFeatures(kmlData, options);
	}
};
var dragAndDropInteraction = new DragAndDrop({ formatConstructors: [
	KMZ,
	GPX,
	GeoJSON,
	IGC,
	KML,
	TopoJSON
] });
var map = new Map({
	interactions: defaults().extend([dragAndDropInteraction]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
dragAndDropInteraction.on("addfeatures", function(event) {
	const vectorSource = new VectorSource({ features: event.features });
	map.addLayer(new VectorLayer({ source: vectorSource }));
	map.getView().fit(vectorSource.getExtent());
});
var displayFeatureInfo = function(pixel) {
	const features = map.getFeaturesAtPixel(pixel);
	let html;
	if (features.length > 0) {
		const info = [];
		for (let i = 0, ii = features.length; i < ii; ++i) {
			const description = features[i].get("description") || features[i].get("name") || features[i].get("_name") || features[i].get("layer");
			if (description) info.push(description);
		}
		html = info.join("<br/>");
	}
	document.getElementById("info").innerHTML = html ?? "";
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
	fetch(fullpath).then((response) => response.blob()).then(function(blob) {
		link.href = URL.createObjectURL(blob);
		link.download = filename;
		link.click();
	});
}
document.getElementById("download-kmz").addEventListener("click", function() {
	download("data/kmz/iceland.kmz", "iceland.kmz");
});
//#endregion

//# sourceMappingURL=drag-and-drop-custom-kmz.js.map