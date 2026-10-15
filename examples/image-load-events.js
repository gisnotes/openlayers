import { Dr as Map, Ni as View, Vn as ImageLayer } from "./common.js";
import { t as ImageWMS } from "./ImageWMS.js";
//#region examples/image-load-events.js
/**
* Renders a progress bar. / 渲染并管理进度条状态的组件类
* @param {HTMLElement} el The target element. / 目标 DOM 容器元素
* @class
*/
function Progress(el) {
	this.el = el;
	this.loading = 0;
	this.loaded = 0;
}
/**
* Increment the count of loading tiles. / 递增加载中计数
*/
Progress.prototype.addLoading = function() {
	++this.loading;
	this.update();
};
/**
* Increment the count of loaded tiles. / 递增已完成（成功或失败）计数
*/
Progress.prototype.addLoaded = function() {
	++this.loaded;
	this.update();
};
/**
* Update the progress bar. / 更新进度条 DOM 宽度百分比
*/
Progress.prototype.update = function() {
	const width = (this.loaded / this.loading * 100).toFixed(1) + "%";
	this.el.style.width = width;
};
/**
* Show the progress bar. / 显示进度条
*/
Progress.prototype.show = function() {
	this.el.style.visibility = "visible";
};
/**
* Hide the progress bar. / 隐藏并重置进度条
*/
Progress.prototype.hide = function() {
	const style = this.el.style;
	setTimeout(function() {
		style.visibility = "hidden";
		style.width = "0px";
	}, 250);
};
var progress = new Progress(document.getElementById("progress"));
var source = new ImageWMS({
	url: "https://ahocevar.com/geoserver/wms",
	params: { "LAYERS": "topp:states" },
	serverType: "geoserver"
});
source.on("imageloadstart", function() {
	progress.addLoading();
});
source.on(["imageloadend", "imageloaderror"], function() {
	progress.addLoaded();
});
var map = new Map({
	layers: [new ImageLayer({ source })],
	target: "map",
	view: new View({
		center: [-10997148, 4569099],
		zoom: 4
	})
});
map.on("loadstart", function() {
	progress.show();
});
map.on("loadend", function() {
	progress.hide();
});
//#endregion

//# sourceMappingURL=image-load-events.js.map