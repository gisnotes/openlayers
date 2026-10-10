import { $ as GeoTIFFSource, Cr as LRUCache, Dr as Map, Ni as View, at as WebGLTileLayer, vo as getIntersection, vr as TileGrid } from "./common.js";
//#region src/ol/source.js
/**
* @module ol/source
*/
/**
* Creates a sources function from a tile grid. This function can be used as value for the
* `sources` property of the {@link module:ol/layer/Layer~Layer} subclasses that support it.
* @param {import("./tilegrid/TileGrid.js").default} tileGrid Tile grid.
* @param {function(import("./tilecoord.js").TileCoord): import("./source/Source.js").default} factory Source factory.
* This function takes a {@link module:ol/tilecoord~TileCoord} as argument and is expected to return a
* {@link module:ol/source/Source~Source}. **Note**: The returned sources should have a tile grid with
* a limited set of resolutions, matching the resolution range of a single zoom level of the pyramid
* `tileGrid` that `sourcesFromTileGrid` was called with.
* @return {function(import("./extent.js").Extent, number): Array<import("./source/Source.js").default>} Sources function.
* @api
*/
function sourcesFromTileGrid(tileGrid, factory) {
	const sourceCache = new LRUCache(32);
	const tileGridExtent = tileGrid.getExtent();
	return function(extent, resolution) {
		sourceCache.expireCache();
		if (tileGridExtent) extent = getIntersection(tileGridExtent, extent);
		const z = tileGrid.getZForResolution(resolution);
		/** @type {Array<import("./source/Source.js").default>} */
		const wantedSources = [];
		tileGrid.forEachTileCoord(extent, z, (tileCoord) => {
			const key = tileCoord.toString();
			if (!sourceCache.containsKey(key)) {
				const source = factory(tileCoord);
				sourceCache.set(key, source);
			}
			wantedSources.push(sourceCache.get(key));
		});
		return wantedSources;
	};
}
//#endregion
//#region examples/cog-pyramid.js
new Map({
	target: "map",
	layers: [new WebGLTileLayer({ sources: sourcesFromTileGrid(new TileGrid({
		extent: [
			-180,
			-90,
			180,
			90
		],
		resolutions: [
			.703125,
			.3515625,
			.17578125,
			.087890625,
			.0439453125
		],
		tileSizes: [
			[512, 256],
			[1024, 512],
			[2048, 1024],
			[4096, 2048],
			[4096, 4096]
		]
	}), ([z, x, y]) => new GeoTIFFSource({ sources: [{ url: `https://cloudlessdownloads.eox.at/api/public/dl/jvu06wnt/STACTA-TileDirectory-2025-viewing-basic-epsg-4326-zoom-6-0/${z}/${y}/${x}.tif` }] })) })],
	view: new View({
		projection: "EPSG:4326",
		center: [0, 0],
		zoom: 0,
		showFullExtent: true
	})
});
//#endregion

//# sourceMappingURL=cog-pyramid.js.map