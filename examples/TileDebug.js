import { An as DataTileSource, Ci as createCanvasContext2D, Yr as toSize, kn as ImageTileSource, pr as renderXYZTemplate, ts as EventType_default, va as get } from "./common.js";
//#region src/ol/source/TileDebug.js
/**
* @module ol/source/TileDebug
*/
/**
* @typedef {Object} Options
* @property {import("../proj.js").ProjectionLike} [projection='EPSG:3857'] Optional projection.
* @property {import("../tilegrid/TileGrid.js").default} [tileGrid] Tile grid.
* @property {boolean} [wrapX=true] Whether to wrap the world horizontally.
* @property {number|import("../array.js").NearestDirectionFunction} [zDirection=0]
* Set to `1` when debugging `VectorTile` sources with a default configuration.
* Choose whether to use tiles with a higher or lower zoom level when between integer
* zoom levels. See {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution}.
* @property {import("./Tile.js").default} [source] Tile source.
* This allows `projection`, `tileGrid`, `wrapX` and `zDirection` to be copied from another source.
* If both `source` and individual options are specified the individual options will have precedence.
* @property {string} [template='z:{z} x:{x} y:{y}'] Template for labeling the tiles.
* Should include `{x}`, `{y}` or `{-y}`, and `{z}` placeholders.
* @property {string} [color='grey'] CSS color to fill text and stroke grid lines of each tile.
*/
/**
* @classdesc
* A pseudo tile source, which does not fetch tiles from a server, but renders
* a grid outline for the tile grid/projection along with the coordinates for
* each tile. See examples/canvas-tiles for an example.
* @api
*/
var TileDebug = class extends ImageTileSource {
	/**
	* @param {Options} [options] Debug tile options.
	*/
	constructor(options) {
		/**
		* @type {Options}
		*/
		options = options || {};
		const template = options.template || "z:{z} x:{x} y:{y}";
		const source = options.source;
		const color = options.color || "grey";
		super({
			transition: 0,
			wrapX: options.wrapX !== void 0 ? options.wrapX : source !== void 0 ? source.getWrapX() : void 0
		});
		const setReady = () => {
			this.projection = options.projection !== void 0 ? get(options.projection) : source !== void 0 ? source.getProjection() : this.projection;
			this.tileGrid = options.tileGrid !== void 0 ? options.tileGrid : source !== void 0 ? source.getTileGrid() : this.tileGrid;
			this.zDirection = options.zDirection !== void 0 ? options.zDirection : source !== void 0 ? source.zDirection : this.zDirection;
			if (source instanceof DataTileSource) this.transformMatrix = source.transformMatrix?.slice() || null;
			const tileGrid = this.tileGrid;
			if (tileGrid) this.setTileSizes(tileGrid.getResolutions().map((r, i) => toSize(tileGrid.getTileSize(i)).map((s) => Math.max(Math.floor(s), 1))));
			this.setLoader((z, x, y, loaderOptions) => {
				const text = renderXYZTemplate(template, z, x, y, loaderOptions.maxY);
				const [width, height] = this.getTileSize(z);
				const context = createCanvasContext2D(width, height);
				context.strokeStyle = color;
				context.strokeRect(.5, .5, width + .5, height + .5);
				context.fillStyle = color;
				context.strokeStyle = "white";
				context.textAlign = "center";
				context.textBaseline = "middle";
				context.font = "24px sans-serif";
				context.lineWidth = 4;
				context.strokeText(text, width / 2, height / 2, width);
				context.fillText(text, width / 2, height / 2, width);
				return Promise.resolve(context.canvas);
			});
			this.setState("ready");
		};
		if (source === void 0 || source.getState() === "ready") setReady();
		else {
			const handler = () => {
				if (source.getState() === "ready") {
					source.removeEventListener(EventType_default.CHANGE, handler);
					setReady();
				}
			};
			source.addEventListener(EventType_default.CHANGE, handler);
		}
	}
};
//#endregion
export { TileDebug as t };

//# sourceMappingURL=TileDebug.js.map