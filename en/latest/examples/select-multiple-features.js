import { $n as VectorLayer, Cn as GeoJSON, Dr as Map, Ni as View, Un as VectorSource, ci as always, ha as fromLonLat } from "./common.js";
import { t as Select } from "./Select.js";
//#region examples/select-multiple-features.js
var select = new Select({
	toggleCondition: always,
	multi: true
});
new Map({
	layers: [new VectorLayer({
		background: "white",
		source: new VectorSource({
			url: "https://openlayers.org/data/vector/us-states.json",
			format: new GeoJSON()
		})
	})],
	target: "map",
	view: new View({
		center: fromLonLat([-100, 38.5]),
		zoom: 4,
		multiWorld: true
	})
}).addInteraction(select);
var status = document.getElementById("status");
select.on("select", function() {
	status.innerHTML = "&nbsp;" + select.getFeatures().getLength() + " selected features";
});
//#endregion

//# sourceMappingURL=select-multiple-features.js.map