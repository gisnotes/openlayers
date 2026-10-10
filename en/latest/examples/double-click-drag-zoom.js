import { Dr as Map, Ni as View, Vo as MapBrowserEventType_default, ni as defaults, vi as Interaction, yr as TileLayer } from "./common.js";
import { n as OSM } from "./OSM.js";
//#region src/ol/interaction/DblClickDragZoom.js
/**
* @module ol/interaction/DblClickDragZoom
*/
/**
* @typedef {Object} Options
* @property {number} [duration=400] Animation duration in milliseconds. *
* @property {number} [delta=1] The zoom delta applied on move of one pixel. *
* @property {function(boolean):boolean} [stopDown]
* Should the down event be propagated to other interactions, or should be
* stopped?
*/
/**
* @classdesc
* Allows the user to zoom the map by double tap/click then drag up/down
* with one finger/left mouse.
* @api
*/
var DblClickDragZoom = class extends Interaction {
	/**
	* @param {Options} [opt_options] Options.
	*/
	constructor(opt_options) {
		const options = opt_options ? opt_options : {};
		super(options);
		if (options.stopDown) this.stopDown = options.stopDown;
		/**
		* @private
		* @type {number}
		*/
		this.scaleDeltaByPixel_ = options.delta ? options.delta : .01;
		/**
		* @private
		* @type {number}
		*/
		this.duration_ = options.duration !== void 0 ? options.duration : 250;
		/**
		* @private
		* @type {import("../coordinate.js").Coordinate|null}
		*/
		this.anchor_ = null;
		/**
		* @private
		* @type {number|undefined}
		*/
		this.lastDistance_;
		/**
		* @private
		* @type {number}
		*/
		this.lastScaleDelta_ = 1;
		/**
		* @type {boolean}
		* @private
		*/
		this.handlingDownUpSequence_ = false;
		/**
		* @type {boolean}
		* @private
		*/
		this.handlingDoubleDownSequence_ = false;
		/**
		* @type {ReturnType<typeof setTimeout>|undefined}
		* @private
		*/
		this.doubleTapTimeoutId_ = void 0;
		/**
		* @type {!Object<string, PointerEvent>}
		* @private
		*/
		this.trackedPointers_ = {};
		/**
		* @type {PointerEvent|null}
		* @private
		*/
		this.down_ = null;
		/**
		* @type {Array<PointerEvent>}
		* @protected
		*/
		this.targetPointers = [];
	}
	/**
	* Handles the {@link module:ol/MapBrowserEvent~MapBrowserEvent  map browser event} and may call into
	* other functions, if event sequences like e.g. 'drag' or 'down-up' etc. are
	* detected.
	* @param {import("../MapBrowserEvent.js").default<PointerEvent>} mapBrowserEvent Map browser event.
	* @return {boolean} `false` to stop event propagation.
	* @api
	* @override
	*/
	handleEvent(mapBrowserEvent) {
		if (!mapBrowserEvent.originalEvent) return true;
		let stopEvent = false;
		this.updateTrackedPointers_(mapBrowserEvent);
		if (this.handlingDownUpSequence_) {
			if (mapBrowserEvent.type == MapBrowserEventType_default.POINTERDRAG) {
				this.handleDragEvent(mapBrowserEvent);
				mapBrowserEvent.originalEvent.preventDefault();
			} else if (mapBrowserEvent.type == MapBrowserEventType_default.POINTERUP) {
				const handledUp = this.handleUpEvent(mapBrowserEvent);
				this.handlingDownUpSequence_ = handledUp;
			}
		} else if (mapBrowserEvent.type == MapBrowserEventType_default.POINTERDOWN) if (this.handlingDoubleDownSequence_) {
			this.handlingDoubleDownSequence_ = false;
			const handled = this.handleDownEvent(mapBrowserEvent);
			this.handlingDownUpSequence_ = handled;
			stopEvent = this.stopDown(handled);
		} else {
			stopEvent = this.stopDown(false);
			this.waitForDblTap_();
		}
		return !stopEvent;
	}
	/**
	* Handle pointer drag events.
	* @param {import("../MapBrowserEvent.js").default<PointerEvent>} mapBrowserEvent Event.
	*/
	handleDragEvent(mapBrowserEvent) {
		let scaleDelta = 1;
		const touch0 = this.targetPointers[0];
		const touch1 = this.down_;
		if (!touch1) return;
		const distance = touch0.clientY - touch1.clientY;
		if (this.lastDistance_ !== void 0) scaleDelta = 1 - (this.lastDistance_ - distance) * this.scaleDeltaByPixel_;
		this.lastDistance_ = distance;
		if (scaleDelta != 1) this.lastScaleDelta_ = scaleDelta;
		const map = mapBrowserEvent.map;
		const view = map.getView();
		map.render();
		view.adjustResolutionInternal(scaleDelta);
	}
	/**
	* Handle pointer down events.
	* @param {import("../MapBrowserEvent.js").default<PointerEvent>} mapBrowserEvent Event.
	* @return {boolean} If the event was consumed.
	*/
	handleDownEvent(mapBrowserEvent) {
		if (this.targetPointers.length == 1) {
			const map = mapBrowserEvent.map;
			this.anchor_ = null;
			this.lastDistance_ = void 0;
			this.lastScaleDelta_ = 1;
			this.down_ = mapBrowserEvent.originalEvent;
			if (!this.handlingDownUpSequence_) map.getView().beginInteraction();
			return true;
		}
		return false;
	}
	/**
	* Handle pointer up events zooming out.
	* @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
	* @return {boolean} If the event was consumed.
	*/
	handleUpEvent(mapBrowserEvent) {
		if (this.targetPointers.length == 0) {
			const view = mapBrowserEvent.map.getView();
			const direction = this.lastScaleDelta_ > 1 ? 1 : -1;
			view.endInteraction(this.duration_, direction);
			this.handlingDownUpSequence_ = false;
			this.handlingDoubleDownSequence_ = false;
			return false;
		}
		return true;
	}
	/**
	* This function is used to determine if "down" events should be propagated
	* to other interactions or should be stopped.
	* @param {boolean} handled Was the event handled by the interaction?
	* @return {boolean} Should the `down` event be stopped?
	*/
	stopDown(handled) {
		return handled;
	}
	/**
	* @param {import("../MapBrowserEvent.js").default<PointerEvent>} mapBrowserEvent Event.
	* @private
	*/
	updateTrackedPointers_(mapBrowserEvent) {
		if (isPointerDraggingEvent(mapBrowserEvent)) {
			const event = mapBrowserEvent.originalEvent;
			const id = event.pointerId.toString();
			if (mapBrowserEvent.type == MapBrowserEventType_default.POINTERUP) delete this.trackedPointers_[id];
			else if (mapBrowserEvent.type == MapBrowserEventType_default.POINTERDOWN) this.trackedPointers_[id] = event;
			else if (id in this.trackedPointers_) this.trackedPointers_[id] = event;
			this.targetPointers = Object.values(this.trackedPointers_);
		}
	}
	/**
	* Wait the second double finger tap.
	* @private
	*/
	waitForDblTap_() {
		if (this.doubleTapTimeoutId_ !== void 0) {
			clearTimeout(this.doubleTapTimeoutId_);
			this.doubleTapTimeoutId_ = void 0;
		} else {
			this.handlingDoubleDownSequence_ = true;
			this.doubleTapTimeoutId_ = setTimeout(this.endInteraction_.bind(this), 250);
		}
	}
	/**
	* @private
	*/
	endInteraction_() {
		this.handlingDoubleDownSequence_ = false;
		this.doubleTapTimeoutId_ = void 0;
	}
};
/**
* @param {import("../MapBrowserEvent.js").default} mapBrowserEvent Event.
* @return {boolean} Whether the event is a pointerdown, pointerdrag
*     or pointerup event.
*/
function isPointerDraggingEvent(mapBrowserEvent) {
	const type = mapBrowserEvent.type;
	return type === MapBrowserEventType_default.POINTERDOWN || type === MapBrowserEventType_default.POINTERDRAG || type === MapBrowserEventType_default.POINTERUP;
}
//#endregion
//#region examples/double-click-drag-zoom.js
new Map({
	interactions: defaults().extend([new DblClickDragZoom()]),
	layers: [new TileLayer({ source: new OSM() })],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2
	})
});
//#endregion

//# sourceMappingURL=double-click-drag-zoom.js.map