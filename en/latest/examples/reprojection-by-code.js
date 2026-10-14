import { Dr as Map, Mr as Stroke, Ni as View, Y as proj4, ba as getTransform, eo as applyTransform, nt as register, va as get, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as TileDebug } from "./TileDebug.js";
import { t as Graticule } from "./Graticule2.js";
//#region examples/reprojection-by-code.js
var key = "EPhPi7Zr1GTS500UybLu";
var osmSource = new OSM();
var debugLayer = new TileLayer({
	source: new TileDebug({
		tileGrid: osmSource.getTileGrid(),
		projection: osmSource.getProjection()
	}),
	visible: false
});
var graticule = new Graticule({
	strokeStyle: new Stroke({
		color: "rgba(255,120,0,0.9)",
		width: 2,
		lineDash: [.5, 4]
	}),
	showLabels: true,
	visible: false,
	wrapX: false
});
var map = new Map({
	layers: [
		new TileLayer({ source: osmSource }),
		debugLayer,
		graticule
	],
	target: "map",
	view: new View({
		projection: "EPSG:3857",
		center: [0, 0],
		zoom: 1
	})
});
var queryInput = document.getElementById("epsg-query");
var searchButton = document.getElementById("epsg-search");
var resultSpan = document.getElementById("epsg-result");
var renderEdgesCheckbox = document.getElementById("render-edges");
var showTilesCheckbox = document.getElementById("show-tiles");
var showGraticuleCheckbox = document.getElementById("show-graticule");
/**
* 动态配置并切换地图的目标投影
* @param {string|null} code 投影代号 (例如 'EPSG:27700')
* @param {string|null} name 投影名称 (例如 'OSGB36 / British National Grid')
* @param {string|null} proj4def WKT 格式或 Proj4 格式的坐标系定义字符串
* @param {Array<number>|null} bbox 经纬度地理范围 [minLon, minLat, maxLon, maxLat]
*/
function setProjection(code, name, proj4def, bbox) {
	if (code === null || name === null || proj4def === null || bbox === null) {
		resultSpan.innerHTML = "未检索到有效坐标系定义，恢复使用 EPSG:3857...";
		map.setView(new View({
			projection: "EPSG:3857",
			center: [0, 0],
			zoom: 1
		}));
		return;
	}
	resultSpan.innerHTML = "(" + code + ") " + name;
	proj4.defs(code, proj4def);
	register(proj4);
	const newProj = get(code);
	const fromLonLat = getTransform("EPSG:4326", newProj);
	newProj.setWorldExtent(bbox);
	if (bbox[0] > bbox[2]) bbox[2] += 360;
	const extent = applyTransform(bbox, fromLonLat, void 0, 8);
	newProj.setExtent(extent);
	const newView = new View({ projection: newProj });
	map.setView(newView);
	newView.fit(extent);
}
/**
* 请求 MapTiler Cloud Coordinates API 检索坐标系定义
* @param {string} query 用户输入的查询关键词
*/
function search(query) {
	resultSpan.innerHTML = "正在检索坐标系 ...";
	fetch(`https://api.maptiler.com/coordinates/search/${query}.json?exports=true&key=${key}`).then(function(response) {
		return response.json();
	}).then(function(json) {
		const results = json["results"];
		if (results && results.length > 0) for (let i = 0, ii = results.length; i < ii; i++) {
			const result = results[i];
			if (result) {
				const id = result["id"];
				const code = id["authority"] + ":" + id["code"];
				const name = result["name"];
				const proj4def = result["exports"]["wkt"];
				const bbox = result["bbox"];
				if (code && code.length > 0 && proj4def && proj4def.length > 0 && bbox && bbox.length == 4) {
					setProjection(code, name, proj4def, bbox);
					return;
				}
			}
		}
		setProjection(null, null, null, null);
	});
}
/**
* 处理搜索按钮点击事件
* @param {Event} event 事件对象
*/
searchButton.onclick = function(event) {
	search(queryInput.value);
	event.preventDefault();
};
/**
* 处理调试选项的勾选切换事件
*/
function onReprojectionChange() {
	osmSource.setRenderReprojectionEdges(renderEdgesCheckbox.checked);
}
function onGraticuleChange() {
	graticule.setVisible(showGraticuleCheckbox.checked);
}
function onTilesChange() {
	debugLayer.setVisible(showTilesCheckbox.checked);
}
showGraticuleCheckbox.addEventListener("change", onGraticuleChange);
renderEdgesCheckbox.addEventListener("change", onReprojectionChange);
showTilesCheckbox.addEventListener("change", onTilesChange);
onReprojectionChange();
onGraticuleChange();
onTilesChange();
//#endregion

//# sourceMappingURL=reprojection-by-code.js.map