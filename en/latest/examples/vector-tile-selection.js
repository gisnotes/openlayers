import { Ar as Style, Bt as MVT, Dr as Map, Mr as Stroke, Ni as View, Pr as Fill, Rt as VectorTile, zt as VectorTileLayer } from "./common.js";
//#region examples/vector-tile-selection.js
var selection = {};
var country = new Style({
	stroke: new Stroke({
		color: "gray",
		width: 1
	}),
	fill: new Fill({ color: "rgba(20,20,20,0.9)" })
});
var selectedCountry = new Style({
	stroke: new Stroke({
		color: "rgba(200,20,20,0.8)",
		width: 2
	}),
	fill: new Fill({ color: "rgba(200,20,20,0.4)" })
});
var vtLayer = new VectorTileLayer({
	declutter: true,
	source: new VectorTile({
		maxZoom: 15,
		format: new MVT({ idProperty: "iso_a3" }),
		url: "https://ahocevar.com/geoserver/gwc/service/tms/1.0.0/ne:ne_10m_admin_0_countries@EPSG%3A900913@pbf/{z}/{x}/{-y}.pbf"
	}),
	style: country
});
var map = new Map({
	layers: [vtLayer],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2,
		multiWorld: true
	})
});
var selectionLayer = new VectorTileLayer({
	map,
	renderMode: "vector",
	source: vtLayer.getSource(),
	style: function(feature) {
		if (feature.getId() in selection) return selectedCountry;
	}
});
var selectElement = document.getElementById("type");
map.on(["click", "pointermove"], function(event) {
	if (selectElement.value === "singleselect-hover" && event.type !== "pointermove" || selectElement.value !== "singleselect-hover" && event.type === "pointermove") return;
	vtLayer.getFeatures(event.pixel).then(function(features) {
		if (!features.length) {
			selection = {};
			selectionLayer.changed();
			return;
		}
		const feature = features[0];
		if (!feature) return;
		const fid = feature.getId();
		if (selectElement.value.startsWith("singleselect")) selection = {};
		selection[fid] = feature;
		selectionLayer.changed();
	});
});
//#endregion

//# sourceMappingURL=vector-tile-selection.js.map