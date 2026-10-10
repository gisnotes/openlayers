import { Dr as Map, Ni as View, V as TileJSON, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/layer-zoom-limits.js
new Map({
	target: "map",
	layers: [new TileLayer({
		maxZoom: 14,
		source: new OSM()
	}), new TileLayer({
		minZoom: 14,
		source: new TileJSON({
			url: "https://api.maptiler.com/maps/outdoor-v2/tiles.json?key=EPhPi7Zr1GTS500UybLu",
			tileSize: 512
		})
	})],
	view: new View({
		center: fromLonLat([-112.18688965, 36.057944835]),
		zoom: 15,
		maxZoom: 18,
		constrainOnlyCenter: true
	})
});
//#endregion

//# sourceMappingURL=layer-zoom-limits.js.map