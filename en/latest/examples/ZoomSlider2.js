import { Eo as clamp, Si as Control, is as unlistenByKey, ji as CLASS_UNSELECTABLE, ki as CLASS_CONTROL, ns as listen, qo as stopPropagation, ts as EventType_default$1, za as easeOut, zo as EventType_default } from "./common.js";
//#region src/ol/control/ZoomSlider.js
/**
* @module ol/control/ZoomSlider
*/
/**
* The enum for available directions.
*
* @enum {number}
*/
var Direction = {
	VERTICAL: 0,
	HORIZONTAL: 1
};
/**
* @typedef {Object} Options
* @property {string} [className='ol-zoomslider'] CSS class name.
* @property {number} [duration=200] Animation duration in milliseconds.
* @property {function(import("../MapEvent.js").default):void} [render] Function called when the control
* should be re-rendered. This is called in a `requestAnimationFrame` callback.
* @property {HTMLElement|string} [target] Specify a target if you want the control to be
* rendered outside of the map's viewport.
*/
/**
* @classdesc
* A slider type of control for zooming.
*
* Example:
*
*     map.addControl(new ZoomSlider());
*
* @api
*/
var ZoomSlider = class extends Control {
	/**
	* @param {Options} [options] Zoom slider options.
	*/
	constructor(options) {
		options = options ? options : {};
		super({
			target: options.target,
			element: document.createElement("div"),
			render: options.render
		});
		/**
		* @type {!Array<import("../events.js").EventsKey>}
		* @private
		*/
		this.dragListenerKeys_ = [];
		/**
		* Will hold the current resolution of the view.
		*
		* @type {number|undefined}
		* @private
		*/
		this.currentResolution_ = void 0;
		/**
		* The direction of the slider. Will be determined from actual display of the
		* container and defaults to Direction.VERTICAL.
		*
		* @type {Direction}
		* @private
		*/
		this.direction_ = Direction.VERTICAL;
		/**
		* @type {boolean}
		* @private
		*/
		this.dragging_;
		/**
		* @type {number}
		* @private
		*/
		this.heightLimit_ = 0;
		/**
		* @type {number}
		* @private
		*/
		this.widthLimit_ = 0;
		/**
		* @type {number|undefined}
		* @private
		*/
		this.startX_;
		/**
		* @type {number|undefined}
		* @private
		*/
		this.startY_;
		/**
		* The calculated thumb size (border box plus margins).  Set when initSlider_
		* is called.
		* @type {import("../size.js").Size|null}
		* @private
		*/
		this.thumbSize_ = null;
		/**
		* Whether the slider is initialized.
		* @type {boolean}
		* @private
		*/
		this.sliderInitialized_ = false;
		/**
		* @type {number}
		* @private
		*/
		this.duration_ = options.duration !== void 0 ? options.duration : 200;
		const className = options.className !== void 0 ? options.className : "ol-zoomslider";
		const thumbElement = document.createElement("button");
		thumbElement.setAttribute("type", "button");
		thumbElement.className = className + "-thumb " + CLASS_UNSELECTABLE;
		const containerElement = this.element;
		containerElement.className = className + " " + CLASS_UNSELECTABLE + " " + CLASS_CONTROL;
		containerElement.appendChild(thumbElement);
		containerElement.addEventListener(EventType_default.POINTERDOWN, this.handleDraggerStart_.bind(this), false);
		containerElement.addEventListener(EventType_default.POINTERMOVE, this.handleDraggerDrag_.bind(this), false);
		containerElement.addEventListener(EventType_default.POINTERUP, this.handleDraggerEnd_.bind(this), false);
		containerElement.addEventListener(EventType_default$1.CLICK, this.handleContainerClick_.bind(this), false);
		thumbElement.addEventListener(EventType_default$1.CLICK, stopPropagation, false);
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
		if (map) map.render();
	}
	/**
	* Initializes the slider element. This will determine and set this controls
	* direction_ and also constrain the dragging of the thumb to always be within
	* the bounds of the container.
	*
	* @return {boolean} Initialization successful
	* @private
	*/
	initSlider_() {
		const container = this.element;
		let containerWidth = container.offsetWidth;
		let containerHeight = container.offsetHeight;
		if (containerWidth === 0 && containerHeight === 0) return this.sliderInitialized_ = false;
		const containerStyle = getComputedStyle(container);
		containerWidth -= parseFloat(containerStyle["paddingRight"]) + parseFloat(containerStyle["paddingLeft"]);
		containerHeight -= parseFloat(containerStyle["paddingTop"]) + parseFloat(containerStyle["paddingBottom"]);
		const thumb = container.firstElementChild;
		const thumbStyle = getComputedStyle(thumb);
		const thumbWidth = thumb.offsetWidth + parseFloat(thumbStyle["marginRight"]) + parseFloat(thumbStyle["marginLeft"]);
		const thumbHeight = thumb.offsetHeight + parseFloat(thumbStyle["marginTop"]) + parseFloat(thumbStyle["marginBottom"]);
		this.thumbSize_ = [thumbWidth, thumbHeight];
		if (containerWidth > containerHeight) {
			this.direction_ = Direction.HORIZONTAL;
			this.widthLimit_ = containerWidth - thumbWidth;
		} else {
			this.direction_ = Direction.VERTICAL;
			this.heightLimit_ = containerHeight - thumbHeight;
		}
		return this.sliderInitialized_ = true;
	}
	/**
	* @param {PointerEvent} event The browser event to handle.
	* @private
	*/
	handleContainerClick_(event) {
		const map = this.getMap();
		if (!map || !this.thumbSize_) return;
		const view = map.getView();
		const relativePosition = this.getRelativePosition_(event.offsetX - this.thumbSize_[0] / 2, event.offsetY - this.thumbSize_[1] / 2);
		const resolution = this.getResolutionForPosition_(relativePosition);
		const zoom = view.getConstrainedZoom(view.getZoomForResolution(resolution));
		view.animateInternal({
			zoom,
			duration: this.duration_,
			easing: easeOut
		});
	}
	/**
	* Handle dragger start events.
	* @param {PointerEvent} event The drag event.
	* @private
	*/
	handleDraggerStart_(event) {
		if (!this.dragging_ && event.target === this.element?.firstElementChild) {
			const map = this.getMap();
			if (!map) return;
			const element = this.element?.firstElementChild;
			if (!element) return;
			map.getView().beginInteraction();
			this.startX_ = event.clientX - parseFloat(element.style.left);
			this.startY_ = event.clientY - parseFloat(element.style.top);
			this.dragging_ = true;
			if (this.dragListenerKeys_.length === 0) {
				const drag = this.handleDraggerDrag_;
				const end = this.handleDraggerEnd_;
				const doc = map.getOwnerDocument();
				this.dragListenerKeys_.push(listen(doc, EventType_default.POINTERMOVE, drag, this), listen(doc, EventType_default.POINTERUP, end, this));
			}
		}
	}
	/**
	* Handle dragger drag events.
	*
	* @param {PointerEvent} event The drag event.
	* @private
	*/
	handleDraggerDrag_(event) {
		if (this.dragging_ && this.startX_ !== void 0 && this.startY_ !== void 0) {
			const deltaX = event.clientX - this.startX_;
			const deltaY = event.clientY - this.startY_;
			const relativePosition = this.getRelativePosition_(deltaX, deltaY);
			this.currentResolution_ = this.getResolutionForPosition_(relativePosition);
			const map = this.getMap();
			if (map) map.getView().setResolution(this.currentResolution_);
		}
	}
	/**
	* Handle dragger end events.
	* @param {PointerEvent} event The drag event.
	* @private
	*/
	handleDraggerEnd_(event) {
		if (this.dragging_) {
			const map = this.getMap();
			if (map) map.getView().endInteraction();
			this.dragging_ = false;
			this.startX_ = void 0;
			this.startY_ = void 0;
			this.dragListenerKeys_.forEach(unlistenByKey);
			this.dragListenerKeys_.length = 0;
		}
	}
	/**
	* Positions the thumb inside its container according to the given resolution.
	*
	* @param {number} res The res.
	* @private
	*/
	setThumbPosition_(res) {
		const position = this.getPositionForResolution_(res);
		const thumb = this.element?.firstElementChild;
		if (!(thumb instanceof HTMLElement)) return;
		if (this.direction_ == Direction.HORIZONTAL) thumb.style.left = this.widthLimit_ * position + "px";
		else thumb.style.top = this.heightLimit_ * position + "px";
	}
	/**
	* Calculates the relative position of the thumb given x and y offsets.  The
	* relative position scales from 0 to 1.  The x and y offsets are assumed to be
	* in pixel units within the dragger limits.
	*
	* @param {number} x Pixel position relative to the left of the slider.
	* @param {number} y Pixel position relative to the top of the slider.
	* @return {number} The relative position of the thumb.
	* @private
	*/
	getRelativePosition_(x, y) {
		let amount;
		if (this.direction_ === Direction.HORIZONTAL) amount = x / this.widthLimit_;
		else amount = y / this.heightLimit_;
		return clamp(amount, 0, 1);
	}
	/**
	* Calculates the corresponding resolution of the thumb given its relative
	* position (where 0 is the minimum and 1 is the maximum).
	*
	* @param {number} position The relative position of the thumb.
	* @return {number} The corresponding resolution.
	* @private
	*/
	getResolutionForPosition_(position) {
		const map = this.getMap();
		if (!map) return 0;
		return map.getView().getResolutionForValueFunction()(1 - position);
	}
	/**
	* Determines the relative position of the slider for the given resolution.  A
	* relative position of 0 corresponds to the minimum view resolution.  A
	* relative position of 1 corresponds to the maximum view resolution.
	*
	* @param {number} res The resolution.
	* @return {number} The relative position value (between 0 and 1).
	* @private
	*/
	getPositionForResolution_(res) {
		const map = this.getMap();
		if (!map) return 0;
		return clamp(1 - map.getView().getValueForResolutionFunction()(res), 0, 1);
	}
	/**
	* Update the zoomslider element.
	* @param {import("../MapEvent.js").default} mapEvent Map event.
	* @override
	*/
	render(mapEvent) {
		if (!mapEvent.frameState) return;
		if (!this.sliderInitialized_ && !this.initSlider_()) return;
		const res = mapEvent.frameState.viewState.resolution;
		this.currentResolution_ = res;
		this.setThumbPosition_(res);
	}
};
//#endregion
export { ZoomSlider as t };

//# sourceMappingURL=ZoomSlider2.js.map