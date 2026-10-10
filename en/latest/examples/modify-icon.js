import { $n as VectorLayer, Ar as Style, Dr as Map, Ki as Point, Ni as View, Nr as Icon, Un as VectorSource, rr as Feature, yr as TileLayer } from "./common.js";
import { t as OGCMapTile } from "./OGCMapTile.js";
import { t as Modify } from "./Modify.js";
//#region examples/modify-icon.js
var iconFeature = new Feature({
	geometry: new Point([0, 0]),
	name: "Null Island",
	population: 4e3,
	rainfall: 500
});
var iconStyle = new Style({ image: new Icon({
	anchor: [.5, 46],
	anchorXUnits: "fraction",
	anchorYUnits: "pixels",
	src: "data/icon.png"
}) });
iconFeature.setStyle(iconStyle);
var vectorSource = new VectorSource({ features: [iconFeature] });
var vectorLayer = new VectorLayer({ source: vectorSource });
var rasterLayer = new TileLayer({ source: new OGCMapTile({
	url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
	crossOrigin: ""
}) });
var target = document.getElementById("map");
var map = new Map({
	layers: [rasterLayer, vectorLayer],
	target,
	view: new View({
		center: [0, 0],
		zoom: 3
	})
});
var modify = new Modify({
	hitDetection: vectorLayer,
	source: vectorSource
});
modify.on(["modifystart", "modifyend"], function(evt) {
	target.style.cursor = evt.type === "modifystart" ? "grabbing" : "pointer";
});
modify.getOverlay().getSource().on(["addfeature", "removefeature"], function(evt) {
	target.style.cursor = evt.type === "addfeature" ? "pointer" : "";
});
map.addInteraction(modify);
//#endregion

//# sourceMappingURL=modify-icon.js.map