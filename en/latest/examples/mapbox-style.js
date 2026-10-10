import { O as apply } from "./common.js";
import { t as FullScreen } from "./FullScreen.js";
//#region examples/mapbox-style.js
apply("map", "https://api.maptiler.com/maps/outdoor-v2/style.json?key=EPhPi7Zr1GTS500UybLu").then(function(map) {
	map.addControl(new FullScreen());
});
//#endregion

//# sourceMappingURL=mapbox-style.js.map