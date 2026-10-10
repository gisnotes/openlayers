import { Dr as Map, Ni as View, Za as toStringHDMS, ha as fromLonLat, wa as toLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Overlay } from "./Overlay2.js";
//#region examples/overlay.js
var map = new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
var pos = fromLonLat([16.3725, 48.208889]);
var popup = new Overlay({ element: document.getElementById("popup") });
map.addOverlay(popup);
var marker = new Overlay({
	position: pos,
	positioning: "center-center",
	element: document.getElementById("marker"),
	stopEvent: false
});
map.addOverlay(marker);
var vienna = new Overlay({
	position: pos,
	element: document.getElementById("vienna")
});
map.addOverlay(vienna);
var element = popup.getElement();
map.on("click", function(evt) {
	const coordinate = evt.coordinate;
	const hdms = toStringHDMS(toLonLat(coordinate));
	popup.setPosition(coordinate);
	let popover = bootstrap.Popover.getInstance(element);
	if (popover) popover.dispose();
	popover = new bootstrap.Popover(element, {
		animation: false,
		container: element,
		content: "<p>The location you clicked was:</p><code>" + hdms + "</code>",
		html: true,
		placement: "top",
		title: "Welcome to OpenLayers"
	});
	popover.show();
});
//#endregion

//# sourceMappingURL=overlay.js.map