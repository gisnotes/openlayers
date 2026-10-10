import { Dr as Map, Ni as View, bi as defaults, xi as Attribution, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/attributions.js
var attribution = new Attribution({ collapsible: false });
var map = new Map({
	layers: [new TileLayer({ source: new OSM() })],
	controls: defaults({ attribution: false }).extend([attribution]),
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
function checkSize() {
	const small = map.getSize()[0] < 600;
	attribution.setCollapsible(small);
	attribution.setCollapsed(small);
}
map.on("change:size", checkSize);
checkSize();
//#endregion

//# sourceMappingURL=attributions.js.map