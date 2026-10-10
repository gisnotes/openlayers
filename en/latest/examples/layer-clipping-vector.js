import { $n as VectorLayer, Ar as Style, Cn as GeoJSON, Dr as Map, Ni as View, Pr as Fill, Un as VectorSource, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as StadiaMaps } from "./StadiaMaps.js";
import { n as getVectorContext } from "./render.js";
//#region examples/layer-clipping-vector.js
var background = new TileLayer({
	className: "toner",
	source: new StadiaMaps({ layer: "stamen_toner" })
});
var base = new TileLayer({ source: new OSM() });
var clipLayer = new VectorLayer({
	style: null,
	source: new VectorSource({
		url: "./data/geojson/switzerland.geojson",
		format: new GeoJSON()
	})
});
clipLayer.getSource().on("addfeature", function() {
	base.setExtent(clipLayer.getSource().getExtent());
});
var style = new Style({ fill: new Fill({ color: "black" }) });
base.on("postrender", function(e) {
	const vectorContext = getVectorContext(e);
	e.context.globalCompositeOperation = "destination-in";
	clipLayer.getSource().forEachFeature(function(feature) {
		vectorContext.drawFeature(feature, style);
	});
	e.context.globalCompositeOperation = "source-over";
});
new Map({
	layers: [
		background,
		base,
		clipLayer
	],
	target: "map",
	view: new View({
		center: fromLonLat([8.23, 46.86]),
		zoom: 7
	})
});
//#endregion

//# sourceMappingURL=layer-clipping-vector.js.map