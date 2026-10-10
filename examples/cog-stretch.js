import { $ as GeoTIFFSource, Dr as Map, Ni as View, at as WebGLTileLayer } from "./common.js";
//#region examples/cog-stretch.js
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
* Read current band selection and contrast stretch max thresholds from DOM inputs
* 从页面 DOM 控件中读取当前用户选择的波段编号以及各通道的对比度拉伸上限值
* @return {Object<string, number>} Style variables object / 样式变量键值对象
*/
function getVariables() {
	const variables = {};
	for (const channel of channels) {
		const selector = document.getElementById(channel);
		variables[channel] = parseInt(selector.value, 10);
		const inputId = `${channel}Max`;
		const input = document.getElementById(inputId);
		variables[inputId] = parseInt(input.value, 10);
	}
	return variables;
}
var layer = new WebGLTileLayer({
	style: {
		variables: getVariables(),
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
	source: new GeoTIFFSource({
		normalize: false,
		sources: [{ url: "https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/exploitation-ready-epsg-4326/exploitation-ready_eoxcloudless-sentinel-2-2025_zoom-4_4bands_16bit.tif" }]
	})
});
/**
* Update WebGL shader uniform variables in real-time without recompiling the shader
* 实时更新 WebGL 着色器中的样式变量（无需重新编译 Shader 或重新请求瓦片）
*/
function update() {
	layer.updateStyleVariables(getVariables());
}
new Map({
	target: "map",
	layers: [layer],
	view: new View({
		projection: "EPSG:4326",
		center: [0, 0],
		zoom: 2,
		maxZoom: 6
	})
});
//#endregion

//# sourceMappingURL=cog-stretch.js.map