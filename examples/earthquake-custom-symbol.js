import { $n as VectorLayer, Ar as Style, Bo as DEVICE_PIXEL_RATIO, Dr as Map, Mr as Stroke, Ni as View, Nr as Icon, Pr as Fill, Un as VectorSource, bo as getTopRight, po as getBottomLeft, yr as TileLayer, zi as Polygon } from "./common.js";
import { t as StadiaMaps } from "./StadiaMaps.js";
import { t as KML } from "./KML2.js";
import { r as toContext } from "./render.js";
//#region examples/earthquake-custom-symbol.js
/**
* 闭包函数：生成指定缩放比例和偏移量的不规则闪电多边形几何轮廓。
* 通过 IIFE（立即执行函数表达式）预先定义基础图形并执行一次旋转，
* 避免在渲染循环中重复创建和旋转多边形模板，提升运行效率。
*/
var getSymbolOutline = (function() {
	const path = [
		[0, 0],
		[4, 2],
		[6, 0],
		[10, 5],
		[6, 3],
		[4, 5],
		[0, 0]
	];
	const symbolOutline = new Polygon([path]);
	symbolOutline.rotate(1.2, path[0]);
	/**
	* @param {number} scale 几何体缩放倍数（与震级挂钩）
	* @param {number} offset 坐标内边距偏移量（通常取描边宽度的一半），防止绘制时边缘描边被画布裁剪
	* @return {Polygon} 缩放并平移归一化后的多边形几何对象
	*/
	return function(scale, offset) {
		const outline = symbolOutline.clone();
		outline.scale(scale, scale, path[0]);
		const origin = getBottomLeft(outline.getExtent());
		outline.translate(offset - origin[0], offset - origin[1]);
		return outline;
	};
})();
var styleCache = {};
var vector = new VectorLayer({
	source: new VectorSource({
		url: "data/kml/2012_Earthquakes_Mag5.kml",
		format: new KML({ extractStyles: false })
	}),
	/**
	* 动态样式回调函数
	* @param {import('../src/ol/Feature.js').default} feature 当前渲染的地震要素
	* @return {Style} 匹配该地震震级的图标样式
	*/
	style: function(feature) {
		const magnitude = feature.get("magnitude");
		let style = styleCache[magnitude];
		if (!style) {
			const scale = 1 + 4 * (magnitude - 5);
			const lineWidth = 2;
			const outline = getSymbolOutline(scale, Math.ceil(lineWidth / 2));
			const canvas = document.createElement("canvas");
			const vectorContext = toContext(canvas.getContext("2d"), {
				size: getTopRight(outline.getExtent()).map((n) => Math.ceil(n + lineWidth / 2)),
				pixelRatio: DEVICE_PIXEL_RATIO
			});
			vectorContext.setStyle(new Style({
				fill: new Fill({ color: "rgba(255, 153, 0, 0.4)" }),
				stroke: new Stroke({
					color: "rgba(255, 204, 0, 0.2)",
					width: 2
				})
			}));
			vectorContext.drawGeometry(outline);
			style = new Style({ image: new Icon({
				img: canvas,
				scale: 1 / DEVICE_PIXEL_RATIO
			}) });
			styleCache[magnitude] = style;
		}
		return style;
	}
});
function parseMagnitudeFromName(name) {
	return parseFloat(name.substr(2));
}
vector.getSource().on("featuresloadend", function(evt) {
	evt.features.forEach((f) => {
		f.set("magnitude", parseMagnitudeFromName(f.get("name")), true);
	});
});
new Map({
	layers: [new TileLayer({ source: new StadiaMaps({ layer: "stamen_toner" }) }), vector],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=earthquake-custom-symbol.js.map