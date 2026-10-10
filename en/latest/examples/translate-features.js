import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource, ha as fromLonLat, ni as defaults } from "./common.js";
import { t as Select } from "./Select.js";
import { t as Translate } from "./Translate.js";
//#region examples/translate-features.js
var vector = new VectorLayer({
	background: "white",
	source: new VectorSource({
		url: "https://openlayers.org/data/vector/us-states.json",
		format: new GeoJSON()
	})
});
var select = new Select();
var translate = new Translate({ features: select.getFeatures() });
new Map({
	interactions: defaults().extend([select, translate]),
	layers: [vector],
	target: "map",
	view: new View({
		center: fromLonLat([-100, 38.5]),
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=translate-features.js.map