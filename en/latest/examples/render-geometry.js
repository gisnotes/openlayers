import { Ar as Style, Fr as CircleStyle, Ki as Point, Mr as Stroke, Pr as Fill, Xn as LineString, zi as Polygon } from "./common.js";
import { r as toContext } from "./render.js";
//#region examples/render-geometry.js
var vectorContext = toContext(document.getElementById("canvas").getContext("2d"), { size: [100, 100] });
var fill = new Fill({ color: "blue" });
var stroke = new Stroke({ color: "black" });
var style = new Style({
	fill,
	stroke,
	image: new CircleStyle({
		radius: 10,
		fill,
		stroke
	})
});
vectorContext.setStyle(style);
vectorContext.drawGeometry(new LineString([[10, 10], [90, 90]]));
vectorContext.drawGeometry(new Polygon([[
	[2, 2],
	[98, 2],
	[2, 98],
	[2, 2]
]]));
vectorContext.drawGeometry(new Point([88, 88]));
//#endregion

//# sourceMappingURL=render-geometry.js.map