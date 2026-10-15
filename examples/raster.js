import { Dr as Map, I as max, M as select_default, Ni as View, Vn as ImageLayer, X as RasterSource, c as linear, kn as ImageTileSource, yr as TileLayer } from "./common.js";
//#region examples/raster.js
var minVgi = 0;
var maxVgi = .5;
var bins = 10;
/**
* Calculate the Vegetation Greenness Index (VGI) from an input pixel.
* 从输入像素计算植被绿度指数 (VGI)，基于地表反射率近似假定
* @param {Array<number>} pixel An array of [R, G, B, A] values. / 像素四通道值
* @return {number} The VGI value for the given pixel. / 像素对应的 VGI 指数值
*/
function vgi(pixel) {
	const r = pixel[0] / 255;
	const g = pixel[1] / 255;
	const b = pixel[2] / 255;
	return (2 * g - r - b) / (2 * g + r + b);
}
/**
* Summarize values for a histogram. / 将 VGI 指数值归入直方图分箱统计中
* @param {number} value A VGI value. / 待统计的 VGI 指数值
* @param {Object} counts An object for keeping track of VGI counts. / 统计容器对象
*/
function summarize(value, counts) {
	const min = counts.min;
	const max = counts.max;
	const num = counts.values.length;
	if (value < min) {} else if (value >= max) counts.values[num - 1] += 1;
	else {
		const index = Math.floor((value - min) / counts.delta);
		counts.values[index] += 1;
	}
}
var aerial = new ImageTileSource({
	attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
	url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
	tileSize: 512,
	maxZoom: 20,
	crossOrigin: ""
});
/**
* Raster source executing VGI operation and threshold coloring in Web Worker.
* 在 Web Worker 中执行 VGI 运算与阈值着色的光栅数据源
*/
var raster = new RasterSource({
	sources: [aerial],
	/**
	* Run calculations on pixel data. / 逐像素运算核心执行函数
	* @param {Array<Array<number>>} pixels List of pixels (one per source). / 各输入源像素列表
	* @param {Object} data User data object passed from beforeoperations. / 用户上下文数据
	* @return {Array<number>} The output pixel. / 运算后输出的像素四通道值
	*/
	operation: function(pixels, data) {
		const pixel = pixels[0];
		const value = vgi(pixel);
		summarize(value, data.counts);
		if (value >= data.threshold) {
			pixel[0] = 0;
			pixel[1] = 255;
			pixel[2] = 0;
			pixel[3] = 128;
		} else pixel[3] = 0;
		return pixel;
	},
	lib: {
		vgi,
		summarize
	}
});
raster.set("threshold", .25);
/**
* Create histogram counting structure. / 创建直方图统计数据结构
* @param {number} min Minimum value / 最小值
* @param {number} max Maximum value / 最大值
* @param {number} num Number of bins / 分箱数量
* @return {Object} Counts container / 统计结构对象
*/
function createCounts(min, max, num) {
	const values = new Array(num);
	for (let i = 0; i < num; ++i) values[i] = 0;
	return {
		min,
		max,
		values,
		delta: (max - min) / num
	};
}
raster.on("beforeoperations", function(event) {
	event.data.counts = createCounts(minVgi, maxVgi, bins);
	event.data.threshold = raster.get("threshold");
});
raster.on("afteroperations", function(event) {
	schedulePlot(event.resolution, event.data.counts, event.data.threshold);
});
new Map({
	layers: [new TileLayer({ source: aerial }), new ImageLayer({ source: raster })],
	target: "map",
	view: new View({
		center: [-9651695, 4937351],
		zoom: 13,
		minZoom: 12,
		maxZoom: 19
	})
});
var timer = null;
/**
* Throttled plotting scheduler. / 节流调度直方图重绘以避免高频更新阻塞
* @param {number} resolution View resolution / 视图分辨率
* @param {Object} counts Histogram counts / 直方图统计数据
* @param {number} threshold Current VGI threshold / 当前阈值
*/
function schedulePlot(resolution, counts, threshold) {
	if (timer) {
		clearTimeout(timer);
		timer = null;
	}
	timer = setTimeout(plot.bind(null, resolution, counts, threshold), 1e3 / 60);
}
var barWidth = 15;
var plotHeight = 150;
var chart = select_default("#plot").append("svg").attr("width", barWidth * bins).attr("height", plotHeight);
var chartRect = chart.node().getBoundingClientRect();
var tip = select_default(document.body).append("div").attr("class", "tip");
/**
* Render D3 SVG histogram and bind interactive threshold drag/hover.
* 渲染 D3 SVG 直方图并绑定柱条悬停动态调整阈值与面积气泡提示
* @param {number} resolution View resolution / 视图分辨率
* @param {Object} counts Histogram counts / 直方图统计数据
* @param {number} threshold Current VGI threshold / 当前阈值
*/
function plot(resolution, counts, threshold) {
	const yScale = linear().domain([0, max(counts.values)]).range([0, plotHeight]);
	const bar = chart.selectAll("rect").data(counts.values);
	bar.enter().append("rect");
	bar.attr("class", function(count, index) {
		return "bar" + (counts.min + index * counts.delta >= threshold ? " selected" : "");
	}).attr("width", barWidth - 2);
	bar.transition().attr("transform", function(value, index) {
		return "translate(" + index * barWidth + ", " + (plotHeight - yScale(value)) + ")";
	}).attr("height", yScale);
	bar.on("mousemove", function() {
		const index = bar.nodes().indexOf(this);
		const threshold = counts.min + index * counts.delta;
		if (raster.get("threshold") !== threshold) {
			raster.set("threshold", threshold);
			raster.changed();
		}
	});
	bar.on("mouseover", function(event) {
		const index = bar.nodes().indexOf(this);
		let area = 0;
		for (let i = counts.values.length - 1; i >= index; --i) area += resolution * resolution * counts.values[i];
		tip.html(message(counts.min + index * counts.delta, area));
		tip.style("display", "block");
		tip.transition().style("left", chartRect.left + index * barWidth + barWidth / 2 + "px").style("top", event.y - 60 + "px").style("opacity", 1);
	});
	bar.on("mouseout", function() {
		tip.transition().style("opacity", 0).on("end", function() {
			tip.style("display", "none");
		});
	});
}
/**
* Format tooltip text with commas for thousands. / 格式化提示框英亩面积与千分位
* @param {number} value VGI threshold / VGI 阈值
* @param {number} area Area in square meters / 面积（平方米）
* @return {string} Formatted HTML string / 格式化后的 HTML 内容
*/
function message(value, area) {
	return (area / 4046.86).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " acres at<br>" + value.toFixed(2) + " VGI or above";
}
//#endregion

//# sourceMappingURL=raster.js.map