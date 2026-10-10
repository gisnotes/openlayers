import { Dr as Map, Ni as View, ai as DragPan, ni as defaults, pi as platformModifierKeyOnly, ri as MouseWheelZoom, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/two-finger-pan-scroll.js
new Map({
	interactions: defaults({
		dragPan: false,
		mouseWheelZoom: false
	}).extend([new DragPan({ condition: function(event) {
		return this.getPointerCount() === 2 || platformModifierKeyOnly(event);
	} }), new MouseWheelZoom({ condition: platformModifierKeyOnly })]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=two-finger-pan-scroll.js.map