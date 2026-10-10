import { $n as VectorLayer, Ar as Style, Dr as Map, Ki as Point, Ni as View, Nr as Icon, Un as VectorSource, rr as Feature, yr as TileLayer } from "./common.js";
import { t as OGCMapTile } from "./OGCMapTile.js";
import { t as Overlay } from "./Overlay2.js";
//#region examples/icon.js
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
var vectorLayer = new VectorLayer({ source: new VectorSource({ features: [iconFeature] }) });
var map = new Map({
	layers: [new TileLayer({ source: new OGCMapTile({
		url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:raster:HYP_HR_SR_OB_DR/map/tiles/WebMercatorQuad",
		crossOrigin: ""
	}) }), vectorLayer],
	target: document.getElementById("map"),
	view: new View({
		center: [0, 0],
		zoom: 3
	})
});
var element = document.getElementById("popup");
var popup = new Overlay({
	element,
	positioning: "bottom-center",
	stopEvent: false
});
map.addOverlay(popup);
var popover;
function disposePopover() {
	if (popover) {
		popover.dispose();
		popover = void 0;
	}
}
map.on("click", function(evt) {
	const feature = map.forEachFeatureAtPixel(evt.pixel, function(feature) {
		return feature;
	});
	disposePopover();
	if (!feature) return;
	popup.setPosition(evt.coordinate);
	popover = new bootstrap.Popover(element, {
		placement: "top",
		html: true,
		content: feature.get("name")
	});
	popover.show();
});
map.on("pointermove", function(e) {
	const hit = map.hasFeatureAtPixel(e.pixel);
	map.getTargetElement().style.cursor = hit ? "pointer" : "";
});
map.on("movestart", disposePopover);
//#endregion

//# sourceMappingURL=icon.js.map