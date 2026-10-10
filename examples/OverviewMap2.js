import { Di as replaceNode, Dr as Map, Hi as fromExtent, Lo as MapProperty_default, Ni as View, No as ViewProperty_default, Oi as CLASS_COLLAPSED, Ro as MapEventType_default, Si as Control, Uo as Collection, ao as containsExtent, ji as CLASS_UNSELECTABLE, ki as CLASS_CONTROL, lo as equals, mo as getBottomRight, ns as listen, rs as listenOnce, ss as ObjectEventType_default, ts as EventType_default, wo as scaleFromCenter, yo as getTopLeft } from "./common.js";
import { t as Overlay } from "./Overlay2.js";
//#region src/ol/control/OverviewMap.js
/**
* @module ol/control/OverviewMap
*/
/**
* Maximum width and/or height extent ratio that determines when the overview
* map should be zoomed out.
* @type {number}
*/
var MAX_RATIO = .75;
/**
* Minimum width and/or height extent ratio that determines when the overview
* map should be zoomed in.
* @type {number}
*/
var MIN_RATIO = .1;
/**
* @typedef {Object} Options
* @property {string} [className='ol-overviewmap'] CSS class name.
* @property {boolean} [collapsed=true] Whether the control should start collapsed or not (expanded).
* @property {string|HTMLElement} [collapseLabel='‹'] Text label to use for the
* expanded overviewmap button. Instead of text, also an element (e.g. a `span` element) can be used.
* @property {boolean} [collapsible=true] Whether the control can be collapsed or not.
* @property {string|HTMLElement} [label='›'] Text label to use for the collapsed
* overviewmap button. Instead of text, also an element (e.g. a `span` element) can be used.
* @property {Array<import("../layer/Base.js").default>|import("../Collection.js").default<import("../layer/Base.js").default>} [layers]
* Layers for the overview map.
* @property {function(import("../MapEvent.js").default):void} [render] Function called when the control
* should be re-rendered. This is called in a `requestAnimationFrame` callback.
* @property {boolean} [rotateWithView=false] Whether the control view should rotate with the main map view.
* @property {HTMLElement|string} [target] Specify a target if you want the control
* to be rendered outside of the map's viewport.
* @property {string} [tipLabel='Overview map'] Text label to use for the button tip.
* @property {View} [view] Custom view for the overview map (should use same projection as main map). If not provided,
* a default view with the same projection as the main map will be used.
*/
/**
* Create a new control with a map acting as an overview map for another
* defined map.
*
* @api
*/
var OverviewMap = class extends Control {
	/**
	* @param {Options} [options] OverviewMap options.
	*/
	constructor(options) {
		options = options ? options : {};
		super({
			element: document.createElement("div"),
			render: options.render,
			target: options.target
		});
		/**
		* @private
		*/
		this.boundHandleRotationChanged_ = this.handleRotationChanged_.bind(this);
		/**
		* @type {boolean}
		* @private
		*/
		this.collapsed_ = options.collapsed !== void 0 ? options.collapsed : true;
		/**
		* @private
		* @type {boolean}
		*/
		this.collapsible_ = options.collapsible !== void 0 ? options.collapsible : true;
		if (!this.collapsible_) this.collapsed_ = false;
		/**
		* @private
		* @type {boolean}
		*/
		this.rotateWithView_ = options.rotateWithView !== void 0 ? options.rotateWithView : false;
		/**
		* @private
		* @type {import("../extent.js").Extent|undefined}
		*/
		this.viewExtent_ = void 0;
		const className = options.className !== void 0 ? options.className : "ol-overviewmap";
		const tipLabel = options.tipLabel !== void 0 ? options.tipLabel : "Overview map";
		const collapseLabel = options.collapseLabel !== void 0 ? options.collapseLabel : "‹";
		if (typeof collapseLabel === "string") {
			/**
			* @private
			* @type {HTMLElement}
			*/
			this.collapseLabel_ = document.createElement("span");
			this.collapseLabel_.textContent = collapseLabel;
		} else this.collapseLabel_ = collapseLabel;
		const label = options.label !== void 0 ? options.label : "›";
		if (typeof label === "string") {
			/**
			* @private
			* @type {HTMLElement}
			*/
			this.label_ = document.createElement("span");
			this.label_.textContent = label;
		} else this.label_ = label;
		const activeLabel = this.collapsible_ && !this.collapsed_ ? this.collapseLabel_ : this.label_;
		const button = document.createElement("button");
		button.setAttribute("type", "button");
		button.title = tipLabel;
		button.appendChild(activeLabel);
		button.addEventListener(EventType_default.CLICK, this.handleClick_.bind(this), false);
		/**
		* @type {HTMLElement}
		* @private
		*/
		this.ovmapDiv_ = document.createElement("div");
		this.ovmapDiv_.className = "ol-overviewmap-map";
		/**
		* Explicitly given view to be used instead of a view derived from the main map.
		* @type {View|undefined}
		* @private
		*/
		this.view_ = options.view;
		const ovmap = new Map({
			view: options.view,
			controls: new Collection(),
			interactions: new Collection()
		});
		/**
		* @type {Map}
		* @private
		*/
		this.ovmap_ = ovmap;
		if (options.layers) options.layers.forEach(function(layer) {
			ovmap.addLayer(layer);
		});
		const box = document.createElement("div");
		box.className = "ol-overviewmap-box";
		box.style.boxSizing = "border-box";
		/**
		* @type {import("../Overlay.js").default}
		* @private
		*/
		this.boxOverlay_ = new Overlay({
			position: [0, 0],
			positioning: "center-center",
			element: box
		});
		this.ovmap_.addOverlay(this.boxOverlay_);
		const cssClasses = className + " " + CLASS_UNSELECTABLE + " " + CLASS_CONTROL + (this.collapsed_ && this.collapsible_ ? " " + CLASS_COLLAPSED : "") + (this.collapsible_ ? "" : " ol-uncollapsible");
		const element = this.element;
		element.className = cssClasses;
		element.appendChild(this.ovmapDiv_);
		element.appendChild(button);
		const overlay = this.boxOverlay_;
		const overlayBox = this.boxOverlay_.getElement();
		const computeDesiredMousePosition = (mousePosition) => {
			return {
				clientX: mousePosition.clientX,
				clientY: mousePosition.clientY
			};
		};
		const move = (event) => {
			const position = computeDesiredMousePosition(event);
			const coordinates = ovmap.getEventCoordinate(position);
			overlay.setPosition(coordinates);
		};
		const endMoving = (event) => {
			const coordinates = ovmap.getEventCoordinateInternal(event);
			const map = this.getMap();
			if (!map) return;
			map.getView().setCenterInternal(coordinates);
			const ownerDocument = map.getOwnerDocument();
			ownerDocument.removeEventListener("pointermove", move);
			ownerDocument.removeEventListener("pointerup", endMoving);
		};
		this.ovmapDiv_.addEventListener("pointerdown", (event) => {
			const map = this.getMap();
			if (!map) return;
			const ownerDocument = map.getOwnerDocument();
			if (event.target === overlayBox) ownerDocument.addEventListener("pointermove", move);
			ownerDocument.addEventListener("pointerup", endMoving);
		});
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
		const oldMap = this.getMap();
		if (map === oldMap) return;
		if (oldMap) {
			const oldView = oldMap.getView();
			if (oldView) this.unbindView_(oldView);
			this.ovmap_.setTarget(null);
		}
		super.setMap(map);
		if (map) {
			this.ovmap_.setTarget(this.ovmapDiv_);
			this.listenerKeys.push(listen(map, ObjectEventType_default.PROPERTYCHANGE, this.handleMapPropertyChange_, this));
			const view = map.getView();
			if (view) this.bindView_(view);
			if (!this.ovmap_.isRendered()) this.updateBoxAfterOvmapIsRendered_();
		}
	}
	/**
	* Handle map property changes.  This only deals with changes to the map's view.
	* @param {import("../Object.js").ObjectEvent} event The propertychange event.
	* @private
	*/
	handleMapPropertyChange_(event) {
		if (event.key === MapProperty_default.VIEW) {
			const oldView = event.oldValue;
			if (oldView) this.unbindView_(oldView);
			const map = this.getMap();
			if (!map) return;
			const newView = map.getView();
			this.bindView_(newView);
		} else if (!this.ovmap_.isRendered() && (event.key === MapProperty_default.TARGET || event.key === MapProperty_default.SIZE)) this.ovmap_.updateSize();
	}
	/**
	* Register listeners for view property changes.
	* @param {import("../View.js").default} view The view.
	* @private
	*/
	bindView_(view) {
		if (!this.view_) {
			const newView = new View({ projection: view.getProjection() });
			this.ovmap_.setView(newView);
		}
		view.addChangeListener(ViewProperty_default.ROTATION, this.boundHandleRotationChanged_);
		this.handleRotationChanged_();
		if (view.isDef()) {
			this.ovmap_.updateSize();
			this.resetExtent_();
		}
	}
	/**
	* Unregister listeners for view property changes.
	* @param {import("../View.js").default} view The view.
	* @private
	*/
	unbindView_(view) {
		view.removeChangeListener(ViewProperty_default.ROTATION, this.boundHandleRotationChanged_);
	}
	/**
	* Handle rotation changes to the main map.
	* @private
	*/
	handleRotationChanged_() {
		if (this.rotateWithView_) {
			const map = this.getMap();
			if (!map) return;
			this.ovmap_.getView().setRotation(map.getView().getRotation());
		}
	}
	/**
	* Reset the overview map extent if the box size (width or
	* height) is less than the size of the overview map size times minRatio
	* or is greater than the size of the overview size times maxRatio.
	*
	* If the map extent was not reset, the box size can fits in the defined
	* ratio sizes. This method then checks if is contained inside the overview
	* map current extent. If not, recenter the overview map to the current
	* main map center location.
	* @private
	*/
	validateExtent_() {
		const map = this.getMap();
		if (!map) return;
		const ovmap = this.ovmap_;
		if (!map.isRendered() || !ovmap.isRendered()) return;
		const mapSize = map.getSize();
		const extent = map.getView().calculateExtentInternal(mapSize);
		if (this.viewExtent_ && equals(extent, this.viewExtent_)) return;
		this.viewExtent_ = extent;
		const ovmapSize = ovmap.getSize();
		const ovextent = ovmap.getView().calculateExtentInternal(ovmapSize);
		const topLeftPixel = ovmap.getPixelFromCoordinateInternal(getTopLeft(extent));
		const bottomRightPixel = ovmap.getPixelFromCoordinateInternal(getBottomRight(extent));
		const boxWidth = Math.abs(
			/** @type {import("../pixel.js").Pixel} */
			topLeftPixel[0] - bottomRightPixel[0]
		);
		const boxHeight = Math.abs(
			/** @type {import("../pixel.js").Pixel} */
			topLeftPixel[1] - bottomRightPixel[1]
		);
		const ovmapWidth = ovmapSize[0];
		const ovmapHeight = ovmapSize[1];
		if (boxWidth < ovmapWidth * MIN_RATIO || boxHeight < ovmapHeight * MIN_RATIO || boxWidth > ovmapWidth * MAX_RATIO || boxHeight > ovmapHeight * MAX_RATIO) this.resetExtent_();
		else if (!containsExtent(ovextent, extent)) this.recenter_();
	}
	/**
	* Reset the overview map extent to half calculated min and max ratio times
	* the extent of the main map.
	* @private
	*/
	resetExtent_() {
		const map = this.getMap();
		if (!map) return;
		const ovmap = this.ovmap_;
		const mapSize = map.getSize();
		const extent = map.getView().calculateExtentInternal(mapSize);
		const ovview = ovmap.getView();
		const steps = Math.log(MAX_RATIO / MIN_RATIO) / Math.LN2;
		scaleFromCenter(extent, 1 / (Math.pow(2, steps / 2) * MIN_RATIO));
		ovview.fitInternal(fromExtent(extent));
	}
	/**
	* Set the center of the overview map to the map center without changing its
	* resolution.
	* @private
	*/
	recenter_() {
		const map = this.getMap();
		if (!map) return;
		const ovmap = this.ovmap_;
		const view = map.getView();
		ovmap.getView().setCenterInternal(view.getCenterInternal());
	}
	/**
	* Update the box using the main map extent
	* @private
	*/
	updateBox_() {
		const map = this.getMap();
		if (!map) return;
		const ovmap = this.ovmap_;
		if (!map.isRendered() || !ovmap.isRendered()) return;
		const mapSize = map.getSize();
		const view = map.getView();
		const ovview = ovmap.getView();
		const rotation = this.rotateWithView_ ? 0 : -view.getRotation();
		const overlay = this.boxOverlay_;
		const box = this.boxOverlay_.getElement();
		const center = view.getCenter();
		const resolution = view.getResolution();
		const ovresolution = ovview.getResolution();
		if (resolution === void 0 || ovresolution === void 0) return;
		const width = mapSize[0] * resolution / ovresolution;
		const height = mapSize[1] * resolution / ovresolution;
		overlay.setPosition(center);
		if (box) {
			box.style.width = width + "px";
			box.style.height = height + "px";
			const transform = "rotate(" + rotation + "rad)";
			box.style.transform = transform;
		}
	}
	/**
	* @private
	*/
	updateBoxAfterOvmapIsRendered_() {
		if (this.ovmapPostrenderKey_) return;
		this.ovmapPostrenderKey_ = listenOnce(this.ovmap_, MapEventType_default.POSTRENDER, (event) => {
			delete this.ovmapPostrenderKey_;
			this.updateBox_();
		});
	}
	/**
	* @param {MouseEvent} event The event to handle
	* @private
	*/
	handleClick_(event) {
		event.preventDefault();
		this.handleToggle_();
	}
	/**
	* @private
	*/
	handleToggle_() {
		const element = this.element;
		if (!element) return;
		element.classList.toggle(CLASS_COLLAPSED);
		if (this.collapsed_) replaceNode(this.collapseLabel_, this.label_);
		else replaceNode(this.label_, this.collapseLabel_);
		this.collapsed_ = !this.collapsed_;
		const ovmap = this.ovmap_;
		if (!this.collapsed_) {
			if (ovmap.isRendered()) {
				this.viewExtent_ = void 0;
				ovmap.render();
				return;
			}
			ovmap.updateSize();
			this.resetExtent_();
			this.updateBoxAfterOvmapIsRendered_();
		}
	}
	/**
	* Return `true` if the overview map is collapsible, `false` otherwise.
	* @return {boolean} True if the widget is collapsible.
	* @api
	*/
	getCollapsible() {
		return this.collapsible_;
	}
	/**
	* Set whether the overview map should be collapsible.
	* @param {boolean} collapsible True if the widget is collapsible.
	* @api
	*/
	setCollapsible(collapsible) {
		if (this.collapsible_ === collapsible) return;
		this.collapsible_ = collapsible;
		const element = this.element;
		if (!element) return;
		element.classList.toggle("ol-uncollapsible");
		if (!collapsible && this.collapsed_) this.handleToggle_();
	}
	/**
	* Collapse or expand the overview map according to the passed parameter. Will
	* not do anything if the overview map isn't collapsible or if the current
	* collapsed state is already the one requested.
	* @param {boolean} collapsed True if the widget is collapsed.
	* @api
	*/
	setCollapsed(collapsed) {
		if (!this.collapsible_ || this.collapsed_ === collapsed) return;
		this.handleToggle_();
	}
	/**
	* Determine if the overview map is collapsed.
	* @return {boolean} The overview map is collapsed.
	* @api
	*/
	getCollapsed() {
		return this.collapsed_;
	}
	/**
	* Return `true` if the overview map view can rotate, `false` otherwise.
	* @return {boolean} True if the control view can rotate.
	* @api
	*/
	getRotateWithView() {
		return this.rotateWithView_;
	}
	/**
	* Set whether the overview map view should rotate with the main map view.
	* @param {boolean} rotateWithView True if the control view should rotate.
	* @api
	*/
	setRotateWithView(rotateWithView) {
		if (this.rotateWithView_ === rotateWithView) return;
		this.rotateWithView_ = rotateWithView;
		const map = this.getMap();
		if (!map) return;
		if (map.getView().getRotation() !== 0) {
			if (this.rotateWithView_) this.handleRotationChanged_();
			else this.ovmap_.getView().setRotation(0);
			this.viewExtent_ = void 0;
			this.validateExtent_();
			this.updateBox_();
		}
	}
	/**
	* Return the overview map.
	* @return {import("../Map.js").default} Overview map.
	* @api
	*/
	getOverviewMap() {
		return this.ovmap_;
	}
	/**
	* Update the overview map element.
	* @param {import("../MapEvent.js").default} mapEvent Map event.
	* @override
	*/
	render(mapEvent) {
		this.validateExtent_();
		this.updateBox_();
	}
};
//#endregion
export { OverviewMap as t };

//# sourceMappingURL=OverviewMap2.js.map