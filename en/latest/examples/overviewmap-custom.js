import { Dr as Map, Ni as View, bi as defaults, ni as defaults$1, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as DragRotateAndZoom } from "./DragRotateAndZoom.js";
import { t as OverviewMap } from "./OverviewMap2.js";
//#region examples/overviewmap-custom.js
var rotateWithView = document.getElementById("rotateWithView");
var overviewMapControl = new OverviewMap({
	className: "ol-overviewmap ol-custom-overviewmap",
	layers: [new TileLayer({ source: new OSM({ "url": "https://{a-c}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png?apikey=0e6fc415256d4fbb9b5166a718591d71" }) })],
	collapseLabel: "»",
	label: "«",
	collapsed: false
});
rotateWithView.addEventListener("change", function() {
	overviewMapControl.setRotateWithView(this.checked);
});
new Map({
	controls: defaults().extend([overviewMapControl]),
	interactions: defaults$1().extend([new DragRotateAndZoom()]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [5e5, 6e6],
		zoom: 7
	})
});
//#endregion

//# sourceMappingURL=overviewmap-custom.js.map