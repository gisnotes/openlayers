import { Bt as MVT, Dr as Map, Ni as View, zt as VectorTileLayer } from "./common.js";
import { t as OGCVectorTile } from "./OGCVectorTile.js";
//#region examples/ogc-vector-tiles.js
new Map({
	target: "map",
	layers: [new VectorTileLayer({
		source: new OGCVectorTile({
			url: "https://maps.gnosis.earth/ogcapi/collections/NaturalEarth:cultural:ne_10m_admin_0_countries/tiles/WebMercatorQuad",
			format: new MVT()
		}),
		background: "#d1d1d1",
		style: {
			"stroke-width": .6,
			"stroke-color": "#8c8b8b",
			"fill-color": "#f7f7e9"
		}
	})],
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
//#endregion

//# sourceMappingURL=ogc-vector-tiles.js.map