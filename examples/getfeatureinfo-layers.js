import { $o as extend, cn as makeArrayPusher, vn as makeStructureNS, xn as pushParseAndPop } from "./common.js";
import { t as XMLFeature } from "./XMLFeature.js";
import { t as GML2 } from "./GML2.js";
//#region src/ol/format/WMSGetFeatureInfo.js
/**
* @module ol/format/WMSGetFeatureInfo
*/
/**
* @typedef {Object} Options
* @property {Array<string>} [layers] If set, only features of the given layers will be returned by the format when read.
*/
/**
* @const
* @type {string}
*/
var featureIdentifier = "_feature";
/**
* @const
* @type {string}
*/
var layerIdentifier = "_layer";
/**
* @classdesc
* Format for reading WMSGetFeatureInfo format. It uses
* {@link module:ol/format/GML2~GML2} to read features.
*
* @api
*/
var WMSGetFeatureInfo = class extends XMLFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @private
		* @type {string}
		*/
		this.featureNS_ = "http://mapserver.gis.umn.edu/mapserver";
		/**
		* @private
		* @type {GML2}
		*/
		this.gmlFormat_ = new GML2();
		/**
		* @private
		* @type {Array<string>|null}
		*/
		this.layers_ = options.layers ? options.layers : null;
	}
	/**
	* @return {Array<string>|null} layers
	*/
	getLayers() {
		return this.layers_;
	}
	/**
	* @param {Array<string>|null} layers Layers to parse.
	*/
	setLayers(layers) {
		this.layers_ = layers;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<import("../Feature.js").default>} Features.
	* @private
	*/
	readFeatures_(node, objectStack) {
		node.setAttribute("namespaceURI", this.featureNS_);
		const localName = node.localName;
		/** @type {Array<import("../Feature.js").default>} */
		let features = [];
		if (node.childNodes.length === 0) return features;
		if (localName == "msGMLOutput") for (let i = 0, ii = node.childNodes.length; i < ii; i++) {
			const layer = node.childNodes[i];
			if (layer.nodeType !== Node.ELEMENT_NODE) continue;
			const layerElement = layer;
			const context = objectStack[0];
			const toRemove = layerIdentifier;
			const layerName = layerElement.localName.replace(toRemove, "");
			if (this.layers_ && !this.layers_.includes(layerName)) continue;
			const featureType = layerName + featureIdentifier;
			context["featureType"] = featureType;
			context["featureNS"] = this.featureNS_;
			/** @type {Object<string, import("../xml.js").Parser>} */
			const parsers = {};
			parsers[featureType] = makeArrayPusher(this.gmlFormat_.readFeatureElement, this.gmlFormat_);
			const parsersNS = makeStructureNS([context["featureNS"], null], parsers);
			layerElement.setAttribute("namespaceURI", this.featureNS_);
			/** @type {Array<import("../Feature.js").default>} */
			const layerFeatures = pushParseAndPop([], parsersNS, layerElement, objectStack, this.gmlFormat_);
			if (layerFeatures) extend(features, layerFeatures);
		}
		if (localName == "FeatureCollection") {
			/** @type {Array<import("../Feature.js").default>} */
			const gmlFeatures = pushParseAndPop([], this.gmlFormat_.FEATURE_COLLECTION_PARSERS, node, [{}], this.gmlFormat_);
			if (gmlFeatures) features = gmlFeatures;
		}
		return features;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		const internalOptions = {};
		if (options) Object.assign(internalOptions, this.getReadOptions(node, options));
		return this.readFeatures_(node, [internalOptions]);
	}
};
//#endregion
//#region examples/getfeatureinfo-layers.js
fetch("data/wmsgetfeatureinfo/osm-restaurant-hotel.xml").then(function(response) {
	return response.text();
}).then(function(response) {
	const allFeatures = new WMSGetFeatureInfo().readFeatures(response);
	document.getElementById("all").innerText = allFeatures.length.toString();
	const hotelFeatures = new WMSGetFeatureInfo({ layers: ["hotel"] }).readFeatures(response);
	document.getElementById("hotel").innerText = hotelFeatures.length.toString();
	const restaurantFeatures = new WMSGetFeatureInfo({ layers: ["restaurant"] }).readFeatures(response);
	document.getElementById("restaurant").innerText = restaurantFeatures.length.toString();
});
//#endregion

//# sourceMappingURL=getfeatureinfo-layers.js.map