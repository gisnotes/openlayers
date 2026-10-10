import { Dr as Map, Ni as View, bi as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as FullScreen } from "./FullScreen.js";
//#region examples/full-screen-source.js
var view = new View({
	center: [-9101767, 2822912],
	zoom: 14
});
new Map({
	controls: defaults().extend([new FullScreen({ source: "fullscreen" })]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view
});
//#endregion

//# sourceMappingURL=full-screen-source.js.map