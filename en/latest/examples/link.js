import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Link } from "./Link2.js";
//#region examples/link.js
var map = new Map({
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
var link = new Link();
var exampleCheckbox = document.getElementById("example-checkbox");
exampleCheckbox.addEventListener("change", function() {
	if (exampleCheckbox.checked) link.update("example", "checked");
	else link.update("example", null);
});
exampleCheckbox.checked = link.track("example", (newValue) => {
	exampleCheckbox.checked = newValue === "checked";
}) === "checked";
map.addInteraction(link);
//#endregion

//# sourceMappingURL=link.js.map