import { $n as VectorLayer, $o as extend, Ar as Style, Dn as transformGeometryWithOptions, Dr as Map, Fr as CircleStyle, Ki as Point, Mr as Stroke, Ni as View, Pr as Fill, Un as VectorSource, Xn as LineString, Zn as bbox, ka as transformExtent, kn as ImageTileSource, os as isEmpty, pn as makeParsersNS, rr as Feature, va as get, xn as pushParseAndPop, yr as TileLayer, zi as Polygon } from "./common.js";
import { t as XMLFeature } from "./XMLFeature.js";
//#region src/ol/format/OSMXML.js
/**
* @module ol/format/OSMXML
*/
/**
* @typedef {Object<string, *>} OSMObject
*/
/**
* @typedef {Object} OSMState
* @property {Object<string, import("../coordinate.js").Coordinate>} nodes Nodes.
* @property {Array<OSMObject>} ways Ways.
* @property {Array<import("../Feature.js").default>} features Features.
*/
/**
* @const
* @type {Array<null>}
*/
var NAMESPACE_URIS = [null];
/**
* @type {import("../xml.js").ParsersNS}
*/
var WAY_PARSERS = makeParsersNS(NAMESPACE_URIS, {
	"nd": readNd,
	"tag": readTag
});
/**
* @type {import("../xml.js").ParsersNS}
*/
var PARSERS = makeParsersNS(NAMESPACE_URIS, {
	"node": readNode,
	"way": readWay
});
/**
* @classdesc
* Feature format for reading data in the
* [OSMXML format](https://wiki.openstreetmap.org/wiki/OSM_XML).
*
* @api
*/
var OSMXML = class extends XMLFeature {
	constructor() {
		super();
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326") ?? void 0;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		options = this.getReadOptions(node, options);
		if (node.localName == "osm") {
			const state = pushParseAndPop({
				nodes: {},
				ways: [],
				features: []
			}, PARSERS, node, [options]) ?? {
				nodes: {},
				ways: [],
				features: []
			};
			for (let j = 0; j < state.ways.length; j++) {
				const values = state.ways[j];
				/** @type {Array<number>} */
				const flatCoordinates = values["flatCoordinates"];
				if (!flatCoordinates.length) {
					const ndrefs = values["ndrefs"];
					for (let i = 0, ii = ndrefs.length; i < ii; i++) {
						const point = state.nodes[ndrefs[i]];
						extend(flatCoordinates, point);
					}
				}
				let geometry;
				const ndrefs = values["ndrefs"];
				if (ndrefs[0] == ndrefs[ndrefs.length - 1]) geometry = new Polygon(flatCoordinates, "XY", [flatCoordinates.length]);
				else geometry = new LineString(flatCoordinates, "XY");
				transformGeometryWithOptions(geometry, false, options);
				const feature = new Feature(geometry);
				if (values["id"] !== void 0) feature.setId(values["id"]);
				feature.setProperties(values["tags"], true);
				state.features.push(feature);
			}
			if (state.features) return state.features;
		}
		return [];
	}
};
/**
* @type {import("../xml.js").ParsersNS}
*/
var NODE_PARSERS = makeParsersNS(NAMESPACE_URIS, { "tag": readTag });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function readNode(node, objectStack) {
	const options = objectStack[0];
	const state = objectStack[objectStack.length - 1];
	const id = node.getAttribute("id");
	/** @type {import("../coordinate.js").Coordinate} */
	const coordinates = [parseFloat(node.getAttribute("lon") ?? "0"), parseFloat(node.getAttribute("lat") ?? "0")];
	if (id !== null) state.nodes[id] = coordinates;
	const values = pushParseAndPop({ tags: {} }, NODE_PARSERS, node, objectStack);
	if (values && !isEmpty(values["tags"])) {
		const geometry = new Point(coordinates);
		transformGeometryWithOptions(geometry, false, options);
		const feature = new Feature(geometry);
		if (id !== null) feature.setId(id);
		feature.setProperties(values["tags"], true);
		state.features.push(feature);
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function readWay(node, objectStack) {
	const id = node.getAttribute("id");
	const values = pushParseAndPop({
		id,
		ndrefs: [],
		flatCoordinates: [],
		tags: {}
	}, WAY_PARSERS, node, objectStack) ?? {
		id,
		ndrefs: [],
		flatCoordinates: [],
		tags: {}
	};
	objectStack[objectStack.length - 1].ways.push(values);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function readNd(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	const ndrefs = values["ndrefs"];
	const ref = node.getAttribute("ref");
	if (ref !== null) ndrefs.push(ref);
	if (node.hasAttribute("lon") && node.hasAttribute("lat")) {
		const flatCoordinates = values["flatCoordinates"];
		flatCoordinates.push(parseFloat(node.getAttribute("lon") ?? "0"));
		flatCoordinates.push(parseFloat(node.getAttribute("lat") ?? "0"));
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function readTag(node, objectStack) {
	const tags = objectStack[objectStack.length - 1]["tags"];
	const key = node.getAttribute("k");
	if (key !== null) tags[key] = node.getAttribute("v");
}
//#endregion
//#region examples/vector-osm.js
var map = null;
var styles = {
	"amenity": { "parking": new Style({
		stroke: new Stroke({
			color: "rgba(170, 170, 170, 1.0)",
			width: 1
		}),
		fill: new Fill({ color: "rgba(170, 170, 170, 0.3)" })
	}) },
	"building": { ".*": new Style({
		zIndex: 100,
		stroke: new Stroke({
			color: "rgba(246, 99, 79, 1.0)",
			width: 1
		}),
		fill: new Fill({ color: "rgba(246, 99, 79, 0.3)" })
	}) },
	"highway": {
		"service": new Style({ stroke: new Stroke({
			color: "rgba(255, 255, 255, 1.0)",
			width: 2
		}) }),
		".*": new Style({ stroke: new Stroke({
			color: "rgba(255, 255, 255, 1.0)",
			width: 3
		}) })
	},
	"landuse": { "forest|grass|allotments": new Style({
		stroke: new Stroke({
			color: "rgba(140, 208, 95, 1.0)",
			width: 1
		}),
		fill: new Fill({ color: "rgba(140, 208, 95, 0.3)" })
	}) },
	"natural": { "tree": new Style({ image: new CircleStyle({
		radius: 2,
		fill: new Fill({ color: "rgba(140, 208, 95, 1.0)" }),
		stroke: null
	}) }) }
};
var vectorSource = new VectorSource({
	format: new OSMXML(),
	loader: function(extent, resolution, projection, success, failure) {
		const epsg4326Extent = transformExtent(extent, projection, "EPSG:4326");
		const client = new XMLHttpRequest();
		client.open("POST", "https://overpass-api.de/api/interpreter");
		client.addEventListener("load", function() {
			const features = new OSMXML().readFeatures(client.responseText, { featureProjection: map.getView().getProjection() });
			vectorSource.addFeatures(features);
			success(features);
		});
		client.addEventListener("error", failure);
		const query = "(node(" + epsg4326Extent[1] + "," + Math.max(epsg4326Extent[0], -180) + "," + epsg4326Extent[3] + "," + Math.min(epsg4326Extent[2], 180) + ");rel(bn)->.foo;way(bn);node(w)->.foo;rel(bw););out meta;";
		client.send(query);
	},
	strategy: bbox
});
var vector = new VectorLayer({
	source: vectorSource,
	style: function(feature) {
		for (const key in styles) {
			const value = feature.get(key);
			if (value !== void 0) {
				for (const regexp in styles[key]) if (new RegExp(regexp).test(value)) return styles[key][regexp];
			}
		}
		return null;
	}
});
map = new Map({
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) }), vector],
	target: document.getElementById("map"),
	view: new View({
		center: [739218, 5906096],
		maxZoom: 19,
		zoom: 17
	})
});
//#endregion

//# sourceMappingURL=vector-osm.js.map