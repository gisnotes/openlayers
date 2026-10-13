import { $n as VectorLayer, Ar as Style, Cn as GeoJSON, Dr as Map, Fr as CircleStyle, It as monotoneChainConvexHull, Ki as Point, Mr as Stroke, Ni as View, Nr as Icon, Pr as Fill, Un as VectorSource, Xn as LineString, _o as getHeight, ha as fromLonLat, kn as ImageTileSource, kr as Text, oo as createEmpty, rr as Feature, uo as extend, xo as getWidth, yr as TileLayer, zi as Polygon } from "./common.js";
import { t as Cluster } from "./Cluster2.js";
//#region examples/clusters-dynamic.js
var circleDistanceMultiplier = 1;
var circleFootSeparation = 28;
var circleStartAngle = Math.PI / 2;
var convexHullFill = new Fill({ color: "rgba(255, 153, 0, 0.4)" });
var convexHullStroke = new Stroke({
	color: "rgba(204, 85, 0, 1)",
	width: 1.5
});
var outerCircleFill = new Fill({ color: "rgba(255, 153, 102, 0.3)" });
var innerCircleFill = new Fill({ color: "rgba(255, 165, 0, 0.7)" });
var textFill = new Fill({ color: "#fff" });
var textStroke = new Stroke({
	color: "rgba(0, 0, 0, 0.6)",
	width: 3
});
var innerCircle = new CircleStyle({
	radius: 14,
	fill: innerCircleFill
});
var outerCircle = new CircleStyle({
	radius: 20,
	fill: outerCircleFill
});
var darkIcon = new Icon({ src: "data/icons/emoticon-cool.svg" });
var lightIcon = new Icon({ src: "data/icons/emoticon-cool-outline.svg" });
/**
* Single feature style, users for clusters with 1 feature and cluster circles.
* 单个要素的图标样式函数（同时服务于仅含 1 个要素的聚合点，以及环形蛛网展开后的每个子要素点）
* @param {Feature} clusterMember A feature from a cluster.
* @return {Style} An icon style for the cluster member's location.
*/
function clusterMemberStyle(clusterMember) {
	return new Style({
		geometry: clusterMember.getGeometry(),
		image: clusterMember.get("LEISTUNG") > 5 ? darkIcon : lightIcon
	});
}
var clickFeature;
var clickResolution;
/**
* Style for clusters with features that are too close to each other, activated on click.
* 针对内部子要素距离过近（或同址重叠）的聚合点的环形展开样式函数（点击时激活）
* @param {Feature} cluster A cluster with overlapping members.
* @param {number} resolution The current view resolution.
* @return {Array<Style>|null} A style to render an expanded view of the cluster members.
*/
function clusterCircleStyle(cluster, resolution) {
	if (cluster !== clickFeature || resolution !== clickResolution) return null;
	const clusterMembers = cluster.get("features");
	const centerCoordinates = cluster.getGeometry().getCoordinates();
	return generatePointsCircle(clusterMembers.length, cluster.getGeometry().getCoordinates(), resolution).reduce((styles, coordinates, i) => {
		const point = new Point(coordinates);
		const line = new LineString([centerCoordinates, coordinates]);
		styles.unshift(new Style({
			geometry: line,
			stroke: convexHullStroke
		}));
		styles.push(clusterMemberStyle(new Feature({
			...clusterMembers[i].getProperties(),
			geometry: point
		})));
		return styles;
	}, []);
}
/**
* From
* https://github.com/Leaflet/Leaflet.markercluster/blob/31360f2/src/MarkerCluster.Spiderfier.js#L55-L72
* Arranges points in a circle around the cluster center, with a line pointing from the center to
* each point.
* 借鉴自 Leaflet.markercluster 的蛛网展开算法：将聚合包内的所有子要素围绕聚合中心按圆周均匀排列
* @param {number} count Number of cluster members.
* @param {Array<number>} clusterCenter Center coordinate of the cluster.
* @param {number} resolution Current view resolution.
* @return {Array<Array<number>>} An array of coordinates representing the cluster members.
*/
function generatePointsCircle(count, clusterCenter, resolution) {
	let legLength = circleDistanceMultiplier * circleFootSeparation * (2 + count) / (Math.PI * 2);
	const angleStep = Math.PI * 2 / count;
	const res = [];
	let angle;
	legLength = Math.max(legLength, 35) * resolution;
	for (let i = 0; i < count; ++i) {
		angle = circleStartAngle + i * angleStep;
		res.push([clusterCenter[0] + legLength * Math.cos(angle), clusterCenter[1] + legLength * Math.sin(angle)]);
	}
	return res;
}
var hoverFeature;
/**
* Style for convex hulls of clusters, activated on hover.
* 聚合包的凸包（Convex Hull）多边形样式函数（鼠标悬停时激活）
* @param {Feature} cluster The cluster feature.
* @return {Style|null} Polygon style for the convex hull of the cluster.
*/
function clusterHullStyle(cluster) {
	if (cluster !== hoverFeature) return null;
	return new Style({
		geometry: new Polygon([monotoneChainConvexHull(cluster.get("features").map((feature) => feature.getGeometry().getCoordinates()))]),
		fill: convexHullFill,
		stroke: convexHullStroke
	});
}
/**
* 常规聚合图层样式函数：多要素显示为双层同心圆 + 数量文本，单要素直接显示光伏电站图标
* @param {import("../src/ol/Feature.js").FeatureLike} feature 聚合要素
* @return {Array<Style>|Style} 渲染样式
*/
function clusterStyle(feature) {
	const size = feature.get("features").length;
	if (size > 1) return [new Style({ image: outerCircle }), new Style({
		image: innerCircle,
		text: new Text({
			text: size.toString(),
			fill: textFill,
			stroke: textStroke
		})
	})];
	const originalFeature = feature.get("features")[0];
	return clusterMemberStyle(originalFeature);
}
var clusterSource = new Cluster({
	attributions: "Data: <a href=\"https://www.data.gv.at/auftritte/?organisation=stadt-wien\">Stadt Wien</a>",
	distance: 35,
	source: new VectorSource({
		format: new GeoJSON(),
		url: "data/geojson/photovoltaic.json"
	})
});
var clusterHulls = new VectorLayer({
	source: clusterSource,
	style: clusterHullStyle
});
var clusters = new VectorLayer({
	source: clusterSource,
	style: clusterStyle
});
var clusterCircles = new VectorLayer({
	source: clusterSource,
	style: clusterCircleStyle
});
var map = new Map({
	layers: [
		new TileLayer({ source: new ImageTileSource({
			attributions: "Base map: <a target=\"_blank\" href=\"https://basemap.at/\">basemap.at</a>",
			url: "https://maps{1-4}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png"
		}) }),
		clusterHulls,
		clusters,
		clusterCircles
	],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2,
		maxZoom: 19,
		extent: [...fromLonLat([16.1793, 48.1124]), ...fromLonLat([16.5559, 48.313])],
		showFullExtent: true
	})
});
map.on("pointermove", (event) => {
	clusters.getFeatures(event.pixel).then((features) => {
		if (features[0] !== hoverFeature) {
			hoverFeature = features[0];
			clusterHulls.setStyle(clusterHullStyle);
			map.getTargetElement().style.cursor = hoverFeature && hoverFeature.get("features").length > 1 ? "pointer" : "";
		}
	});
});
map.on("click", (event) => {
	clusters.getFeatures(event.pixel).then((features) => {
		if (features.length > 0) {
			const clusterMembers = features[0].get("features");
			if (clusterMembers.length > 1) {
				const extent = createEmpty();
				clusterMembers.forEach((feature) => extend(extent, feature.getGeometry().getExtent()));
				const view = map.getView();
				const resolution = map.getView().getResolution();
				if (view.getZoom() === view.getMaxZoom() || getWidth(extent) < resolution && getHeight(extent) < resolution) {
					clickFeature = features[0];
					clickResolution = resolution;
					clusterCircles.setStyle(clusterCircleStyle);
				} else view.fit(extent, {
					duration: 500,
					padding: [
						50,
						50,
						50,
						50
					]
				});
			}
		}
	});
});
//#endregion

//# sourceMappingURL=clusters-dynamic.js.map