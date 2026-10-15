import { Dr as Map, Fi as withExtentCenter, Ii as withHigherResolutions, Li as withLowerResolutions, Pi as getView, Ri as withZoom, at as WebGLTileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as GeoZarr } from "./GeoZarr2.js";
//#region examples/geozarr-storytelling.js
var urlSelect = document.getElementById("url-select");
var customUrl = document.getElementById("custom-url");
var loadButton = document.getElementById("load-url");
var groupCol = document.getElementById("group-col");
var groupSelect = document.getElementById("group-select");
var dimsContainer = document.getElementById("dims");
var errorBox = document.getElementById("error");
/**
* Show a non-fatal error message above the map.
* 在地图上方展示非致命错误提示信息。
* @param {Error} error The error to display.
*/
function showError(error) {
	errorBox.textContent = error.message || String(error);
	errorBox.style.display = "";
}
/**
* Clear any displayed error message.
* 清空并隐藏所有错误信息。
*/
function hideError() {
	errorBox.textContent = "";
	errorBox.style.display = "none";
}
var BANDS = ["vv", "vh"];
var COMPOSITE_RESCALE = {
	vv: [0, .4],
	vh: [0, .1],
	ratio: [1, 15]
};
var map;
var dataLayer;
var rootUrl = "";
var groupPath = "";
function getUrl() {
	return urlSelect.value === "custom" ? customUrl.value : urlSelect.value;
}
urlSelect.addEventListener("change", () => {
	const custom = urlSelect.value === "custom";
	customUrl.style.display = custom ? "" : "none";
	if (custom) customUrl.focus();
});
/**
* Current index selected in each dimension dropdown.
* 获取各个维度下拉框当前选中的索引字典。
* @return {Object<string, number>} The selected index per dimension name.
*/
function currentDimensions() {
	const dimensions = {};
	for (const select of dimsContainer.querySelectorAll("select")) dimensions[select.dataset.dim] = Number(select.value);
	return dimensions;
}
/**
* Convert a CF time value to milliseconds since the Unix epoch.
* 将符合 CF 约定格式的时间数值转换为自 Unix 纪元以来的毫秒时间戳。
* @param {number|bigint} value The encoded time value / 编码的时间数值
* @param {string} units A CF units string, e.g. `'nanoseconds since 1970-01-01'` / CF 规范单位字符串
* @return {number|null} Milliseconds since the epoch, or null if not decodable / 毫秒时间戳，解码失败返回 null
*/
function cfTimeToMs(value, units) {
	const match = /^\s*(\w+)\s+since\s+(.+?)\s*$/i.exec(units || "");
	if (!match) return null;
	const perUnitMs = {
		nanosecond: 1e-6,
		nanoseconds: 1e-6,
		microsecond: .001,
		microseconds: .001,
		millisecond: 1,
		milliseconds: 1,
		second: 1e3,
		seconds: 1e3,
		minute: 6e4,
		minutes: 6e4,
		hour: 36e5,
		hours: 36e5,
		day: 864e5,
		days: 864e5
	}[match[1].toLowerCase()];
	if (perUnitMs === void 0) return null;
	let refMs = Date.parse(match[2]);
	if (Number.isNaN(refMs)) refMs = Date.parse(`${match[2].replace(" ", "T")}Z`);
	if (Number.isNaN(refMs)) return null;
	return Number(value) * perUnitMs + refMs;
}
/**
* Read a dimension's coordinate values through the source and turn them into
* dropdown entries, decoding CF time to dates. Entries are sorted by value so
* the dropdown lists them in ascending (e.g. chronological) order even when the
* cube stores the slices unsorted. Falls back to the plain index when a value is
* missing (a dimension without a coordinate array).
* 读取指定维度的坐标数组值并转化为下拉选项，将 CF 时间解码为易读日期。
* @param {GeoZarr} source The source / 数据源
* @param {string} name The dimension name / 维度名称
* @param {number} size The dimension length / 维度长度
* @param {Object|null} attributes The dimension's coordinate array attributes / 维度属性字典
* @return {Promise<Array<{index: number, label: string}>>} Entries sorted by value / 按时序升序排序的选项列表
*/
async function dimensionEntries(source, name, size, attributes) {
	const units = attributes?.units;
	const entries = (await Promise.all([...Array(size).keys()].map((index) => source.getValue(name, index)))).map((value, index) => {
		const ms = value === null ? null : cfTimeToMs(value, units);
		const date = ms === null ? null : new Date(ms);
		const valid = date && !isNaN(date.getTime());
		return {
			index,
			label: valid ? date.toISOString().slice(0, 16).replace("T", " ") : String(value ?? index),
			sortKey: valid ? ms : Number(value ?? index)
		};
	});
	entries.sort((a, b) => a.sortKey - b.sortKey);
	return entries;
}
/**
* Build one dropdown per non-spatial dimension, labeling each option with the
* real coordinate value (e.g. a date) when available.
* 为每个非空间维度动态构建下拉选择器，展示真实的坐标标签（如格式化日期）。
* @param {GeoZarr} source The source / 数据源
* @param {Object<string, {size: number, attributes: Object|null}>} dimensions The selectable dimensions / 可选维度
* @return {Promise<void>} Resolves when the selectors are built
*/
async function buildDimensionSelectors(source, dimensions) {
	const columns = [];
	for (const [name, { size, attributes }] of Object.entries(dimensions)) {
		const entries = await dimensionEntries(source, name, size, attributes);
		const group = document.createElement("div");
		group.className = "input-group";
		const label = document.createElement("label");
		label.className = "input-group-text";
		label.textContent = isNaN(Number(name)) ? name : `dim ${name}`;
		const select = document.createElement("select");
		select.className = "form-select";
		select.dataset.dim = name;
		for (const entry of entries) {
			const option = document.createElement("option");
			option.value = String(entry.index);
			option.textContent = entry.label;
			select.appendChild(option);
		}
		select.addEventListener("change", () => render(false));
		group.appendChild(label);
		group.appendChild(select);
		const col = document.createElement("div");
		col.className = "col-auto";
		col.appendChild(group);
		columns.push(col);
	}
	dimsContainer.replaceChildren(...columns);
}
/**
* WebGL style for the dual-polarization composite: vv -> red, vh -> green,
* vv/vh -> blue, each rescaled from its fixed [low, high] range to [0, 255].
* 双极化雷达复合合成 WebGL 样式：VV -> 红，VH -> 绿，VV/VH -> 蓝。
* @return {Object} The WebGLTile style / WebGLTile 样式配置
*/
function compositeStyle() {
	const channel = (value, [low, high]) => [
		"interpolate",
		["linear"],
		value,
		low,
		0,
		high,
		255
	];
	return { color: [
		"color",
		channel(["band", 1], COMPOSITE_RESCALE.vv),
		channel(["band", 2], COMPOSITE_RESCALE.vh),
		channel([
			"/",
			["band", 1],
			["band", 2]
		], COMPOSITE_RESCALE.ratio)
	] };
}
/**
* (Re)render the map. A dimension change (`rebuildDimensions` false) reloads the
* current cube's slice in place; a group change or the first load opens a fresh
* source and rebuilds the dimension selectors and the map.
* (重新)渲染地图。仅维度切换时 (rebuildDimensions 为 false) 原地更新当前立方体切片；
* 轨道群组变更或初次加载时开启全新数据源并重新构建维度下拉框和地图。
* @param {boolean} rebuildDimensions Rebuild the dimension selectors / 是否重建维度下拉选择器
*/
async function render(rebuildDimensions) {
	if (!rootUrl) return;
	if (!rebuildDimensions) {
		dataLayer.getSource().updateDimensions(currentDimensions());
		return;
	}
	const bands = groupPath ? BANDS.map((name) => ({
		name,
		group: groupPath
	})) : BANDS;
	const source = new GeoZarr({
		url: rootUrl,
		bands
	});
	try {
		await buildDimensionSelectors(source, await source.getDimensions());
		source.updateDimensions(currentDimensions());
		hideError();
		if (map) map.setTarget(null);
		dataLayer = new WebGLTileLayer({
			style: compositeStyle(),
			source
		});
		map = new Map({
			layers: [new WebGLTileLayer({ source: new OSM() }), dataLayer],
			target: "map",
			view: getView(source, withLowerResolutions(1), withHigherResolutions(2), withExtentCenter(), withZoom(2))
		});
	} catch (error) {
		showError(error);
	}
}
/**
* Discover the renderable groups in a store: the store's own group when it is a
* multiscales group, otherwise its immediate child groups that are multiscales
* groups (e.g. the `ascending`/`descending` orbit groups of an S1 RTC cube).
* 自动探测存储中可渲染的多尺度群组（如升降轨群组）。
* @param {Object} group The parsed store-root group zarr.json / 解析出的 zarr.json 对象
* @return {Array<string>} Group paths relative to the entered url ('' = the url itself) / 群组相对路径列表
*/
function discoverGroups(group) {
	if (group.attributes?.multiscales?.layout) return [""];
	const consolidated = group.consolidated_metadata?.metadata ?? {};
	const groups = [];
	for (const key of Object.keys(consolidated)) if (!key.includes("/") && consolidated[key]?.node_type === "group" && consolidated[key]?.attributes?.multiscales?.layout) groups.push(key);
	return groups.length > 0 ? groups : [""];
}
/** Select the current group and render / 选择当前选中的群组并执行渲染 */
async function loadGroup() {
	groupPath = groupSelect.value;
	await render(true);
}
/** Load the entered store: read its root metadata, discover groups, render / 读取存储根元数据，探测群组并加载 */
async function load() {
	rootUrl = getUrl();
	if (!rootUrl) return;
	try {
		const response = await fetch(`${rootUrl}/zarr.json`);
		if (!response.ok) throw new Error(`Could not read ${rootUrl}/zarr.json (${response.status})`);
		const groups = discoverGroups(await response.json());
		groupSelect.innerHTML = "";
		for (const path of groups) {
			const option = document.createElement("option");
			option.value = path;
			option.textContent = path || "(root)";
			groupSelect.appendChild(option);
		}
		groupCol.style.display = groups.length < 2 ? "none" : "";
		await loadGroup();
	} catch (error) {
		showError(error);
	}
}
groupSelect.addEventListener("change", loadGroup);
loadButton.addEventListener("click", load);
load();
//#endregion

//# sourceMappingURL=geozarr-storytelling.js.map