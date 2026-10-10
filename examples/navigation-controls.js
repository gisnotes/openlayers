import { Dr as Map, Hi as fromExtent, Ni as View, Si as Control, _a as fromUserExtent, bi as defaults, ji as CLASS_UNSELECTABLE, ki as CLASS_CONTROL, ts as EventType_default, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region src/ol/control/ZoomToExtent.js
/**
* @module ol/control/ZoomToExtent
*/
/**
* @typedef {Object} Options
* @property {string} [className='ol-zoom-extent'] Class name.
* @property {HTMLElement|string} [target] Specify a target if you want the control
* to be rendered outside of the map's viewport.
* @property {string|HTMLElement} [label='E'] Text label to use for the button.
* Instead of text, also an element (e.g. a `span` element) can be used.
* @property {string} [tipLabel='Fit to extent'] Text label to use for the button tip.
* @property {import("../extent.js").Extent} [extent] The extent to zoom to. If undefined the validity
* extent of the view projection is used.
* @property {import("../View.js").FitOptions} [fitOptions] Options to pass to the view when fitting
* the extent (e.g. `padding`, `duration`, `minResolution`, `maxZoom`, `easing`, `callback`).
*/
/**
* @classdesc
* A button control which, when pressed, changes the map view to a specific
* extent. To style this control use the css selector `.ol-zoom-extent`.
*
* @api
*/
var ZoomToExtent = class extends Control {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		super({
			element: document.createElement("div"),
			target: options.target
		});
		/**
		* @type {?import("../extent.js").Extent|null}
		* @protected
		*/
		this.extent = options.extent ? options.extent : null;
		/**
		* @type {import("../View.js").FitOptions}
		* @protected
		*/
		this.fitOptions = options.fitOptions || {};
		const className = options.className !== void 0 ? options.className : "ol-zoom-extent";
		const label = options.label !== void 0 ? options.label : "E";
		const tipLabel = options.tipLabel !== void 0 ? options.tipLabel : "Fit to extent";
		const button = document.createElement("button");
		button.setAttribute("type", "button");
		button.title = tipLabel;
		button.appendChild(typeof label === "string" ? document.createTextNode(label) : label);
		button.addEventListener(EventType_default.CLICK, this.handleClick_.bind(this), false);
		const cssClasses = className + " " + CLASS_UNSELECTABLE + " " + CLASS_CONTROL;
		const element = this.element;
		element.className = cssClasses;
		element.appendChild(button);
	}
	/**
	* @param {MouseEvent} event The event to handle
	* @private
	*/
	handleClick_(event) {
		event.preventDefault();
		this.handleZoomToExtent();
	}
	/**
	* @protected
	*/
	handleZoomToExtent() {
		const map = this.getMap();
		if (!map) return;
		const view = map.getView();
		const extent = !this.extent ? view.getProjection().getExtent() : fromUserExtent(this.extent, view.getProjection());
		view.fitInternal(fromExtent(extent), this.fitOptions);
	}
};
//#endregion
//#region examples/navigation-controls.js
new Map({
	controls: defaults().extend([new ZoomToExtent({ extent: [
		813079.7791264898,
		5929220.284081122,
		848966.9639063801,
		5936863.986909639
	] })]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=navigation-controls.js.map