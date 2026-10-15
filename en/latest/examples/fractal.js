import { $n as VectorLayer, Dr as Map, Ni as View, Un as VectorSource, Xn as LineString, rr as Feature } from "./common.js";
//#region examples/fractal.js
var radius = 1e7;
var cos30 = Math.cos(Math.PI / 6);
var rise = radius * Math.sin(Math.PI / 6);
var run = radius * cos30;
var triangle = new LineString([
	[0, radius],
	[run, -rise],
	[-run, -rise],
	[0, radius]
]);
var feature = new Feature(triangle);
new Map({
	layers: [new VectorLayer({ source: new VectorSource({ features: [feature] }) })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 1
	})
});
/**
* Generate Koch Snowflake fractal recursively to specified depth
* 递归生成指定深度的科赫雪花分形折线几何
* @param {number} depth Recursion depth level / 递归深度层级
*/
function makeFractal(depth) {
	const geometry = triangle.clone();
	const graph = coordsToGraph(geometry.getCoordinates());
	for (let i = 0; i < depth; ++i) {
		let node = graph;
		while (node.next) {
			const next = node.next;
			injectNodes(node);
			node = next;
		}
	}
	const coordinates = graphToCoords(graph);
	document.getElementById("count").innerText = String(coordinates.length);
	geometry.setCoordinates(coordinates);
	feature.setGeometry(geometry);
}
/**
* Inject 3 subdivision nodes into a segment in linked list to form the _/\_ peak
* 在单向链表的当前线段中间插入 3 个细分节点构成 _/\_ 凸起三角形
* @param {Object} startNode Start node of the segment / 线段起始节点
*/
function injectNodes(startNode) {
	const endNode = startNode.next;
	const start = startNode.point;
	const end = startNode.next.point;
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];
	const firstNode = { point: [start[0] + dx / 3, start[1] + dy / 3] };
	const r = Math.sqrt(dx * dx + dy * dy) / (2 * cos30);
	const a = Math.atan2(dy, dx) + Math.PI / 6;
	const secondNode = { point: [start[0] + r * Math.cos(a), start[1] + r * Math.sin(a)] };
	const thirdNode = { point: [end[0] - dx / 3, end[1] - dy / 3] };
	startNode.next = firstNode;
	firstNode.next = secondNode;
	secondNode.next = thirdNode;
	thirdNode.next = endNode;
}
/**
* Convert coordinate array to a singly-linked list for O(1) node insertion
* 将坐标数组转换为单向链表，以支持 O(1) 复杂度的常数级节点插入
* @param {Array<Array<number>>} coordinates Coordinates / 坐标数组
* @return {Object} Head node of linked list / 链表头节点
*/
function coordsToGraph(coordinates) {
	const graph = { point: coordinates[0] };
	const length = coordinates.length;
	for (let level = 0, node = graph; level < length - 1; ++level) {
		node.next = { point: coordinates[level + 1] };
		node = node.next;
	}
	return graph;
}
/**
* Convert singly-linked list back into coordinate array
* 将单向链表逆向还原为平整的坐标数组
* @param {Object} graph Head node of linked list / 链表头节点
* @return {Array<Array<number>>} Coordinates / 坐标数组
*/
function graphToCoords(graph) {
	const coordinates = [graph.point];
	for (let node = graph, i = 1; node.next; node = node.next, ++i) coordinates[i] = node.next.point;
	return coordinates;
}
var depthInput = document.getElementById("depth");
function update() {
	makeFractal(Number(depthInput.value));
}
var updateTimer;
/**
* Regenerate fractal on depth change with 200ms debounce
* 滑块变动时以 200ms 防抖机制重新生成分形几何，防止阻塞主线程
*/
depthInput.onchange = function() {
	window.clearTimeout(updateTimer);
	updateTimer = window.setTimeout(update, 200);
};
update();
//#endregion

//# sourceMappingURL=fractal.js.map