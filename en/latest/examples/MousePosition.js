import { Ca as identityTransform, Qa as wrapX, Sa as getUserProjection, Si as Control, ns as listen, va as get, xa as getTransformFromProjections, zo as EventType_default } from "./common.js";
//#region src/ol/control/MousePosition.js
/**
* @module ol/control/MousePosition
*/
/**
* @type {string}
*/
var PROJECTION = "projection";
/**
* @type {string}
*/
var COORDINATE_FORMAT = "coordinateFormat";
/***
* @template Return
* @typedef {import("../Observable.js").OnSignature<import("../Observable.js").EventTypes, import("../events/Event.js").default, Return> &
*   import("../Observable.js").OnSignature<import("../ObjectEventType.js").Types|
*     'change:coordinateFormat'|'change:projection', import("../Object.js").ObjectEvent, Return> &
*   import("../Observable.js").CombinedOnSignature<import("../Observable.js").EventTypes|import("../ObjectEventType.js").Types|
*     'change:coordinateFormat'|'change:projection', Return>} MousePositionOnSignature
*/
/**
* @typedef {Object} Options
* @property {string} [className='ol-mouse-position'] CSS class name.
* @property {import("../coordinate.js").CoordinateFormat} [coordinateFormat] Coordinate format.
* @property {import("../proj.js").ProjectionLike} [projection] Projection. Default is the view projection.
* @property {function(import("../MapEvent.js").default):void} [render] Function called when the
* control should be re-rendered. This is called in a `requestAnimationFrame`
* callback.
* @property {HTMLElement|string} [target] Specify a target if you want the
* control to be rendered outside of the map's viewport.
* @property {string} [placeholder] Markup to show when the mouse position is not
* available (e.g. when the pointer leaves the map viewport).  By default, a non-breaking space is rendered
* initially and the last position is retained when the mouse leaves the viewport.
* When a string is provided (e.g. `'no position'` or `''` for an empty string) it is used as a
* placeholder.
* @property {boolean} [wrapX=true] Wrap the world horizontally on the projection's antimeridian, if it
* is a global projection.
*/
/**
* @classdesc
* A control to show the 2D coordinates of the mouse cursor. By default, these
* are in the view projection, but can be in any supported projection.
* By default the control is shown in the top right corner of the map, but this
* can be changed by using the css selector `.ol-mouse-position`.
*
* On touch devices, which usually do not have a mouse cursor, the coordinates
* of the currently touched position are shown.
*
* @api
*/
var MousePosition = class extends Control {
	/**
	* @param {Options} [options] Mouse position options.
	*/
	constructor(options) {
		options = options ? options : {};
		const element = document.createElement("div");
		element.className = options.className !== void 0 ? options.className : "ol-mouse-position";
		super({
			element,
			render: options.render,
			target: options.target
		});
		/***
		* @type {MousePositionOnSignature<import("../events.js").EventsKey>}
		*/
		this.on;
		/***
		* @type {MousePositionOnSignature<import("../events.js").EventsKey>}
		*/
		this.once;
		/***
		* @type {MousePositionOnSignature<void>}
		*/
		this.un;
		this.addChangeListener(PROJECTION, this.handleProjectionChanged_);
		if (options.coordinateFormat) this.setCoordinateFormat(options.coordinateFormat);
		if (options.projection) this.setProjection(options.projection);
		/**
		* @private
		* @type {boolean}
		*/
		this.renderOnMouseOut_ = options.placeholder !== void 0;
		/**
		* @private
		* @type {string}
		*/
		this.placeholder_ = this.renderOnMouseOut_ ? options.placeholder : "&#160;";
		/**
		* @private
		* @type {string}
		*/
		this.renderedHTML_ = element.innerHTML;
		/**
		* @private
		* @type {?import("../proj/Projection.js").default}
		*/
		this.mapProjection_ = null;
		/**
		* @private
		* @type {?import("../proj.js").TransformFunction}
		*/
		this.transform_ = null;
		/**
		* @private
		* @type {boolean}
		*/
		this.wrapX_ = options.wrapX === false ? false : true;
	}
	/**
	* @private
	*/
	handleProjectionChanged_() {
		this.transform_ = null;
	}
	/**
	* Return the coordinate format type used to render the current position or
	* undefined.
	* @return {import("../coordinate.js").CoordinateFormat|undefined} The format to render the current
	*     position in.
	* @observable
	* @api
	*/
	getCoordinateFormat() {
		return this.get(COORDINATE_FORMAT);
	}
	/**
	* Return the projection that is used to report the mouse position.
	* @return {import("../proj/Projection.js").default|undefined} The projection to report mouse
	*     position in.
	* @observable
	* @api
	*/
	getProjection() {
		return this.get(PROJECTION);
	}
	/**
	* @param {MouseEvent} event Browser event.
	* @protected
	*/
	handleMouseMove(event) {
		const map = this.getMap();
		if (!map) return;
		this.updateHTML_(map.getEventPixel(event));
	}
	/**
	* @param {Event} event Browser event.
	* @protected
	*/
	handleMouseOut(event) {
		this.updateHTML_(null);
	}
	/**
	* Remove the control from its current map and attach it to the new map.
	* Pass `null` to just remove the control from the current map.
	* Subclasses may set up event handlers to get notified about changes to
	* the map here.
	* @param {import("../Map.js").default|null} map Map.
	* @api
	* @override
	*/
	setMap(map) {
		super.setMap(map);
		if (map) {
			const viewport = map.getViewport();
			if (!viewport) return;
			this.listenerKeys.push(listen(viewport, EventType_default.POINTERMOVE, this.handleMouseMove, this));
			if (this.renderOnMouseOut_) this.listenerKeys.push(listen(viewport, EventType_default.POINTEROUT, this.handleMouseOut, this));
			this.updateHTML_(null);
		}
	}
	/**
	* Set the coordinate format type used to render the current position.
	* @param {import("../coordinate.js").CoordinateFormat} format The format to render the current
	*     position in.
	* @observable
	* @api
	*/
	setCoordinateFormat(format) {
		this.set(COORDINATE_FORMAT, format);
	}
	/**
	* Set the projection that is used to report the mouse position.
	* @param {import("../proj.js").ProjectionLike} projection The projection to report mouse
	*     position in.
	* @observable
	* @api
	*/
	setProjection(projection) {
		this.set(PROJECTION, get(projection));
	}
	/**
	* @param {?import("../pixel.js").Pixel} pixel Pixel.
	* @private
	*/
	updateHTML_(pixel) {
		let html = this.placeholder_;
		if (pixel && this.mapProjection_) {
			if (!this.transform_) {
				const projection = this.getProjection();
				if (projection) this.transform_ = getTransformFromProjections(this.mapProjection_, projection);
				else this.transform_ = identityTransform;
			}
			const map = this.getMap();
			if (!map) return;
			const coordinate = map.getCoordinateFromPixelInternal(pixel);
			if (coordinate) {
				const userProjection = getUserProjection();
				if (userProjection) this.transform_ = getTransformFromProjections(this.mapProjection_, userProjection);
				const transform = this.transform_;
				if (transform) transform(coordinate, coordinate);
				if (this.wrapX_) wrapX(coordinate, userProjection || this.getProjection() || this.mapProjection_);
				const coordinateFormat = this.getCoordinateFormat();
				if (coordinateFormat) html = coordinateFormat(coordinate);
				else html = coordinate.toString();
			}
		}
		if (!this.renderedHTML_ || html !== this.renderedHTML_) {
			const element = this.element;
			if (element) {
				element.innerHTML = html;
				this.renderedHTML_ = html;
			}
		}
	}
	/**
	* Update the projection. Rendering of the coordinates is done in
	* `handleMouseMove` and `handleMouseUp`.
	* @param {import("../MapEvent.js").default} mapEvent Map event.
	* @override
	*/
	render(mapEvent) {
		const frameState = mapEvent.frameState;
		if (!frameState) this.mapProjection_ = null;
		else if (this.mapProjection_ != frameState.viewState.projection) {
			this.mapProjection_ = frameState.viewState.projection;
			this.transform_ = null;
		}
	}
};
//#endregion
export { MousePosition as t };

//# sourceMappingURL=MousePosition.js.map