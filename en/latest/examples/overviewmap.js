import { Dr as Map, Ni as View, bi as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as OverviewMap } from "./OverviewMap2.js";
//#region examples/overviewmap.js
var source = new OSM();
var overviewMapControl = new OverviewMap({ layers: [new TileLayer({ source })] });
new Map({
	controls: defaults().extend([overviewMapControl]),
	layers: [new TileLayer({ source })],
	target: "map",
	view: new View({
		center: [5e5, 6e6],
		zoom: 7
	})
});
//#endregion

//# sourceMappingURL=overviewmap.js.map