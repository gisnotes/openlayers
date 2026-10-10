import { $n as VectorLayer, Ar as Style, Dn as transformGeometryWithOptions, Dr as Map, Fr as CircleStyle, Ki as Point, Mr as Stroke, Ni as View, Nr as Icon, Pr as Fill, Qi as getStrideForLayout, Un as VectorSource, Xn as LineString, kn as ImageTileSource, rr as Feature, va as get, yr as TileLayer } from "./common.js";
import { n as getVectorContext } from "./render.js";
import { t as TextFeature } from "./TextFeature.js";
//#region src/ol/geom/flat/flip.js
/**
* @module ol/geom/flat/flip
*/
/**
* @param {Array<number>} flatCoordinates Flat coordinates.
* @param {number} offset Offset.
* @param {number} end End.
* @param {number} stride Stride.
* @param {Array<number>} [dest] Destination.
* @param {number} [destOffset] Destination offset.
* @return {Array<number>} Flat coordinates.
*/
function flipXY(flatCoordinates, offset, end, stride, dest, destOffset) {
	if (dest !== void 0) {
		dest = dest;
		destOffset = destOffset !== void 0 ? destOffset : 0;
	} else {
		dest = [];
		destOffset = 0;
	}
	let j = offset;
	while (j < end) {
		const x = flatCoordinates[j++];
		dest[destOffset++] = flatCoordinates[j++];
		dest[destOffset++] = x;
		for (let k = 2; k < stride; ++k) dest[destOffset++] = flatCoordinates[j++];
	}
	dest.length = destOffset;
	return dest;
}
//#endregion
//#region src/ol/format/Polyline.js
/**
* @module ol/format/Polyline
*/
/**
* @typedef {Object} Options
* @property {number} [factor=1e5] The factor by which the coordinates values will be scaled.
* @property {import("../geom/Geometry.js").GeometryLayout} [geometryLayout='XY'] Layout of the
* feature geometries created by the format reader.
*/
/**
* @classdesc
* Feature format for reading and writing data in the Encoded
* Polyline Algorithm Format.
*
* When reading features, the coordinates are assumed to be in two dimensions
* and in [latitude, longitude] order.
*
* As Polyline sources contain a single feature,
* {@link module:ol/format/Polyline~Polyline#readFeatures} will return the
* feature in an array.
*
* @api
*/
var Polyline = class extends TextFeature {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326") ?? void 0;
		/**
		* @private
		* @type {number}
		*/
		this.factor_ = options.factor ? options.factor : 1e5;
		/**
		* @private
		* @type {import("../geom/Geometry.js").GeometryLayout}
		*/
		this.geometryLayout_ = options.geometryLayout ? options.geometryLayout : "XY";
	}
	/**
	* @protected
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromText(text, options) {
		return new Feature(this.readGeometryFromText(text, options));
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromText(text, options) {
		return [this.readFeatureFromText(text, options)];
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromText(text, options) {
		const stride = getStrideForLayout(this.geometryLayout_);
		const flatCoordinates = decodeDeltas(text, stride, this.factor_);
		flipXY(flatCoordinates, 0, flatCoordinates.length, stride, flatCoordinates);
		return transformGeometryWithOptions(new LineString(flatCoordinates, this.geometryLayout_), false, this.adaptOptions(options));
	}
	/**
	* @param {import("../Feature.js").default<LineString>} feature Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeatureText(feature, options) {
		const geometry = feature.getGeometry();
		if (geometry) return this.writeGeometryText(geometry, options);
		throw new Error("Expected `feature` to have a geometry");
	}
	/**
	* @param {Array<import("../Feature.js").default<LineString>>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeaturesText(features, options) {
		return this.writeFeatureText(features[0], options);
	}
	/**
	* @param {LineString} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeGeometryText(geometry, options) {
		geometry = transformGeometryWithOptions(geometry, true, this.adaptOptions(options));
		const flatCoordinates = geometry.getFlatCoordinates();
		const stride = geometry.getStride();
		return encodeDeltas(flipXY(flatCoordinates, 0, flatCoordinates.length, stride), stride, this.factor_);
	}
};
/**
* Encode a list of n-dimensional points and return an encoded string
*
* Attention: This function will modify the passed array!
*
* @param {Array<number>} numbers A list of n-dimensional points.
* @param {number} stride The number of dimension of the points in the list.
* @param {number} [factor] The factor by which the numbers will be
*     multiplied. The remaining decimal places will get rounded away.
*     Default is `1e5`.
* @return {string} The encoded string.
* @api
* @deprecated
*/
function encodeDeltas(numbers, stride, factor) {
	factor = factor ? factor : 1e5;
	const lastNumbers = new Array(stride).fill(0);
	for (let i = 0, ii = numbers.length; i < ii;) for (let d = 0; d < stride; ++d, ++i) {
		const value = numbers[i] * factor;
		const num = value < 0 ? Math.ceil(value - .5) : Math.round(value);
		const delta = num - lastNumbers[d];
		lastNumbers[d] = num;
		numbers[i] = delta;
	}
	return encodeSignedIntegers(numbers);
}
/**
* Decode a list of n-dimensional points from an encoded string
*
* @param {string} encoded An encoded string.
* @param {number} stride The number of dimension of the points in the
*     encoded string.
* @param {number} [factor] The factor by which the resulting numbers will
*     be divided. Default is `1e5`.
* @return {Array<number>} A list of n-dimensional points.
* @api
* @deprecated
*/
function decodeDeltas(encoded, stride, factor) {
	factor = factor ? factor : 1e5;
	/** @type {Array<number>} */
	const lastNumbers = new Array(stride).fill(0);
	const numbers = decodeSignedIntegers(encoded);
	for (let i = 0, ii = numbers.length; i < ii;) for (let d = 0; d < stride; ++d, ++i) {
		lastNumbers[d] += numbers[i];
		numbers[i] = lastNumbers[d] / factor;
	}
	return numbers;
}
/**
* Encode a list of signed integers and return an encoded string
*
* Attention: This function will modify the passed array!
*
* @param {Array<number>} numbers A list of signed integers.
* @return {string} The encoded string.
*/
function encodeSignedIntegers(numbers) {
	for (let i = 0, ii = numbers.length; i < ii; ++i) {
		const num = numbers[i];
		numbers[i] = num < 0 ? ~(num << 1) : num << 1;
	}
	return encodeUnsignedIntegers(numbers);
}
/**
* Decode a list of signed integers from an encoded string
*
* @param {string} encoded An encoded string.
* @return {Array<number>} A list of signed integers.
*/
function decodeSignedIntegers(encoded) {
	const numbers = decodeUnsignedIntegers(encoded);
	for (let i = 0, ii = numbers.length; i < ii; ++i) {
		const num = numbers[i];
		numbers[i] = num & 1 ? ~(num >> 1) : num >> 1;
	}
	return numbers;
}
/**
* Encode a list of unsigned integers and return an encoded string
*
* @param {Array<number>} numbers A list of unsigned integers.
* @return {string} The encoded string.
*/
function encodeUnsignedIntegers(numbers) {
	let encoded = "";
	for (let i = 0, ii = numbers.length; i < ii; ++i) encoded += encodeUnsignedInteger(numbers[i]);
	return encoded;
}
/**
* Decode a list of unsigned integers from an encoded string
*
* @param {string} encoded An encoded string.
* @return {Array<number>} A list of unsigned integers.
*/
function decodeUnsignedIntegers(encoded) {
	const numbers = [];
	let current = 0;
	let shift = 0;
	for (let i = 0, ii = encoded.length; i < ii; ++i) {
		const b = encoded.charCodeAt(i) - 63;
		current |= (b & 31) << shift;
		if (b < 32) {
			numbers.push(current);
			current = 0;
			shift = 0;
		} else shift += 5;
	}
	return numbers;
}
/**
* Encode one single unsigned integer and return an encoded string
*
* @param {number} num Unsigned integer that should be encoded.
* @return {string} The encoded string.
*/
function encodeUnsignedInteger(num) {
	let value, encoded = "";
	while (num >= 32) {
		value = (32 | num & 31) + 63;
		encoded += String.fromCharCode(value);
		num >>= 5;
	}
	value = num + 63;
	encoded += String.fromCharCode(value);
	return encoded;
}
//#endregion
//#region examples/feature-move-animation.js
var map = new Map({
	target: document.getElementById("map"),
	view: new View({
		center: [-5639523.95, -3501274.52],
		zoom: 10,
		minZoom: 2,
		maxZoom: 19
	}),
	layers: [new TileLayer({ source: new ImageTileSource({
		attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
		url: "https://api.maptiler.com/maps/hybrid/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
		tileSize: 512
	}) })]
});
fetch("data/polyline/route.json").then(function(response) {
	response.json().then(function(result) {
		const polyline = result.routes[0].geometry;
		const route = new Polyline({ factor: 1e6 }).readGeometry(polyline, {
			dataProjection: "EPSG:4326",
			featureProjection: "EPSG:3857"
		});
		const routeFeature = new Feature({
			type: "route",
			geometry: route
		});
		const startMarker = new Feature({
			type: "icon",
			geometry: new Point(route.getFirstCoordinate())
		});
		const endMarker = new Feature({
			type: "icon",
			geometry: new Point(route.getLastCoordinate())
		});
		const position = startMarker.getGeometry().clone();
		const geoMarker = new Feature({
			type: "geoMarker",
			geometry: position
		});
		const styles = {
			"route": new Style({ stroke: new Stroke({
				width: 6,
				color: [
					237,
					212,
					0,
					.8
				]
			}) }),
			"icon": new Style({ image: new Icon({
				anchor: [.5, 1],
				src: "data/icon.png"
			}) }),
			"geoMarker": new Style({ image: new CircleStyle({
				radius: 7,
				fill: new Fill({ color: "black" }),
				stroke: new Stroke({
					color: "white",
					width: 2
				})
			}) })
		};
		const vectorLayer = new VectorLayer({
			source: new VectorSource({ features: [
				routeFeature,
				geoMarker,
				startMarker,
				endMarker
			] }),
			style: function(feature) {
				return styles[feature.get("type")];
			}
		});
		map.addLayer(vectorLayer);
		const speedInput = document.getElementById("speed");
		const startButton = document.getElementById("start-animation");
		let animating = false;
		let distance = 0;
		let lastTime;
		function moveFeature(event) {
			const speed = Number(speedInput.value);
			const time = event.frameState.time;
			const elapsedTime = time - lastTime;
			distance = (distance + speed * elapsedTime / 1e6) % 2;
			lastTime = time;
			const currentCoordinate = route.getCoordinateAt(distance > 1 ? 2 - distance : distance);
			position.setCoordinates(currentCoordinate);
			const vectorContext = getVectorContext(event);
			vectorContext.setStyle(styles.geoMarker);
			vectorContext.drawGeometry(position);
			map.render();
		}
		function startAnimation() {
			animating = true;
			lastTime = Date.now();
			startButton.textContent = "Stop Animation";
			vectorLayer.on("postrender", moveFeature);
			geoMarker.setGeometry(null);
		}
		function stopAnimation() {
			animating = false;
			startButton.textContent = "Start Animation";
			geoMarker.setGeometry(position);
			vectorLayer.un("postrender", moveFeature);
		}
		startButton.addEventListener("click", function() {
			if (animating) stopAnimation();
			else startAnimation();
		});
	});
});
//#endregion

//# sourceMappingURL=feature-move-animation.js.map