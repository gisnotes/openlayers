import { Dr as Map, Ni as View, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
import { t as ZoomSlider } from "./ZoomSlider2.js";
//#region examples/zoomslider.js
/**
* 创建地图并挂载 ZoomSlider 缩放滑块控件的通用工厂函数。
* 注意：三个地图在 JS 层的代码完全一致，滑块的位置、外观以及垂直/水平滑动方向均由 zoomslider.css 控制。
*
* @param {string} divId 地图目标容器 DOM 的 id（'map1' | 'map2' | 'map3'）
* @return {Map} 创建完成的 OpenLayers Map 实例
*/
function createMap(divId) {
	const map = new Map({
		layers: [new TileLayer({ source: new OSM() })],
		target: divId,
		view: new View({
			center: [0, 0],
			zoom: 2
		})
	});
	const zoomslider = new ZoomSlider();
	map.addControl(zoomslider);
	return map;
}
createMap("map1");
createMap("map2");
createMap("map3");
//#endregion

//# sourceMappingURL=zoomslider.js.map