import { $n as VectorLayer, Ar as Style, Dr as Map, Ki as Point, Ni as View, Nr as Icon, Un as VectorSource, rr as Feature, yr as TileLayer } from "./common.js";
import { t as StadiaMaps } from "./StadiaMaps.js";
import { t as Select } from "./Select.js";
//#region examples/icon-negative.js
/**
* 创建图标样式的工厂函数
* @param {string|undefined} src 图标图片 URL（与 img 二选一）
* @param {HTMLImageElement|HTMLCanvasElement|undefined} img 已加载的 Image 或离屏 Canvas 元素（与 src 二选一）
* @return {Style} OpenLayers 样式实例
*/
function createStyle(src, img) {
	return new Style({ image: new Icon({
		anchor: [.5, .96],
		crossOrigin: "anonymous",
		src,
		img
	}) });
}
var iconFeature = new Feature(new Point([0, 0]));
iconFeature.set("style", createStyle("data/icon.png", void 0));
var map = new Map({
	layers: [new TileLayer({ source: new StadiaMaps({ layer: "stamen_watercolor" }) }), new VectorLayer({
		style: function(feature) {
			return feature.get("style");
		},
		source: new VectorSource({ features: [iconFeature] })
	})],
	target: document.getElementById("map"),
	view: new View({
		center: [0, 0],
		zoom: 3
	})
});
var selectStyle = {};
var select = new Select({ style: function(feature) {
	const image = feature.get("style").getImage().getImage();
	if (!selectStyle[image.src]) {
		const canvas = document.createElement("canvas");
		const context = canvas.getContext("2d");
		canvas.width = image.width;
		canvas.height = image.height;
		context.drawImage(image, 0, 0, image.width, image.height);
		const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
		const data = imageData.data;
		for (let i = 0, ii = data.length; i < ii; i = i + (i % 4 == 2 ? 2 : 1)) data[i] = 255 - data[i];
		context.putImageData(imageData, 0, 0);
		selectStyle[image.src] = createStyle(void 0, canvas);
	}
	return selectStyle[image.src];
} });
map.addInteraction(select);
map.on("pointermove", function(evt) {
	map.getTargetElement().style.cursor = map.hasFeatureAtPixel(evt.pixel) ? "pointer" : "";
});
//#endregion

//# sourceMappingURL=icon-negative.js.map