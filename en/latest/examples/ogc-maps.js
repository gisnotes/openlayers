import { Dr as Map, Ln as ImageSource, Lr as decode, Ni as View, Oo as round, Rn as defaultImageLoadFunction, Vn as ImageLayer, _o as getHeight, dr as appendParams, va as get, xo as getWidth, zn as getRequestExtent } from "./common.js";
//#region src/ol/source/ogcMapUtil.js
/**
* @module ol/source/ogcMapUtil
*/
/**
* @param {string} baseUrl Base URL.
* @param {import("../extent.js").Extent} extent Extent.
* @param {import("../size.js").Size} size Size.
* @param {import("../proj/Projection.js").default} projection Projection.
* @param {Object<string, *>} params OGC Map params. Will be modified in place.
* @return {string} Request URL.
*/
function getRequestUrl(baseUrl, extent, size, projection, params) {
	params["width"] = size[0];
	params["height"] = size[1];
	const axisOrientation = projection.getAxisOrientation();
	params["crs"] = projection.getCode();
	params["bbox-crs"] = projection.getCode();
	params["bbox"] = (axisOrientation.startsWith("ne") ? [
		extent[1],
		extent[0],
		extent[3],
		extent[2]
	] : extent).join(",");
	return appendParams(baseUrl, params);
}
/**
* @param {import("../extent.js").Extent} extent Extent.
* @param {number} resolution Resolution.
* @param {number} pixelRatio pixel ratio.
* @param {import("../proj.js").Projection} projection Projection.
* @param {string} url OGC Map service url.
* @param {Object<string, *>} params OGC Map params.
* @return {string} Image src.
*/
function getImageSrc(extent, resolution, pixelRatio, projection, url, params) {
	params = Object.assign({}, params);
	const imageResolution = resolution / pixelRatio;
	const imageSize = [round(getWidth(extent) / imageResolution, 4), round(getHeight(extent) / imageResolution, 4)];
	if (pixelRatio !== 1) params["mm-per-pixel"] = .28 / pixelRatio;
	return getRequestUrl(url, extent, imageSize, projection, params);
}
/**
* @typedef {Object} LoaderOptions
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting
* the image from the remote server.
* @property {Object<string,*>} [params] OGC Map request parameters.
* No param is required by default. `width`, `height`, `bbox`, `crs` and `bbox-crs` will be set dynamically.
* @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is 'EPSG:3857'.
* @property {number} [ratio=1.5] Ratio. `1` means image requests are the size of the map viewport, `2` means
* twice the width and height of the map viewport, and so on. Must be `1` or higher.
* @property {string} url OGC Map service URL.
* @property {function(HTMLImageElement, string): Promise<import('../DataTile.js').ImageLike>} [load] Function
* to perform loading of the image. Receives the created `HTMLImageElement` and the desired `src` as argument and
* returns a promise resolving to the loaded or decoded image. Default is {@link module:ol/Image.decode}.
*/
/**
* Creates a loader for OGC Map images.
* @param {LoaderOptions} options Loader options.
* @return {import("../Image.js").ImageObjectPromiseLoader} Loader.
* @api
*/
function createLoader(options) {
	const hidpi = options.hidpi === void 0 ? true : options.hidpi;
	const projection = get(options.projection || "EPSG:3857");
	const ratio = options.ratio || 1.5;
	const load = options.load || decode;
	const crossOrigin = options.crossOrigin ?? null;
	return (extent, resolution, pixelRatio) => {
		extent = getRequestExtent(extent, resolution, pixelRatio, ratio);
		if (pixelRatio !== 1 && !hidpi) pixelRatio = 1;
		const src = getImageSrc(extent, resolution, pixelRatio, projection, options.url, options.params || {});
		const image = new Image();
		image.crossOrigin = crossOrigin;
		if (options.referrerPolicy !== void 0) image.referrerPolicy = options.referrerPolicy;
		return load(image, src).then((image) => ({
			image,
			extent,
			pixelRatio
		}));
	};
}
//#endregion
//#region src/ol/source/OGCMap.js
/**
* @module ol/source/OGCMap
*/
/**
* @typedef {Object} Options
* @property {import("./Source.js").AttributionLike} [attributions] Attributions.
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting
* the image from the remote server.
* @property {import("../Image.js").LoadFunction} [imageLoadFunction] Optional function to load an image given a URL.
* @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
* linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
* @property {Object<string,*>} [params] OGC Maps request parameters.
* No param is required by default. `width`, `height`, `bbox`, `crs` and `bbox-crs` will be set dynamically.
* @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
* @property {number} [ratio=1.5] Ratio. `1` means image requests are the size of the map viewport, `2` means
* twice the width and height of the map viewport, and so on. Must be `1` or higher.
* @property {Array<number>} [resolutions] Resolutions.
* If specified, requests will be made for these resolutions only.
* @property {string} [url] OGC Maps service URL.
*/
/**
* @classdesc
* Source for OGC Maps servers providing single, untiled images.
*
* @fires module:ol/source/Image.ImageSourceEvent
* @api
*/
var OGCMap = class extends ImageSource {
	/**
	* @param {Options} [options] OGCMapOptions options.
	*/
	constructor(options) {
		options = options ? options : {};
		super({
			attributions: options.attributions,
			interpolate: options.interpolate,
			projection: options.projection,
			resolutions: options.resolutions
		});
		/**
		* @private
		* @type {?string}
		*/
		this.crossOrigin_ = options.crossOrigin !== void 0 ? options.crossOrigin : null;
		/**
		* @private
		* @type {ReferrerPolicy|undefined}
		*/
		this.referrerPolicy_ = options.referrerPolicy;
		/**
		* @private
		* @type {string|undefined}
		*/
		this.url_ = options.url;
		/**
		* @private
		* @type {import("../Image.js").LoadFunction}
		*/
		this.imageLoadFunction_ = options.imageLoadFunction !== void 0 ? options.imageLoadFunction : defaultImageLoadFunction;
		/**
		* @private
		* @type {!Object}
		*/
		this.params_ = Object.assign({}, options.params);
		/**
		* @private
		* @type {boolean}
		*/
		this.hidpi_ = options.hidpi !== void 0 ? options.hidpi : true;
		/**
		* @private
		* @type {number}
		*/
		this.renderedRevision_ = 0;
		/**
		* @private
		* @type {number}
		*/
		this.ratio_ = options.ratio !== void 0 ? options.ratio : 1.5;
		/**
		* @private
		* @type {import("../proj/Projection.js").default|null}
		*/
		this.loaderProjection_ = null;
	}
	/**
	* Get the user-provided params, i.e. those passed to the constructor through
	* the "params" option, and possibly updated using the updateParams method.
	* @return {Object} Params.
	* @api
	*/
	getParams() {
		return this.params_;
	}
	/**
	* @param {import("../extent.js").Extent} extent Extent.
	* @param {number} resolution Resolution.
	* @param {number} pixelRatio Pixel ratio.
	* @param {import("../proj/Projection.js").default} projection Projection.
	* @return {import("../Image.js").default|null} Single image.
	* @override
	*/
	getImageInternal(extent, resolution, pixelRatio, projection) {
		if (this.url_ === void 0) return null;
		if (!this.loader || this.loaderProjection_ !== projection) {
			this.loaderProjection_ = projection;
			this.loader = createLoader({
				crossOrigin: this.crossOrigin_,
				referrerPolicy: this.referrerPolicy_,
				params: this.params_,
				projection,
				hidpi: this.hidpi_,
				url: this.url_,
				ratio: this.ratio_,
				load: (image, src) => {
					const wrapper = this.image;
					wrapper.setImage(image);
					this.imageLoadFunction_(wrapper, src);
					return decode(image);
				}
			});
		}
		return super.getImageInternal(extent, resolution, pixelRatio, projection);
	}
	/**
	* Return the image load function of the source.
	* @return {import("../Image.js").LoadFunction} The image load function.
	* @api
	*/
	getImageLoadFunction() {
		return this.imageLoadFunction_;
	}
	/**
	* Return the URL used for this OGC Maps source.
	* @return {string|undefined} URL.
	* @api
	*/
	getUrl() {
		return this.url_;
	}
	/**
	* Set the image load function of the source.
	* @param {import("../Image.js").LoadFunction} imageLoadFunction Image load function.
	* @api
	*/
	setImageLoadFunction(imageLoadFunction) {
		this.imageLoadFunction_ = imageLoadFunction;
		this.changed();
	}
	/**
	* Set the URL to use for requests.
	* @param {string|undefined} url URL.
	* @api
	*/
	setUrl(url) {
		if (url != this.url_) {
			this.url_ = url;
			this.loader = null;
			this.changed();
		}
	}
	/**
	* Set the user-provided params.
	* @param {Object} params Params.
	* @api
	*/
	setParams(params) {
		this.params_ = Object.assign({}, params);
		this.loader = null;
		this.changed();
	}
	/**
	* Update the user-provided params.
	* @param {Object} params Params.
	* @api
	*/
	updateParams(params) {
		Object.assign(this.params_, params);
		this.changed();
	}
	/**
	* @override
	*/
	changed() {
		this.image = null;
		super.changed();
	}
};
//#endregion
//#region examples/ogc-maps.js
new Map({
	target: "map",
	layers: [new ImageLayer({ source: new OGCMap({ url: "https://maps.gnosis.earth/ogcapi/collections/blueMarble/map" }) })],
	view: new View({
		center: [0, 0],
		zoom: 4
	})
});
//#endregion

//# sourceMappingURL=ogc-maps.js.map