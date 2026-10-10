import { Dr as Map, Ni as View, Vn as ImageLayer, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as ImageWMS } from "./ImageWMS.js";
//#region examples/wms-getlegendgraphic.js
var wmsSource = new ImageWMS({
	url: "https://ahocevar.com/geoserver/wms",
	params: { "LAYERS": "topp:states" },
	ratio: 1,
	serverType: "geoserver"
});
var updateLegend = function(resolution) {
	const graphicUrl = wmsSource.getLegendUrl(resolution);
	const img = document.getElementById("legend");
	img.src = graphicUrl;
};
var map = new Map({
	layers: [new TileLayer({ source: new OSM() }), new ImageLayer({
		extent: [
			-13884991,
			2870341,
			-7455066,
			6338219
		],
		source: wmsSource
	})],
	target: "map",
	view: new View({
		center: [-10997148, 4569099],
		zoom: 4
	})
});
updateLegend(map.getView().getResolution());
map.getView().on("change:resolution", function(event) {
	updateLegend(event.target.getResolution());
});
//#endregion

//# sourceMappingURL=wms-getlegendgraphic.js.map