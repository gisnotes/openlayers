import { Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
import { t as Modify } from "./Modify.js";
import { t as Snap } from "./Snap2.js";
import { t as WebGLVectorLayer } from "./WebGLVector.js";
//#region examples/webgl-draw-line.js
/** @type {import('../src/ol/style/flat.js').StyleVariables} */
var styleVariables = {
	width: 12,
	offset: 0,
	capType: "butt",
	joinType: "miter",
	miterLimit: 10,
	dashLength1: 25,
	dashLength2: 15,
	dashLength3: 15,
	dashLength4: 15,
	dashOffset: 0,
	patternSpacing: 0,
	patternOffset: 0
};
var source = new VectorSource({
	url: "data/geojson/switzerland.geojson",
	format: new GeoJSON()
});
/**
* Generate WebGL FlatStyle expression based on dash and pattern toggles
* 根据虚线与纹理开关生成 WebGL FlatStyle 样式表达式
* @param {boolean} dash Whether dash pattern is enabled / 是否包含虚线
* @param {boolean} pattern Whether image pattern is enabled / 是否包含图片纹理
* @return {import('../src/ol/style/flat.js').FlatStyle} Generated style object / 生成的样式对象
*/
var getStyle = (dash, pattern) => {
	let newStyle = {
		"stroke-width": ["var", "width"],
		"stroke-color": "rgba(24,86,34,0.7)",
		"stroke-offset": ["var", "offset"],
		"stroke-miter-limit": ["var", "miterLimit"],
		"stroke-line-cap": ["var", "capType"],
		"stroke-line-join": ["var", "joinType"]
	};
	if (dash) newStyle = {
		...newStyle,
		"stroke-line-dash": [
			["var", "dashLength1"],
			["var", "dashLength2"],
			["var", "dashLength3"],
			["var", "dashLength4"]
		],
		"stroke-line-dash-offset": ["var", "dashOffset"]
	};
	if (pattern) {
		delete newStyle["stroke-color"];
		newStyle = {
			...newStyle,
			"stroke-pattern-src": "data/dot.svg",
			"stroke-pattern-spacing": ["var", "patternSpacing"],
			"stroke-pattern-start-offset": ["var", "patternOffset"]
		};
	}
	return newStyle;
};
/** @type {import('../src/ol/style/flat.js').FlatStyle} */
var style = getStyle(false, false);
var vector = new WebGLVectorLayer({
	source,
	style,
	variables: { ...styleVariables }
});
var map = new Map({
	layers: [new TileLayer({ source: new OSM() }), vector],
	target: "map",
	view: new View({
		center: fromLonLat([8.43, 46.82]),
		zoom: 7
	})
});
var rebuildStyle = () => {
	const dash = document.getElementById("dashEnable").checked;
	const pattern = document.getElementById("patternEnable").checked;
	style = getStyle(dash, pattern);
	map.removeLayer(vector);
	vector = new WebGLVectorLayer({
		source,
		style,
		variables: { ...styleVariables }
	});
	map.addLayer(vector);
};
var modify = new Modify({ source });
map.addInteraction(modify);
var draw;
var snap;
function addInteractions() {
	draw = new Draw({
		source,
		type: "LineString"
	});
	map.addInteraction(draw);
	snap = new Snap({ source });
	map.addInteraction(snap);
}
addInteractions();
var inputListener = (event) => {
	const variableName = event.target.name;
	if (event.target.type === "radio") styleVariables[variableName] = event.target.value;
	else styleVariables[variableName] = parseFloat(event.target.value);
	vector.updateStyleVariables(styleVariables);
	const valueSpan = document.getElementById(`value-${variableName}`);
	if (valueSpan) valueSpan.textContent = String(styleVariables[variableName]);
	map.render();
};
document.querySelectorAll("input.uniform").forEach((input) => input.addEventListener("input", inputListener));
document.querySelectorAll("input.rebuild").forEach((input) => input.addEventListener("input", rebuildStyle));
//#endregion

//# sourceMappingURL=webgl-draw-line.js.map