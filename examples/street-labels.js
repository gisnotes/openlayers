import { $n as VectorLayer, Ar as Style, Cn as GeoJSON, Dr as Map, Ni as View, Pr as Fill, Un as VectorSource, ho as getCenter, kn as ImageTileSource, kr as Text, yr as TileLayer } from "./common.js";
//#region examples/street-labels.js
var style = new Style({ text: new Text({
	font: "bold 11px \"Open Sans\", \"Arial Unicode MS\", \"sans-serif\"",
	placement: "line",
	fill: new Fill({ color: "white" })
}) });
var attributions = "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>";
var viewExtent = [
	1817379,
	6139595,
	1827851,
	6143616
];
new Map({
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions,
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) }), new VectorLayer({
		declutter: true,
		source: new VectorSource({
			format: new GeoJSON(),
			url: "data/geojson/vienna-streets.geojson"
		}),
		style: function(feature) {
			style.getText().setText(feature.get("name"));
			return style;
		}
	})],
	target: "map",
	view: new View({
		extent: viewExtent,
		center: getCenter(viewExtent),
		zoom: 17,
		minZoom: 14
	})
});
//#endregion

//# sourceMappingURL=street-labels.js.map