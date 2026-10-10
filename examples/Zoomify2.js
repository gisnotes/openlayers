import { Ci as createCanvasContext2D, Io as TileState_default, Tr as ImageTile, Yr as toSize, ar as TileImage, fr as expandUrl, ho as getCenter, lr as createFromTileUrlFunctions, vr as TileGrid } from "./common.js";
//#region src/ol/source/Zoomify.js
/**
* @module ol/source/Zoomify
*/
/**
* @typedef {'default' | 'truncated'} TierSizeCalculation
*/
var CustomTile = class extends ImageTile {
	/**
	* @param {import("../size.js").Size} tileSize Full tile size.
	* @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
	* @param {import("../TileState.js").default} state State.
	* @param {string} src Image source URI.
	* @param {import('../dom.js').ImageAttributes} imageAttributes Image attributes options.
	* @param {import("../Tile.js").LoadFunction} tileLoadFunction Tile load function.
	* @param {import("../Tile.js").Options} [options] Tile options.
	*/
	constructor(tileSize, tileCoord, state, src, imageAttributes, tileLoadFunction, options) {
		super(tileCoord, state, src, imageAttributes, tileLoadFunction, options);
		/**
		* @private
		* @type {HTMLCanvasElement|OffscreenCanvas|HTMLImageElement|HTMLVideoElement|undefined}
		*/
		this.zoomifyImage_ = void 0;
		/**
		* @private
		* @type {import("../size.js").Size}
		*/
		this.tileSize_ = tileSize;
	}
	/**
	* Get the image element for this tile.
	* @return {HTMLCanvasElement|OffscreenCanvas|HTMLImageElement|HTMLVideoElement|null} Image.
	* @override
	*/
	getImage() {
		if (this.zoomifyImage_) return this.zoomifyImage_;
		const image = super.getImage();
		if (!image) return null;
		if (this.state == TileState_default.LOADED) {
			const tileSize = this.tileSize_;
			if (image.width == tileSize[0] && image.height == tileSize[1]) {
				this.zoomifyImage_ = image;
				return image;
			}
			const context = createCanvasContext2D(tileSize[0], tileSize[1]);
			context.drawImage(image, 0, 0);
			this.zoomifyImage_ = context.canvas;
			return context.canvas;
		}
		return image;
	}
};
/**
* @typedef {Object} Options
* @property {import("./Source.js").AttributionLike} [attributions] Attributions.
* @property {number} [cacheSize] Deprecated.  Use the cacheSize option on the layer instead.
* @property {null|string} [crossOrigin] The `crossOrigin` attribute for loaded images.  Note that
* you must provide a `crossOrigin` value  you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
* linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
* @property {import("../proj.js").ProjectionLike} [projection] Projection.
* @property {number} [tilePixelRatio] The pixel ratio used by the tile service. For example, if the tile service advertizes 256px by 256px tiles but actually sends 512px by 512px images (for retina/hidpi devices) then `tilePixelRatio` should be set to `2`
* @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
* Higher values can increase reprojection performance, but decrease precision.
* @property {string} url URL template or base URL of the Zoomify service.
* A base URL is the fixed part
* of the URL, excluding the tile group, z, x, and y folder structure, e.g.
* `http://my.zoomify.info/IMAGE.TIF/`. A URL template must include
* `{TileGroup}`, `{x}`, `{y}`, and `{z}` placeholders, e.g.
* `http://my.zoomify.info/IMAGE.TIF/{TileGroup}/{z}-{x}-{y}.jpg`.
* Internet Imaging Protocol (IIP) with JTL extension can be also used with
* `{tileIndex}` and `{z}` placeholders, e.g.
* `http://my.zoomify.info?FIF=IMAGE.TIF&JTL={z},{tileIndex}`.
* A `{?-?}` template pattern, for example `subdomain{a-f}.domain.com`, may be
* used instead of defining each one separately in the `urls` option.
* @property {TierSizeCalculation} [tierSizeCalculation] Tier size calculation method: `default` or `truncated`.
* @property {import("../size.js").Size} size Size.
* @property {import("../extent.js").Extent} [extent] Extent for the TileGrid that is created.
* Default sets the TileGrid in the
* fourth quadrant, meaning extent is `[0, -height, width, 0]`. To change the
* extent to the first quadrant (the default for OpenLayers 2) set the extent
* as `[0, 0, width, height]`.
* @property {number} [transition] Duration of the opacity transition for rendering.
* To disable the opacity transition, pass `transition: 0`.
* @property {number} [tileSize=256] Tile size. Same tile size is used for all zoom levels.
* @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
* Choose whether to use tiles with a higher or lower zoom level when between integer
* zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
*/
/**
* @classdesc
* Layer source for tile data in Zoomify format (both Zoomify and Internet
* Imaging Protocol are supported).
* @api
*/
var Zoomify = class extends TileImage {
	/**
	* @param {Options} options Options.
	*/
	constructor(options) {
		const size = options.size;
		const tierSizeCalculation = options.tierSizeCalculation !== void 0 ? options.tierSizeCalculation : "default";
		const tilePixelRatio = options.tilePixelRatio || 1;
		const imageWidth = size[0];
		const imageHeight = size[1];
		/** @type {Array<import("../size.js").Size>} */
		const tierSizeInTiles = [];
		const tileSize = options.tileSize || 256;
		let tileSizeForTierSizeCalculation = tileSize * tilePixelRatio;
		switch (tierSizeCalculation) {
			case "default":
				while (imageWidth > tileSizeForTierSizeCalculation || imageHeight > tileSizeForTierSizeCalculation) {
					tierSizeInTiles.push([Math.ceil(imageWidth / tileSizeForTierSizeCalculation), Math.ceil(imageHeight / tileSizeForTierSizeCalculation)]);
					tileSizeForTierSizeCalculation += tileSizeForTierSizeCalculation;
				}
				break;
			case "truncated":
				let width = imageWidth;
				let height = imageHeight;
				while (width > tileSizeForTierSizeCalculation || height > tileSizeForTierSizeCalculation) {
					tierSizeInTiles.push([Math.ceil(width / tileSizeForTierSizeCalculation), Math.ceil(height / tileSizeForTierSizeCalculation)]);
					width >>= 1;
					height >>= 1;
				}
				break;
			default: throw new Error("Unknown `tierSizeCalculation` configured");
		}
		tierSizeInTiles.push([1, 1]);
		tierSizeInTiles.reverse();
		const resolutions = [tilePixelRatio];
		const tileCountUpToTier = [0];
		for (let i = 1, ii = tierSizeInTiles.length; i < ii; i++) {
			resolutions.push(tilePixelRatio << i);
			tileCountUpToTier.push(tierSizeInTiles[i - 1][0] * tierSizeInTiles[i - 1][1] + tileCountUpToTier[i - 1]);
		}
		resolutions.reverse();
		const imageExtent = options.extent || [
			0,
			-imageHeight,
			imageWidth,
			0
		];
		const tileGrid = new TileGrid({
			tileSize,
			extent: imageExtent,
			resolutions
		});
		let url = options.url;
		if (url && !url.includes("{TileGroup}") && !url.includes("{tileIndex}")) url += "{TileGroup}/{z}-{x}-{y}.jpg";
		const urls = expandUrl(url);
		let tileWidth = tileSize * tilePixelRatio;
		/**
		* @param {string} template Template.
		* @return {import("../Tile.js").UrlFunction} Tile URL function.
		*/
		function createFromTemplate(template) {
			return (
			/**
			* @param {import("../tilecoord.js").TileCoord} tileCoord Tile Coordinate.
			* @param {number} pixelRatio Pixel ratio.
			* @param {import("../proj/Projection.js").default} projection Projection.
			* @return {string|undefined} Tile URL.
			*/
function(tileCoord, pixelRatio, projection) {
				if (!tileCoord) return;
				const tileCoordZ = tileCoord[0];
				const tileCoordX = tileCoord[1];
				const tileCoordY = tileCoord[2];
				const tileIndex = tileCoordX + tileCoordY * tierSizeInTiles[tileCoordZ][0];
				/** @type {Record<string, string | number>} */
				const localContext = {
					"z": tileCoordZ,
					"x": tileCoordX,
					"y": tileCoordY,
					"tileIndex": tileIndex,
					"TileGroup": "TileGroup" + ((tileIndex + tileCountUpToTier[tileCoordZ]) / tileWidth | 0)
				};
				return template.replace(/\{(\w+?)\}/g, function(m, p) {
					return String(localContext[p]);
				});
			});
		}
		const tileUrlFunction = createFromTileUrlFunctions(urls.map(createFromTemplate));
		const ZoomifyTileClass = CustomTile.bind(null, toSize(tileSize * tilePixelRatio));
		super({
			attributions: options.attributions,
			cacheSize: options.cacheSize,
			crossOrigin: options.crossOrigin,
			referrerPolicy: options.referrerPolicy,
			interpolate: options.interpolate,
			projection: options.projection,
			tilePixelRatio,
			reprojectionErrorThreshold: options.reprojectionErrorThreshold,
			tileClass: ZoomifyTileClass,
			tileGrid,
			tileUrlFunction,
			transition: options.transition
		});
		/**
		* @type {number|import("../array.js").NearestDirectionFunction}
		*/
		this.zDirection = options.zDirection ?? 0;
		const testTileUrl = tileUrlFunction(tileGrid.getTileCoordForCoordAndResolution(getCenter(imageExtent), resolutions[resolutions.length - 1]), 1, null);
		if (testTileUrl) {
			const image = new Image();
			image.addEventListener("error", () => {
				tileWidth = tileSize;
				this.changed();
			});
			image.src = testTileUrl;
		}
	}
};
//#endregion
export { Zoomify as n, CustomTile as t };

//# sourceMappingURL=Zoomify2.js.map