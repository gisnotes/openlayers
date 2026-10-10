import { Dr as Map, Mr as Stroke, Ni as View, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Graticule } from "./Graticule2.js";
//#region examples/graticule.js
new Map({
	layers: [new TileLayer({ source: new OSM({ wrapX: false }) }), new Graticule({
		strokeStyle: new Stroke({
			color: "rgba(255,120,0,0.9)",
			width: 2,
			lineDash: [.5, 4]
		}),
		showLabels: true,
		wrapX: false
	})],
	target: "map",
	view: new View({
		center: fromLonLat([4.8, 47.75]),
		zoom: 5
	})
});
//#endregion

//# sourceMappingURL=graticule.js.map