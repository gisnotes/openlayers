import { Cr as LRUCache, Dr as Map, Er as Tile, Io as TileState_default, Ni as View, So as intersects, U as jsonp, V as TileJSON, cr as createFromTemplates, eo as applyTransform, hr as extentFromProjection, mr as createXYZ, or as TileSource, rs as listenOnce, ts as EventType_default, ur as nullTileUrlFunction, va as get, xa as getTransformFromProjections, xr as getKeyZXY, yr as TileLayer } from "./common.js";
import { t as Overlay } from "./Overlay2.js";
//#region src/ol/source/UTFGrid.js
/**
* @module ol/source/UTFGrid
*/
/**
* @typedef {Object} UTFGridJSON
* @property {Array<string>} grid The grid.
* @property {Array<string>} keys The keys.
* @property {Object<string, Object>} [data] Optional data.
*/
var CustomTile = class extends Tile {
	/**
	* @param {import("../tilecoord.js").TileCoord} tileCoord Tile coordinate.
	* @param {import("../TileState.js").default} state State.
	* @param {string} src Image source URI.
	* @param {import("../extent.js").Extent} extent Extent of the tile.
	* @param {boolean} preemptive Load the tile when visible (before it's needed).
	* @param {boolean} jsonp Load the tile as a script.
	*/
	constructor(tileCoord, state, src, extent, preemptive, jsonp) {
		super(tileCoord, state);
		/**
		* @private
		* @type {string}
		*/
		this.src_ = src;
		/**
		* @private
		* @type {import("../extent.js").Extent}
		*/
		this.extent_ = extent;
		/**
		* @private
		* @type {boolean}
		*/
		this.preemptive_ = preemptive;
		/**
		* @private
		* @type {Array<string>|undefined}
		*/
		this.grid_ = void 0;
		/**
		* @private
		* @type {Array<string>|undefined}
		*/
		this.keys_ = void 0;
		/**
		* @private
		* @type {Object<string, Object>|undefined}
		*/
		this.data_ = void 0;
		/**
		* @private
		* @type {boolean}
		*/
		this.jsonp_ = jsonp;
	}
	/**
	* Get the image element for this tile.
	* @return {HTMLImageElement|null} Image.
	*/
	getImage() {
		return null;
	}
	/**
	* Synchronously returns data at given coordinate (if available).
	* @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
	* @return {*} The data.
	*/
	getData(coordinate) {
		if (!this.grid_ || !this.keys_) return null;
		const xRelative = (coordinate[0] - this.extent_[0]) / (this.extent_[2] - this.extent_[0]);
		const yRelative = (coordinate[1] - this.extent_[1]) / (this.extent_[3] - this.extent_[1]);
		const row = this.grid_[Math.floor((1 - yRelative) * this.grid_.length)];
		if (typeof row !== "string") return null;
		let code = row.charCodeAt(Math.floor(xRelative * row.length));
		if (code >= 93) code--;
		if (code >= 35) code--;
		code -= 32;
		let data = null;
		if (code in this.keys_) {
			const id = this.keys_[code];
			if (this.data_ && id in this.data_) data = this.data_[id];
			else data = id;
		}
		return data;
	}
	/**
	* Calls the callback (synchronously by default) with the available data
	* for given coordinate (or `null` if not yet loaded).
	* @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
	* @param {function(*): void} callback Callback.
	* @param {boolean} [request] If `true` the callback is always async.
	*                               The tile data is requested if not yet loaded.
	*/
	forDataAtCoordinate(coordinate, callback, request) {
		if (this.state == TileState_default.EMPTY && request === true) {
			this.state = TileState_default.IDLE;
			listenOnce(this, EventType_default.CHANGE, (e) => {
				callback(this.getData(coordinate));
			});
			this.loadInternal_();
		} else if (request === true) setTimeout(() => {
			callback(this.getData(coordinate));
		}, 0);
		else callback(this.getData(coordinate));
	}
	/**
	* Return the key to be used for all tiles in the source.
	* @return {string} The key for all tiles.
	* @override
	*/
	getKey() {
		return this.src_;
	}
	/**
	* @private
	*/
	handleError_() {
		this.state = TileState_default.ERROR;
		this.changed();
	}
	/**
	* @param {!UTFGridJSON} json UTFGrid data.
	* @private
	*/
	handleLoad_(json) {
		this.grid_ = json["grid"];
		this.keys_ = json["keys"];
		this.data_ = json["data"];
		this.state = TileState_default.LOADED;
		this.changed();
	}
	/**
	* @private
	*/
	loadInternal_() {
		if (this.state == TileState_default.IDLE) {
			this.state = TileState_default.LOADING;
			if (this.jsonp_) jsonp(this.src_, this.handleLoad_.bind(this), this.handleError_.bind(this));
			else {
				const client = new XMLHttpRequest();
				client.addEventListener("load", this.onXHRLoad_.bind(this));
				client.addEventListener("error", this.onXHRError_.bind(this));
				client.open("GET", this.src_);
				client.send();
			}
		}
	}
	/**
	* @private
	* @param {Event} event The load event.
	*/
	onXHRLoad_(event) {
		const client = event.target;
		if (!client.status || client.status >= 200 && client.status < 300) {
			let response;
			try {
				response = JSON.parse(client.responseText);
			} catch {
				this.handleError_();
				return;
			}
			this.handleLoad_(response);
		} else this.handleError_();
	}
	/**
	* @private
	* @param {Event} event The error event.
	*/
	onXHRError_(event) {
		this.handleError_();
	}
	/**
	* @override
	*/
	load() {
		if (this.preemptive_) this.loadInternal_();
		else this.setState(TileState_default.EMPTY);
	}
};
/**
* @typedef {Object} Options
* @property {boolean} [preemptive=true]
* If `true` the UTFGrid source loads the tiles based on their "visibility".
* This improves the speed of response, but increases traffic.
* Note that if set to `false` (lazy loading), you need to pass `true` as
* `request` to the `forDataAtCoordinateAndResolution` method otherwise no
* data will ever be loaded.
* @property {boolean} [jsonp=false] Use JSONP with callback to load the TileJSON.
* Useful when the server does not support CORS..
* @property {import("./TileJSON.js").Config} [tileJSON] TileJSON configuration for this source.
* If not provided, `url` must be configured.
* @property {string} [url] TileJSON endpoint that provides the configuration for this source.
* Request will be made through JSONP. If not provided, `tileJSON` must be configured.
* @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
* @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
* Choose whether to use tiles with a higher or lower zoom level when between integer
* zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
*/
/**
* @classdesc
* Layer source for UTFGrid interaction data loaded from TileJSON format.
* @api
*/
var UTFGrid = class extends TileSource {
	/**
	* @param {Options} options Source options.
	*/
	constructor(options) {
		super({
			projection: get("EPSG:3857") ?? void 0,
			state: "loading",
			wrapX: options.wrapX !== void 0 ? options.wrapX : true,
			zDirection: options.zDirection
		});
		/**
		* @private
		* @type {boolean}
		*/
		this.preemptive_ = options.preemptive !== void 0 ? options.preemptive : true;
		/**
		* @private
		* @type {!import("../Tile.js").UrlFunction}
		*/
		this.tileUrlFunction_ = nullTileUrlFunction;
		/**
		* @private
		* @type {string|undefined}
		*/
		this.template_ = void 0;
		/**
		* @private
		* @type {boolean}
		*/
		this.jsonp_ = options.jsonp || false;
		/**
		* @private
		* @type {LRUCache<CustomTile>}
		*/
		this.tileCache_ = new LRUCache(512);
		if (options.url) if (this.jsonp_) jsonp(options.url, this.handleTileJSONResponse.bind(this), this.handleTileJSONError.bind(this));
		else {
			const client = new XMLHttpRequest();
			client.addEventListener("load", this.onXHRLoad_.bind(this));
			client.addEventListener("error", this.onXHRError_.bind(this));
			client.open("GET", options.url);
			client.send();
		}
		else if (options.tileJSON) this.handleTileJSONResponse(options.tileJSON);
		else throw new Error("Either `url` or `tileJSON` options must be provided");
	}
	/**
	* @private
	* @param {Event} event The load event.
	*/
	onXHRLoad_(event) {
		const client = event.target;
		if (!client.status || client.status >= 200 && client.status < 300) {
			let response;
			try {
				response = JSON.parse(client.responseText);
			} catch {
				this.handleTileJSONError();
				return;
			}
			this.handleTileJSONResponse(response);
		} else this.handleTileJSONError();
	}
	/**
	* @private
	* @param {Event} event The error event.
	*/
	onXHRError_(event) {
		this.handleTileJSONError();
	}
	/**
	* Return the template from TileJSON.
	* @return {string|undefined} The template from TileJSON.
	* @api
	*/
	getTemplate() {
		return this.template_;
	}
	/**
	* Calls the callback (synchronously by default) with the available data
	* for given coordinate and resolution (or `null` if not yet loaded or
	* in case of an error).
	* @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
	* @param {number} resolution Resolution.
	* @param {function(*): void} callback Callback.
	* @param {boolean} [request] If `true` the callback is always async.
	*                               The tile data is requested if not yet loaded.
	* @api
	*/
	forDataAtCoordinateAndResolution(coordinate, resolution, callback, request) {
		if (this.tileGrid) {
			const z = this.tileGrid.getZForResolution(resolution, this.zDirection);
			const tileCoord = this.tileGrid.getTileCoordForCoordAndZ(coordinate, z);
			const tile = this.getTile(tileCoord[0], tileCoord[1], tileCoord[2], 1, this.getProjection());
			if (tile.getState() == TileState_default.IDLE) tile.load();
			tile.forDataAtCoordinate(coordinate, callback, request);
		} else if (request === true) setTimeout(function() {
			callback(null);
		}, 0);
		else callback(null);
	}
	/**
	* @protected
	*/
	handleTileJSONError() {
		this.setState("error");
	}
	/**
	* TODO: very similar to ol/source/TileJSON#handleTileJSONResponse
	* @protected
	* @param {import("./TileJSON.js").Config} tileJSON Tile JSON.
	*/
	handleTileJSONResponse(tileJSON) {
		const epsg4326Projection = get("EPSG:4326");
		const sourceProjection = this.getProjection();
		let extent;
		if (tileJSON["bounds"] !== void 0) {
			const transform = getTransformFromProjections(epsg4326Projection, sourceProjection);
			extent = applyTransform(tileJSON["bounds"], transform);
		}
		const gridExtent = extentFromProjection(sourceProjection);
		const minZoom = tileJSON["minzoom"] || 0;
		const tileGrid = createXYZ({
			extent: gridExtent,
			maxZoom: tileJSON["maxzoom"] || 22,
			minZoom
		});
		this.tileGrid = tileGrid;
		this.template_ = tileJSON["template"];
		const grids = tileJSON["grids"];
		if (!grids) {
			this.setState("error");
			return;
		}
		this.tileUrlFunction_ = createFromTemplates(grids, tileGrid);
		if (tileJSON["attribution"]) {
			const attributionExtent = extent !== void 0 ? extent : gridExtent;
			this.setAttributions((function(frameState) {
				if (intersects(attributionExtent, frameState.extent)) return [tileJSON["attribution"]];
				return null;
			}));
		}
		this.setState("ready");
	}
	/**
	* @param {number} z Tile coordinate z.
	* @param {number} x Tile coordinate x.
	* @param {number} y Tile coordinate y.
	* @param {number} pixelRatio Pixel ratio.
	* @param {import("../proj/Projection.js").default} projection Projection.
	* @return {!CustomTile} Tile.
	* @override
	*/
	getTile(z, x, y, pixelRatio, projection) {
		const tileCoord = [
			z,
			x,
			y
		];
		const urlTileCoord = this.getTileCoordForTileUrlFunction(tileCoord, projection);
		if (!urlTileCoord) return new CustomTile(
			tileCoord,
			TileState_default.EMPTY,
			"",
			/** @type {import("../tilegrid/TileGrid.js").default} */
			this.tileGrid.getTileCoordExtent(tileCoord),
			this.preemptive_,
			this.jsonp_
		);
		const tileUrl = this.tileUrlFunction_(urlTileCoord, pixelRatio, projection);
		const tileKey = `${this.getKey()},${getKeyZXY(z, x, y)}`;
		if (this.tileCache_.containsKey(tileKey)) return this.tileCache_.get(tileKey);
		this.tileCache_.expireCache();
		const tileGrid = this.tileGrid;
		const tile = new CustomTile(tileCoord, tileUrl !== void 0 ? TileState_default.IDLE : TileState_default.EMPTY, tileUrl !== void 0 ? tileUrl : "", tileGrid.getTileCoordExtent(tileCoord), this.preemptive_, this.jsonp_);
		this.tileCache_.set(tileKey, tile);
		return tile;
	}
};
//#endregion
//#region examples/utfgrid.js
var mapLayer = new TileLayer({ source: new TileJSON({ url: "https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ" }) });
var gridSource = new UTFGrid({ url: "https://api.tiles.mapbox.com/v4/mapbox.geography-class.json?secure&access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ" });
var gridLayer = new TileLayer({ source: gridSource });
var view = new View({
	center: [0, 0],
	zoom: 1
});
var mapElement = document.getElementById("map");
var map = new Map({
	layers: [mapLayer, gridLayer],
	target: mapElement,
	view
});
var infoElement = document.getElementById("country-info");
var flagElement = document.getElementById("country-flag");
var nameElement = document.getElementById("country-name");
var infoOverlay = new Overlay({
	element: infoElement,
	offset: [15, 15],
	stopEvent: false
});
map.addOverlay(infoOverlay);
var displayCountryInfo = function(coordinate) {
	const viewResolution = view.getResolution();
	gridSource.forDataAtCoordinateAndResolution(coordinate, viewResolution, function(data) {
		mapElement.style.cursor = data ? "pointer" : "";
		if (data) {
			flagElement.src = "data:image/png;base64," + data["flag_png"];
			nameElement.innerHTML = data["admin"];
		}
		infoOverlay.setPosition(data ? coordinate : void 0);
	});
};
map.on("pointermove", function(evt) {
	if (evt.dragging) return;
	displayCountryInfo(map.getEventCoordinate(evt.originalEvent));
});
map.on("click", function(evt) {
	displayCountryInfo(evt.coordinate);
});
//#endregion

//# sourceMappingURL=utfgrid.js.map