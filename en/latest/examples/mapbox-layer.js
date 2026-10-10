import { Cn as GeoJSON, Dr as Map, Ni as View, Qr as Layer, Un as VectorSource, ha as fromLonLat, sr as Source, wa as toLonLat } from "./common.js";
import { t as Heatmap } from "./Heatmap.js";
//#region examples/mapbox-layer.js
var center = [-98.8, 37.9];
var mbMap = new mapboxgl.Map({
	style: "https://api.maptiler.com/maps/dataviz-light/style.json?key=EPhPi7Zr1GTS500UybLu",
	attributionControl: false,
	boxZoom: false,
	center,
	container: "map",
	doubleClickZoom: false,
	dragPan: false,
	dragRotate: false,
	interactive: false,
	keyboard: false,
	pitchWithRotate: false,
	scrollZoom: false,
	touchZoomRotate: false
});
var mbLayer = new Layer({
	render: function(frameState) {
		const canvas = mbMap.getCanvas();
		const viewState = frameState.viewState;
		const visible = mbLayer.getVisible();
		canvas.style.display = visible ? "block" : "none";
		canvas.style.position = "absolute";
		const opacity = mbLayer.getOpacity();
		canvas.style.opacity = opacity;
		const rotation = viewState.rotation;
		mbMap.jumpTo({
			center: toLonLat(viewState.center),
			zoom: viewState.zoom - 1,
			bearing: -rotation * 180 / Math.PI,
			animate: false
		});
		if (mbMap._frame) {
			mbMap._frame.cancel();
			mbMap._frame = null;
		}
		mbMap._render();
		return canvas;
	},
	source: new Source({ attributions: ["<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">© MapTiler</a>", "<a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">© OpenStreetMap contributors</a>"] })
});
var cities = new Heatmap({
	source: new VectorSource({
		url: "data/geojson/world-cities.geojson",
		format: new GeoJSON()
	}),
	weight: function(feature) {
		return feature.get("population") / 1e7;
	},
	radius: 15,
	blur: 15
});
new Map({
	target: "map",
	view: new View({
		center: fromLonLat(center),
		zoom: 4
	}),
	layers: [mbLayer, cities]
});
//#endregion

//# sourceMappingURL=mapbox-layer.js.map