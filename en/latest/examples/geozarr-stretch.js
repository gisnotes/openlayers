import { Dr as Map, Fi as withExtentCenter, Ii as withHigherResolutions, Pi as getView, at as WebGLTileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as GeoZarr } from "./GeoZarr2.js";
//#region examples/geozarr-stretch.js
var channels = [
	"red",
	"green",
	"blue"
];
for (const channel of channels) {
	document.getElementById(channel).addEventListener("change", update);
	document.getElementById(`${channel}Max`).addEventListener("input", update);
}
/**
* Read current band selection and contrast stretch max thresholds (float values 0.2~0.5) from DOM
* 从页面 DOM 控件中读取当前用户选择的波段序号以及各通道的对比度拉伸上限（0.2~0.5 浮点数）
* @return {Object<string, number>} Style variables object / 样式变量键值对象
*/
function getVariables() {
	const variables = {};
	for (const channel of channels) {
		const selector = document.getElementById(channel);
		variables[channel] = parseFloat(selector.value);
		const inputId = `${channel}Max`;
		const input = document.getElementById(inputId);
		variables[inputId] = parseFloat(input.value);
	}
	return variables;
}
var source = new GeoZarr({
	url: "https://s3.explorer.eopf.copernicus.eu/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260120T125339_N0511_R138_T27VWL_20260120T131151.zarr/measurements/reflectance",
	bands: [
		"b04",
		"b03",
		"b02",
		"b11"
	]
});
var layer = new WebGLTileLayer({
	style: {
		variables: getVariables(),
		gamma: 1.5,
		color: [
			"array",
			[
				"/",
				["band", ["var", "red"]],
				["var", "redMax"]
			],
			[
				"/",
				["band", ["var", "green"]],
				["var", "greenMax"]
			],
			[
				"/",
				["band", ["var", "blue"]],
				["var", "blueMax"]
			],
			1
		]
	},
	source
});
/**
* Update WebGL shader uniform variables in real-time without recompiling the shader
* 实时更新 WebGL 着色器中的 uniform 样式变量（无需重新编译 Shader 或重新请求分块）
*/
function update() {
	layer.updateStyleVariables(getVariables());
}
new Map({
	target: "map",
	layers: [new WebGLTileLayer({ source: new OSM() }), layer],
	view: getView(source, withHigherResolutions(2), withExtentCenter())
});
//#endregion

//# sourceMappingURL=geozarr-stretch.js.map