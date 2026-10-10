import { A as applyStyle, Dr as Map, Ni as View, Rt as VectorTile, Y as proj4, ha as fromLonLat, k as applyBackground, mr as createXYZ, nt as register, zt as VectorTileLayer } from "./common.js";
//#region examples/vector-tiles-reprojected.js
proj4.defs("ESRI:102017", "+proj=laea +lat_0=90 +lon_0=0 +x_0=0 +y_0=0 +datum=WGS84 +units=m +no_defs +type=crs");
register(proj4);
var url = "https://api.maptiler.com/maps/basic-4326/style.json?key=EPhPi7Zr1GTS500UybLu";
var layer = new VectorTileLayer({
	declutter: true,
	source: new VectorTile({
		projection: "EPSG:4326",
		tileGrid: createXYZ({
			extent: [
				-180,
				-90,
				180,
				90
			],
			tileSize: 512,
			maxResolution: 180 / 512,
			maxZoom: 13
		})
	})
});
applyStyle(layer, url);
applyBackground(layer, url);
new Map({
	target: "map",
	layers: [layer],
	view: new View({
		projection: "ESRI:102017",
		minZoom: 3,
		zoom: 4,
		center: fromLonLat([0, 90], "ESRI:102017")
	})
});
//#endregion

//# sourceMappingURL=vector-tiles-reprojected.js.map