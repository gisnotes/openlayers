import { Lr as decode, Oo as round, _o as getHeight, dr as appendParams, va as get, xo as getWidth, zn as getRequestExtent } from "./common.js";
//#region src/ol/source/arcgisRest.js
/**
* @module ol/source/arcgisRest
*/
/**
* @param {string} baseUrl Base URL for the ArcGIS Rest service.
* @param {import("../extent.js").Extent} extent Extent.
* @param {number} resolution Resolution.
* @param {number} pixelRatio Pixel ratio.
* @param {import("../proj/Projection.js").default} projection Projection.
* @param {Record<string, *>} params Params.
* @return {string} Request URL.
*/
function getRequestUrl(baseUrl, extent, resolution, pixelRatio, projection, params) {
	const srid = projection.getCode().split(/:(?=\d+$)/).pop();
	const imageResolution = resolution / pixelRatio;
	const imageSize = [round(getWidth(extent) / imageResolution, 4), round(getHeight(extent) / imageResolution, 4)];
	params["size"] = imageSize[0] + "," + imageSize[1];
	params["bbox"] = extent.join(",");
	params["bboxSR"] = srid;
	params["imageSR"] = srid;
	params["dpi"] = Math.round(params["dpi"] ? params["dpi"] * pixelRatio : 90 * pixelRatio);
	return appendParams(baseUrl.replace(/MapServer\/?$/, "MapServer/export").replace(/ImageServer\/?$/, "ImageServer/exportImage"), params);
}
/**
* @typedef {Object} LoaderOptions
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {boolean} [hidpi=true] Use the `ol/Map#pixelRatio` value when requesting the image from
* the remote server.
* @property {Object<string,*>} [params] ArcGIS Rest parameters. This field is optional. Service
* defaults will be used for any fields not specified. `format` is `png32` by default. `f` is
* `image` by default. `transparent` is `true` by default.  `bbox`, `size`, `bboxSR`, and `imageSR`
* will be set dynamically. Set `layers` to override the default service layer visibility. See
* https://developers.arcgis.com/rest/services-reference/export-map.htm
* for further reference.
* @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is 'EPSG:3857'.
* The projection code must contain a numeric end portion separated by :
* or the entire code must form a valid ArcGIS SpatialReference definition.
* @property {number} [ratio=1.5] Ratio. `1` means image requests are the size of the map viewport,
* `2` means twice the size of the map viewport, and so on.
* @property {string} url ArcGIS Rest service URL for a Map Service or Image Service. The url
* should include /MapServer or /ImageServer.
* @property {function(HTMLImageElement, string): Promise<import('../DataTile.js').ImageLike>} [load] Function
* to perform loading of the image. Receives the created `HTMLImageElement` and the desired `src` as argument and
* returns a promise resolving to the loaded or decoded image. Default is {@link module:ol/Image.decode}.
*/
/**
* Creates a loader for ArcGIS Rest images.
* @param {LoaderOptions} options Image ArcGIS Rest Options.
* @return {import('../Image.js').ImageObjectPromiseLoader} ArcGIS Rest image.
* @api
*/
function createLoader(options) {
	const load = options.load ? options.load : decode;
	const projection = get(options.projection || "EPSG:3857");
	const ratio = options.ratio ?? 1.5;
	const crossOrigin = options.crossOrigin ?? null;
	const referrerPolicy = options.referrerPolicy;
	return function(extent, resolution, pixelRatio) {
		pixelRatio = options.hidpi ? pixelRatio : 1;
		const params = {
			"f": "image",
			"format": "png32",
			"transparent": true
		};
		Object.assign(params, options.params);
		extent = getRequestExtent(extent, resolution, pixelRatio, ratio);
		if (!projection) return Promise.reject(/* @__PURE__ */ new Error("Projection not configured"));
		const src = getRequestUrl(options.url, extent, resolution, pixelRatio, projection, params);
		const image = new Image();
		image.crossOrigin = crossOrigin;
		if (referrerPolicy !== void 0) image.referrerPolicy = referrerPolicy;
		return load(image, src).then((image) => {
			const resolution = getWidth(extent) / image.width * pixelRatio;
			return {
				image,
				extent,
				resolution,
				pixelRatio
			};
		});
	};
}
//#endregion
export { getRequestUrl as n, createLoader as t };

//# sourceMappingURL=arcgisRest.js.map