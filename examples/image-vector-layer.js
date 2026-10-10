import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource } from "./common.js";
import { t as VectorImageLayer } from "./VectorImage.js";
//#region examples/image-vector-layer.js
var map = new Map({
	layers: [new VectorImageLayer({
		background: "#1a2b39",
		imageRatio: 2,
		source: new VectorSource({
			url: "https://openlayers.org/data/vector/ecoregions.json",
			format: new GeoJSON()
		}),
		style: { "fill-color": [
			"string",
			["get", "COLOR"],
			"#eee"
		] }
	})],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
var featureOverlay = new VectorLayer({
	source: new VectorSource(),
	map,
	style: {
		"stroke-color": "rgba(255, 255, 255, 0.7)",
		"stroke-width": 2
	}
});
var highlight;
var displayFeatureInfo = function(pixel) {
	const feature = map.forEachFeatureAtPixel(pixel, function(feature) {
		return feature;
	});
	const info = document.getElementById("info");
	if (feature) info.innerHTML = feature.get("ECO_NAME") || "&nbsp;";
	else info.innerHTML = "&nbsp;";
	if (feature !== highlight) {
		if (highlight) featureOverlay.getSource().removeFeature(highlight);
		if (feature) featureOverlay.getSource().addFeature(feature);
		highlight = feature;
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

//# sourceMappingURL=image-vector-layer.js.map