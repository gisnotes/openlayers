import { Dr as Map, Ni as View, Vn as ImageLayer, Y as proj4, bi as defaults, ha as fromLonLat, ja as Projection, nt as register } from "./common.js";
import { t as ImageWMS } from "./ImageWMS.js";
import { t as ScaleLine } from "./ScaleLine.js";
//#region examples/wms-image-custom-proj.js
/**
* Proj4js integration mechanism:
* 1. Define custom projection string with proj4.defs()
* 2. Synchronize projection definitions with register(proj4)
* 3. Create Projection instance and pass extent to define initial resolution
* Proj4js 透明集成机制说明：
* 1. 通过 proj4.defs() 注册 EPSG:21781 (瑞士国家投影 CH1903 / LV03) 的 Proj 字符串定义；
* 2. 调用 register(proj4) 将 Proj4js 内部已注册的所有投影转换规则同步至 OpenLayers 全局投影表；
* 3. 创建 Projection 实例并配置 extent 包围盒范围，用于计算 Zoom 级别 0 时的默认初始分辨率。
*/
proj4.defs("EPSG:21781", "+proj=somerc +lat_0=46.95240555555556 +lon_0=7.439583333333333 +k_0=1 +x_0=600000 +y_0=200000 +ellps=bessel +towgs84=660.077,13.551,369.344,2.484,1.783,2.939,5.66 +units=m +no_defs");
register(proj4);
var projection = new Projection({
	code: "EPSG:21781",
	extent: [
		485869.5728,
		76443.1884,
		837076.5648,
		299941.7864
	]
});
var extent = [
	42e4,
	3e4,
	9e5,
	35e4
];
var layers = [new ImageLayer({
	extent,
	source: new ImageWMS({
		url: "https://wms.geo.admin.ch/",
		crossOrigin: "anonymous",
		attributions: "© <a href=\"https://shop.swisstopo.admin.ch/en/products/maps/national/lk1000\"target=\"_blank\">Pixelmap 1:1000000 / geo.admin.ch</a>",
		params: {
			"LAYERS": "ch.swisstopo.pixelkarte-farbe-pk1000.noscale",
			"FORMAT": "image/jpeg"
		},
		serverType: "mapserver"
	})
}), new ImageLayer({
	extent,
	source: new ImageWMS({
		url: "https://wms.geo.admin.ch/",
		crossOrigin: "anonymous",
		attributions: "© <a href=\"https://www.hydrodaten.admin.ch/en/notes-on-the-flood-alert-maps.html\"target=\"_blank\">Flood Alert / geo.admin.ch</a>",
		params: { "LAYERS": "ch.bafu.hydroweb-warnkarte_national" },
		serverType: "mapserver"
	})
})];
new Map({
	controls: defaults().extend([new ScaleLine()]),
	layers,
	target: "map",
	view: new View({
		projection,
		center: fromLonLat([8.23, 46.86], projection),
		extent,
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=wms-image-custom-proj.js.map