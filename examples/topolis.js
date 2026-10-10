import { $n as VectorLayer, Ar as Style, Dr as Map, Fr as CircleStyle, Ki as Point, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, Xn as LineString, kr as Text, rr as Feature, yr as TileLayer, zi as Polygon } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as Draw } from "./Draw.js";
import { t as MousePosition } from "./MousePosition.js";
import { t as Snap } from "./Snap2.js";
//#region examples/topolis.js
var raster = new TileLayer({ source: new OSM() });
var nodes = new VectorSource({ wrapX: false });
var nodesLayer = new VectorLayer({
	source: nodes,
	style: function(f) {
		return [new Style({
			image: new CircleStyle({
				radius: 8,
				fill: new Fill({ color: "rgba(255, 0, 0, 0.2)" }),
				stroke: new Stroke({
					color: "red",
					width: 1
				})
			}),
			text: new Text({
				text: f.get("node").id.toString(),
				fill: new Fill({ color: "red" }),
				stroke: new Stroke({
					color: "white",
					width: 3
				})
			})
		})];
	}
});
var edges = new VectorSource({ wrapX: false });
var edgesLayer = new VectorLayer({
	source: edges,
	style: function(f) {
		return [new Style({
			stroke: new Stroke({
				color: "blue",
				width: 1
			}),
			text: new Text({
				text: f.get("edge").id.toString(),
				fill: new Fill({ color: "blue" }),
				stroke: new Stroke({
					color: "white",
					width: 2
				})
			})
		})];
	}
});
var faces = new VectorSource({ wrapX: false });
var map = new Map({
	layers: [
		raster,
		new VectorLayer({
			source: faces,
			style: function(f) {
				return [new Style({
					stroke: new Stroke({
						color: "black",
						width: 1
					}),
					fill: new Fill({ color: "rgba(0, 255, 0, 0.2)" }),
					text: new Text({
						font: "bold 12px sans-serif",
						text: f.get("face").id.toString(),
						fill: new Fill({ color: "green" }),
						stroke: new Stroke({
							color: "white",
							width: 2
						})
					})
				})];
			}
		}),
		edgesLayer,
		nodesLayer
	],
	target: "map",
	view: new View({
		center: [-11e6, 46e5],
		zoom: 16
	})
});
var topo = topolis.createTopology();
topo.on("addnode", nodeToFeature);
topo.on("removenode", function(e) {
	removeElementFeature(nodes, e);
});
topo.on("addedge", edgeToFeature);
topo.on("modedge", function(e) {
	edges.getFeatureById(e.id).setGeometry(new LineString(e.coordinates));
});
topo.on("removeedge", function(e) {
	removeElementFeature(edges, e);
});
topo.on("addface", faceToFeature);
topo.on("removeface", function(e) {
	removeElementFeature(faces, e);
});
function removeElementFeature(source, element) {
	const feature = source.getFeatureById(element.id);
	source.removeFeature(feature);
}
function nodeToFeature(node) {
	const feature = new Feature({
		geometry: new Point(node.coordinate),
		node
	});
	feature.setId(node.id);
	nodes.addFeature(feature);
}
function edgeToFeature(edge) {
	const feature = new Feature({
		geometry: new LineString(edge.coordinates),
		edge
	});
	feature.setId(edge.id);
	edges.addFeature(feature);
}
function faceToFeature(face) {
	const feature = new Feature({
		geometry: new Polygon(topo.getFaceGeometry(face)),
		face
	});
	feature.setId(face.id);
	faces.addFeature(feature);
}
function createNode(topo, coord) {
	let node;
	const existingEdge = topo.getEdgeByPoint(coord, 5)[0];
	if (existingEdge) node = topo.modEdgeSplit(existingEdge, coord);
	else node = topo.addIsoNode(coord);
	return node;
}
function onDrawend(e) {
	const edgeGeom = e.feature.getGeometry().getCoordinates();
	const startCoord = edgeGeom[0];
	const endCoord = edgeGeom[edgeGeom.length - 1];
	let start, end;
	try {
		start = topo.getNodeByPoint(startCoord);
		end = topo.getNodeByPoint(endCoord);
		const edgesAtStart = topo.getEdgeByPoint(startCoord, 5);
		const edgesAtEnd = topo.getEdgeByPoint(endCoord, 5);
		const crossing = topo.getEdgesByLine(edgeGeom);
		if (crossing.length === 1 && !start && !end && edgesAtStart.length === 0 && edgesAtEnd.length === 0) {
			topo.remEdgeNewFace(crossing[0]);
			start = crossing[0].start;
			if (start.face) topo.removeIsoNode(start);
			end = crossing[0].end;
			if (end.face) topo.removeIsoNode(end);
			return;
		}
		if (!start) {
			start = createNode(topo, startCoord);
			edgeGeom[0] = start.coordinate;
		}
		if (!end) {
			end = createNode(topo, endCoord);
			edgeGeom[edgeGeom.length - 1] = end.coordinate;
		}
		topo.addEdgeNewFaces(start, end, edgeGeom);
	} catch (e) {
		alert(e.toString());
	}
}
var draw = new Draw({ type: "LineString" });
draw.on("drawend", onDrawend);
map.addInteraction(draw);
var snap = new Snap({ source: edges });
map.addInteraction(snap);
map.addControl(new MousePosition());
//#endregion

//# sourceMappingURL=topolis.js.map