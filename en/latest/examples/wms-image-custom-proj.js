import { Dr as Map, Ni as View, Vn as ImageLayer, Y as proj4, bi as defaults, ha as fromLonLat, ja as Projection, nt as register } from "./common.js";
import { t as ImageWMS } from "./ImageWMS.js";
import { t as ScaleLine } from "./ScaleLine.js";
//#region examples/wms-image-custom-proj.js
/**
* Proj4js 透明集成机制说明：
*
* 1. 通过 proj4.defs() 注册 EPSG:21781 (瑞士国家投影 CH1903 / LV03) 的 Proj 字符串定义；
* 2. 调用 register(proj4) 将 Proj4js 内部已注册的所有投影转换规则同步至 OpenLayers 全局投影表；
* 3. 当我们通过 new Projection({code: 'EPSG:21781', ...}) 创建投影实例时，OpenLayers 会自动绑定 Proj4js 提供的正反算函数；
*    若需直接获取带有单位、轴向等完整元数据的已注册投影对象，也可以直接调用 ol/proj#get('EPSG:21781')；
* 4. 为投影配置的 extent 包围盒范围非常关键，OpenLayers 视图（View）依据该范围计算 Zoom 级别 0 时的默认初始分辨率。
*    各投影的推荐有效范围可在 https://spatialreference.org/ 检索获取。
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