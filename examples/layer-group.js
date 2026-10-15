import { Dr as Map, Ni as View, V as TileJSON, ei as LayerGroup, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/layer-group.js
var map = new Map({
	layers: [new TileLayer({ source: new OSM() }), new LayerGroup({ layers: [new TileLayer({ source: new TileJSON({
		url: "https://api.tiles.mapbox.com/v4/mapbox.20110804-hoa-foodinsecurity-3month.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ",
		crossOrigin: "anonymous"
	}) }), new TileLayer({ source: new TileJSON({
		url: "https://api.tiles.mapbox.com/v4/mapbox.world-borders-light.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ",
		crossOrigin: "anonymous"
	}) })] })],
	target: "map",
	view: new View({
		center: fromLonLat([37.4057, 8.81566]),
		zoom: 4
	})
});
/**
* Bind input elements (checkbox & slider) to a layer's visibility and opacity.
* 将 DOM 表单控件（复选框与滑动条）与图层的可见性及透明度进行双向绑定。
* @param {string} layerid DOM element selector prefix.
* @param {import("../src/ol/layer/Base.js").default} layer Target layer.
*/
function bindInputs(layerid, layer) {
	const visibilityInput = document.querySelector(layerid + " input.visible");
	visibilityInput.addEventListener("change", function() {
		layer.setVisible(this.checked);
	});
	visibilityInput.checked = layer.getVisible();
	const opacityInput = document.querySelector(layerid + " input.opacity");
	opacityInput.addEventListener("input", function() {
		layer.setOpacity(parseFloat(this.value));
	});
	opacityInput.value = String(layer.getOpacity());
}
/**
* Recursively traverse layer groups and bind controls to each layer.
* 递归遍历图层树，为每个叶子图层与父图层组动态绑定 UI 控件。
* @param {string} id ID prefix.
* @param {LayerGroup} group Layer group.
*/
function setup(id, group) {
	group.getLayers().forEach(function(layer, i) {
		const layerid = id + i;
		bindInputs(layerid, layer);
		if (layer instanceof LayerGroup) setup(layerid, layer);
	});
}
setup("#layer", map.getLayerGroup());
document.querySelectorAll("#layertree li > span").forEach(function(element) {
	element.addEventListener("click", function() {
		this.parentNode.querySelector("fieldset").style.display = this.parentNode.querySelector("fieldset").style.display === "none" ? "" : "none";
	});
	element.parentNode.querySelector("fieldset").style.display = "none";
});
//#endregion

//# sourceMappingURL=layer-group.js.map