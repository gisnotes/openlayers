import { Bn as fromResolutionLike, Co as isEmpty, Hn as CanvasImageLayerRenderer, Or as BaseVectorLayer, Po as ViewHint_default, Z as ImageCanvas, Zr as RBush, aa as create, er as CanvasVectorLayerRenderer, go as getForViewAndSize, lo as equals, na as apply, ra as compose, ts as EventType_default, zr as ImageState_default } from "./common.js";
//#region src/ol/renderer/canvas/VectorImageLayer.js
/**
* @module ol/renderer/canvas/VectorImageLayer
*/
/**
* @classdesc
* Canvas renderer for image layers.
* @api
*/
var CanvasVectorImageLayerRenderer = class extends CanvasImageLayerRenderer {
	/**
	* @param {import("../../layer/VectorImage.js").default} layer Vector image layer.
	*/
	constructor(layer) {
		super(layer);
		/**
		* @protected
		* @type {boolean}
		*/
		this.wantRotation = true;
		/**
		* @private
		* @type {import("./VectorLayer.js").default}
		*/
		this.vectorRenderer_ = new CanvasVectorLayerRenderer(layer, { wantRotation: true });
		/**
		* @private
		* @type {number}
		*/
		this.layerImageRatio_ = layer.getImageRatio();
		/**
		* @private
		* @type {import("../../transform.js").Transform}
		*/
		this.coordinateToVectorPixelTransform_ = create();
		/**
		* @private
		* @type {import("../../transform.js").Transform|null}
		*/
		this.renderedPixelToCoordinateTransform_ = null;
	}
	/**
	* Clean up.
	* @override
	*/
	disposeInternal() {
		this.vectorRenderer_.dispose();
		super.disposeInternal();
	}
	/**
	* Asynchronous layer level hit detection.
	* @param {import("../../pixel.js").Pixel} pixel Pixel.
	* @return {Promise<Array<import("../../Feature.js").default>>} Promise that resolves with an array of features.
	* @override
	*/
	getFeatures(pixel) {
		if (!this.vectorRenderer_) return Promise.resolve([]);
		const vectorPixel = apply(this.coordinateToVectorPixelTransform_, apply(this.renderedPixelToCoordinateTransform_, pixel.slice()));
		return this.vectorRenderer_.getFeatures(vectorPixel);
	}
	/**
	* Perform action necessary to get the layer rendered after new fonts have loaded
	* @override
	*/
	handleFontsChanged() {
		this.vectorRenderer_.handleFontsChanged();
	}
	/**
	* Determine whether render should be called.
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @return {boolean} Layer is ready to be rendered.
	* @override
	*/
	prepareFrame(frameState) {
		const pixelRatio = frameState.pixelRatio;
		const viewState = frameState.viewState;
		const viewResolution = viewState.resolution;
		const hints = frameState.viewHints;
		const vectorRenderer = this.vectorRenderer_;
		const imageRotation = viewState.rotation;
		const canvasWidth = Math.round(frameState.size[0] * pixelRatio);
		const canvasHeight = Math.round(frameState.size[1] * pixelRatio);
		const padX = Math.round(canvasWidth * (this.layerImageRatio_ - 1) / 2);
		const padY = Math.round(canvasHeight * (this.layerImageRatio_ - 1) / 2);
		const imageSize = [(canvasWidth + 2 * padX) / pixelRatio, (canvasHeight + 2 * padY) / pixelRatio];
		const imageExtent = getForViewAndSize(viewState.center, viewResolution, 0, imageSize);
		const renderedExtent = getForViewAndSize(viewState.center, viewResolution, imageRotation, imageSize);
		if (!hints[ViewHint_default.ANIMATING] && !hints[ViewHint_default.INTERACTING] && !isEmpty(renderedExtent)) {
			vectorRenderer.useContainer(null, null);
			const context = vectorRenderer.context;
			const layerState = frameState.layerStatesArray[frameState.layerIndex];
			const imageLayerState = Object.assign({}, layerState, { opacity: 1 });
			const imageFrameState = Object.assign({}, frameState, {
				extent: renderedExtent,
				size: imageSize,
				layerStatesArray: [imageLayerState],
				layerIndex: 0,
				declutter: null
			});
			const declutter = this.getLayer().getDeclutter();
			if (declutter) imageFrameState.declutter = { [declutter]: new RBush(9) };
			const image = new ImageCanvas(imageExtent, viewResolution, pixelRatio, context.canvas, (callback) => {
				if (vectorRenderer.prepareFrame(imageFrameState) && (vectorRenderer.replayGroupChanged || !this.image || this.renderedRotation !== imageRotation || !equals(this.image.getExtent(), imageExtent))) {
					vectorRenderer.clipping = false;
					vectorRenderer.renderFrame(imageFrameState, null);
					vectorRenderer.renderDeclutter(imageFrameState);
					vectorRenderer.renderDeferred(imageFrameState);
					callback();
				}
			});
			image.addEventListener(EventType_default.CHANGE, () => {
				if (image.getState() !== ImageState_default.LOADED) return;
				this.image = image;
				this.renderedRotation = imageRotation;
				const imagePixelRatio = image.getPixelRatio();
				const renderedResolution = fromResolutionLike(image.getResolution()) * pixelRatio / imagePixelRatio;
				this.renderedResolution = renderedResolution;
				this.coordinateToVectorPixelTransform_ = compose(this.coordinateToVectorPixelTransform_, imageSize[0] / 2, imageSize[1] / 2, 1 / renderedResolution, -1 / renderedResolution, -imageRotation, -viewState.center[0], -viewState.center[1]);
			});
			image.load();
		}
		if (this.image) this.renderedPixelToCoordinateTransform_ = frameState.pixelToCoordinateTransform.slice();
		return !this.getLayer().getSource()?.loading && !!this.image;
	}
	/**
	* @override
	*/
	preRender() {}
	/**
	* @override
	*/
	postRender() {}
	/**
	*/
	renderDeclutter() {}
	/**
	* @param {import("../../coordinate.js").Coordinate} coordinate Coordinate.
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @param {number} hitTolerance Hit tolerance in pixels.
	* @param {import("../vector.js").FeatureCallback<T>} callback Feature callback.
	* @param {Array<import("../Map.js").HitMatch<T>>} matches The hit detected matches with tolerance.
	* @return {T|undefined} Callback result.
	* @template T
	* @override
	*/
	forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches) {
		if (this.vectorRenderer_) return this.vectorRenderer_.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches);
		return super.forEachFeatureAtCoordinate(coordinate, frameState, hitTolerance, callback, matches);
	}
};
//#endregion
//#region src/ol/layer/VectorImage.js
/**
* @module ol/layer/VectorImage
*/
/**
* @template {import("../source/Vector.js").default<FeatureType>} [VectorSourceType=import("../source/Vector.js").default<*>]
* @template {import('../Feature.js').FeatureLike} [FeatureType=import("./BaseVector.js").ExtractedFeatureType<VectorSourceType>]
* @typedef {Object} Options
* @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
* @property {number} [opacity=1] Opacity (0, 1).
* @property {boolean} [visible=true] Visibility.
* @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
* rendered outside of this extent.
* @property {number} [zIndex] The z-index for layer rendering.  At rendering time, the layers
* will be ordered, first by Z-index and then by position. When `undefined`, a `zIndex` of 0 is assumed
* for layers that are added to the map's `layers` collection, or `Infinity` when the layer's `setMap()`
* method was used.
* @property {number} [minResolution] The minimum resolution (inclusive) at which this layer will be
* visible.
* @property {number} [maxResolution] The maximum resolution (exclusive) below which this layer will
* be visible.
* @property {number} [minZoom] The minimum view zoom level (exclusive) above which this layer will be
* visible.
* @property {number} [maxZoom] The maximum view zoom level (inclusive) at which this layer will
* be visible.
* @property {import("../render.js").OrderFunction} [renderOrder] Render order. Function to be used when sorting
* features before rendering. By default features are drawn in the order that they are created. Use
* `null` to avoid the sort, but get an undefined draw order.
* @property {number} [renderBuffer=100] The buffer in pixels around the viewport extent used by the
* renderer when getting features from the vector source for the rendering or hit-detection.
* Recommended value: the size of the largest symbol, line width or label.
* @property {VectorSourceType} [source] Source.
* @property {import("../Map.js").default} [map] Sets the layer as overlay on a map. The map will not manage
* this layer in its layers collection, and the layer will be rendered on top. This is useful for
* temporary layers. The standard way to add a layer to a map and have it managed by the map is to
* use [map.addLayer()]{@link import("../Map.js").default#addLayer}.
* @property {boolean|string|number} [declutter=false] Declutter images and text on this layer. Any truthy value will enable
* decluttering. The priority is defined by the `zIndex` of the style and the render order of features. Higher z-index means higher
* priority. Within the same z-index, a feature rendered before another has higher priority. Items will
* not be decluttered against or together with items on other layers with the same `declutter` value. If
* that is needed, use {@link import("../layer/Vector.js").default} instead.
* @property {import("../style/Style.js").StyleLike|import("../style/flat.js").FlatStyleLike|null} [style] Layer style. When set to `null`, only
* features that have their own style will be rendered. See {@link module:ol/style/Style~Style} for the default style
* which will be used if this is not set.
* @property {import("./Base.js").BackgroundColor} [background] Background color for the layer. If not specified, no background
* will be rendered.
* @property {number} [imageRatio=1] Ratio by which the rendered extent should be larger than the
* viewport extent. A larger ratio avoids cut images during panning, but will cause a decrease in performance.
* @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
*/
/**
* @classdesc
* Vector data is rendered client-side, to an image. This layer type provides great performance
* during panning and zooming, but pixels are scaled during zoom animations. For more accurate
* rendering of vector data, use {@link module:ol/layer/Vector~VectorLayer} instead.
*
* Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
* property on the layer object; for example, setting `title: 'My Title'` in the
* options means that `title` is observable, and has get/set accessors.
*
* @template {import("../source/Vector.js").default<FeatureType>} [VectorSourceType=import("../source/Vector.js").default<*>]
* @template {import('../Feature.js').FeatureLike} [FeatureType=import("./BaseVector.js").ExtractedFeatureType<VectorSourceType>]
* @extends {BaseVectorLayer<FeatureType, VectorSourceType, CanvasVectorImageLayerRenderer>}
* @api
*/
var VectorImageLayer = class extends BaseVectorLayer {
	/**
	* @param {Options<VectorSourceType, FeatureType>} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		const baseOptions = Object.assign({}, options);
		delete baseOptions.imageRatio;
		super(baseOptions);
		/**
		* @type {number}
		* @private
		*/
		this.imageRatio_ = options.imageRatio !== void 0 ? options.imageRatio : 1;
	}
	/**
	* @return {number} Ratio between rendered extent size and viewport extent size.
	*/
	getImageRatio() {
		return this.imageRatio_;
	}
	/**
	* @override
	*/
	createRenderer() {
		return new CanvasVectorImageLayerRenderer(this);
	}
};
//#endregion
export { VectorImageLayer as t };

//# sourceMappingURL=VectorImage.js.map