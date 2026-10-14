import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
//#region examples/draw-freehand.js
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
var typeSelect = document.getElementById("type");
var freehandCheckbox = document.getElementById("freehand");
var draw;
function addInteraction() {
	if (typeSelect.value !== "None") {
		draw = new Draw({
			source,
			type: typeSelect.value,
			freehand: freehandCheckbox.checked
		});
		map.addInteraction(draw);
	}
}
/**
* Handle geometry type change event.
* 处理几何类型下拉切换事件。
*/
typeSelect.onchange = function() {
	map.removeInteraction(draw);
	addInteraction();
};
/**
* Handle freehand checkbox change event.
* 处理自由手绘复选框勾选切换事件。
*/
freehandCheckbox.onchange = function() {
	if (draw) draw.setFreehand(freehandCheckbox.checked);
};
addInteraction();
//#endregion

//# sourceMappingURL=draw-freehand.js.map