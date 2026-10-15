import { Dr as Map, Ni as View, V as TileJSON, ka as transformExtent, yr as TileLayer } from "./common.js";
//#region examples/layer-extent.js
/**
* Transform extent from WGS84 (EPSG:4326) to Web Mercator (EPSG:3857).
* 将 WGS84 经纬度包围盒转换为 Web 墨卡托投影坐标系包围盒。
* @param {import("../src/ol/extent.js").Extent} extent WGS84 extent.
* @return {import("../src/ol/extent.js").Extent} Projected extent.
*/
function transform(extent) {
	return transformExtent(extent, "EPSG:4326", "EPSG:3857");
}
var extents = {
	India: transform([
		68.17665,
		7.96553,
		97.40256,
		35.49401
	]),
	Argentina: transform([
		-73.41544,
		-55.25,
		-53.62835,
		-21.83231
	]),
	Nigeria: transform([
		2.6917,
		4.24059,
		14.57718,
		13.86592
	]),
	Sweden: transform([
		11.02737,
		55.36174,
		23.90338,
		69.10625
	])
};
var base = new TileLayer({ source: new TileJSON({
	url: "https://api.tiles.mapbox.com/v4/mapbox.world-light.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ",
	crossOrigin: "anonymous"
}) });
var overlay = new TileLayer({
	extent: extents.India,
	source: new TileJSON({
		url: "https://api.tiles.mapbox.com/v4/mapbox.world-black.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ",
		crossOrigin: "anonymous"
	})
});
new Map({
	layers: [base, overlay],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
for (const countryKey in extents) document.getElementById(countryKey).onclick = function(event) {
	overlay.setExtent(extents[event.target.id]);
};
//#endregion

//# sourceMappingURL=layer-extent.js.map