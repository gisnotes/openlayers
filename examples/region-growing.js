import { Dr as Map, Ni as View, Vn as ImageLayer, X as RasterSource, ha as fromLonLat, kn as ImageTileSource, yr as TileLayer } from "./common.js";
//#region examples/region-growing.js
/**
* Region growing segmentation algorithm running as an image operation in Web Worker.
* 在 Web Worker 线程中运行的整图级区域生长空间分割算法
* @param {Array<ImageData>} inputs Input images / 输入图像数据数组
* @param {Object} data Context data from beforeoperations / 外部注入的上下文参数
* @return {ImageData|Object} Output image with segmented region highlighted / 标记高亮后的输出图像
*/
function growRegion(inputs, data) {
	const image = inputs[0];
	let seed = data.pixel;
	const delta = parseInt(data.delta, 10);
	if (!seed) return image;
	seed = seed.map(Math.round);
	const width = image.width;
	const height = image.height;
	const inputData = image.data;
	const outputData = new Uint8ClampedArray(inputData);
	const seedIdx = (seed[1] * width + seed[0]) * 4;
	const seedR = inputData[seedIdx];
	const seedG = inputData[seedIdx + 1];
	const seedB = inputData[seedIdx + 2];
	let edge = [seed];
	while (edge.length) {
		const newedge = [];
		for (let i = 0, ii = edge.length; i < ii; i++) {
			const next = next4Edges(edge[i]);
			for (let j = 0, jj = next.length; j < jj; j++) {
				const s = next[j][0];
				const t = next[j][1];
				if (s >= 0 && s < width && t >= 0 && t < height) {
					const ci = (t * width + s) * 4;
					const cr = inputData[ci];
					const cg = inputData[ci + 1];
					const cb = inputData[ci + 2];
					if (inputData[ci + 3] === 0) continue;
					if (Math.abs(seedR - cr) < delta && Math.abs(seedG - cg) < delta && Math.abs(seedB - cb) < delta) {
						outputData[ci] = 255;
						outputData[ci + 1] = 0;
						outputData[ci + 2] = 0;
						outputData[ci + 3] = 255;
						newedge.push([s, t]);
					}
					inputData[ci + 3] = 0;
				}
			}
		}
		edge = newedge;
	}
	return {
		data: outputData,
		width,
		height
	};
}
/**
* Return 4-connected neighbor pixel coordinates.
* 获取当前像素上下左右 4-邻域连通坐标
* @param {Array<number>} edge Pixel coordinates [x, y] / 当前像素坐标
* @return {Array<Array<number>>} 4-connected neighbors / 四邻域坐标数组
*/
function next4Edges(edge) {
	const x = edge[0];
	const y = edge[1];
	return [
		[x + 1, y],
		[x - 1, y],
		[x, y + 1],
		[x, y - 1]
	];
}
var imagery = new TileLayer({ source: new ImageTileSource({
	attributions: "<a href=\"https://www.maptiler.com/copyright/\" target=\"_blank\">&copy; MapTiler</a> <a href=\"https://www.openstreetmap.org/copyright\" target=\"_blank\">&copy; OpenStreetMap contributors</a>",
	url: "https://api.maptiler.com/maps/satellite/{z}/{x}/{y}.jpg?key=EPhPi7Zr1GTS500UybLu",
	tileSize: 512,
	maxZoom: 20
}) });
var raster = new RasterSource({
	sources: [imagery.getSource()],
	operationType: "image",
	operation: growRegion,
	lib: { next4Edges }
});
var map = new Map({
	layers: [imagery, new ImageLayer({
		opacity: .7,
		source: raster
	})],
	target: "map",
	view: new View({
		center: fromLonLat([-119.07, 47.65]),
		zoom: 11
	})
});
var coordinate;
map.on("click", function(event) {
	coordinate = event.coordinate;
	raster.changed();
});
var thresholdControl = document.getElementById("threshold");
raster.on("beforeoperations", function(event) {
	const data = event.data;
	data.delta = thresholdControl.value;
	if (coordinate) data.pixel = map.getPixelFromCoordinate(coordinate);
});
function updateControlValue() {
	document.getElementById("threshold-value").innerText = thresholdControl.value;
}
updateControlValue();
thresholdControl.addEventListener("input", function() {
	updateControlValue();
	raster.changed();
});
//#endregion

//# sourceMappingURL=region-growing.js.map