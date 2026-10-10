import { Dn as transformGeometryWithOptions, Gi as linearRingIsClockwise, Jn as MultiPoint, Ki as Point, Xi as deflateCoordinates, Xn as LineString, Yn as MultiLineString, ao as containsExtent, os as isEmpty, qi as LinearRing, qn as MultiPolygon, rr as Feature, va as get, wn as JSONFeature, zi as Polygon } from "./common.js";
//#region src/ol/format/EsriJSON.js
/**
* @module ol/format/EsriJSON
*/
/**
* @typedef {import("arcgis-rest-api").Feature} EsriJSONFeature
* @typedef {import("arcgis-rest-api").FeatureSet} EsriJSONFeatureSet
* @typedef {import("arcgis-rest-api").Geometry} EsriJSONGeometry
* @typedef {import("arcgis-rest-api").Point} EsriJSONPoint
* @typedef {import("arcgis-rest-api").Polyline} EsriJSONPolyline
* @typedef {import("arcgis-rest-api").Polygon} EsriJSONPolygon
* @typedef {import("arcgis-rest-api").Multipoint} EsriJSONMultipoint
* @typedef {import("arcgis-rest-api").HasZM} EsriJSONHasZM
* @typedef {import("arcgis-rest-api").Position} EsriJSONPosition
* @typedef {import("arcgis-rest-api").SpatialReferenceWkid} EsriJSONSpatialReferenceWkid
*/
/**
* @typedef {Object<string, *>} EsriJSONObject
*/
/**
* @typedef {Object} EsriJSONMultiPolygon
* @property {Array<Array<Array<Array<number>>>>} rings Rings for the MultiPolygon.
* @property {boolean} [hasM] If the polygon coordinates have an M value.
* @property {boolean} [hasZ] If the polygon coordinates have a Z value.
* @property {EsriJSONSpatialReferenceWkid} [spatialReference] The coordinate reference system.
*/
/**
* @const
* @type {Object<import("../geom/Geometry.js").Type, function(EsriJSONGeometry): import("../geom/Geometry.js").default>}
*/
var GEOMETRY_READERS = {
	Point: readPointGeometry,
	LineString: readLineStringGeometry,
	Polygon: readPolygonGeometry,
	MultiPoint: readMultiPointGeometry,
	MultiLineString: readMultiLineStringGeometry,
	MultiPolygon: readMultiPolygonGeometry
};
/**
* @const
* @type {Object<import("../geom/Geometry.js").Type, function(import("../geom/Geometry.js").default, import("./Feature.js").WriteOptions=): (EsriJSONGeometry)>}
*/
var GEOMETRY_WRITERS = {
	Point: writePointGeometry,
	LineString: writeLineStringGeometry,
	Polygon: writePolygonGeometry,
	MultiPoint: writeMultiPointGeometry,
	MultiLineString: writeMultiLineStringGeometry,
	MultiPolygon: writeMultiPolygonGeometry
};
/**
* @typedef {Object} Options
* @property {string} [geometryName] Geometry name to use when creating features.
*/
/**
* @classdesc
* Feature format for reading and writing data in the EsriJSON format.
*
* @api
*/
var EsriJSON = class extends JSONFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		super();
		/**
		* Name of the geometry attribute for features.
		* @type {string|undefined}
		* @private
		*/
		this.geometryName_ = options.geometryName;
	}
	/**
	* @param {Object} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @param {string} [idField] Name of the field where to get the id from.
	* @protected
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromObject(object, options, idField) {
		const esriJSONFeature = object;
		const geometry = readGeometry(esriJSONFeature.geometry, options);
		const feature = new Feature();
		if (this.geometryName_) feature.setGeometryName(this.geometryName_);
		feature.setGeometry(geometry);
		if (esriJSONFeature.attributes) {
			feature.setProperties(esriJSONFeature.attributes, true);
			if (idField) {
				const id = esriJSONFeature.attributes[idField];
				if (id !== void 0) feature.setId(id);
			}
		}
		return feature;
	}
	/**
	* @param {Object} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromObject(object, options) {
		options = options ? options : {};
		if (object["features"]) {
			const esriJSONFeatureSet = object;
			/** @type {Array<import("../Feature.js").default>} */
			const features = [];
			const esriJSONFeatures = esriJSONFeatureSet.features;
			for (let i = 0, ii = esriJSONFeatures.length; i < ii; ++i) features.push(this.readFeatureFromObject(esriJSONFeatures[i], options, esriJSONFeatureSet.objectIdFieldName));
			return features;
		}
		return [this.readFeatureFromObject(object, options)];
	}
	/**
	* @param {EsriJSONGeometry} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromObject(object, options) {
		const geometry = readGeometry(object, options);
		if (!geometry) throw new Error("Cannot read geometry from object");
		return geometry;
	}
	/**
	* @param {EsriJSONObject} object Object.
	* @protected
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromObject(object) {
		if (object["spatialReference"] && object["spatialReference"]["wkid"] !== void 0) {
			const crs = object["spatialReference"].wkid;
			const projection = get("EPSG:" + crs);
			if (projection) return projection;
		}
		throw new Error("Unknown projection");
	}
	/**
	* Encode a geometry as a EsriJSON object.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {EsriJSONGeometry} Object.
	* @api
	* @override
	*/
	writeGeometryObject(geometry, options) {
		return writeGeometry(geometry, this.adaptOptions(options));
	}
	/**
	* Encode a feature as a esriJSON Feature object.
	*
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {Object} Object.
	* @api
	* @override
	*/
	writeFeatureObject(feature, options) {
		options = this.adaptOptions(options);
		const object = {};
		if (!feature.hasProperties()) {
			object["attributes"] = {};
			return object;
		}
		const properties = feature.getProperties();
		const geometry = feature.getGeometry();
		if (geometry) {
			object["geometry"] = writeGeometry(geometry, options);
			const projection = options && (options.dataProjection || options.featureProjection);
			if (projection) {
				const proj = get(projection);
				if (proj) object["geometry"]["spatialReference"] = { wkid: Number(proj.getCode().split(":").pop()) };
			}
			delete properties[feature.getGeometryName()];
		}
		if (!isEmpty(properties)) object["attributes"] = properties;
		else object["attributes"] = {};
		return object;
	}
	/**
	* Encode an array of features as a EsriJSON object.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {EsriJSONFeatureSet} EsriJSON Object.
	* @api
	* @override
	*/
	writeFeaturesObject(features, options) {
		options = this.adaptOptions(options);
		/** @type {Array<EsriJSONFeature>} */
		const objects = [];
		for (let i = 0, ii = features.length; i < ii; ++i) objects.push(this.writeFeatureObject(features[i], options));
		return { "features": objects };
	}
};
/**
* @param {EsriJSONObject} object Object.
* @param {import("./Feature.js").ReadOptions} [options] Read options.
* @return {import("../geom/Geometry.js").default|null} Geometry.
*/
function readGeometry(object, options) {
	if (!object) return null;
	let geomObject = object;
	/** @type {import("../geom/Geometry.js").Type|undefined} */
	let type;
	if (typeof geomObject["x"] === "number" && typeof geomObject["y"] === "number") type = "Point";
	else if (geomObject["points"]) type = "MultiPoint";
	else if (geomObject["paths"]) if (geomObject.paths.length === 1) type = "LineString";
	else type = "MultiLineString";
	else if (geomObject["rings"]) {
		const esriJSONPolygon = geomObject;
		const layout = getGeometryLayout(esriJSONPolygon);
		const rings = convertRings(esriJSONPolygon.rings, layout);
		if (rings.length === 1) {
			type = "Polygon";
			geomObject = Object.assign({}, geomObject, { ["rings"]: rings[0] });
		} else {
			type = "MultiPolygon";
			geomObject = Object.assign({}, geomObject, { ["rings"]: rings });
		}
	}
	if (!type) return null;
	const geometryReader = GEOMETRY_READERS[type];
	return transformGeometryWithOptions(geometryReader(geomObject), false, options);
}
/**
* Determines inner and outer rings.
* Checks if any polygons in this array contain any other polygons in this
* array. It is used for checking for holes.
* Logic inspired by: https://github.com/Esri/terraformer-arcgis-parser
* @param {Array<!Array<!Array<number>>>} rings Rings.
* @param {import("../geom/Geometry.js").GeometryLayout} layout Geometry layout.
* @return {Array<!Array<!Array<!Array<number>>>>} Transformed rings.
*/
function convertRings(rings, layout) {
	/** @type {Array<number>} */
	const flatRing = [];
	const outerRings = [];
	const holes = [];
	let i, ii;
	for (i = 0, ii = rings.length; i < ii; ++i) {
		flatRing.length = 0;
		deflateCoordinates(flatRing, 0, rings[i], layout.length);
		if (linearRingIsClockwise(flatRing, 0, flatRing.length, layout.length)) outerRings.push([rings[i]]);
		else holes.push(rings[i]);
	}
	while (holes.length) {
		const hole = holes.shift();
		let matched = false;
		for (i = outerRings.length - 1; i >= 0; i--) {
			const outerRing = outerRings[i][0];
			if (!outerRing) continue;
			if (containsExtent(new LinearRing(outerRing).getExtent(), new LinearRing(hole).getExtent())) {
				outerRings[i].push(hole);
				matched = true;
				break;
			}
		}
		if (!matched) outerRings.push([hole.reverse()]);
	}
	return outerRings;
}
/**
* @param {EsriJSONPoint} object Object.
* @return {import("../geom/Geometry.js").default} Point.
*/
function readPointGeometry(object) {
	let point;
	if (object.m !== void 0 && object.z !== void 0) point = new Point([
		object.x,
		object.y,
		object.z,
		object.m
	], "XYZM");
	else if (object.z !== void 0) point = new Point([
		object.x,
		object.y,
		object.z
	], "XYZ");
	else if (object.m !== void 0) point = new Point([
		object.x,
		object.y,
		object.m
	], "XYM");
	else point = new Point([object.x, object.y]);
	return point;
}
/**
* @param {EsriJSONPolyline} object Object.
* @return {import("../geom/Geometry.js").default} LineString.
*/
function readLineStringGeometry(object) {
	const layout = getGeometryLayout(object);
	return new LineString(object.paths[0], layout);
}
/**
* @param {EsriJSONPolyline} object Object.
* @return {import("../geom/Geometry.js").default} MultiLineString.
*/
function readMultiLineStringGeometry(object) {
	const layout = getGeometryLayout(object);
	return new MultiLineString(object.paths, layout);
}
/**
* @param {EsriJSONHasZM} object Object.
* @return {import("../geom/Geometry.js").GeometryLayout} The geometry layout to use.
*/
function getGeometryLayout(object) {
	/** @type {import("../geom/Geometry.js").GeometryLayout} */
	let layout = "XY";
	if (object.hasZ === true && object.hasM === true) layout = "XYZM";
	else if (object.hasZ === true) layout = "XYZ";
	else if (object.hasM === true) layout = "XYM";
	return layout;
}
/**
* @param {EsriJSONMultipoint} object Object.
* @return {import("../geom/Geometry.js").default} MultiPoint.
*/
function readMultiPointGeometry(object) {
	const layout = getGeometryLayout(object);
	return new MultiPoint(object.points, layout);
}
/**
* @param {EsriJSONMultiPolygon} object Object.
* @return {import("../geom/Geometry.js").default} MultiPolygon.
*/
function readMultiPolygonGeometry(object) {
	const layout = getGeometryLayout(object);
	return new MultiPolygon(object.rings, layout);
}
/**
* @param {EsriJSONPolygon} object Object.
* @return {import("../geom/Geometry.js").default} Polygon.
*/
function readPolygonGeometry(object) {
	const layout = getGeometryLayout(object);
	return new Polygon(object.rings, layout);
}
/**
* @param {import("../geom/Point.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPoint} EsriJSON geometry.
*/
function writePointGeometry(geometry, options) {
	const coordinates = geometry.getCoordinates();
	/** @type {EsriJSONPoint} */
	let esriJSON;
	const layout = geometry.getLayout();
	if (layout === "XYZ") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		z: coordinates[2]
	};
	else if (layout === "XYM") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		m: coordinates[2]
	};
	else if (layout === "XYZM") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		z: coordinates[2],
		m: coordinates[3]
	};
	else if (layout === "XY") esriJSON = {
		x: coordinates[0],
		y: coordinates[1]
	};
	else throw new Error("Invalid geometry layout");
	return esriJSON;
}
/**
* @param {import("../geom/SimpleGeometry.js").default} geometry Geometry.
* @return {{hasZ: boolean, hasM: boolean}} Object with boolean hasZ and hasM keys.
*/
function getHasZM(geometry) {
	const layout = geometry.getLayout();
	return {
		hasZ: layout === "XYZ" || layout === "XYZM",
		hasM: layout === "XYM" || layout === "XYZM"
	};
}
/**
* @param {import("../geom/LineString.js").default} lineString Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolyline} EsriJSON geometry.
*/
function writeLineStringGeometry(lineString, options) {
	const hasZM = getHasZM(lineString);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		paths: [lineString.getCoordinates()]
	};
}
/**
* @param {import("../geom/Polygon.js").default} polygon Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolygon} EsriJSON geometry.
*/
function writePolygonGeometry(polygon, options) {
	const hasZM = getHasZM(polygon);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		rings: polygon.getCoordinates(false)
	};
}
/**
* @param {import("../geom/MultiLineString.js").default} multiLineString Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolyline} EsriJSON geometry.
*/
function writeMultiLineStringGeometry(multiLineString, options) {
	const hasZM = getHasZM(multiLineString);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		paths: multiLineString.getCoordinates()
	};
}
/**
* @param {import("../geom/MultiPoint.js").default} multiPoint Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONMultipoint} EsriJSON geometry.
*/
function writeMultiPointGeometry(multiPoint, options) {
	const hasZM = getHasZM(multiPoint);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		points: multiPoint.getCoordinates()
	};
}
/**
* @param {import("../geom/MultiPolygon.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolygon} EsriJSON geometry.
*/
function writeMultiPolygonGeometry(geometry, options) {
	const hasZM = getHasZM(geometry);
	const coordinates = geometry.getCoordinates(false);
	const output = [];
	for (let i = 0; i < coordinates.length; i++) for (let x = coordinates[i].length - 1; x >= 0; x--) output.push(coordinates[i][x]);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		rings: output
	};
}
/**
* @param {import("../geom/Geometry.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONGeometry} EsriJSON geometry.
*/
function writeGeometry(geometry, options) {
	const geometryWriter = GEOMETRY_WRITERS[geometry.getType()];
	return geometryWriter(transformGeometryWithOptions(geometry, true, options), options);
}
//#endregion
export { EsriJSON as t };

//# sourceMappingURL=EsriJSON.js.map