import { Dr as Map, Ni as View, gi as shiftKeyOnly, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Extent } from "./Extent.js";
//#region examples/extent-interaction.js
var map = new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
var extent = new Extent({ condition: shiftKeyOnly });
map.addInteraction(extent);
//#endregion

//# sourceMappingURL=extent-interaction.js.map