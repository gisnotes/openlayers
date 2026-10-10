import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
//#region examples/draw-features-style.js
var raster = new TileLayer({ source: new OSM() });
var source = new VectorSource({ wrapX: false });
var map = new Map({
	layers: [raster, new VectorLayer({ source })],
	target: "map",
	view: new View({
		center: [-11e6, 46e5],
		zoom: 4
	})
});
var styles = {
	Point: {
		"circle-radius": 5,
		"circle-fill-color": "red"
	},
	LineString: {
		"circle-radius": 5,
		"circle-fill-color": "red",
		"stroke-color": "yellow",
		"stroke-width": 2
	},
	Polygon: {
		"circle-radius": 5,
		"circle-fill-color": "red",
		"stroke-color": "yellow",
		"stroke-width": 2,
		"fill-color": "blue"
	},
	Circle: {
		"circle-radius": 5,
		"circle-fill-color": "red",
		"stroke-color": "blue",
		"stroke-width": 2,
		"fill-color": "yellow"
	}
};
var typeSelect = document.getElementById("type");
var draw;
function addInteraction() {
	const value = typeSelect.value;
	if (value !== "None") {
		draw = new Draw({
			source,
			type: typeSelect.value,
			style: styles[value]
		});
		map.addInteraction(draw);
	}
}
/**
* Handle change event.
* 处理下拉选项变更事件。
*/
typeSelect.onchange = function() {
	map.removeInteraction(draw);
	addInteraction();
};
addInteraction();
//#endregion

//# sourceMappingURL=draw-features-style.js.map