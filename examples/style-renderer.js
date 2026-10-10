import { $n as VectorLayer, Ar as Style, Cn as GeoJSON, Dr as Map, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, _o as getHeight, po as getBottomLeft, xo as getWidth } from "./common.js";
import { r as toContext } from "./render.js";
//#region examples/style-renderer.js
var fill = new Fill();
var stroke = new Stroke({
	color: "rgba(255,255,255,0.8)",
	width: 2
});
var style = new Style({ renderer: function(pixelCoordinates, state) {
	const context = state.context;
	const geometry = state.geometry.clone();
	geometry.setCoordinates(pixelCoordinates);
	const extent = geometry.getExtent();
	const width = getWidth(extent);
	const height = getHeight(extent);
	const flag = state.feature.get("flag");
	if (!flag || height < 1 || width < 1) return;
	context.save();
	const renderContext = toContext(context, { pixelRatio: 1 });
	renderContext.setFillStrokeStyle(fill, stroke);
	renderContext.drawGeometry(geometry);
	context.clip();
	const bottomLeft = getBottomLeft(extent);
	const left = bottomLeft[0];
	const bottom = bottomLeft[1];
	context.drawImage(flag, left, bottom, width, height);
	context.restore();
} });
var vectorLayer = new VectorLayer({
	source: new VectorSource({
		url: "https://openlayersbook.github.io/openlayers_book_samples/assets/data/countries.geojson",
		format: new GeoJSON()
	}),
	style
});
vectorLayer.getSource().on("addfeature", function(event) {
	const feature = event.feature;
	const img = new Image();
	img.onload = function() {
		feature.set("flag", img);
	};
	img.src = "https://flagcdn.com/w320/" + feature.get("iso_a2").toLowerCase() + ".png";
});
new Map({
	layers: [vectorLayer],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
//#endregion

//# sourceMappingURL=style-renderer.js.map