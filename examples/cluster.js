import { $n as VectorLayer, Ar as Style, Dr as Map, Fr as CircleStyle, Ki as Point, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, kr as Text, no as boundingExtent, rr as Feature, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Cluster } from "./Cluster2.js";
//#region examples/cluster.js
var distanceInput = document.getElementById("distance");
var minDistanceInput = document.getElementById("min-distance");
var count = 2e4;
var features = new Array(count);
var e = 45e5;
for (let i = 0; i < count; ++i) features[i] = new Feature(new Point([2 * e * Math.random() - e, 2 * e * Math.random() - e]));
var source = new VectorSource({ features });
var clusterSource = new Cluster({
	distance: parseInt(distanceInput.value, 10),
	minDistance: parseInt(minDistanceInput.value, 10),
	source
});
var styleCache = {};
var clusters = new VectorLayer({
	source: clusterSource,
	style: function(feature) {
		const size = feature.get("features").length;
		let style = styleCache[size];
		if (!style) {
			style = new Style({
				image: new CircleStyle({
					radius: 10,
					stroke: new Stroke({ color: "#fff" }),
					fill: new Fill({ color: "#3399CC" })
				}),
				text: new Text({
					text: size.toString(),
					fill: new Fill({ color: "#fff" })
				})
			});
			styleCache[size] = style;
		}
		return style;
	}
});
var map = new Map({
	layers: [new TileLayer({ source: new OSM() }), clusters],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
distanceInput.addEventListener("input", function() {
	clusterSource.setDistance(parseInt(distanceInput.value, 10));
});
minDistanceInput.addEventListener("input", function() {
	clusterSource.setMinDistance(parseInt(minDistanceInput.value, 10));
});
map.on("click", (e) => {
	clusters.getFeatures(e.pixel).then((clickedFeatures) => {
		if (clickedFeatures.length) {
			const features = clickedFeatures[0].get("features");
			if (features.length > 1) {
				const extent = boundingExtent(features.map((r) => r.getGeometry().getCoordinates()));
				map.getView().fit(extent, {
					duration: 1e3,
					padding: [
						50,
						50,
						50,
						50
					]
				});
			}
		}
	});
});
//#endregion

//# sourceMappingURL=cluster.js.map