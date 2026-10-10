import { Dr as Map, Ln as ImageSource, Lr as decode, Ni as View, Rn as defaultImageLoadFunction, Vn as ImageLayer, _o as getHeight, dr as appendParams, ho as getCenter, xo as getWidth, zn as getRequestExtent } from "./common.js";
//#region src/ol/source/mapguide.js
/**
* @module ol/source/mapguide
*/
/**
* @typedef {Object} LoaderOptions
* @property {string} url The mapagent url.
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {number} [displayDpi=96] The display resolution.
* @property {number} [metersPerUnit=1] The meters-per-unit value.
* @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting
* the image from the remote server.
* @property {boolean} [useOverlay] If `true`, will use `GETDYNAMICMAPOVERLAYIMAGE`.
* @property {number} [ratio=1] Ratio. `1` means image requests are the size of the map viewport, `2` means
* twice the width and height of the map viewport, and so on. Must be `1` or higher.
* @property {Object<string, string|number>} [params] Additional query parameters.
* @property {function(HTMLImageElement, string): Promise<import('../DataTile.js').ImageLike>} [load] Function
* to perform loading of the image. Receives the created `HTMLImageElement` and the desired `src` as argument and
* returns a promise resolving to the loaded or decoded image. Default is {@link module:ol/Image.decode}.
*/
/**
* @param {import("../extent.js").Extent} extent The map extents.
* @param {import("../size.js").Size} size The viewport size.
* @param {number} metersPerUnit The meters-per-unit value.
* @param {number} dpi The display resolution.
* @return {number} The computed map scale.
*/
function getScale(extent, size, metersPerUnit, dpi) {
	const mcsW = getWidth(extent);
	const mcsH = getHeight(extent);
	const devW = size[0];
	const devH = size[1];
	const mpp = .0254 / dpi;
	if (devH * mcsW > devW * mcsH) return mcsW * metersPerUnit / (devW * mpp);
	return mcsH * metersPerUnit / (devH * mpp);
}
/**
* @param {string} baseUrl The mapagent url.
* @param {Object<string, string|number>} params Request parameters.
* @param {import("../extent.js").Extent} extent Extent.
* @param {import("../size.js").Size} size Size.
* @param {boolean} useOverlay If `true`, will use `GETDYNAMICMAPOVERLAYIMAGE`.
* @param {number} metersPerUnit The meters-per-unit value.
* @param {number} displayDpi The display resolution.
* @return {string} The mapagent map image request URL.
*/
function getUrl(baseUrl, params, extent, size, useOverlay, metersPerUnit, displayDpi) {
	const scale = getScale(extent, size, metersPerUnit, displayDpi);
	const center = getCenter(extent);
	const baseParams = {
		"OPERATION": useOverlay ? "GETDYNAMICMAPOVERLAYIMAGE" : "GETMAPIMAGE",
		"VERSION": "2.0.0",
		"LOCALE": "en",
		"CLIENTAGENT": "ol/source/ImageMapGuide source",
		"CLIP": "1",
		"SETDISPLAYDPI": displayDpi,
		"SETDISPLAYWIDTH": Math.round(size[0]),
		"SETDISPLAYHEIGHT": Math.round(size[1]),
		"SETVIEWSCALE": scale,
		"SETVIEWCENTERX": center[0],
		"SETVIEWCENTERY": center[1]
	};
	Object.assign(baseParams, params);
	return appendParams(baseUrl, baseParams);
}
/**
* Creates a loader for MapGuide images.
* @param {LoaderOptions} options Image ArcGIS Rest Options.
* @return {import('../Image.js').ImageObjectPromiseLoader} ArcGIS Rest image.
* @api
*/
function createLoader(options) {
	const load = options.load || decode;
	const useOverlay = options.useOverlay ?? false;
	const metersPerUnit = options.metersPerUnit || 1;
	const displayDpi = options.displayDpi || 96;
	const ratio = options.ratio ?? 1;
	const crossOrigin = options.crossOrigin ?? null;
	const referrerPolicy = options.referrerPolicy;
	return function(extent, resolution, pixelRatio) {
		const image = new Image();
		image.crossOrigin = crossOrigin;
		if (referrerPolicy !== void 0) image.referrerPolicy = referrerPolicy;
		extent = getRequestExtent(extent, resolution, pixelRatio, ratio);
		const width = getWidth(extent) / resolution;
		const height = getHeight(extent) / resolution;
		const size = [width * pixelRatio, height * pixelRatio];
		const src = getUrl(options.url, options.params || {}, extent, size, useOverlay, metersPerUnit, displayDpi);
		return load(image, src).then((image) => ({
			image,
			extent,
			pixelRatio
		}));
	};
}
//#endregion
//#region src/ol/source/ImageMapGuide.js
/**
* @module ol/source/ImageMapGuide
*/
/**
* @typedef {Object} Options
* @property {string} [url] The mapagent url.
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {number} [displayDpi=96] The display resolution.
* @property {number} [metersPerUnit=1] The meters-per-unit value.
* @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting
* the image from the remote server.
* @property {boolean} [useOverlay] If `true`, will use `GETDYNAMICMAPOVERLAYIMAGE`.
* @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
* @property {number} [ratio=1] Ratio. `1` means image requests are the size of the map viewport, `2` means
* twice the width and height of the map viewport, and so on. Must be `1` or higher.
* @property {Array<number>} [resolutions] Resolutions.
* If specified, requests will be made for these resolutions only.
* @property {import("../Image.js").LoadFunction} [imageLoadFunction] Optional function to load an image given a URL.
* @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
* linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
* @property {Object<string, string|number>} [params] Additional parameters.
*/
/**
* @classdesc
* Source for images from Mapguide servers
*
* @fires module:ol/source/Image.ImageSourceEvent
* @api
*/
var ImageMapGuide = class extends ImageSource {
	/**
	* @param {Options} options ImageMapGuide options.
	*/
	constructor(options) {
		super({
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
		* @type {number}
		*/
		this.displayDpi_ = options.displayDpi !== void 0 ? options.displayDpi : 96;
		/**
		* @private
		* @type {!Object}
		*/
		this.params_ = Object.assign({}, options.params);
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
		* @type {boolean}
		*/
		this.hidpi_ = options.hidpi !== void 0 ? options.hidpi : true;
		/**
		* @private
		* @type {number}
		*/
		this.metersPerUnit_ = options.metersPerUnit !== void 0 ? options.metersPerUnit : 1;
		/**
		* @private
		* @type {number}
		*/
		this.ratio_ = options.ratio !== void 0 ? options.ratio : 1;
		/**
		* @private
		* @type {boolean}
		*/
		this.useOverlay_ = options.useOverlay !== void 0 ? options.useOverlay : false;
		/**
		* @private
		* @type {number}
		*/
		this.renderedRevision_ = 0;
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
				hidpi: this.hidpi_,
				metersPerUnit: this.metersPerUnit_,
				url: this.url_,
				useOverlay: this.useOverlay_,
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
	* Set the image load function of the MapGuide source.
	* @param {import("../Image.js").LoadFunction} imageLoadFunction Image load function.
	* @api
	*/
	setImageLoadFunction(imageLoadFunction) {
		this.imageLoadFunction_ = imageLoadFunction;
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
//#region examples/mapguide-untiled.js
new Map({
	layers: [new ImageLayer({
		extent: [
			-87.86511444236592,
			43.66506556483793,
			-87.59539405949707,
			43.82385256443007
		],
		source: new ImageMapGuide({
			projection: "EPSG:4326",
			url: "https://mikenunn.net/mapguide/mapagent/mapagent.fcgi?",
			useOverlay: false,
			metersPerUnit: 111319.4908,
			params: {
				MAPDEFINITION: "Library://Samples/Sheboygan/Maps/Sheboygan.MapDefinition",
				FORMAT: "PNG",
				VERSION: "3.0.0",
				USERNAME: "OLGuest",
				PASSWORD: "olguest"
			},
			ratio: 2
		})
	})],
	target: "map",
	view: new View({
		center: [-87.7302542509315, 43.744459064634],
		projection: "EPSG:4326",
		zoom: 12
	})
});
//#endregion

//# sourceMappingURL=mapguide-untiled.js.map