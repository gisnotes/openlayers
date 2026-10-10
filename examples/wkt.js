import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as WKT } from "./WKT2.js";
//#region examples/wkt.js
new Map({
	layers: [new TileLayer({ source: new OSM() }), new VectorLayer({ source: new VectorSource({ features: [new WKT().readFeature("POLYGON((10.689 -25.092, 34.595 -20.170, 38.814 -35.639, 13.502 -39.155, 10.689 -25.092))", {
		dataProjection: "EPSG:4326",
		featureProjection: "EPSG:3857"
	})] }) })],
	target: "map",
	view: new View({
		center: [2952104.0199, -3277504.823],
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=wkt.js.map