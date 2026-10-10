import { Dr as Map, Fo as assert, Ni as View, Yr as toSize, ar as TileImage, vr as TileGrid, yo as getTopLeft, yr as TileLayer } from "./common.js";
import { t as CustomTile } from "./Zoomify2.js";
//#region src/ol/format/IIIFInfo.js
/**
* @module ol/format/IIIFInfo
*/
/**
* @typedef {Object} PreferredOptions
* @property {string} [format] Preferred image format. Will be used if the image information
* indicates support for that format.
* @property {string} [quality] IIIF image qualitiy.  Will be used if the image information
* indicates support for that quality.
*/
/**
* @typedef {Object} SupportedFeatures
* @property {Array<string>} [supports] Supported IIIF image size and region
* calculation features.
* @property {Array<string>} [formats] Supported image formats.
* @property {Array<string>} [qualities] Supported IIIF image qualities.
*/
/**
* @typedef {Object} TileInfo
* @property {Array<number>} scaleFactors Supported resolution scaling factors.
* @property {number} width Tile width in pixels.
* @property {number} [height] Tile height in pixels. Same as tile width if height is
* not given.
*/
/**
* @typedef {Object} IiifProfile
* @property {Array<string>} [formats] Supported image formats for the image service.
* @property {Array<string>} [qualities] Supported IIIF image qualities.
* @property {Array<string>} [supports] Supported features.
* @property {number} [maxArea] Maximum area (pixels) available for this image service.
* @property {number} [maxHeight] Maximum height.
* @property {number} [maxWidth] Maximum width.
*/
/**
* @typedef {Object} IIIFImageOptions
* @property {string|undefined} [url] Image service URL.
* @property {Array<Array<number>>|undefined} [sizes] Supported sizes.
* @property {Array<number>|undefined} [tileSize] Tile size.
* @property {Array<number>|undefined} [resolutions] Resolution factors.
* @property {Array<string>} [supports] Supported features.
* @property {Array<string>} [formats] Supported formats.
* @property {Array<string>} [qualities] Supported qualities.
* @property {string|undefined} [preferredFormat] Preferred format.
*/
/**
* @typedef {Object<string,string|number|Array<number|string|IiifProfile|Object<string, number>|TileInfo>>}
*    ImageInformationResponse
*/
/**
* Enum representing the major IIIF Image API versions
* @enum {string}
*/
var Versions = {
	VERSION1: "version1",
	VERSION2: "version2",
	VERSION3: "version3"
};
/**
* Supported image formats, qualities and supported region / size calculation features
* for different image API versions and compliance levels
* @const
* @type {Object<string, Object<string, SupportedFeatures>>}
*/
var IIIF_PROFILE_VALUES = {};
IIIF_PROFILE_VALUES[Versions.VERSION1] = {
	"level0": {
		supports: [],
		formats: [],
		qualities: ["native"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["native"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: [
			"native",
			"color",
			"grey",
			"bitonal"
		]
	}
};
IIIF_PROFILE_VALUES[Versions.VERSION2] = {
	"level0": {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByDistortedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default", "bitonal"]
	}
};
IIIF_PROFILE_VALUES[Versions.VERSION3] = {
	"level0": {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"regionSquare",
			"sizeByW",
			"sizeByH",
			"sizeByWh"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionSquare",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default"]
	}
};
IIIF_PROFILE_VALUES["none"] = { "none": {
	supports: [],
	formats: [],
	qualities: []
} };
var COMPLIANCE_VERSION1 = /^https?:\/\/library\.stanford\.edu\/iiif\/image-api\/(?:1\.1\/)?compliance\.html#level[0-2]$/;
var COMPLIANCE_VERSION2 = /^https?:\/\/iiif\.io\/api\/image\/2\/level[0-2](?:\.json)?$/;
var COMPLIANCE_VERSION3 = /(^https?:\/\/iiif\.io\/api\/image\/3\/level[0-2](?:\.json)?$)|(^level[0-2]$)/;
/**
* @param {IIIFInfo} iiifInfo IIIF info instance.
* @return {IIIFImageOptions} Options.
*/
function generateVersion1Options(iiifInfo) {
	let levelProfile = iiifInfo.getComplianceLevelSupportedFeatures();
	if (levelProfile === void 0) levelProfile = IIIF_PROFILE_VALUES[Versions.VERSION1]["level0"];
	const formats = iiifInfo.imageInfo.formats ?? [];
	return {
		url: iiifInfo.imageInfo["@id"] === void 0 ? void 0 : iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		supports: levelProfile.supports ?? [],
		formats: [...levelProfile.formats ?? [], ...formats],
		qualities: levelProfile.qualities ?? [],
		resolutions: iiifInfo.imageInfo.scale_factors,
		tileSize: iiifInfo.imageInfo.tile_width !== void 0 ? iiifInfo.imageInfo.tile_height !== void 0 ? [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_height] : [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_width] : iiifInfo.imageInfo.tile_height != void 0 ? [iiifInfo.imageInfo.tile_height, iiifInfo.imageInfo.tile_height] : void 0
	};
}
/**
* @param {IIIFInfo} iiifInfo IIIF info instance.
* @return {IIIFImageOptions} Options.
*/
function generateVersion2Options(iiifInfo) {
	const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures() ?? IIIF_PROFILE_VALUES["none"]["none"];
	const additionalProfile = Array.isArray(iiifInfo.imageInfo.profile) && iiifInfo.imageInfo.profile.length > 1;
	const profileSupports = additionalProfile && iiifInfo.imageInfo.profile[1].supports ? iiifInfo.imageInfo.profile[1].supports : [];
	const profileFormats = additionalProfile && iiifInfo.imageInfo.profile[1].formats ? iiifInfo.imageInfo.profile[1].formats : [];
	const profileQualities = additionalProfile && iiifInfo.imageInfo.profile[1].qualities ? iiifInfo.imageInfo.profile[1].qualities : [];
	return {
		url: iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : 		/** @type {Array<{width: number, height: number}>} */ iiifInfo.imageInfo.sizes.map(function(size) {
			return [size.width, size.height];
		}),
		tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.width;
		})[0], iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.height === void 0 ? tile.width : tile.height;
		})[0]],
		resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : 		/** @type {Array<TileInfo>} */ iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.scaleFactors;
		})[0],
		supports: [...levelProfile.supports ?? [], ...profileSupports],
		formats: [...levelProfile.formats ?? [], ...profileFormats],
		qualities: [...levelProfile.qualities ?? [], ...profileQualities]
	};
}
/**
* @param {IIIFInfo} iiifInfo IIIF info instance.
* @return {IIIFImageOptions} Options.
*/
function generateVersion3Options(iiifInfo) {
	const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures() ?? IIIF_PROFILE_VALUES["none"]["none"];
	const formats = iiifInfo.imageInfo.extraFormats === void 0 ? levelProfile.formats ?? [] : [...levelProfile.formats ?? [], ...iiifInfo.imageInfo.extraFormats];
	const preferredFormat = iiifInfo.imageInfo.preferredFormats !== void 0 && Array.isArray(iiifInfo.imageInfo.preferredFormats) && iiifInfo.imageInfo.preferredFormats.length > 0 ? iiifInfo.imageInfo.preferredFormats.filter(function(format) {
		return [
			"jpg",
			"png",
			"gif"
		].includes(format);
	}).reduce(function(acc, format) {
		return acc === void 0 && formats.includes(format) ? format : acc;
	}, void 0) : void 0;
	return {
		url: iiifInfo.imageInfo["id"],
		sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : 		/** @type {Array<{width: number, height: number}>} */ iiifInfo.imageInfo.sizes.map(function(size) {
			return [size.width, size.height];
		}),
		tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.width;
		})[0], iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.height;
		})[0]],
		resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : 		/** @type {Array<TileInfo>} */ iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.scaleFactors;
		})[0],
		supports: iiifInfo.imageInfo.extraFeatures === void 0 ? levelProfile.supports ?? [] : [...levelProfile.supports ?? [], ...iiifInfo.imageInfo.extraFeatures],
		formats,
		qualities: iiifInfo.imageInfo.extraQualities === void 0 ? levelProfile.qualities ?? [] : [...levelProfile.qualities ?? [], ...iiifInfo.imageInfo.extraQualities],
		preferredFormat
	};
}
/** @type {Object<string, function(IIIFInfo): IIIFImageOptions>} */
var versionFunctions = {};
versionFunctions[Versions.VERSION1] = generateVersion1Options;
versionFunctions[Versions.VERSION2] = generateVersion2Options;
versionFunctions[Versions.VERSION3] = generateVersion3Options;
/**
* @classdesc
* Format for transforming IIIF Image API image information responses into
* IIIF tile source ready options
*
* @api
*/
var IIIFInfo = class {
	/**
	* @param {string|ImageInformationResponse} imageInfo
	* Deserialized image information JSON response object or JSON response as string
	*/
	constructor(imageInfo) {
		this.setImageInfo(imageInfo);
	}
	/**
	* @param {string|ImageInformationResponse} imageInfo
	* Deserialized image information JSON response object or JSON response as string
	* @api
	*/
	setImageInfo(imageInfo) {
		if (typeof imageInfo == "string") this.imageInfo = JSON.parse(imageInfo);
		else this.imageInfo = imageInfo;
	}
	/**
	* @return {Versions|undefined} Major IIIF version.
	* @api
	*/
	getImageApiVersion() {
		if (this.imageInfo === void 0) return;
		let context = this.imageInfo["@context"] || "ol-no-context";
		if (typeof context == "string") context = [context];
		for (let i = 0; i < context.length; i++) switch (context[i]) {
			case "http://library.stanford.edu/iiif/image-api/1.1/context.json":
			case "http://iiif.io/api/image/1/context.json": return Versions.VERSION1;
			case "http://iiif.io/api/image/2/context.json": return Versions.VERSION2;
			case "http://iiif.io/api/image/3/context.json": return Versions.VERSION3;
			case "ol-no-context":
				if (this.getComplianceLevelEntryFromProfile(Versions.VERSION1) && this.imageInfo.identifier) return Versions.VERSION1;
				break;
			default:
		}
		assert(false, "Cannot determine IIIF Image API version from provided image information JSON");
	}
	/**
	* @param {Versions} version Optional IIIF image API version
	* @return {string|undefined} Compliance level as it appears in the IIIF image information
	* response.
	*/
	getComplianceLevelEntryFromProfile(version) {
		if (this.imageInfo === void 0 || this.imageInfo.profile === void 0) return;
		if (version === void 0) version = this.getImageApiVersion();
		switch (version) {
			case Versions.VERSION1:
				if (COMPLIANCE_VERSION1.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case Versions.VERSION3:
				if (COMPLIANCE_VERSION3.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case Versions.VERSION2:
				if (typeof this.imageInfo.profile === "string" && COMPLIANCE_VERSION2.test(this.imageInfo.profile)) return this.imageInfo.profile;
				if (Array.isArray(this.imageInfo.profile) && this.imageInfo.profile.length > 0 && typeof this.imageInfo.profile[0] === "string" && COMPLIANCE_VERSION2.test(this.imageInfo.profile[0])) return this.imageInfo.profile[0];
				break;
			default:
		}
	}
	/**
	* @param {Versions} version Optional IIIF image API version
	* @return {string|undefined} Compliance level, on of 'level0', 'level1' or 'level2' or undefined
	*/
	getComplianceLevelFromProfile(version) {
		const complianceLevel = this.getComplianceLevelEntryFromProfile(version);
		if (complianceLevel === void 0) return;
		const level = complianceLevel.match(/level[0-2](?:\.json)?$/g);
		return Array.isArray(level) ? level[0].replace(".json", "") : void 0;
	}
	/**
	* @return {SupportedFeatures|undefined} Image formats, qualities and region / size calculation
	* methods that are supported by the IIIF service.
	*/
	getComplianceLevelSupportedFeatures() {
		if (this.imageInfo === void 0) return;
		const version = this.getImageApiVersion();
		if (version === void 0) return;
		const level = this.getComplianceLevelFromProfile(version);
		if (level === void 0) return IIIF_PROFILE_VALUES["none"]["none"];
		return IIIF_PROFILE_VALUES[version][level];
	}
	/**
	* @param {PreferredOptions} [preferredOptions] Optional options for preferred format and quality.
	* @return {import("../source/IIIF.js").Options|undefined} IIIF tile source ready constructor options.
	* @api
	*/
	getTileSourceOptions(preferredOptions) {
		const options = preferredOptions || {}, version = this.getImageApiVersion();
		if (version === void 0) return;
		const imageOptions = version === void 0 ? void 0 : versionFunctions[version](this);
		if (imageOptions === void 0) return;
		return {
			url: imageOptions.url,
			version,
			size: [this.imageInfo.width, this.imageInfo.height],
			sizes: imageOptions.sizes,
			format: options.format !== void 0 && (imageOptions.formats ?? []).includes(options.format) ? options.format : imageOptions.preferredFormat !== void 0 ? imageOptions.preferredFormat : "jpg",
			supports: imageOptions.supports ?? [],
			quality: options.quality && (imageOptions.qualities ?? []).includes(options.quality) ? options.quality : (imageOptions.qualities ?? []).includes("native") ? "native" : "default",
			resolutions: Array.isArray(imageOptions.resolutions) ? imageOptions.resolutions.sort(function(a, b) {
				return b - a;
			}) : void 0,
			tileSize: imageOptions.tileSize
		};
	}
};
//#endregion
//#region src/ol/source/IIIF.js
/**
* @module ol/source/IIIF
*/
/**
* @typedef {Object} Options
* @property {import("./Source.js").AttributionLike} [attributions] Attributions.
* @property {boolean} [attributionsCollapsible=true] Attributions are collapsible.
* @property {number} [cacheSize] Deprecated.  Use the cacheSize option on the layer instead.
* @property {null|string} [crossOrigin] The value for the crossOrigin option of the request.
* @property {import("../extent.js").Extent} [extent=[0, -height, width, 0]] The extent.
* @property {string} [format='jpg'] Requested image format.
* @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
* linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
* @property {import("../proj.js").ProjectionLike} [projection] Projection.
* @property {string} [quality] Requested IIIF image quality. Default is 'native'
* for version 1, 'default' for versions 2 and 3.
* @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
* Higher values can increase reprojection performance, but decrease precision.
* @property {Array<number>} [resolutions] Supported resolutions as given in IIIF 'scaleFactors'
* @property {import("../size.js").Size} size Size of the image [width, height].
* @property {Array<import("../size.js").Size>} [sizes] Supported scaled image sizes.
* Content of the IIIF info.json 'sizes' property, but as array of Size objects.
* @property {import("./Source.js").State} [state] Source state.
* @property {Array<string>} [supports=[]] Supported IIIF region and size calculation
* features.
* @property {number} [tilePixelRatio] Tile pixel ratio.
* @property {number|import("../size.js").Size} [tileSize] Tile size.
* Same tile size is used for all zoom levels. If tile size is a number,
* a square tile is assumed. If the IIIF image service supports arbitrary
* tiling (sizeByH, sizeByW, sizeByWh or sizeByPct as well as regionByPx or regionByPct
* are supported), the default tilesize is 256.
* @property {number} [transition] Transition.
* @property {string} [url] Base URL of the IIIF Image service.
* This should be the same as the IIIF Image ID.
* @property {import("../format/IIIFInfo.js").Versions} [version=Versions.VERSION2] Service's IIIF Image API version.
* @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
* Choose whether to use tiles with a higher or lower zoom level when between integer
* zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
*/
/**
* @param {number} percentage Percentage value.
* @return {string} Formatted percentage.
*/
function formatPercentage(percentage) {
	return percentage.toLocaleString("en", { maximumFractionDigits: 10 });
}
/**
* @classdesc
* Layer source for IIIF Image API services.
* @api
*/
var IIIF = class extends TileImage {
	/**
	* @param {Options} [options] Tile source options. Use {@link import("../format/IIIFInfo.js").IIIFInfo}
	* to parse Image API service information responses into constructor options.
	* @api
	*/
	constructor(options) {
		/**
		* @type {Partial<Options>}
		*/
		const partialOptions = options || {};
		let baseUrl = partialOptions.url || "";
		baseUrl = baseUrl + (baseUrl.lastIndexOf("/") === baseUrl.length - 1 || baseUrl === "" ? "" : "/");
		const version = partialOptions.version || Versions.VERSION2;
		const sizes = partialOptions.sizes || [];
		const size = partialOptions.size;
		assert(size != void 0 && Array.isArray(size) && size.length == 2 && !isNaN(size[0]) && size[0] > 0 && !isNaN(size[1]) && size[1] > 0, "Missing or invalid `size`");
		const width = size[0];
		const height = size[1];
		const tileSize = partialOptions.tileSize;
		const tilePixelRatio = partialOptions.tilePixelRatio || 1;
		const format = partialOptions.format || "jpg";
		const quality = partialOptions.quality || (partialOptions.version == Versions.VERSION1 ? "native" : "default");
		let resolutions = partialOptions.resolutions || [];
		const supports = partialOptions.supports || [];
		const extent = partialOptions.extent || [
			0,
			-height,
			width,
			0
		];
		const supportsListedSizes = sizes != void 0 && Array.isArray(sizes) && sizes.length > 0;
		const supportsListedTiles = tileSize !== void 0 && (typeof tileSize === "number" && Number.isInteger(tileSize) && tileSize > 0 || Array.isArray(tileSize) && tileSize.length > 0);
		const supportsArbitraryTiling = supports != void 0 && Array.isArray(supports) && (supports.includes("regionByPx") || supports.includes("regionByPct")) && (supports.includes("sizeByWh") || supports.includes("sizeByH") || supports.includes("sizeByW") || supports.includes("sizeByPct"));
		/** @type {number} */
		let tileWidth = 256;
		/** @type {number} */
		let tileHeight = 256;
		/** @type {number} */
		let maxZoom;
		resolutions.sort(function(a, b) {
			return b - a;
		});
		if (supportsListedTiles || supportsArbitraryTiling) {
			if (tileSize != void 0) {
				if (typeof tileSize === "number" && Number.isInteger(tileSize) && tileSize > 0) {
					tileWidth = tileSize;
					tileHeight = tileSize;
				} else if (Array.isArray(tileSize) && tileSize.length > 0) {
					if (tileSize.length == 1 || tileSize[1] == void 0 && Number.isInteger(tileSize[0])) {
						tileWidth = tileSize[0];
						tileHeight = tileSize[0];
					}
					if (tileSize.length == 2) {
						if (Number.isInteger(tileSize[0]) && Number.isInteger(tileSize[1])) {
							tileWidth = tileSize[0];
							tileHeight = tileSize[1];
						} else if (tileSize[0] == void 0 && Number.isInteger(tileSize[1])) {
							tileWidth = tileSize[1];
							tileHeight = tileSize[1];
						}
					}
				}
			}
			if (tileWidth === void 0 || tileHeight === void 0) {
				tileWidth = 256;
				tileHeight = 256;
			}
			if (resolutions.length == 0) {
				maxZoom = Math.max(Math.ceil(Math.log(width / tileWidth) / Math.LN2), Math.ceil(Math.log(height / tileHeight) / Math.LN2));
				for (let i = maxZoom; i >= 0; i--) resolutions.push(Math.pow(2, i));
			} else {
				const maxScaleFactor = Math.max(...resolutions);
				maxZoom = Math.round(Math.log(maxScaleFactor) / Math.LN2);
			}
		} else {
			tileWidth = width;
			tileHeight = height;
			resolutions = [];
			if (supportsListedSizes) {
				sizes.sort(function(a, b) {
					return a[0] - b[0];
				});
				maxZoom = -1;
				const ignoredSizesIndex = [];
				for (let i = 0; i < sizes.length; i++) {
					const resolution = width / sizes[i][0];
					if (resolutions.length > 0 && resolutions[resolutions.length - 1] == resolution) {
						ignoredSizesIndex.push(i);
						continue;
					}
					resolutions.push(resolution);
					maxZoom++;
				}
				if (ignoredSizesIndex.length > 0) for (let i = 0; i < ignoredSizesIndex.length; i++) sizes.splice(ignoredSizesIndex[i] - i, 1);
			} else {
				resolutions.push(1);
				sizes.push([width, height]);
				maxZoom = 0;
			}
		}
		const tileGrid = new TileGrid({
			tileSize: [tileWidth, tileHeight],
			extent,
			origin: getTopLeft(extent),
			resolutions
		});
		/** @type {import("../Tile.js").UrlFunction} */
		const tileUrlFunction = function(tileCoord, pixelRatio, projection) {
			let regionParam, sizeParam;
			const zoom = tileCoord[0];
			if (zoom > maxZoom) return;
			const tileX = tileCoord[1], tileY = tileCoord[2], scale = resolutions[zoom];
			if (tileX === void 0 || tileY === void 0 || scale === void 0 || tileX < 0 || Math.ceil(width / scale / tileWidth) <= tileX || tileY < 0 || Math.ceil(height / scale / tileHeight) <= tileY) return;
			if (supportsArbitraryTiling || supportsListedTiles) {
				const regionX = tileX * tileWidth * scale, regionY = tileY * tileHeight * scale;
				let regionW = tileWidth * scale, regionH = tileHeight * scale, sizeW = tileWidth, sizeH = tileHeight;
				if (regionX + regionW > width) regionW = width - regionX;
				if (regionY + regionH > height) regionH = height - regionY;
				if (regionX + tileWidth * scale > width) sizeW = Math.floor((width - regionX + scale - 1) / scale);
				if (regionY + tileHeight * scale > height) sizeH = Math.floor((height - regionY + scale - 1) / scale);
				if (regionX == 0 && regionW == width && regionY == 0 && regionH == height) regionParam = "full";
				else if (!supportsArbitraryTiling || supports.includes("regionByPx")) regionParam = regionX + "," + regionY + "," + regionW + "," + regionH;
				else if (supports.includes("regionByPct")) {
					const pctX = formatPercentage(regionX / width * 100), pctY = formatPercentage(regionY / height * 100), pctW = formatPercentage(regionW / width * 100), pctH = formatPercentage(regionH / height * 100);
					regionParam = "pct:" + pctX + "," + pctY + "," + pctW + "," + pctH;
				}
				if (version == Versions.VERSION3 && (!supportsArbitraryTiling || supports.includes("sizeByWh"))) sizeParam = sizeW + "," + sizeH;
				else if (!supportsArbitraryTiling || supports.includes("sizeByW")) sizeParam = sizeW + ",";
				else if (supports.includes("sizeByH")) sizeParam = "," + sizeH;
				else if (supports.includes("sizeByWh")) sizeParam = sizeW + "," + sizeH;
				else if (supports.includes("sizeByPct")) sizeParam = "pct:" + formatPercentage(100 / scale);
			} else {
				regionParam = "full";
				if (supportsListedSizes) {
					const regionWidth = sizes[zoom][0], regionHeight = sizes[zoom][1];
					if (version == Versions.VERSION3) if (regionWidth == width && regionHeight == height) sizeParam = "max";
					else sizeParam = regionWidth + "," + regionHeight;
					else if (regionWidth == width) sizeParam = "full";
					else sizeParam = regionWidth + ",";
				} else sizeParam = version == Versions.VERSION3 ? "max" : "full";
			}
			return baseUrl + regionParam + "/" + sizeParam + "/0/" + quality + "." + format;
		};
		const IiifTileClass = CustomTile.bind(null, toSize(tileSize || 256).map(function(size) {
			return size * tilePixelRatio;
		}));
		super({
			attributions: partialOptions.attributions,
			attributionsCollapsible: partialOptions.attributionsCollapsible,
			cacheSize: partialOptions.cacheSize,
			crossOrigin: partialOptions.crossOrigin,
			interpolate: partialOptions.interpolate,
			projection: partialOptions.projection,
			reprojectionErrorThreshold: partialOptions.reprojectionErrorThreshold,
			state: partialOptions.state,
			tileClass: IiifTileClass,
			tileGrid,
			tilePixelRatio: partialOptions.tilePixelRatio,
			tileUrlFunction,
			transition: partialOptions.transition
		});
		/**
		* @type {number|import("../array.js").NearestDirectionFunction}
		*/
		this.zDirection = partialOptions.zDirection ?? 0;
	}
};
//#endregion
//#region examples/iiif.js
var layer = new TileLayer();
var map = new Map({
	layers: [layer],
	target: "map"
});
var notifyDiv = document.getElementById("iiif-notification");
var urlInput = document.getElementById("imageInfoUrl");
var displayButton = document.getElementById("display");
function refreshMap(imageInfoUrl) {
	fetch(imageInfoUrl).then(function(response) {
		response.json().then(function(imageInfo) {
			const options = new IIIFInfo(imageInfo).getTileSourceOptions();
			if (options === void 0 || options.version === void 0) {
				notifyDiv.textContent = "Data seems to be no valid IIIF image information.";
				return;
			}
			options.zDirection = -1;
			const iiifTileSource = new IIIF(options);
			layer.setSource(iiifTileSource);
			map.setView(new View({
				resolutions: iiifTileSource.getTileGrid().getResolutions(),
				extent: iiifTileSource.getTileGrid().getExtent(),
				constrainOnlyCenter: true
			}));
			map.getView().fit(iiifTileSource.getTileGrid().getExtent());
			notifyDiv.textContent = "";
		}).catch(function(body) {
			notifyDiv.textContent = "Could not read image info json. " + body;
		});
	}).catch(function() {
		notifyDiv.textContent = "Could not read data from URL.";
	});
}
displayButton.addEventListener("click", function() {
	refreshMap(urlInput.value);
});
refreshMap(urlInput.value);
//#endregion

//# sourceMappingURL=iiif.js.map