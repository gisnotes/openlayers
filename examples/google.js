import { Dr as Map, Ni as View, Po as ViewHint_default, Si as Control, ar as TileImage, at as WebGLTileLayer, bi as defaults, bo as getTopRight, hr as extentFromProjection, mr as createXYZ, po as getBottomLeft, wa as toLonLat } from "./common.js";
//#region src/ol/source/Google.js
/**
* @module ol/source/Google
*/
var maxZoom = 22;
/**
* @typedef {Object} Options
* @property {string} key Google Map Tiles API key. Get yours at https://developers.google.com/maps/documentation/tile/get-api-key.
* @property {string} [mapType='roadmap'] The type of [base map](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields).
* @property {string} [language='en-US'] An [IETF language tag](https://en.wikipedia.org/wiki/IETF_language_tag) for information displayed on the tiles.
* @property {string} [region='US'] A [Common Locale Data Repository](https://cldr.unicode.org/) (CLDR) region identifier that represents the user location.
* @property {string} [imageFormat] The image format used for the map tiles (e.g. `'jpeg'`, or `'png'`).
* @property {string} [scale] Scale for map elements (`'scaleFactor1x'`, `'scaleFactor2x'`, or `'scaleFactor4x'`).
* @property {boolean} [highDpi=false] Use high-resolution tiles.
* @property {Array<string>} [layerTypes] The layer types added to the map (e.g. `'layerRoadmap'`, `'layerStreetview'`, or `'layerTraffic'`).
* @property {boolean} [overlay=false] Display only the `layerTypes` and not the underlying `mapType` (only works if `layerTypes` is provided).
* @property {Array<Object>} [styles] [Custom styles](https://developers.google.com/maps/documentation/tile/style-reference) applied to the map.
* @property {boolean} [attributionsCollapsible=true] Allow the attributions to be collapsed.
* @property {boolean} [interpolate=true] Use interpolated values when resampling.  By default,
* linear interpolation is used when resampling.  Set to false to use the nearest neighbor instead.
* @property {number} [cacheSize] Initial tile cache size. Will auto-grow to hold at least the number of tiles in the viewport.
* @property {number} [reprojectionErrorThreshold=0.5] Maximum allowed reprojection error (in pixels).
* Higher values can increase reprojection performance, but decrease precision.
* @property {import("../Tile.js").LoadFunction} [tileLoadFunction] Optional function to load a tile given a URL. The default is
* ```js
* function(imageTile, src) {
*   imageTile.getImage().src = src;
* };
* ```
* @property {Array<string>} [apiOptions] An array of values specifying additional options to apply.
* @property {boolean} [wrapX=true] Wrap the world horizontally.
* @property {number} [transition] Duration of the opacity transition for rendering.
* To disable the opacity transition, pass `transition: 0`.
* @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
* Choose whether to use tiles with a higher or lower zoom level when between integer
* zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
* @property {string} [url='https://tile.googleapis.com/'] The Google Tile server URL.
* @property {function(string, RequestInit): Promise<Response>} [fetchSessionToken] Function to
* fetch a session token, called with the `createSession` URL and the request config. Defaults to
* `fetch`. Use this e.g. to persist session tokens across page reloads, so tile URLs stay the same
* and cached tiles can be reused. Note that the session token response includes an `expiry`, which
* is used to renew the session before it expires.
*/
/**
* @typedef {Object} SessionTokenRequest
* @property {string} mapType The map type.
* @property {string} language The language.
* @property {string} region The region.
* @property {string} [imageFormat] The image format.
* @property {string} [scale] The scale.
* @property {boolean} [highDpi] Use high resolution tiles.
* @property {Array<string>} [layerTypes] The layer types.
* @property {boolean} [overlay] The overlay.
* @property {Array<Object>} [styles] The styles.
* @property {Array<string>} [apiOptions] An array of values specifying additional options to apply.
*/
/**
* @typedef {Object} SessionTokenResponse
* @property {string} session The session token.
* @property {string} expiry The session token expiry (seconds since the epoch as a string).
* @property {number} tileWidth The tile width.
* @property {number} tileHeight The tile height.
* @property {string} imageFormat The image format.
*/
/**
* @classdesc
* A tile layer source that renders tiles from the Google [Map Tiles API](https://developers.google.com/maps/documentation/tile/overview).
* The constructor takes options that are passed to the request to create a session token.  Refer to the
* [documentation](https://developers.google.com/maps/documentation/tile/session_tokens#required_fields)
* for additional details.
* @api
*/
var Google = class extends TileImage {
	/**
	* @param {Options} options Google Maps options.
	*/
	constructor(options) {
		const highDpi = !!options.highDpi;
		super({
			attributionsCollapsible: options.attributionsCollapsible,
			cacheSize: options.cacheSize,
			crossOrigin: "anonymous",
			interpolate: options.interpolate,
			projection: "EPSG:3857",
			reprojectionErrorThreshold: options.reprojectionErrorThreshold,
			state: "loading",
			tileLoadFunction: options.tileLoadFunction,
			tilePixelRatio: highDpi ? 2 : 1,
			wrapX: options.wrapX !== void 0 ? options.wrapX : true,
			transition: options.transition,
			zDirection: options.zDirection
		});
		/**
		* @type {string}
		* @private
		*/
		this.apiKey_ = options.key;
		/**
		* @type {Error|null}
		* @private
		*/
		this.error_ = null;
		/**
		* @type {SessionTokenRequest}
		*/
		const sessionTokenRequest = {
			mapType: options.mapType || "roadmap",
			language: options.language || "en-US",
			region: options.region || "US"
		};
		if (options.imageFormat) sessionTokenRequest.imageFormat = options.imageFormat;
		if (options.scale) sessionTokenRequest.scale = options.scale;
		if (highDpi) sessionTokenRequest.highDpi = true;
		if (options.layerTypes) sessionTokenRequest.layerTypes = options.layerTypes;
		if (options.styles) sessionTokenRequest.styles = options.styles;
		if (options.overlay === true) sessionTokenRequest.overlay = true;
		if (options.apiOptions) sessionTokenRequest.apiOptions = options.apiOptions;
		/**
		* @type {SessionTokenRequest}
		* @private
		*/
		this.sessionTokenRequest_ = sessionTokenRequest;
		/**
		* @type {string}
		* @private
		*/
		this.sessionTokenValue_;
		/**
		* @type {ReturnType<typeof setTimeout>}
		* @private
		*/
		this.sessionRefreshId_;
		/**
		* @type {string}
		* @private
		*/
		this.previousViewportAttribution_;
		/**
		* @type {string}
		* @private
		*/
		this.previousViewportExtent_;
		const baseUrl = options.url || "https://tile.googleapis.com/";
		/**
		* @type {string}
		* @private
		*/
		this.createSessionUrl_ = baseUrl + "v1/createSession";
		if (options.fetchSessionToken) this.fetchSessionToken = options.fetchSessionToken;
		/**
		* @type {string}
		* @private
		*/
		this.tileUrl_ = baseUrl + "v1/2dtiles";
		/**
		* @type {string}
		* @private
		*/
		this.attributionUrl_ = baseUrl + "tile/v1/viewport";
		this.createSession_();
	}
	/**
	* @return {Error|null} A source loading error. When the source state is `error`, use this function
	* to get more information about the error. To debug a faulty configuration, you may want to use
	* a listener like
	* ```js
	* source.on('change', () => {
	*   if (source.getState() === 'error') {
	*     console.error(source.getError());
	*   }
	* });
	* ```
	*/
	getError() {
		return this.error_;
	}
	/**
	* Fetch a session token. Can be replaced with the `fetchSessionToken` option.
	* @param {string} url The URL.
	* @param {RequestInit} config The config.
	* @return {Promise<Response>} A promise that resolves with the response.
	*/
	fetchSessionToken(url, config) {
		return fetch(url, config);
	}
	/**
	* Get or renew a session token for use with tile requests.
	* @private
	*/
	async createSession_() {
		const url = this.createSessionUrl_ + "?key=" + this.apiKey_;
		const config = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(this.sessionTokenRequest_)
		};
		const response = await this.fetchSessionToken(url, config);
		if (!response.ok) {
			try {
				const body = await response.json();
				this.error_ = new Error(body.error.message);
			} catch {
				this.error_ = /* @__PURE__ */ new Error("Error fetching session token");
			}
			this.setState("error");
			return;
		}
		/**
		* @type {SessionTokenResponse}
		*/
		const sessionTokenResponse = await response.json();
		const tilePixelRatio = this.getTilePixelRatio(1);
		const tileSize = [sessionTokenResponse.tileWidth / tilePixelRatio, sessionTokenResponse.tileHeight / tilePixelRatio];
		this.tileGrid = createXYZ({
			extent: extentFromProjection(this.getProjection()),
			maxZoom,
			tileSize
		});
		const session = sessionTokenResponse.session;
		this.sessionTokenValue_ = session;
		const key = this.apiKey_;
		const tileUrl = this.tileUrl_;
		/**
		* @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
		* @param {number} pixelRatio Pixel ratio.
		* @param {import("../proj/Projection.js").default} projection Projection.
		* @return {string} Tile URL.
		*/
		this.tileUrlFunction = function(tileCoord, pixelRatio, projection) {
			const z = tileCoord[0];
			const x = tileCoord[1];
			const y = tileCoord[2];
			return `${tileUrl}/${z}/${x}/${y}?session=${session}&key=${key}`;
		};
		const expiry = parseInt(sessionTokenResponse.expiry, 10) * 1e3;
		const timeout = Math.max(expiry - Date.now() - 60 * 1e3, 1);
		this.sessionRefreshId_ = setTimeout(() => this.createSession_(), timeout);
		this.setAttributions(this.fetchAttributions_.bind(this));
		this.setState("ready");
	}
	/**
	* @param {import('../Map.js').FrameState} frameState The frame state.
	* @return {Promise<string>} The attributions.
	* @private
	*/
	async fetchAttributions_(frameState) {
		if (frameState.viewHints[ViewHint_default.ANIMATING] || frameState.viewHints[ViewHint_default.INTERACTING] || frameState.animate) return this.previousViewportAttribution_;
		const extent = frameState.extent;
		if (!extent) return this.previousViewportAttribution_;
		const [west, south] = toLonLat(getBottomLeft(extent), frameState.viewState.projection);
		const [east, north] = toLonLat(getTopRight(extent), frameState.viewState.projection);
		const tileGrid = this.getTileGrid();
		if (!tileGrid) return this.previousViewportAttribution_;
		const viewportExtent = `zoom=${tileGrid.getZForResolution(frameState.viewState.resolution, this.zDirection)}&north=${north}&south=${south}&east=${east}&west=${west}`;
		if (this.previousViewportExtent_ == viewportExtent) return this.previousViewportAttribution_;
		this.previousViewportExtent_ = viewportExtent;
		const session = this.sessionTokenValue_;
		const key = this.apiKey_;
		const url = `${this.attributionUrl_}?session=${session}&key=${key}&${viewportExtent}`;
		this.previousViewportAttribution_ = await fetch(url).then((response) => response.json()).then((json) => json.copyright);
		return this.previousViewportAttribution_;
	}
	/**
	* @override
	*/
	disposeInternal() {
		clearTimeout(this.sessionRefreshId_);
		super.disposeInternal();
	}
};
//#endregion
//#region examples/google.js
function showMap(key) {
	const source = new Google({
		key,
		scale: "scaleFactor2x",
		highDpi: true
	});
	source.on("change", () => {
		if (source.getState() === "error") alert(source.getError());
	});
	class GoogleLogoControl extends Control {
		constructor() {
			const element = document.createElement("img");
			element.style.pointerEvents = "none";
			element.style.position = "absolute";
			element.style.bottom = "5px";
			element.style.left = "5px";
			element.src = "https://developers.google.com/static/maps/documentation/images/google_on_white.png";
			super({ element });
		}
	}
	new Map({
		layers: [new WebGLTileLayer({ source })],
		controls: defaults().extend([new GoogleLogoControl()]),
		target: "map",
		view: new View({
			center: [0, 0],
			zoom: 2
		})
	});
}
document.getElementById("key-form").addEventListener("submit", (event) => {
	showMap(event.target.elements["key"].value);
});
//#endregion

//# sourceMappingURL=google.js.map