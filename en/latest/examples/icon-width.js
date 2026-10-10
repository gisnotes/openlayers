import { $n as VectorLayer, Ar as Style, Dr as Map, Ki as Point, Ni as View, Nr as Icon, Un as VectorSource, rr as Feature } from "./common.js";
//#region examples/icon-width.js
var widthInput = document.getElementById("width-input");
var heightInput = document.getElementById("height-input");
var clearWidthButton = document.getElementById("clear-width-button");
var clearHeightButton = document.getElementById("clear-height-button");
var scaleSpan = document.getElementById("scale");
var iconFeature = new Feature({
	geometry: new Point([0, 0]),
	name: "Null Island",
	population: 4e3,
	rainfall: 500
});
var iconStyle = new Style({ image: new Icon({
	src: "data/icon.png",
	width: Number(widthInput.value),
	height: Number(heightInput.value)
}) });
iconFeature.setStyle(iconStyle);
widthInput.addEventListener("input", (event) => {
	const currentIcon = iconStyle.getImage();
	iconStyle.setImage(new Icon({
		src: "data/icon.png",
		width: Number(event.target.value),
		height: currentIcon.getHeight()
	}));
	iconFeature.setStyle(iconStyle);
});
heightInput.addEventListener("input", (event) => {
	const currentIcon = iconStyle.getImage();
	iconStyle.setImage(new Icon({
		src: "data/icon.png",
		height: Number(event.target.value),
		width: currentIcon.getWidth()
	}));
	iconFeature.setStyle(iconStyle);
});
clearWidthButton.addEventListener("click", () => {
	const currentIcon = iconStyle.getImage();
	iconStyle.setImage(new Icon({
		src: "data/icon.png",
		height: currentIcon.getHeight()
	}));
	iconFeature.setStyle(iconStyle);
	widthInput.value = String(Math.round(iconStyle.getImage().getWidth()));
	scaleSpan.innerText = formatScale(iconStyle.getImage().getScale());
	iconFeature.setStyle(iconStyle);
});
clearHeightButton.addEventListener("click", () => {
	const currentIcon = iconStyle.getImage();
	iconStyle.setImage(new Icon({
		src: "data/icon.png",
		width: currentIcon.getWidth()
	}));
	iconFeature.setStyle(iconStyle);
	heightInput.value = String(Math.round(iconStyle.getImage().getHeight()));
	iconFeature.setStyle(iconStyle);
});
new Map({
	layers: [new VectorLayer({ source: new VectorSource({ features: [iconFeature] }) })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 3
	})
}).on("rendercomplete", () => scaleSpan.innerText = formatScale(iconStyle.getImage().getScale()));
/**
* 格式化 scale 缩放比例（支持单数值或 [scaleX, scaleY] 二元数组，保留两位小数）
* @param {number|Array<number>|undefined} scale 图标缩放比例
* @return {string|number|undefined} 格式化后的字符串
*/
function formatScale(scale) {
	return Array.isArray(scale) ? "[" + scale?.map((v) => v.toFixed(2)).join(", ") + "]" : scale;
}
//#endregion

//# sourceMappingURL=icon-width.js.map