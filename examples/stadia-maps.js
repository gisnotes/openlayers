import { Dr as Map, Ni as View, ha as fromLonLat, yr as TileLayer } from "./common.js";
import { t as StadiaMaps } from "./StadiaMaps.js";
//#region examples/stadia-maps.js
new Map({
	layers: [new TileLayer({ source: new StadiaMaps({
		layer: "alidade_smooth_dark",
		retina: true
	}) })],
	target: "map",
	view: new View({
		center: fromLonLat([24.750645, 59.444351]),
		zoom: 14
	})
});
//#endregion

//# sourceMappingURL=stadia-maps.js.map