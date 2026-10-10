import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Jn as MultiPoint, Ki as Point, Ni as View, Un as VectorSource, Xn as LineString, Yn as MultiLineString, g as OL3Parser, h as BufferOp, ha as fromLonLat, qi as LinearRing, qn as MultiPolygon, yr as TileLayer, zi as Polygon } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/jsts.js
var source = new VectorSource();
fetch("data/geojson/roads-seoul.geojson").then(function(response) {
	return response.json();
}).then(function(json) {
	const features = new GeoJSON().readFeatures(json, { featureProjection: "EPSG:3857" });
	const parser = new OL3Parser(void 0, void 0);
	parser.inject(Point, LineString, LinearRing, Polygon, MultiPoint, MultiLineString, MultiPolygon);
	for (let i = 0; i < features.length; i++) {
		const feature = features[i];
		const jstsGeom = parser.read(feature.getGeometry());
		const buffered = BufferOp.bufferOp(jstsGeom, 40);
		feature.setGeometry(parser.write(buffered));
	}
	source.addFeatures(features);
});
var vectorLayer = new VectorLayer({ source });
new Map({
	layers: [new TileLayer({ source: new OSM() }), vectorLayer],
	target: document.getElementById("map"),
	view: new View({
		center: fromLonLat([126.979293, 37.528787]),
		zoom: 15
	})
});
//#endregion

//# sourceMappingURL=jsts.js.map