import { Dr as Map, Ni as View, ni as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as DragRotateAndZoom } from "./DragRotateAndZoom.js";
//#region examples/drag-rotate-and-zoom.js
new Map({
	interactions: defaults().extend([new DragRotateAndZoom()]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=drag-rotate-and-zoom.js.map