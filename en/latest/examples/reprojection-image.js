import { Dr as Map, J as Static, Ni as View, Oa as transform, Vn as ImageLayer, Y as proj4, ho as getCenter, nt as register, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region examples/reprojection-image.js
proj4.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +towgs84=446.448,-125.157,542.06,0.15,0.247,0.842,-20.489 +units=m +no_defs");
register(proj4);
var imageExtent = [
	0,
	0,
	7e5,
	13e5
];
var imageLayer = new ImageLayer();
new Map({
	layers: [new TileLayer({ source: new OSM() }), imageLayer],
	target: "map",
	view: new View({
		center: transform(getCenter(imageExtent), "EPSG:27700", "EPSG:3857"),
		zoom: 4
	})
});
var interpolate = document.getElementById("interpolate");
function setSource() {
	const source = new Static({
		url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/British_National_Grid.svg/2000px-British_National_Grid.svg.png",
		crossOrigin: "",
		projection: "EPSG:27700",
		imageExtent,
		interpolate: interpolate.checked
	});
	imageLayer.setSource(source);
}
setSource();
interpolate.addEventListener("change", setSource);
//#endregion

//# sourceMappingURL=reprojection-image.js.map