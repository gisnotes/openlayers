import { $n as VectorLayer, $o as extend, $t as writeStringTextNode, Ar as Style, Cn as GeoJSON, Dn as transformGeometryWithOptions, Dr as Map, En as transformExtentWithOptions, Fo as assert, Kt as readNonNegativeIntegerString, Mr as Stroke, Ni as View, Sn as pushSerializeAndPop, Un as VectorSource, Xn as LineString, Yn as MultiLineString, _n as makeSimpleNodeFactory, bn as parseNode, cn as makeArrayPusher, en as OBJECT_PROPERTY_NODE_FACTORY, fn as makeObjectPropertySetter, kn as ImageTileSource, mn as makeReplacer, nn as createElementNS, on as isDocument, qn as MultiPolygon, qt as readPositiveInteger, rn as getAllTextContent, sn as makeArrayExtender, so as createOrUpdate, tn as XML_SCHEMA_INSTANCE_URI, un as makeChildAppender, va as get, xn as pushParseAndPop, yn as parse, yr as TileLayer, zi as Polygon } from "./common.js";
import { t as XMLFeature } from "./XMLFeature.js";
import { n as GMLBase, r as GMLNS, t as GML2 } from "./GML2.js";
//#region src/ol/format/GML3.js
/**
* @module ol/format/GML3
*/
/**
* @typedef {Object<string, *>} GML3Context
*/
/***
* @typedef {GML3Context & {serializers?: Object<string, Object<string, import("../xml.js").Serializer>>}} GML3WriteContext
*/
/**
* @const
* @type {string}
* @private
*/
var schemaLocation = GMLNS + " http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd";
/**
* @const
* @type {Object<string, string>}
*/
var MULTIGEOMETRY_TO_MEMBER_NODENAME = {
	"MultiLineString": "lineStringMember",
	"MultiCurve": "curveMember",
	"MultiPolygon": "polygonMember",
	"MultiSurface": "surfaceMember"
};
/**
* @classdesc
* Feature format for reading and writing data in the GML format
* version 3.1.1.
* Currently only supports GML 3.1.1 Simple Features profile.
*
* @api
*/
var GML3 = class extends GMLBase {
	/**
	* @param {import("./GMLBase.js").Options} [options] Optional configuration object.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		/**
		* @private
		* @type {boolean}
		*/
		this.surface_ = options.surface !== void 0 ? options.surface : false;
		/**
		* @private
		* @type {boolean}
		*/
		this.curve_ = options.curve !== void 0 ? options.curve : false;
		/**
		* @private
		* @type {boolean}
		*/
		this.multiCurve_ = options.multiCurve !== void 0 ? options.multiCurve : true;
		/**
		* @private
		* @type {boolean}
		*/
		this.multiSurface_ = options.multiSurface !== void 0 ? options.multiSurface : true;
		/**
		* @type {string}
		*/
		this.schemaLocation = options.schemaLocation ? options.schemaLocation : schemaLocation;
		/**
		* @private
		* @type {boolean}
		*/
		this.hasZ = options.hasZ !== void 0 ? options.hasZ : false;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiLineString|undefined} MultiLineString.
	*/
	readMultiCurve(node, objectStack) {
		/** @type {Array<LineString>} */
		const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
		if (lineStrings) return new MultiLineString(lineStrings);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Polygon.
	*/
	readFlatCurveRing(node, objectStack) {
		/** @type {Array<LineString>} */
		const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
		/** @type {Array<number>} */
		const flatCoordinates = [];
		for (let i = 0, ii = lineStrings.length; i < ii; ++i) extend(flatCoordinates, lineStrings[i].getFlatCoordinates());
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiPolygon|undefined} MultiPolygon.
	*/
	readMultiSurface(node, objectStack) {
		/** @type {Array<Polygon>} */
		const polygons = pushParseAndPop([], this.MULTISURFACE_PARSERS, node, objectStack, this);
		if (polygons) return new MultiPolygon(polygons);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	curveMemberParser(node, objectStack) {
		parseNode(this.CURVEMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	surfaceMemberParser(node, objectStack) {
		parseNode(this.SURFACEMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<Array<number>|null>|undefined} flat coordinates.
	*/
	readPatch(node, objectStack) {
		/** @type {Array<Array<number>|null>} */
		return pushParseAndPop([null], this.PATCHES_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} flat coordinates.
	*/
	readSegment(node, objectStack) {
		return pushParseAndPop([], this.SEGMENTS_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<Array<number>|null>|undefined} flat coordinates.
	*/
	readPolygonPatch(node, objectStack) {
		/** @type {Array<Array<number>|null>} */
		return pushParseAndPop([null], this.FLAT_LINEAR_RINGS_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} flat coordinates.
	*/
	readLineStringSegment(node, objectStack) {
		/** @type {Array<number>|undefined} */
		return pushParseAndPop([null], this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	interiorParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) objectStack[objectStack.length - 1].push(flatLinearRing);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	exteriorParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) {
			const flatLinearRings = objectStack[objectStack.length - 1];
			flatLinearRings[0] = flatLinearRing;
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Polygon|undefined} Polygon.
	*/
	readSurface(node, objectStack) {
		/** @type {Array<Array<number>|null>} */
		const flatLinearRings = pushParseAndPop([null], this.SURFACE_PARSERS, node, objectStack, this);
		if (flatLinearRings && flatLinearRings[0]) {
			const flatCoordinates = flatLinearRings[0];
			const ends = [flatCoordinates.length];
			let i, ii;
			for (i = 1, ii = flatLinearRings.length; i < ii; ++i) {
				extend(flatCoordinates, flatLinearRings[i]);
				ends.push(flatCoordinates.length);
			}
			return new Polygon(flatCoordinates, "XYZ", ends);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {LineString|undefined} LineString.
	*/
	readCurve(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatCoordinates = pushParseAndPop([null], this.CURVE_PARSERS, node, objectStack, this);
		if (flatCoordinates) return new LineString(flatCoordinates, "XYZ");
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../extent.js").Extent|undefined} Envelope.
	*/
	readEnvelope(node, objectStack) {
		/** @type {Array<Array<number>>} */
		const flatCoordinates = pushParseAndPop([null], this.ENVELOPE_PARSERS, node, objectStack, this);
		return createOrUpdate(flatCoordinates[1][0], flatCoordinates[1][1], flatCoordinates[2][0], flatCoordinates[2][1]);
	}
	/**
	* @param {Node} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Flat coordinates.
	*/
	readFlatPos(node, objectStack) {
		let s = getAllTextContent(node, false);
		const re = /^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/;
		/** @type {Array<number>} */
		const flatCoordinates = [];
		let m;
		while (m = re.exec(s)) {
			flatCoordinates.push(parseFloat(m[1]));
			s = s.substr(m[0].length);
		}
		if (s !== "") return;
		const containerSrs = objectStack[0]["srsName"];
		if ((containerSrs ? get(containerSrs)?.getAxisOrientation() ?? "enu" : "enu") === "neu") for (let i = 0, ii = flatCoordinates.length; i < ii; i += 3) {
			const y = flatCoordinates[i];
			flatCoordinates[i] = flatCoordinates[i + 1];
			flatCoordinates[i + 1] = y;
		}
		const len = flatCoordinates.length;
		if (len == 2) flatCoordinates.push(0);
		if (len === 0) return;
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Flat coordinates.
	*/
	readFlatPosList(node, objectStack) {
		const s = getAllTextContent(node, false).replace(/^\s*|\s*$/g, "");
		const context = objectStack[0];
		const containerSrs = context["srsName"];
		const contextDimension = context["srsDimension"];
		const axisOrientation = containerSrs ? get(containerSrs)?.getAxisOrientation() ?? "enu" : "enu";
		const coords = s.split(/\s+/);
		let dim = 2;
		const srsDimensionAttr = node.getAttribute("srsDimension");
		if (srsDimensionAttr) dim = readNonNegativeIntegerString(srsDimensionAttr) ?? 2;
		else if (node.getAttribute("dimension")) dim = readNonNegativeIntegerString(node.getAttribute("dimension") ?? "") ?? 2;
		else if (node.parentNode.getAttribute("srsDimension")) dim = readNonNegativeIntegerString(
			/** @type {Element} */
			node.parentNode.getAttribute("srsDimension") ?? ""
		) ?? 2;
		else if (contextDimension) dim = readNonNegativeIntegerString(contextDimension) ?? 2;
		const asXYZ = axisOrientation.startsWith("en");
		let x, y, z;
		const flatCoordinates = [];
		for (let i = 0, ii = coords.length; i < ii; i += dim) {
			x = parseFloat(coords[i]);
			y = parseFloat(coords[i + 1]);
			z = dim === 3 ? parseFloat(coords[i + 2]) : 0;
			if (asXYZ) flatCoordinates.push(x, y, z);
			else flatCoordinates.push(y, x, z);
		}
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} value Point geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writePos_(node, value, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsDimension = hasZ ? "3" : "2";
		node.setAttribute("srsDimension", srsDimension);
		const srsName = context["srsName"];
		const axisOrientation = srsName ? get(srsName)?.getAxisOrientation() ?? "enu" : "enu";
		const point = value.getCoordinates();
		let coords = axisOrientation.startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
		if (hasZ) {
			const z = point[2] || 0;
			coords += " " + z;
		}
		writeStringTextNode(node, coords);
	}
	/**
	* @param {Array<number>} point Point geometry.
	* @param {string} [srsName] Optional srsName
	* @param {boolean} [hasZ] whether the geometry has a Z coordinate (is 3D) or not.
	* @return {string} The coords string.
	* @private
	*/
	getCoords_(point, srsName, hasZ) {
		let coords = (srsName ? get(srsName)?.getAxisOrientation() ?? "enu" : "enu").startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
		if (hasZ) {
			const z = point[2] || 0;
			coords += " " + z;
		}
		return coords;
	}
	/**
	* @param {Element} node Node.
	* @param {LineString|import("../geom/LinearRing.js").default} value Geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writePosList_(node, value, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsDimension = hasZ ? "3" : "2";
		node.setAttribute("srsDimension", srsDimension);
		const srsName = context["srsName"];
		const points = value.getCoordinates();
		const len = points.length;
		const parts = new Array(len);
		let point;
		for (let i = 0; i < len; ++i) {
			point = points[i];
			parts[i] = this.getCoords_(point, srsName, hasZ);
		}
		writeStringTextNode(node, parts.join(" "));
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} geometry Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePoint(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const pos = createElementNS(node.namespaceURI ?? "", "pos");
		node.appendChild(pos);
		this.writePos_(pos, geometry, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../extent.js").Extent} extent Extent.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeEnvelope(node, extent, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const keys = ["lowerCorner", "upperCorner"];
		const values = [extent[0] + " " + extent[1], extent[2] + " " + extent[3]];
		pushSerializeAndPop({ node }, this.ENVELOPE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, keys, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} geometry LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLinearRing(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const posList = createElementNS(node.namespaceURI ?? "", "posList");
		node.appendChild(posList);
		this.writePosList_(posList, geometry, objectStack);
	}
	/**
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node} Node.
	* @private
	*/
	RING_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const parentNode = context.node;
		const exteriorWritten = context["exteriorWritten"];
		if (exteriorWritten === void 0) context["exteriorWritten"] = true;
		return createElementNS(parentNode.namespaceURI ?? "", exteriorWritten !== void 0 ? "interior" : "exterior");
	}
	/**
	* @param {Element} node Node.
	* @param {Polygon} geometry Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		if (node.nodeName !== "PolygonPatch" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "Polygon" || node.nodeName === "PolygonPatch") {
			const rings = geometry.getLinearRings();
			pushSerializeAndPop({
				node,
				hasZ,
				srsName
			}, this.RING_SERIALIZERS, this.RING_NODE_FACTORY_, rings, objectStack, void 0, this);
		} else if (node.nodeName === "Surface") {
			const patches = createElementNS(node.namespaceURI ?? "", "patches");
			node.appendChild(patches);
			this.writeSurfacePatches_(patches, geometry, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {LineString} geometry LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeCurveOrLineString(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (node.nodeName !== "LineStringSegment" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "LineString" || node.nodeName === "LineStringSegment") {
			const posList = createElementNS(node.namespaceURI ?? "", "posList");
			node.appendChild(posList);
			this.writePosList_(posList, geometry, objectStack);
		} else if (node.nodeName === "Curve") {
			const segments = createElementNS(node.namespaceURI ?? "", "segments");
			node.appendChild(segments);
			this.writeCurveSegments_(segments, geometry, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {MultiPolygon} geometry MultiPolygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const surface = context["surface"];
		if (srsName) node.setAttribute("srsName", srsName);
		const polygons = geometry.getPolygons();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			surface
		}, this.SURFACEORPOLYGONMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, polygons, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/MultiPoint.js").default} geometry MultiPoint geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiPoint(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const srsName = context["srsName"];
		const hasZ = context["hasZ"];
		if (srsName) node.setAttribute("srsName", srsName);
		const points = geometry.getPoints();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName
		}, this.POINTMEMBER_SERIALIZERS, makeSimpleNodeFactory("pointMember"), points, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {MultiLineString} geometry MultiLineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiCurveOrLineString(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const curve = context["curve"];
		if (srsName) node.setAttribute("srsName", srsName);
		const lines = geometry.getLineStrings();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			curve
		}, this.LINESTRINGORCURVEMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, lines, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} ring LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeRing(node, ring, objectStack) {
		const linearRing = createElementNS(node.namespaceURI ?? "", "LinearRing");
		node.appendChild(linearRing);
		this.writeLinearRing(linearRing, ring, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {Polygon} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygonMember(node, polygon, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(polygon, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeSurfaceOrPolygon(child, polygon, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} point Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePointMember(node, point, objectStack) {
		const child = createElementNS(node.namespaceURI ?? "", "Point");
		node.appendChild(child);
		this.writePoint(child, point, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {LineString} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLineStringOrCurveMember(node, line, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(line, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeCurveOrLineString(child, line, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Polygon} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeSurfacePatches_(node, polygon, objectStack) {
		const child = createElementNS(node.namespaceURI ?? "", "PolygonPatch");
		node.appendChild(child);
		this.writeSurfaceOrPolygon(child, polygon, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {LineString} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeCurveSegments_(node, line, objectStack) {
		const child = createElementNS(node.namespaceURI ?? "", "LineStringSegment");
		node.appendChild(child);
		this.writeCurveOrLineString(child, line, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeGeometryElement(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const item = Object.assign({}, context);
		item.node = node;
		let value;
		const options = context;
		if (Array.isArray(geometry)) value = transformExtentWithOptions(geometry, options);
		else value = transformGeometryWithOptions(geometry, true, options);
		pushSerializeAndPop(item, this.GEOMETRY_SERIALIZERS, this.GEOMETRY_NODE_FACTORY_, [value], objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../Feature.js").default} feature Feature.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeFeatureElement(node, feature, objectStack) {
		const fid = feature.getId();
		if (fid) node.setAttribute("fid", fid);
		const context = objectStack[objectStack.length - 1];
		const featureNS = context["featureNS"];
		const geometryName = feature.getGeometryName();
		if (!context.serializers) {
			context.serializers = {};
			context.serializers[featureNS] = {};
		}
		const keys = [];
		const values = [];
		if (feature.hasProperties()) {
			const properties = feature.getProperties();
			for (const key in properties) {
				const value = properties[key];
				if (value !== null && value !== void 0) {
					keys.push(key);
					values.push(value);
					if (key == geometryName || typeof value.getSimplifiedGeometry === "function") {
						if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(this.writeGeometryElement, this);
					} else if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(writeStringTextNode);
				}
			}
		}
		const item = Object.assign({}, context);
		item.node = node;
		pushSerializeAndPop(item, context.serializers, makeSimpleNodeFactory(void 0, featureNS), values, objectStack, keys);
	}
	/**
	* @param {Node} node Node.
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeFeatureMembers_(node, features, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const featureType = context["featureType"];
		const featureNS = context["featureNS"];
		/** @type {Object<string, Object<string, import("../xml.js").Serializer>>} */
		const serializers = {};
		serializers[featureNS] = {};
		serializers[featureNS][featureType] = makeChildAppender(this.writeFeatureElement, this);
		const item = Object.assign({}, context);
		item.node = node;
		pushSerializeAndPop(item, serializers, makeSimpleNodeFactory(featureType, featureNS), features, objectStack);
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node|undefined} Node.
	* @private
	*/
	MULTIGEOMETRY_MEMBER_NODE_FACTORY_(value, objectStack, nodeName) {
		const parentNode = objectStack[objectStack.length - 1].node;
		return createElementNS(this.namespace, MULTIGEOMETRY_TO_MEMBER_NODENAME[parentNode.nodeName]);
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Element|undefined} Node.
	* @private
	*/
	GEOMETRY_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const multiSurface = context["multiSurface"];
		const surface = context["surface"];
		const curve = context["curve"];
		const multiCurve = context["multiCurve"];
		if (!Array.isArray(value)) {
			nodeName = value.getType();
			if (nodeName === "MultiPolygon" && multiSurface === true) nodeName = "MultiSurface";
			else if (nodeName === "Polygon" && surface === true) nodeName = "Surface";
			else if (nodeName === "LineString" && curve === true) nodeName = "Curve";
			else if (nodeName === "MultiLineString" && multiCurve === true) nodeName = "MultiCurve";
		} else nodeName = "Envelope";
		return createElementNS(this.namespace, nodeName);
	}
	/**
	* Encode a geometry in GML 3.1.1 Simple Features.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	* @api
	* @override
	*/
	writeGeometryNode(geometry, options) {
		options = this.adaptOptions(options);
		const geom = createElementNS(this.namespace, "geom");
		const context = {
			node: geom,
			hasZ: this.hasZ,
			srsName: this.srsName,
			curve: this.curve_,
			surface: this.surface_,
			multiSurface: this.multiSurface_,
			multiCurve: this.multiCurve_
		};
		if (options) Object.assign(context, options);
		this.writeGeometryElement(geom, geometry, [context]);
		return geom;
	}
	/**
	* Encode an array of features in the GML 3.1.1 format as an XML node.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Element} Node.
	* @api
	* @override
	*/
	writeFeaturesNode(features, options) {
		options = this.adaptOptions(options);
		const node = createElementNS(this.namespace, "featureMembers");
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", this.schemaLocation);
		const context = {
			srsName: this.srsName,
			hasZ: this.hasZ,
			curve: this.curve_,
			surface: this.surface_,
			multiSurface: this.multiSurface_,
			multiCurve: this.multiCurve_,
			featureNS: this.featureNS,
			featureType: this.featureType
		};
		if (options) Object.assign(context, options);
		this.writeFeatureMembers_(node, features, [context]);
		return node;
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml": {
	"pos": makeReplacer(GML3.prototype.readFlatPos),
	"posList": makeReplacer(GML3.prototype.readFlatPosList),
	"coordinates": makeReplacer(GML2.prototype.readFlatCoordinates)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml": {
	"interior": GML3.prototype.interiorParser,
	"exterior": GML3.prototype.exteriorParser
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml": {
	"Point": makeReplacer(GMLBase.prototype.readPoint),
	"MultiPoint": makeReplacer(GMLBase.prototype.readMultiPoint),
	"LineString": makeReplacer(GMLBase.prototype.readLineString),
	"MultiLineString": makeReplacer(GMLBase.prototype.readMultiLineString),
	"LinearRing": makeReplacer(GMLBase.prototype.readLinearRing),
	"Polygon": makeReplacer(GMLBase.prototype.readPolygon),
	"MultiPolygon": makeReplacer(GMLBase.prototype.readMultiPolygon),
	"Surface": makeReplacer(GML3.prototype.readSurface),
	"MultiSurface": makeReplacer(GML3.prototype.readMultiSurface),
	"Curve": makeReplacer(GML3.prototype.readCurve),
	"MultiCurve": makeReplacer(GML3.prototype.readMultiCurve),
	"Envelope": makeReplacer(GML3.prototype.readEnvelope)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.MULTICURVE_PARSERS = { "http://www.opengis.net/gml": {
	"curveMember": makeArrayPusher(GML3.prototype.curveMemberParser),
	"curveMembers": makeArrayPusher(GML3.prototype.curveMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.MULTISURFACE_PARSERS = { "http://www.opengis.net/gml": {
	"surfaceMember": makeArrayPusher(GML3.prototype.surfaceMemberParser),
	"surfaceMembers": makeArrayPusher(GML3.prototype.surfaceMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.CURVEMEMBER_PARSERS = { "http://www.opengis.net/gml": {
	"LineString": makeArrayPusher(GMLBase.prototype.readLineString),
	"Curve": makeArrayPusher(GML3.prototype.readCurve)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SURFACEMEMBER_PARSERS = { "http://www.opengis.net/gml": {
	"Polygon": makeArrayPusher(GMLBase.prototype.readPolygon),
	"Surface": makeArrayPusher(GML3.prototype.readSurface)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SURFACE_PARSERS = { "http://www.opengis.net/gml": { "patches": makeReplacer(GML3.prototype.readPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.CURVE_PARSERS = { "http://www.opengis.net/gml": { "segments": makeReplacer(GML3.prototype.readSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.ENVELOPE_PARSERS = { "http://www.opengis.net/gml": {
	"lowerCorner": makeArrayPusher(GML3.prototype.readFlatPosList),
	"upperCorner": makeArrayPusher(GML3.prototype.readFlatPosList)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.PATCHES_PARSERS = { "http://www.opengis.net/gml": { "PolygonPatch": makeReplacer(GML3.prototype.readPolygonPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SEGMENTS_PARSERS = { "http://www.opengis.net/gml": { "LineStringSegment": makeArrayExtender(GML3.prototype.readLineStringSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.RING_PARSERS = { "http://www.opengis.net/gml": {
	"LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing),
	"Ring": makeReplacer(GML3.prototype.readFlatCurveRing)
} };
/**
* Encode an array of features in GML 3.1.1 Simple Features.
*
* @function
* @param {Array<import("../Feature.js").default>} features Features.
* @param {import("./Feature.js").WriteOptions} [options] Options.
* @return {string} Result.
* @api
*/
GML3.prototype.writeFeatures;
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.RING_SERIALIZERS = { "http://www.opengis.net/gml": {
	"exterior": makeChildAppender(GML3.prototype.writeRing),
	"interior": makeChildAppender(GML3.prototype.writeRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.ENVELOPE_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lowerCorner": makeChildAppender(writeStringTextNode),
	"upperCorner": makeChildAppender(writeStringTextNode)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"surfaceMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember),
	"polygonMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.POINTMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": { "pointMember": makeChildAppender(GML3.prototype.writePointMember) } };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lineStringMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember),
	"curveMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.GEOMETRY_SERIALIZERS = { "http://www.opengis.net/gml": {
	"Curve": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiCurve": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"Point": makeChildAppender(GML3.prototype.writePoint),
	"MultiPoint": makeChildAppender(GML3.prototype.writeMultiPoint),
	"LineString": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiLineString": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"LinearRing": makeChildAppender(GML3.prototype.writeLinearRing),
	"Polygon": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiPolygon": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Surface": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiSurface": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Envelope": makeChildAppender(GML3.prototype.writeEnvelope)
} };
//#endregion
//#region src/ol/format/GML32.js
/**
* @module ol/format/GML32
*/
/**
* @classdesc Feature format for reading and writing data in the GML format
*            version 3.2.1.
* @api
*/
var GML32 = class extends GML3 {
	/**
	* @param {import("./GMLBase.js").Options} [options] Optional configuration object.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		/**
		* @type {string}
		*/
		this.schemaLocation = options.schemaLocation ? options.schemaLocation : this.namespace + " http://schemas.opengis.net/gml/3.2.1/gml.xsd";
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
	* @param {Array<*>} objectStack Node stack.
	* @override
	*/
	writeGeometryElement(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		objectStack[objectStack.length - 1] = Object.assign({
			multiCurve: true,
			multiSurface: true
		}, context);
		super.writeGeometryElement(node, geometry, objectStack);
	}
};
GML32.prototype.namespace = "http://www.opengis.net/gml/3.2";
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"pos": makeReplacer(GML3.prototype.readFlatPos),
	"posList": makeReplacer(GML3.prototype.readFlatPosList),
	"coordinates": makeReplacer(GML2.prototype.readFlatCoordinates)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"interior": GML3.prototype.interiorParser,
	"exterior": GML3.prototype.exteriorParser
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"Point": makeReplacer(GMLBase.prototype.readPoint),
	"MultiPoint": makeReplacer(GMLBase.prototype.readMultiPoint),
	"LineString": makeReplacer(GMLBase.prototype.readLineString),
	"MultiLineString": makeReplacer(GMLBase.prototype.readMultiLineString),
	"LinearRing": makeReplacer(GMLBase.prototype.readLinearRing),
	"Polygon": makeReplacer(GMLBase.prototype.readPolygon),
	"MultiPolygon": makeReplacer(GMLBase.prototype.readMultiPolygon),
	"Surface": makeReplacer(GML32.prototype.readSurface),
	"MultiSurface": makeReplacer(GML3.prototype.readMultiSurface),
	"Curve": makeReplacer(GML32.prototype.readCurve),
	"MultiCurve": makeReplacer(GML3.prototype.readMultiCurve),
	"Envelope": makeReplacer(GML32.prototype.readEnvelope)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTICURVE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"curveMember": makeArrayPusher(GML3.prototype.curveMemberParser),
	"curveMembers": makeArrayPusher(GML3.prototype.curveMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTISURFACE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"surfaceMember": makeArrayPusher(GML3.prototype.surfaceMemberParser),
	"surfaceMembers": makeArrayPusher(GML3.prototype.surfaceMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.CURVEMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"LineString": makeArrayPusher(GMLBase.prototype.readLineString),
	"Curve": makeArrayPusher(GML3.prototype.readCurve)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SURFACEMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"Polygon": makeArrayPusher(GMLBase.prototype.readPolygon),
	"Surface": makeArrayPusher(GML3.prototype.readSurface)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SURFACE_PARSERS = { "http://www.opengis.net/gml/3.2": { "patches": makeReplacer(GML3.prototype.readPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.CURVE_PARSERS = { "http://www.opengis.net/gml/3.2": { "segments": makeReplacer(GML3.prototype.readSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.ENVELOPE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"lowerCorner": makeArrayPusher(GML3.prototype.readFlatPosList),
	"upperCorner": makeArrayPusher(GML3.prototype.readFlatPosList)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.PATCHES_PARSERS = { "http://www.opengis.net/gml/3.2": { "PolygonPatch": makeReplacer(GML3.prototype.readPolygonPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SEGMENTS_PARSERS = { "http://www.opengis.net/gml/3.2": { "LineStringSegment": makeArrayExtender(GML3.prototype.readLineStringSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTIPOINT_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"pointMember": makeArrayPusher(GMLBase.prototype.pointMemberParser),
	"pointMembers": makeArrayPusher(GMLBase.prototype.pointMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTILINESTRING_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"lineStringMember": makeArrayPusher(GMLBase.prototype.lineStringMemberParser),
	"lineStringMembers": makeArrayPusher(GMLBase.prototype.lineStringMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTIPOLYGON_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"polygonMember": makeArrayPusher(GMLBase.prototype.polygonMemberParser),
	"polygonMembers": makeArrayPusher(GMLBase.prototype.polygonMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.POINTMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "Point": makeArrayPusher(GMLBase.prototype.readFlatCoordinatesFromNode) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.LINESTRINGMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "LineString": makeArrayPusher(GMLBase.prototype.readLineString) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.POLYGONMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "Polygon": makeArrayPusher(GMLBase.prototype.readPolygon) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.RING_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing),
	"Ring": makeReplacer(GML32.prototype.readFlatCurveRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.RING_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"exterior": makeChildAppender(GML3.prototype.writeRing),
	"interior": makeChildAppender(GML3.prototype.writeRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.ENVELOPE_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"lowerCorner": makeChildAppender(writeStringTextNode),
	"upperCorner": makeChildAppender(writeStringTextNode)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"surfaceMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember),
	"polygonMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.POINTMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": { "pointMember": makeChildAppender(GML3.prototype.writePointMember) } };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"lineStringMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember),
	"curveMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.GEOMETRY_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"Curve": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiCurve": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"Point": makeChildAppender(GML32.prototype.writePoint),
	"MultiPoint": makeChildAppender(GML3.prototype.writeMultiPoint),
	"LineString": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiLineString": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"LinearRing": makeChildAppender(GML3.prototype.writeLinearRing),
	"Polygon": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiPolygon": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Surface": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiSurface": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Envelope": makeChildAppender(GML3.prototype.writeEnvelope)
} };
//#endregion
//#region src/ol/format/filter/Filter.js
/**
* @module ol/format/filter/Filter
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature filters.
*
* @abstract
*/
var Filter = class {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	*/
	constructor(tagName) {
		/**
		* @private
		* @type {!string}
		*/
		this.tagName_ = tagName;
	}
	/**
	* The XML tag name for a filter.
	* @return {!string} Name.
	*/
	getTagName() {
		return this.tagName_;
	}
};
//#endregion
//#region src/ol/format/filter/LogicalNary.js
/**
* @module ol/format/filter/LogicalNary
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature n-ary logical filters.
*
* @abstract
*/
var LogicalNary = class extends Filter {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	* @param {Array<import("./Filter.js").default>} conditions Conditions.
	*/
	constructor(tagName, conditions) {
		super(tagName);
		/**
		* @type {Array<import("./Filter.js").default>}
		*/
		this.conditions = conditions;
		assert(this.conditions.length >= 2, "At least 2 conditions are required");
	}
};
//#endregion
//#region src/ol/format/filter/And.js
/**
* @module ol/format/filter/And
*/
/**
* @classdesc
* Represents a logical `<And>` operator between two or more filter conditions.
*
* @abstract
*/
var And = class extends LogicalNary {
	/**
	* @param {...import("./Filter.js").default} conditions Conditions.
	*/
	constructor(conditions) {
		super("And", Array.prototype.slice.call(arguments));
	}
};
//#endregion
//#region src/ol/format/filter/Bbox.js
/**
* @module ol/format/filter/Bbox
*/
/**
* @classdesc
* Represents a `<BBOX>` operator to test whether a geometry-valued property
* intersects a fixed bounding box
*
* @api
*/
var Bbox = class extends Filter {
	/**
	* @param {!string} geometryName Geometry name to use.
	* @param {!import("../../extent.js").Extent} extent Extent.
	* @param {string} [srsName] SRS name. No srsName attribute will be set
	* on geometries when this is not provided.
	*/
	constructor(geometryName, extent, srsName) {
		super("BBOX");
		/**
		* @type {!string}
		*/
		this.geometryName = geometryName;
		/**
		* @type {import("../../extent.js").Extent}
		*/
		this.extent = extent;
		if (extent.length !== 4) throw new Error("Expected an extent with four values ([minX, minY, maxX, maxY])");
		/**
		* @type {string|undefined}
		*/
		this.srsName = srsName;
	}
};
//#endregion
//#region src/ol/format/filter/Comparison.js
/**
* @module ol/format/filter/Comparison
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature property comparison filters.
*
* @abstract
*/
var Comparison = class extends Filter {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	* @param {!string} propertyName Name of the context property to compare.
	*/
	constructor(tagName, propertyName) {
		super(tagName);
		/**
		* @type {!string}
		*/
		this.propertyName = propertyName;
	}
};
//#endregion
//#region src/ol/format/filter/ComparisonBinary.js
/**
* @module ol/format/filter/ComparisonBinary
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature property binary comparison filters.
*
* @abstract
*/
var ComparisonBinary = class extends Comparison {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!(string|number)} expression The value to compare.
	* @param {boolean} [matchCase] Case-sensitive?
	*/
	constructor(tagName, propertyName, expression, matchCase) {
		super(tagName, propertyName);
		/**
		* @type {!(string|number)}
		*/
		this.expression = expression;
		/**
		* @type {boolean|undefined}
		*/
		this.matchCase = matchCase;
	}
};
//#endregion
//#region src/ol/format/filter/EqualTo.js
/**
* @module ol/format/filter/EqualTo
*/
/**
* @classdesc
* Represents a `<PropertyIsEqualTo>` comparison operator.
* @api
*/
var EqualTo = class extends ComparisonBinary {
	/**
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!(string|number)} expression The value to compare.
	* @param {boolean} [matchCase] Case-sensitive?
	*/
	constructor(propertyName, expression, matchCase) {
		super("PropertyIsEqualTo", propertyName, expression, matchCase);
	}
};
//#endregion
//#region src/ol/format/filter/IsLike.js
/**
* @module ol/format/filter/IsLike
*/
/**
* @classdesc
* Represents a `<PropertyIsLike>` comparison operator.
* @api
*/
var IsLike = class extends Comparison {
	/**
	* [constructor description]
	* @param {!string} propertyName Name of the context property to compare.
	* @param {!string} pattern Text pattern.
	* @param {string} [wildCard] Pattern character which matches any sequence of
	*    zero or more string characters. Default is '*'.
	* @param {string} [singleChar] pattern character which matches any single
	*    string character. Default is '.'.
	* @param {string} [escapeChar] Escape character which can be used to escape
	*    the pattern characters. Default is '!'.
	* @param {boolean} [matchCase] Case-sensitive?
	*/
	constructor(propertyName, pattern, wildCard, singleChar, escapeChar, matchCase) {
		super("PropertyIsLike", propertyName);
		/**
		* @type {!string}
		*/
		this.pattern = pattern;
		/**
		* @type {!string}
		*/
		this.wildCard = wildCard !== void 0 ? wildCard : "*";
		/**
		* @type {!string}
		*/
		this.singleChar = singleChar !== void 0 ? singleChar : ".";
		/**
		* @type {!string}
		*/
		this.escapeChar = escapeChar !== void 0 ? escapeChar : "!";
		/**
		* @type {boolean|undefined}
		*/
		this.matchCase = matchCase;
	}
};
//#endregion
//#region src/ol/format/filter.js
/**
* @module ol/format/filter
*/
/**
* Create a logical `<And>` operator between two or more filter conditions.
*
* @param {...import("./filter/Filter.js").default} conditions Filter conditions.
* @return {!And} `<And>` operator.
* @api
*/
function and(conditions) {
	return Reflect.construct(And, Array.prototype.slice.call(arguments));
}
/**
* Create a `<BBOX>` operator to test whether a geometry-valued property
* intersects a fixed bounding box
*
* @param {!string} geometryName Geometry name to use.
* @param {!import("../extent.js").Extent} extent Extent.
* @param {string} [srsName] SRS name. No srsName attribute will be
*    set on geometries when this is not provided.
* @return {!Bbox} `<BBOX>` operator.
* @api
*/
function bbox(geometryName, extent, srsName) {
	return new Bbox(geometryName, extent, srsName);
}
/**
* Creates a `<PropertyIsEqualTo>` comparison operator.
*
* @param {!string} propertyName Name of the context property to compare.
* @param {!(string|number)} expression The value to compare.
* @param {boolean} [matchCase] Case-sensitive?
* @return {!EqualTo} `<PropertyIsEqualTo>` operator.
* @api
*/
function equalTo(propertyName, expression, matchCase) {
	return new EqualTo(propertyName, expression, matchCase);
}
/**
* Represents a `<PropertyIsLike>` comparison operator that matches a string property
* value against a text pattern.
*
* @param {!string} propertyName Name of the context property to compare.
* @param {!string} pattern Text pattern.
* @param {string} [wildCard] Pattern character which matches any sequence of
*    zero or more string characters. Default is '*'.
* @param {string} [singleChar] pattern character which matches any single
*    string character. Default is '.'.
* @param {string} [escapeChar] Escape character which can be used to escape
*    the pattern characters. Default is '!'.
* @param {boolean} [matchCase] Case-sensitive?
* @return {!IsLike} `<PropertyIsLike>` operator.
* @api
*/
function like(propertyName, pattern, wildCard, singleChar, escapeChar, matchCase) {
	return new IsLike(propertyName, pattern, wildCard, singleChar, escapeChar, matchCase);
}
//#endregion
//#region src/ol/format/WFS.js
/**
* @module ol/format/WFS
*/
/**
* @typedef {Object<string, *>} WFSObject
*/
/**
* @const
* @type {import("../xml.js").ParsersNS}
*/
var FEATURE_COLLECTION_PARSERS = {
	"http://www.opengis.net/gml": { "boundedBy": makeObjectPropertySetter(GMLBase.prototype.readExtentElement, "bounds") },
	"http://www.opengis.net/wfs/2.0": { "member": readMember }
};
/**
* Reads a `wfs:member`, which contains either a feature or, in GetFeature
* responses for multiple type names, a nested `wfs:FeatureCollection`.
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @this {GMLBase}
*/
function readMember(node, objectStack) {
	const features = objectStack[objectStack.length - 1];
	const child = node.firstElementChild;
	if (child && child.localName === "FeatureCollection") {
		const context = objectStack[0];
		const featureType = context["featureType"];
		const featureNS = context["featureNS"];
		features.push(...pushParseAndPop([], FEATURE_COLLECTION_PARSERS, child, objectStack, this));
		context["featureType"] = featureType;
		context["featureNS"] = featureNS;
		return;
	}
	const feature = GMLBase.prototype.readFeaturesInternal.call(this, node, objectStack);
	if (feature !== void 0) features.push(feature);
}
/**
* @const
* @type {import("../xml.js").ParsersNS}
*/
var TRANSACTION_SUMMARY_PARSERS = {
	"http://www.opengis.net/wfs": {
		"totalInserted": makeObjectPropertySetter(readPositiveInteger),
		"totalUpdated": makeObjectPropertySetter(readPositiveInteger),
		"totalDeleted": makeObjectPropertySetter(readPositiveInteger)
	},
	"http://www.opengis.net/wfs/2.0": {
		"totalInserted": makeObjectPropertySetter(readPositiveInteger),
		"totalUpdated": makeObjectPropertySetter(readPositiveInteger),
		"totalDeleted": makeObjectPropertySetter(readPositiveInteger)
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRANSACTION_RESPONSE_PARSERS = {
	"http://www.opengis.net/wfs": {
		"TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
		"InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
	},
	"http://www.opengis.net/wfs/2.0": {
		"TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
		"InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
	}
};
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var QUERY_SERIALIZERS = {
	"http://www.opengis.net/wfs": { "PropertyName": makeChildAppender(writeStringTextNode) },
	"http://www.opengis.net/wfs/2.0": { "PropertyName": makeChildAppender(writeStringTextNode) }
};
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var TRANSACTION_SERIALIZERS = {
	"http://www.opengis.net/wfs": {
		"Insert": makeChildAppender(writeFeature),
		"Update": makeChildAppender(writeUpdate),
		"Delete": makeChildAppender(writeDelete),
		"Property": makeChildAppender(writeProperty),
		"Native": makeChildAppender(writeNative)
	},
	"http://www.opengis.net/wfs/2.0": {
		"Insert": makeChildAppender(writeFeature),
		"Update": makeChildAppender(writeUpdate),
		"Delete": makeChildAppender(writeDelete),
		"Property": makeChildAppender(writeProperty),
		"Native": makeChildAppender(writeNative)
	}
};
/**
* @typedef {Object} Options
* @property {Object<string, string>|string} [featureNS] The namespace URI used for features.
* @property {Array<string>|string} [featureType] The feature type to parse. Only used for read operations.
* @property {GMLBase} [gmlFormat] The GML format to use to parse the response.
* Default is `ol/format/GML2` for WFS 1.0.0, `ol/format/GML3` for WFS 1.1.0 and `ol/format/GML32` for WFS 2.0.0.
* @property {string} [schemaLocation] Optional schemaLocation to use for serialization, this will override the default.
* @property {string} [version='1.1.0'] WFS version to use. Can be either `1.0.0`, `1.1.0` or `2.0.0`.
*/
/**
* @typedef {Object} WriteGetFeatureOptions
* @property {string} featureNS The namespace URI used for features.
* @property {string} featurePrefix The prefix for the feature namespace.
* @property {Array<string|FeatureType>} featureTypes The feature type names or FeatureType objects to
* define a unique bbox filter per feature type name (in this case, options `bbox` and `geometryName` are
* ignored.).
* @property {string} [srsName] SRS name. No srsName attribute will be set on
* geometries when this is not provided.
* @property {string} [handle] Handle.
* @property {string} [outputFormat] Output format.
* @property {number} [maxFeatures] Maximum number of features to fetch.
* @property {string} [geometryName] Geometry name to use in a BBOX filter.
* @property {Array<string>} [propertyNames] Optional list of property names to serialize.
* @property {string} [viewParams] viewParams GeoServer vendor parameter.
* @property {number} [startIndex] Start index to use for WFS paging. This is a
* WFS 2.0 feature backported to WFS 1.1.0 by some Web Feature Services.
* @property {number} [count] Number of features to retrieve when paging. This is a
* WFS 2.0 feature backported to WFS 1.1.0 by some Web Feature Services. Please note that some
* Web Feature Services have repurposed `maxfeatures` instead.
* @property {import("../extent.js").Extent} [bbox] Extent to use for the BBOX filter. The `geometryName`
* option must be set.
* @property {import("./filter/Filter.js").default} [filter] Filter condition. See
* {@link module:ol/format/filter} for more information.
* @property {string} [resultType] Indicates what response should be returned,
* e.g. `hits` only includes the `numberOfFeatures` attribute in the response and no features.
*/
/**
* @typedef {Object} FeatureType
* @property {!string} name The feature type name.
* @property {!import("../extent.js").Extent} bbox Extent to use for the BBOX filter.
* @property {!string} geometryName Geometry name to use in the BBOX filter.
*/
/**
* @typedef {Object} WriteTransactionOptions
* @property {string} featureNS The namespace URI used for features.
* @property {string} featurePrefix The prefix for the feature namespace.
* @property {string} featureType The feature type name.
* @property {string} [srsName] SRS name. No srsName attribute will be set on
* geometries when this is not provided.
* @property {string} [handle] Handle.
* @property {boolean} [hasZ] Must be set to true if the transaction is for
* a 3D layer. This will allow the Z coordinate to be included in the transaction.
* @property {Array<Object>} nativeElements Native elements. Currently not supported.
* @property {import("./GMLBase.js").Options} [gmlOptions] GML options for the WFS transaction writer.
* @property {string} [version='1.1.0'] WFS version to use for the transaction. Can be either `1.0.0`, `1.1.0` or `2.0.0`.
*/
/**
* Number of features; bounds/extent.
* @typedef {Object} FeatureCollectionMetadata
* @property {number} numberOfFeatures NumberOfFeatures.
* @property {import("../extent.js").Extent} bounds Bounds.
*/
/**
* @typedef {Object} TransactionSummary
* @property {number} totalDeleted TotalDeleted.
* @property {number} totalInserted TotalInserted.
* @property {number} totalUpdated TotalUpdated.
*/
/**
* Total deleted; total inserted; total updated; array of insert ids.
* @typedef {Object} TransactionResponse
* @property {TransactionSummary} transactionSummary Transaction summary.
* @property {Array<string>} insertIds InsertIds.
*/
/**
* @type {string}
*/
var FEATURE_PREFIX = "feature";
/**
* @type {string}
*/
var XMLNS = "http://www.w3.org/2000/xmlns/";
/**
* @type {Object<string, string>}
*/
var OGCNS = {
	"2.0.0": "http://www.opengis.net/ogc/1.1",
	"1.1.0": "http://www.opengis.net/ogc",
	"1.0.0": "http://www.opengis.net/ogc"
};
/**
* @type {Object<string, string>}
*/
var WFSNS = {
	"2.0.0": "http://www.opengis.net/wfs/2.0",
	"1.1.0": "http://www.opengis.net/wfs",
	"1.0.0": "http://www.opengis.net/wfs"
};
/**
* @type {Object<string, string>}
*/
var FESNS = {
	"2.0.0": "http://www.opengis.net/fes/2.0",
	"1.1.0": "http://www.opengis.net/fes",
	"1.0.0": "http://www.opengis.net/fes"
};
/**
* @type {Object<string, string>}
*/
var SCHEMA_LOCATIONS = {
	"2.0.0": "http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd",
	"1.1.0": "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
	"1.0.0": "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/wfs.xsd"
};
/**
* @type {Object<string, typeof GML2|typeof GML3|typeof GML32>}
*/
var GML_FORMATS = {
	"2.0.0": GML32,
	"1.1.0": GML3,
	"1.0.0": GML2
};
/**
* @const
* @type {string}
*/
var DEFAULT_VERSION = "1.1.0";
/**
* @classdesc
* Feature format for reading and writing data in the WFS format.
* By default, supports WFS version 1.1.0. You can pass a GML format
* as option to override the default.
* Also see {@link module:ol/format/GMLBase~GMLBase} which is used by this format.
*
* @api
*/
var WFS = class extends XMLFeature {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @private
		* @type {string}
		*/
		this.version_ = options.version ? options.version : DEFAULT_VERSION;
		/**
		* @private
		* @type {Array<string>|string|undefined}
		*/
		this.featureType_ = options.featureType;
		/**
		* @private
		* @type {Object<string, string>|string|undefined}
		*/
		this.featureNS_ = options.featureNS;
		/**
		* @private
		* @type {GMLBase}
		*/
		this.gmlFormat_ = options.gmlFormat ? options.gmlFormat : new GML_FORMATS[this.version_]();
		/**
		* @private
		* @type {string}
		*/
		this.schemaLocation_ = options.schemaLocation ? options.schemaLocation : SCHEMA_LOCATIONS[this.version_];
	}
	/**
	* @return {Array<string>|string|undefined} featureType
	*/
	getFeatureType() {
		return this.featureType_;
	}
	/**
	* @param {Array<string>|string|undefined} featureType Feature type(s) to parse.
	*/
	setFeatureType(featureType) {
		this.featureType_ = featureType;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		/** @type {import("../xml.js").NodeStackItem} */
		const context = { node };
		Object.assign(context, {
			"featureType": this.featureType_,
			"featureNS": this.featureNS_
		});
		Object.assign(context, this.getReadOptions(node, options ? options : {}));
		const objectStack = [context];
		let featuresNS;
		if (this.version_ === "2.0.0") featuresNS = FEATURE_COLLECTION_PARSERS;
		else featuresNS = this.gmlFormat_.FEATURE_COLLECTION_PARSERS;
		let features = pushParseAndPop([], featuresNS, node, objectStack, this.gmlFormat_);
		if (!features) features = [];
		return features;
	}
	/**
	* Read transaction response of the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {TransactionResponse|undefined} Transaction response.
	* @api
	*/
	readTransactionResponse(source) {
		if (!source) return;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readTransactionResponseFromDocument(doc);
		}
		if (isDocument(source)) return this.readTransactionResponseFromDocument(source);
		return this.readTransactionResponseFromNode(source);
	}
	/**
	* Read feature collection metadata of the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	* @api
	*/
	readFeatureCollectionMetadata(source) {
		if (!source) return;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readFeatureCollectionMetadataFromDocument(doc);
		}
		if (isDocument(source)) return this.readFeatureCollectionMetadataFromDocument(source);
		return this.readFeatureCollectionMetadataFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	*/
	readFeatureCollectionMetadataFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readFeatureCollectionMetadataFromNode(n);
	}
	/**
	* @param {Element} node Node.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	*/
	readFeatureCollectionMetadataFromNode(node) {
		const result = {};
		result["numberOfFeatures"] = readNonNegativeIntegerString(node.getAttribute("numberOfFeatures") ?? "");
		return pushParseAndPop(result, FEATURE_COLLECTION_PARSERS, node, [], this.gmlFormat_);
	}
	/**
	* @param {Document} doc Document.
	* @return {TransactionResponse|undefined} Transaction response.
	*/
	readTransactionResponseFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readTransactionResponseFromNode(n);
	}
	/**
	* @param {Element} node Node.
	* @return {TransactionResponse|undefined} Transaction response.
	*/
	readTransactionResponseFromNode(node) {
		return pushParseAndPop({}, TRANSACTION_RESPONSE_PARSERS, node, []);
	}
	/**
	* Encode format as WFS `GetFeature` and return the Node.
	*
	* @param {WriteGetFeatureOptions} options Options.
	* @return {Node} Result.
	* @api
	*/
	writeGetFeature(options) {
		const node = createElementNS(WFSNS[this.version_], "GetFeature");
		node.setAttribute("service", "WFS");
		node.setAttribute("version", this.version_);
		if (options.handle) node.setAttribute("handle", options.handle);
		if (options.outputFormat) node.setAttribute("outputFormat", options.outputFormat);
		if (options.maxFeatures !== void 0) node.setAttribute("maxFeatures", String(options.maxFeatures));
		if (options.resultType) node.setAttribute("resultType", options.resultType);
		if (options.startIndex !== void 0) node.setAttribute("startIndex", String(options.startIndex));
		if (options.count !== void 0) node.setAttribute("count", String(options.count));
		if (options.viewParams !== void 0) node.setAttribute("viewParams", options.viewParams);
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", this.schemaLocation_);
		/** @type {import("../xml.js").NodeStackItem} */
		const context = { node };
		Object.assign(context, {
			"version": this.version_,
			"srsName": options.srsName,
			"featureNS": options.featureNS ? options.featureNS : this.featureNS_,
			"featurePrefix": options.featurePrefix,
			"propertyNames": options.propertyNames ? options.propertyNames : []
		});
		assert(Array.isArray(options.featureTypes), "`options.featureTypes` must be an Array");
		if (typeof options.featureTypes[0] === "string") {
			let filter = options.filter;
			if (options.bbox) {
				assert(options.geometryName, "`options.geometryName` must also be provided when `options.bbox` is set");
				filter = this.combineBboxAndFilter(options.geometryName, options.bbox, options.srsName, filter);
			}
			Object.assign(context, {
				"geometryName": options.geometryName,
				"filter": filter
			});
			writeGetFeature(node, options.featureTypes, [context]);
		} else options.featureTypes.forEach((featureType) => {
			if (typeof featureType === "string") return;
			const completeFilter = this.combineBboxAndFilter(featureType.geometryName, featureType.bbox, options.srsName, options.filter);
			Object.assign(context, {
				"geometryName": featureType.geometryName,
				"filter": completeFilter
			});
			writeGetFeature(node, [featureType.name], [context]);
		});
		return node;
	}
	/**
	* Create a bbox filter and combine it with another optional filter.
	*
	* @param {!string} geometryName Geometry name to use.
	* @param {!import("../extent.js").Extent} extent Extent.
	* @param {string} [srsName] SRS name. No srsName attribute will be
	*    set on geometries when this is not provided.
	* @param {import("./filter/Filter.js").default} [filter] Filter condition.
	* @return {import("./filter/Filter.js").default} The filter.
	*/
	combineBboxAndFilter(geometryName, extent, srsName, filter) {
		const bboxFilter = bbox(geometryName, extent, srsName);
		if (filter) return and(filter, bboxFilter);
		return bboxFilter;
	}
	/**
	* Encode format as WFS `Transaction` and return the Node.
	*
	* @param {Array<import("../Feature.js").default>} inserts The features to insert.
	* @param {Array<import("../Feature.js").default>} updates The features to update.
	* @param {Array<import("../Feature.js").default>} deletes The features to delete.
	* @param {WriteTransactionOptions} options Write options.
	* @return {Node} Result.
	* @api
	*/
	writeTransaction(inserts, updates, deletes, options) {
		/** @type {Array<WFSObject>} */
		const objectStack = [];
		const version = options.version ? options.version : this.version_;
		const node = createElementNS(WFSNS[version], "Transaction");
		node.setAttribute("service", "WFS");
		node.setAttribute("version", version);
		let baseObj;
		/** @type {import("../xml.js").NodeStackItem} */
		if (options) {
			baseObj = options.gmlOptions ? options.gmlOptions : {};
			if (options.handle) node.setAttribute("handle", options.handle);
		}
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", SCHEMA_LOCATIONS[version]);
		const request = createTransactionRequest(node, baseObj, version, options);
		if (inserts) serializeTransactionRequest("Insert", inserts, objectStack, request);
		if (updates) serializeTransactionRequest("Update", updates, objectStack, request);
		if (deletes) serializeTransactionRequest("Delete", deletes, objectStack, request);
		if (options.nativeElements) serializeTransactionRequest("Native", options.nativeElements, objectStack, request);
		return node;
	}
	/**
	* @param {Document} doc Document.
	* @return {import("../proj/Projection.js").default|undefined} Projection.
	* @override
	*/
	readProjectionFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readProjectionFromNode(n);
	}
	/**
	* @param {Element} node Node.
	* @return {import("../proj/Projection.js").default|undefined} Projection.
	* @override
	*/
	readProjectionFromNode(node) {
		if (node.firstElementChild && node.firstElementChild.firstElementChild) {
			node = node.firstElementChild.firstElementChild;
			for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (!(n.childNodes.length === 0 || n.childNodes.length === 1 && n.firstChild && n.firstChild.nodeType === 3)) {
				const objectStack = [{}];
				this.gmlFormat_.readGeometryElement(n, objectStack);
				const stackItem = objectStack.pop();
				if (stackItem && stackItem["srsName"]) return get(stackItem["srsName"]) ?? void 0;
			}
		}
	}
};
/**
* @param {Element} node Node.
* @param {*} baseObj Base object.
* @param {string} version Version.
* @param {WriteTransactionOptions} options Options.
* @return {WFSObject} Request object.
*/
function createTransactionRequest(node, baseObj, version, options) {
	const featurePrefix = options.featurePrefix ? options.featurePrefix : FEATURE_PREFIX;
	let gmlVersion;
	if (version === "1.0.0") gmlVersion = 2;
	else if (version === "1.1.0") gmlVersion = 3;
	else if (version === "2.0.0") gmlVersion = 3.2;
	return Object.assign({ node }, {
		version,
		"featureNS": options.featureNS,
		"featureType": options.featureType,
		"featurePrefix": featurePrefix,
		"gmlVersion": gmlVersion,
		"hasZ": options.hasZ,
		"srsName": options.srsName
	}, baseObj);
}
/**
* @param {string} type Request type.
* @param {Array<*>} values Values to serialize.
* @param {Array<WFSObject>} objectStack Object stack.
* @param {WFSObject} request Transaction request context.
*/
function serializeTransactionRequest(type, values, objectStack, request) {
	pushSerializeAndPop(request, TRANSACTION_SERIALIZERS, makeSimpleNodeFactory(type), values, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Transaction Summary.
*/
function readTransactionSummary(node, objectStack) {
	return pushParseAndPop({}, TRANSACTION_SUMMARY_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OGC_FID_PARSERS = {
	"http://www.opengis.net/ogc": { "FeatureId": makeArrayPusher(function(node, objectStack) {
		return node.getAttribute("fid");
	}) },
	"http://www.opengis.net/ogc/1.1": { "FeatureId": makeArrayPusher(function(node, objectStack) {
		return node.getAttribute("fid");
	}) },
	"http://www.opengis.net/fes/2.0": { "ResourceId": makeArrayPusher(function(node, objectStack) {
		return node.getAttribute("rid");
	}) }
};
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function fidParser(node, objectStack) {
	parseNode(OGC_FID_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var INSERT_RESULTS_PARSERS = {
	"http://www.opengis.net/wfs": { "Feature": fidParser },
	"http://www.opengis.net/wfs/2.0": { "Feature": fidParser }
};
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<string>|undefined} Insert results.
*/
function readInsertResults(node, objectStack) {
	return pushParseAndPop([], INSERT_RESULTS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeFeature(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const featureType = context["featureType"];
	const featureNS = context["featureNS"];
	const gmlVersion = context["gmlVersion"];
	const child = createElementNS(featureNS, featureType);
	node.appendChild(child);
	if (gmlVersion === 2) GML2.prototype.writeFeatureElement(child, feature, objectStack);
	else if (gmlVersion === 3) GML3.prototype.writeFeatureElement(child, feature, objectStack);
	else GML32.prototype.writeFeatureElement(child, feature, objectStack);
}
/**
* @param {Node} node Node.
* @param {number|string} fid Feature identifier.
* @param {Array<*>} objectStack Node stack.
*/
function writeOgcFidFilter(node, fid, objectStack) {
	const version = objectStack[objectStack.length - 1]["version"];
	const ns = getFilterNS(version);
	const isV2 = version === "2.0.0";
	const filter = createElementNS(ns, "Filter");
	const child = createElementNS(ns, isV2 ? "ResourceId" : "FeatureId");
	filter.appendChild(child);
	child.setAttribute(isV2 ? "rid" : "fid", fid);
	node.appendChild(filter);
}
/**
* @param {string|undefined} featurePrefix The prefix of the feature.
* @param {string} featureType The type of the feature.
* @return {string} The value of the typeName property.
*/
function getTypeName(featurePrefix, featureType) {
	featurePrefix = featurePrefix ? featurePrefix : FEATURE_PREFIX;
	const prefix = featurePrefix + ":";
	if (featureType.startsWith(prefix)) return featureType;
	return prefix + featureType;
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeDelete(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	assert(feature.getId() !== void 0, "Features must have an id set");
	const featureType = context["featureType"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const typeName = getTypeName(featurePrefix, featureType);
	node.setAttribute("typeName", typeName);
	node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const fid = feature.getId();
	if (fid !== void 0) writeOgcFidFilter(node, fid, objectStack);
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeUpdate(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	assert(feature.getId() !== void 0, "Features must have an id set");
	const version = context["version"];
	const featureType = context["featureType"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const typeName = getTypeName(featurePrefix, featureType);
	const geometryName = feature.getGeometryName();
	node.setAttribute("typeName", typeName);
	node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const fid = feature.getId();
	if (fid !== void 0) {
		const keys = feature.getKeys();
		const values = [];
		for (let i = 0, ii = keys.length; i < ii; i++) {
			const value = feature.get(keys[i]);
			if (value !== void 0) {
				let name = keys[i];
				if (value && typeof value.getSimplifiedGeometry === "function") name = geometryName;
				values.push({
					name,
					value
				});
			}
		}
		pushSerializeAndPop({
			version,
			"gmlVersion": context["gmlVersion"],
			node,
			"hasZ": context["hasZ"],
			"srsName": context["srsName"]
		}, TRANSACTION_SERIALIZERS, makeSimpleNodeFactory("Property"), values, objectStack);
		writeOgcFidFilter(node, fid, objectStack);
	}
}
/**
* @param {Node} node Node.
* @param {{name: string, value: *}} pair Property name and value.
* @param {Array<*>} objectStack Node stack.
*/
function writeProperty(node, pair, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const version = context["version"];
	const ns = WFSNS[version];
	const name = createElementNS(ns, version === "2.0.0" ? "ValueReference" : "Name");
	const gmlVersion = context["gmlVersion"];
	node.appendChild(name);
	writeStringTextNode(name, pair.name);
	if (pair.value !== void 0 && pair.value !== null) {
		const value = createElementNS(ns, "Value");
		node.appendChild(value);
		if (pair.value && typeof pair.value.getSimplifiedGeometry === "function") if (gmlVersion === 2) GML2.prototype.writeGeometryElement(value, pair.value, objectStack);
		else if (gmlVersion === 3) GML3.prototype.writeGeometryElement(value, pair.value, objectStack);
		else GML32.prototype.writeGeometryElement(value, pair.value, objectStack);
		else writeStringTextNode(value, pair.value);
	}
}
/**
* @param {Element} node Node.
* @param {{vendorId: string, safeToIgnore: boolean, value: string}} nativeElement The native element.
* @param {Array<*>} objectStack Node stack.
*/
function writeNative(node, nativeElement, objectStack) {
	if (nativeElement.vendorId) node.setAttribute("vendorId", nativeElement.vendorId);
	if (nativeElement.safeToIgnore !== void 0) node.setAttribute("safeToIgnore", String(nativeElement.safeToIgnore));
	if (nativeElement.value !== void 0) writeStringTextNode(node, nativeElement.value);
}
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var GETFEATURE_SERIALIZERS = {
	"http://www.opengis.net/wfs": { "Query": makeChildAppender(writeQuery) },
	"http://www.opengis.net/wfs/2.0": { "Query": makeChildAppender(writeQuery) },
	"http://www.opengis.net/ogc": {
		"During": makeChildAppender(writeDuringFilter),
		"And": makeChildAppender(writeLogicalFilter),
		"Or": makeChildAppender(writeLogicalFilter),
		"Not": makeChildAppender(writeNotFilter),
		"BBOX": makeChildAppender(writeBboxFilter),
		"Contains": makeChildAppender(writeSpatialFilter),
		"Intersects": makeChildAppender(writeSpatialFilter),
		"Within": makeChildAppender(writeSpatialFilter),
		"DWithin": makeChildAppender(writeDWithinFilter),
		"PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNull": makeChildAppender(writeIsNullFilter),
		"PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
		"PropertyIsLike": makeChildAppender(writeIsLikeFilter)
	},
	"http://www.opengis.net/fes/2.0": {
		"During": makeChildAppender(writeDuringFilter),
		"And": makeChildAppender(writeLogicalFilter),
		"Or": makeChildAppender(writeLogicalFilter),
		"Not": makeChildAppender(writeNotFilter),
		"BBOX": makeChildAppender(writeBboxFilter),
		"Contains": makeChildAppender(writeSpatialFilter),
		"Disjoint": makeChildAppender(writeSpatialFilter),
		"Intersects": makeChildAppender(writeSpatialFilter),
		"ResourceId": makeChildAppender(writeResourceIdFilter),
		"Within": makeChildAppender(writeSpatialFilter),
		"DWithin": makeChildAppender(writeDWithinFilter),
		"PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNull": makeChildAppender(writeIsNullFilter),
		"PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
		"PropertyIsLike": makeChildAppender(writeIsLikeFilter)
	}
};
/**
* @param {Element} node Node.
* @param {string} featureType Feature type.
* @param {Array<*>} objectStack Node stack.
*/
function writeQuery(node, featureType, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const version = context["version"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const propertyNames = context["propertyNames"];
	const srsName = context["srsName"];
	let typeName;
	if (featurePrefix) typeName = getTypeName(featurePrefix, featureType);
	else typeName = featureType;
	let typeNameAttr;
	if (version === "2.0.0") typeNameAttr = "typeNames";
	else typeNameAttr = "typeName";
	node.setAttribute(typeNameAttr, typeName);
	if (srsName) node.setAttribute("srsName", srsName);
	if (featureNS) node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const item = Object.assign({}, context);
	item.node = node;
	pushSerializeAndPop(item, QUERY_SERIALIZERS, makeSimpleNodeFactory("PropertyName"), propertyNames, objectStack);
	const filter = context["filter"];
	if (filter) {
		const child = createElementNS(getFilterNS(version), "Filter");
		node.appendChild(child);
		writeFilterCondition(child, filter, objectStack);
	}
}
/**
* @param {Element} node Node.
* @param {import("./filter/Filter.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeFilterCondition(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(filter.getTagName()), [filter], objectStack);
}
/**
* @param {Node} node Node.
* @param {import("./filter/Bbox.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeBboxFilter(node, filter, objectStack) {
	const parent = objectStack[objectStack.length - 1];
	const version = parent["context"]["version"];
	parent["srsName"] = filter.srsName;
	const format = GML_FORMATS[version];
	writePropertyName(version, node, filter.geometryName);
	format.prototype.writeGeometryElement(node, filter.extent, objectStack);
}
/**
* @param {Element} node Element.
* @param {import("./filter/ResourceId.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeResourceIdFilter(node, filter, objectStack) {
	node.setAttribute("rid", filter.rid);
}
/**
* @param {Node} node Node.
* @param {import("./filter/Spatial.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeSpatialFilter(node, filter, objectStack) {
	const parent = objectStack[objectStack.length - 1];
	const version = parent["context"]["version"];
	parent["srsName"] = filter.srsName;
	const format = GML_FORMATS[version];
	writePropertyName(version, node, filter.geometryName);
	format.prototype.writeGeometryElement(node, filter.geometry, objectStack);
}
/**
* @param {Node} node Node.
* @param {import("./filter/DWithin.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeDWithinFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writeSpatialFilter(node, filter, objectStack);
	const distance = createElementNS(getFilterNS(version), "Distance");
	writeStringTextNode(distance, filter.distance.toString());
	if (version === "2.0.0") distance.setAttribute("uom", filter.unit);
	else distance.setAttribute("units", filter.unit);
	node.appendChild(distance);
}
/**
* @param {Node} node Node.
* @param {import("./filter/During.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeDuringFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writeExpression(FESNS[version], "ValueReference", node, filter.propertyName);
	const timePeriod = createElementNS(GMLNS, "TimePeriod");
	node.appendChild(timePeriod);
	const begin = createElementNS(GMLNS, "begin");
	timePeriod.appendChild(begin);
	writeTimeInstant(begin, filter.begin);
	const end = createElementNS(GMLNS, "end");
	timePeriod.appendChild(end);
	writeTimeInstant(end, filter.end);
}
/**
* @param {Element} node Node.
* @param {import("./filter/LogicalNary.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeLogicalFilter(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1]["context"];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	const conditions = filter.conditions;
	for (let i = 0, ii = conditions.length; i < ii; ++i) {
		const condition = conditions[i];
		pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
	}
}
/**
* @param {Element} node Node.
* @param {import("./filter/Not.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeNotFilter(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1]["context"];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	const condition = filter.condition;
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
}
/**
* @param {Element} node Node.
* @param {import("./filter/ComparisonBinary.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeComparisonFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	if (filter.matchCase !== void 0) node.setAttribute("matchCase", filter.matchCase.toString());
	writePropertyName(version, node, filter.propertyName);
	writeLiteral(version, node, "" + filter.expression);
}
/**
* @param {Node} node Node.
* @param {import("./filter/IsNull.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsNullFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writePropertyName(version, node, filter.propertyName);
}
/**
* @param {Node} node Node.
* @param {import("./filter/IsBetween.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsBetweenFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	const ns = getFilterNS(version);
	writePropertyName(version, node, filter.propertyName);
	const lowerBoundary = createElementNS(ns, "LowerBoundary");
	node.appendChild(lowerBoundary);
	writeLiteral(version, lowerBoundary, "" + filter.lowerBoundary);
	const upperBoundary = createElementNS(ns, "UpperBoundary");
	node.appendChild(upperBoundary);
	writeLiteral(version, upperBoundary, "" + filter.upperBoundary);
}
/**
* @param {Element} node Node.
* @param {import("./filter/IsLike.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsLikeFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	node.setAttribute("wildCard", filter.wildCard);
	node.setAttribute("singleChar", filter.singleChar);
	node.setAttribute("escapeChar", filter.escapeChar);
	if (filter.matchCase !== void 0) node.setAttribute("matchCase", filter.matchCase.toString());
	writePropertyName(version, node, filter.propertyName);
	writeLiteral(version, node, "" + filter.pattern);
}
/**
* @param {string} ns Namespace.
* @param {string} tagName Tag name.
* @param {Node} node Node.
* @param {string} value Value.
*/
function writeExpression(ns, tagName, node, value) {
	const property = createElementNS(ns, tagName);
	writeStringTextNode(property, value);
	node.appendChild(property);
}
/**
* @param {string} version Version.
* @param {Node} node Node.
* @param {string} value PropertyName value.
*/
function writeLiteral(version, node, value) {
	writeExpression(getFilterNS(version), "Literal", node, value);
}
/**
* @param {string} version Version.
* @param {Node} node Node.
* @param {string} value PropertyName value.
*/
function writePropertyName(version, node, value) {
	if (version === "2.0.0") writeExpression(FESNS[version], "ValueReference", node, value);
	else writeExpression(OGCNS[version], "PropertyName", node, value);
}
/**
* @param {Node} node Node.
* @param {string} time PropertyName value.
*/
function writeTimeInstant(node, time) {
	const timeInstant = createElementNS(GMLNS, "TimeInstant");
	node.appendChild(timeInstant);
	const timePosition = createElementNS(GMLNS, "timePosition");
	timeInstant.appendChild(timePosition);
	writeStringTextNode(timePosition, time);
}
/**
* @param {Element} node Node.
* @param {Array<string>} featureTypes Feature types.
* @param {Array<*>} objectStack Node stack.
*/
function writeGetFeature(node, featureTypes, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const item = Object.assign({}, context);
	item.node = node;
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory("Query"), featureTypes, objectStack);
}
function getFilterNS(version) {
	let ns;
	if (version === "2.0.0") ns = FESNS[version];
	else ns = OGCNS[version];
	return ns;
}
//#endregion
//#region examples/vector-wfs-getfeature.js
var vectorSource = new VectorSource();
var vector = new VectorLayer({
	source: vectorSource,
	style: new Style({ stroke: new Stroke({
		color: "rgba(0, 0, 255, 1.0)",
		width: 2
	}) })
});
var map = new Map({
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512,
		maxZoom: 20
	}) }), vector],
	target: document.getElementById("map"),
	view: new View({
		center: [-8908887.277395891, 5381918.072437216],
		maxZoom: 19,
		zoom: 12
	})
});
var featureRequest = new WFS().writeGetFeature({
	srsName: "EPSG:3857",
	featureNS: "http://openstreemap.org",
	featurePrefix: "osm",
	featureTypes: ["water_areas"],
	outputFormat: "application/json",
	filter: and(like("name", "Mississippi*"), equalTo("waterway", "riverbank"))
});
fetch("https://ahocevar.com/geoserver/wfs", {
	method: "POST",
	body: new XMLSerializer().serializeToString(featureRequest)
}).then(function(response) {
	return response.json();
}).then(function(json) {
	const features = new GeoJSON().readFeatures(json);
	vectorSource.addFeatures(features);
	map.getView().fit(vectorSource.getExtent());
});
//#endregion

//# sourceMappingURL=vector-wfs-getfeature.js.map