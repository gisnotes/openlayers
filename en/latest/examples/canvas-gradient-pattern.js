import { $n as VectorLayer, Ar as Style, Bo as DEVICE_PIXEL_RATIO, Dr as Map, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, ha as fromLonLat } from "./common.js";
import { t as KML } from "./KML2.js";
//#region examples/canvas-gradient-pattern.js
var pixelRatio = DEVICE_PIXEL_RATIO;
var gradient = document.createElement("canvas").getContext("2d").createLinearGradient(0, 0, 1024 * pixelRatio, 0);
gradient.addColorStop(0, "red");
gradient.addColorStop(1 / 6, "orange");
gradient.addColorStop(2 / 6, "yellow");
gradient.addColorStop(3 / 6, "green");
gradient.addColorStop(4 / 6, "aqua");
gradient.addColorStop(5 / 6, "blue");
gradient.addColorStop(1, "purple");
new Map({
	layers: [new VectorLayer({
		background: "white",
		source: new VectorSource({
			url: "data/kml/states.kml",
			format: new KML({ extractStyles: false })
		}),
		style: new Style({
			fill: new Fill({ color: gradient }),
			stroke: new Stroke({
				color: "#333",
				width: 1
			})
		})
	})],
	target: "map",
	view: new View({
		center: fromLonLat([-100, 38.5]),
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=canvas-gradient-pattern.js.map