import { $n as VectorLayer, Ar as Style, Cn as GeoJSON, Dr as Map, Mr as Stroke, Ni as View, Un as VectorSource, ni as defaults, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
import { t as Modify } from "./Modify.js";
import { t as Snap } from "./Snap2.js";
//#region examples/line-styles.js
var source = new VectorSource({
	url: "data/geojson/line-samples.geojson",
	format: new GeoJSON()
});
var vector = new VectorLayer({ source });
var styleOptionsForm = document.getElementById("line-style-options-form");
function updateStyles() {
	const formData = new FormData(styleOptionsForm);
	const styles = [new Style({ stroke: new Stroke({
		color: formData.get("color"),
		lineCap: formData.get("lineCap"),
		lineJoin: formData.get("lineJoin"),
		lineDash: formData.get("lineDash")?.split(",")?.map((value) => Number(value)),
		lineDashOffset: formData.get("lineDashOffset"),
		miterLimit: formData.get("miterLimit"),
		width: formData.get("width"),
		offset: formData.get("offset")
	}) })];
	if (Math.abs(formData.get("offset")) > 0) styles.push(new Style({ stroke: new Stroke({
		color: "#aaa",
		width: 1,
		lineDash: [3, 3]
	}) }));
	vector.setStyle(styles);
}
updateStyles();
styleOptionsForm.addEventListener("change", updateStyles);
var modify = new Modify({ source });
var draw = new Draw({
	source,
	type: "Polygon"
});
var snap = new Snap({ source });
new Map({
	layers: [new TileLayer({ source: new OSM() }), vector],
	target: "map",
	view: new View({
		center: [-8161939, 6095025],
		zoom: 8
	}),
	interactions: defaults().extend([
		modify,
		draw,
		snap
	])
});
//#endregion

//# sourceMappingURL=line-styles.js.map