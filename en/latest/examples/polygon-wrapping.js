import { $n as VectorLayer, Dr as Map, Hi as fromExtent, Ni as View, Un as VectorSource, rr as Feature, va as get, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/polygon-wrapping.js
var extent = get("EPSG:3857").getExtent();
var leftX = extent[0];
var rightX = extent[2];
new Map({
	layers: [new TileLayer({ source: new OSM() }), new VectorLayer({
		updateWhileAnimating: true,
		updateWhileInteracting: true,
		source: new VectorSource({ features: [
			new Feature(fromExtent([
				leftX,
				-15e6,
				leftX,
				15e6
			])),
			new Feature(fromExtent([
				leftX - 2e6,
				45e5,
				leftX + 4e6,
				65e5
			])),
			new Feature(fromExtent([
				rightX - 4e6,
				75e5,
				rightX + 2e6,
				95e5
			]))
		] })
	})],
	target: "map",
	view: new View({
		center: [0, 6e6],
		zoom: 1
	})
});
//#endregion

//# sourceMappingURL=polygon-wrapping.js.map