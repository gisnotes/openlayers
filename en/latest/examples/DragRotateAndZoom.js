import { gi as shiftKeyOnly, oi as PointerInteraction, ui as mouseOnly } from "./common.js";
//#region src/ol/interaction/DragRotateAndZoom.js
/**
* @module ol/interaction/DragRotateAndZoom
*/
/**
* @typedef {Object} Options
* @property {import("../events/condition.js").Condition} [condition] A function that
* takes a {@link module:ol/MapBrowserEvent~MapBrowserEvent} and returns a
* boolean to indicate whether that event should be handled.
* Default is {@link module:ol/events/condition.shiftKeyOnly}.
* @property {number} [duration=400] Animation duration in milliseconds.
*/
/**
* @classdesc
* Allows the user to zoom and rotate the map by clicking and dragging
* on the map.  By default, this interaction is limited to when the shift
* key is held down.
*
* This interaction is only supported for mouse devices.
*
* And this interaction is not included in the default interactions.
* @api
*/
var DragRotateAndZoom = class extends PointerInteraction {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		/**
		* @private
		* @type {import("../events/condition.js").Condition}
		*/
		this.condition_ = options.condition ? options.condition : shiftKeyOnly;
		/**
		* @private
		* @type {number|undefined}
		*/
		this.lastAngle_ = void 0;
		/**
		* @private
		* @type {number|undefined}
		*/
		this.lastMagnitude_ = void 0;
		/**
		* @private
		* @type {number}
		*/
		this.lastScaleDelta_ = 0;
		/**
		* @private
		* @type {number}
		*/
		this.duration_ = options.duration !== void 0 ? options.duration : 400;
	}
	/**
	* Handle pointer drag events.
	* @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
	* @override
	*/
	handleDragEvent(mapBrowserEvent) {
		if (!mouseOnly(mapBrowserEvent)) return;
		const map = mapBrowserEvent.map;
		const size = map.getSize();
		if (!size) return;
		const offset = mapBrowserEvent.pixel;
		const deltaX = offset[0] - size[0] / 2;
		const deltaY = size[1] / 2 - offset[1];
		const theta = Math.atan2(deltaY, deltaX);
		const magnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		const view = map.getView();
		if (this.lastAngle_ !== void 0) {
			const angleDelta = this.lastAngle_ - theta;
			view.adjustRotationInternal(angleDelta);
		}
		this.lastAngle_ = theta;
		if (this.lastMagnitude_ !== void 0) view.adjustResolutionInternal(this.lastMagnitude_ / magnitude);
		if (this.lastMagnitude_ !== void 0) this.lastScaleDelta_ = this.lastMagnitude_ / magnitude;
		this.lastMagnitude_ = magnitude;
	}
	/**
	* Handle pointer up events.
	* @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
	* @return {boolean} If the event was consumed.
	* @override
	*/
	handleUpEvent(mapBrowserEvent) {
		if (!mouseOnly(mapBrowserEvent)) return true;
		const view = mapBrowserEvent.map.getView();
		const direction = this.lastScaleDelta_ > 1 ? 1 : -1;
		view.endInteraction(this.duration_, direction);
		this.lastScaleDelta_ = 0;
		return false;
	}
	/**
	* Handle pointer down events.
	* @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
	* @return {boolean} If the event was consumed.
	* @override
	*/
	handleDownEvent(mapBrowserEvent) {
		if (!mouseOnly(mapBrowserEvent)) return false;
		if (this.condition_(mapBrowserEvent)) {
			mapBrowserEvent.map.getView().beginInteraction();
			this.lastAngle_ = void 0;
			this.lastMagnitude_ = void 0;
			return true;
		}
		return false;
	}
};
//#endregion
export { DragRotateAndZoom as t };

//# sourceMappingURL=DragRotateAndZoom.js.map