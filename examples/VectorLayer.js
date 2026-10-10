import { At as DefaultUniform, Da as toUserResolution, Dt as WebGLLayerRenderer, Ea as toUserExtent, Fo as assert, Or as BaseVectorLayer, Po as ViewHint_default, Sa as getUserProjection, Wn as VectorEventType_default, aa as create, da as translate, is as unlistenByKey, lo as equals, na as apply, ns as listen, oo as createEmpty, ro as buffer, xa as getTransformFromProjections, xo as getWidth } from "./common.js";
import { c as createPostProcessDefinition, d as MixedGeometryBatch, i as VectorStyleRenderer, l as hasTextStyle, n as applyVectorUniforms, o as toFlatStyleLike, r as WebGLRenderTarget, s as TextUniforms, t as VectorUniforms, u as colorDecodeId } from "./vectorUtil.js";
//#region src/ol/renderer/webgl/worldUtil.js
/**
* Compute world params
* @param {import("../../Map.js").FrameState} frameState Frame state.
* @param {any} layer The layer
* @return {Array<number>} The world start, end and width.
*/
function getWorldParameters(frameState, layer) {
	const projection = frameState.viewState.projection;
	const multiWorld = layer.getSource().getWrapX() && projection.canWrapX();
	const projectionExtent = projection.getExtent();
	const extent = frameState.extent;
	const worldWidth = multiWorld ? getWidth(projectionExtent) : 0;
	const endWorld = multiWorld ? Math.ceil((extent[2] - projectionExtent[2]) / worldWidth) + 1 : 1;
	return [
		multiWorld ? Math.floor((extent[0] - projectionExtent[0]) / worldWidth) : 0,
		endWorld,
		multiWorld ? worldWidth : 0
	];
}
//#endregion
//#region src/ol/renderer/webgl/VectorLayer.js
/**
* @module ol/renderer/webgl/VectorLayer
*/
var Uniforms = {
	...DefaultUniform,
	...VectorUniforms,
	...TextUniforms,
	RENDER_EXTENT: "u_renderExtent",
	GLOBAL_ALPHA: "u_globalAlpha"
};
/**
* @typedef {import('../../render/webgl/VectorStyleRenderer.js').StyleShaders} StyleShaders
*/
/**
* @typedef {import('../../style/flat.js').FlatStyleLike | Array<StyleShaders> | StyleShaders} LayerStyle
*/
/**
* @typedef {Object} Options
* @property {string} [className='ol-layer'] A CSS class name to set to the canvas element.
* @property {LayerStyle} style Flat vector style; also accepts shaders
* @property {Object<string, number|Array<number>|string|boolean>} variables Style variables
* @property {boolean} [disableHitDetection=false] Setting this to true will provide a slight performance boost, but will
* prevent all hit detection on the layer.
* @property {Array<import("./Layer.js").PostProcessesOptions>} [postProcesses] Post-processes definitions
*/
/**
* @classdesc
* Experimental WebGL vector renderer. Supports polygons, lines and points:
*  Polygons are broken down into triangles
*  Lines are rendered as strips of quads
*  Points are rendered as quads
*
* You need to provide vertex and fragment shaders as well as custom attributes for each type of geometry. All shaders
* can access the uniforms in the {@link module:ol/webgl/Helper~DefaultUniform} enum.
* The vertex shaders can access the following attributes depending on the geometry type:
*  For polygons: {@link module:ol/render/webgl/PolygonBatchRenderer~Attributes}
*  For line strings: {@link module:ol/render/webgl/LineStringBatchRenderer~Attributes}
*  For points: {@link module:ol/render/webgl/PointBatchRenderer~Attributes}
*
* Please note that the fragment shaders output should have premultiplied alpha, otherwise visual anomalies may occur.
*
* Note: this uses {@link module:ol/webgl/Helper~WebGLHelper} internally.
* @extends {WebGLLayerRenderer<import("../../layer/Vector.js").default>}
*/
var WebGLVectorLayerRenderer = class extends WebGLLayerRenderer {
	/**
	* @param {import("../../layer/Layer.js").default} layer Layer.
	* @param {Options} options Options.
	*/
	constructor(layer, options) {
		const uniforms = {
			[Uniforms.RENDER_EXTENT]: [
				0,
				0,
				0,
				0
			],
			[Uniforms.GLOBAL_ALPHA]: 1,
			[Uniforms.ONE]: 1
		};
		super(layer, {
			uniforms,
			postProcesses: options.postProcesses ?? []
		});
		/**
		* @type {boolean}
		* @private
		*/
		this.hitDetectionEnabled_ = !options.disableHitDetection;
		/**
		* @type {WebGLRenderTarget}
		* @private
		*/
		this.hitRenderTarget_;
		/**
		* @private
		*/
		this.sourceRevision_ = -1;
		/**
		* @private
		*/
		this.layerRevision_ = -1;
		/**
		* @private
		*/
		this.skipNextTextRender_ = false;
		/**
		* @private
		*/
		this.previousExtent_ = createEmpty();
		/**
		* This transform is updated on every frame and is the composition of:
		* - invert of the world->screen transform that was used when rebuilding buffers (see `this.renderTransform_`)
		* - current world->screen transform
		* @type {import("../../transform.js").Transform}
		* @private
		*/
		this.currentTransform_ = create();
		/**
		* @type {import("../../transform.js").Transform}
		* @private
		*/
		this.currentFrameStateTransform_ = create();
		/**
		* @type {import('../../style/flat.js').StyleVariables}
		* @private
		*/
		this.styleVariables_ = {};
		/**
		* @type {LayerStyle}
		* @private
		*/
		this.style_ = [];
		/**
		* @private
		*/
		this.hasText_ = false;
		/**
		* @type {VectorStyleRenderer|null}
		* @public
		*/
		this.styleRenderer_ = null;
		/**
		* @type {import('../../render/webgl/VectorStyleRenderer.js').WebGLBuffers|null}
		* @private
		*/
		this.buffers_ = null;
		/**
		* @private
		*/
		this.batch_ = new MixedGeometryBatch();
		/**
		* @private
		* @type {boolean}
		*/
		this.initialFeaturesAdded_ = false;
		/**
		* @private
		* @type {Array<import("../../events.js").EventsKey|null>|null}
		*/
		this.sourceListenKeys_ = null;
		this.applyOptions_(options);
	}
	/**
	* @private
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	addInitialFeatures_(frameState) {
		const source = this.getLayer().getSource();
		if (!source) return;
		const userProjection = getUserProjection();
		/** @type {import("../../proj.js").TransformFunction|undefined} */
		let projectionTransform;
		if (userProjection) projectionTransform = getTransformFromProjections(userProjection, frameState.viewState.projection) ?? void 0;
		this.batch_.addFeatures(source.getFeatures(), projectionTransform);
		this.sourceListenKeys_ = [
			listen(source, VectorEventType_default.ADDFEATURE, this.handleSourceFeatureAdded_.bind(this, projectionTransform)),
			listen(source, VectorEventType_default.CHANGEFEATURE, this.handleSourceFeatureChanged_.bind(this, projectionTransform), this),
			listen(source, VectorEventType_default.REMOVEFEATURE, this.handleSourceFeatureDelete_, this),
			listen(source, VectorEventType_default.CLEAR, this.handleSourceFeatureClear_, this)
		];
	}
	/**
	* @param {Options} options Options.
	* @private
	*/
	applyOptions_(options) {
		this.styleVariables_ = options.variables;
		this.style_ = options.style;
		const flatStyle = toFlatStyleLike(this.style_);
		const newHasText = !!flatStyle && hasTextStyle(flatStyle);
		if (newHasText && !this.hasText_) this.setPostProcesses([createPostProcessDefinition(() => this.styleRenderer_.getTextOverlayCanvas(), () => this.styleRenderer_.getTextOverlayFrameState()), ...this.getPostProcesses()]);
		else if (!newHasText && this.hasText_) this.setPostProcesses(this.getPostProcesses().slice(1));
		this.hasText_ = newHasText;
	}
	/**
	* @private
	*/
	createRenderers_() {
		this.buffers_ = null;
		this.styleRenderer_ = new VectorStyleRenderer(this.style_, this.styleVariables_, this.helper, this.hitDetectionEnabled_);
	}
	/**
	* @param {Options} options Options.
	* @override
	*/
	reset(options) {
		this.applyOptions_(options);
		if (this.helper) this.createRenderers_();
		super.reset(options);
	}
	/**
	* @override
	*/
	afterHelperCreated() {
		if (this.styleRenderer_) this.styleRenderer_.setHelper(this.helper, this.buffers_);
		else this.createRenderers_();
		if (this.hitDetectionEnabled_) this.hitRenderTarget_ = new WebGLRenderTarget(this.helper);
	}
	/**
	* @param {import("../../proj.js").TransformFunction|undefined} projectionTransform Transform function.
	* @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
	* @private
	*/
	handleSourceFeatureAdded_(projectionTransform, event) {
		const feature = event.feature;
		if (!feature) return;
		this.batch_.addFeature(feature, projectionTransform);
	}
	/**
	* @param {import("../../proj.js").TransformFunction|undefined} projectionTransform Transform function.
	* @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
	* @private
	*/
	handleSourceFeatureChanged_(projectionTransform, event) {
		const feature = event.feature;
		if (!feature) return;
		this.batch_.changeFeature(feature, projectionTransform);
	}
	/**
	* @param {import("../../source/Vector.js").VectorSourceEvent} event Event.
	* @private
	*/
	handleSourceFeatureDelete_(event) {
		const feature = event.feature;
		if (!feature) return;
		this.batch_.removeFeature(feature);
	}
	/**
	* @private
	*/
	handleSourceFeatureClear_() {
		this.batch_.clear();
	}
	/**
	* @param {import("../../transform.js").Transform} batchInvertTransform Inverse of the transformation in which geometries are expressed
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @private
	*/
	applyUniforms_(batchInvertTransform, frameState) {
		applyVectorUniforms(this.helper, this.currentFrameStateTransform_, batchInvertTransform, frameState);
	}
	/**
	* Render the layer.
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @return {HTMLElement} The rendered element.
	* @override
	*/
	renderFrame(frameState) {
		const gl = this.helper.getGL();
		this.preRender(gl, frameState);
		const layer = this.getLayer();
		const [startWorld, endWorld, worldWidth] = getWorldParameters(frameState, layer);
		this.helper.prepareDraw(frameState);
		this.renderWorlds(frameState, false, startWorld, endWorld, worldWidth);
		if (this.hasText_) this.styleRenderer_?.finalizeTextRender(frameState).then(() => {
			if (this.skipNextTextRender_) {
				this.skipNextTextRender_ = false;
				return;
			}
			this.skipNextTextRender_ = true;
			this.layerRevision_++;
			layer.changed();
		});
		this.helper.finalizeDraw(frameState, this.dispatchPreComposeEvent, this.dispatchPostComposeEvent);
		const canvas = this.helper.getCanvas();
		if (this.hitDetectionEnabled_ && this.hitRenderTarget_) {
			this.renderWorlds(frameState, true, startWorld, endWorld, worldWidth);
			this.hitRenderTarget_.clearCachedData();
		}
		this.postRender(gl, frameState);
		return canvas;
	}
	/**
	* Determine whether renderFrame should be called.
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @return {boolean} Layer is ready to be rendered.
	* @override
	*/
	prepareFrameInternal(frameState) {
		if (!this.initialFeaturesAdded_) {
			this.addInitialFeatures_(frameState);
			this.initialFeaturesAdded_ = true;
		}
		const layer = this.getLayer();
		const vectorSource = layer.getSource();
		if (!vectorSource) return true;
		const viewState = frameState.viewState;
		const viewNotMoving = !frameState.viewHints[ViewHint_default.ANIMATING] && !frameState.viewHints[ViewHint_default.INTERACTING];
		const frameExtent = frameState.extent;
		if (!frameExtent) return true;
		const extentChanged = !equals(this.previousExtent_, frameExtent);
		const sourceChanged = this.sourceRevision_ < vectorSource.getRevision();
		const layerChanged = this.layerRevision_ < layer.getRevision();
		this.sourceRevision_ = vectorSource.getRevision();
		this.layerRevision_ = layer.getRevision();
		if (layerChanged || extentChanged || sourceChanged) this.skipNextTextRender_ = false;
		if (viewNotMoving && (extentChanged || sourceChanged)) {
			const projection = viewState.projection;
			const resolution = viewState.resolution;
			const extent = buffer(frameExtent, ((layer instanceof BaseVectorLayer ? layer.getRenderBuffer() : 0) ?? 0) * resolution);
			const userProjection = getUserProjection();
			if (userProjection) vectorSource.loadFeatures(toUserExtent(extent, userProjection), toUserResolution(resolution, projection), userProjection);
			else vectorSource.loadFeatures(extent, resolution, projection);
			this.ready = false;
			const styleRenderer = this.styleRenderer_;
			if (!styleRenderer) return true;
			const transform = this.helper.makeProjectionTransform(frameState, create(), true);
			styleRenderer.generateBuffers(this.batch_, transform, frameState.viewState.resolution).then((buffers) => {
				if (this.buffers_) this.disposeBuffers(this.buffers_);
				this.buffers_ = buffers;
				this.ready = true;
				this.getLayer()?.changed();
			});
			this.previousExtent_ = frameExtent.slice();
		}
		return true;
	}
	/**
	* Render the world, either to the main framebuffer or to the hit framebuffer
	* @param {import("../../Map.js").FrameState} frameState current frame state
	* @param {boolean} forHitDetection whether the rendering is for hit detection
	* @param {number} startWorld the world to render in the first iteration
	* @param {number} endWorld the last world to render
	* @param {number} worldWidth the width of the worlds being rendered
	*/
	renderWorlds(frameState, forHitDetection, startWorld, endWorld, worldWidth) {
		let world = startWorld;
		if (forHitDetection) {
			const hitRenderTarget = this.hitRenderTarget_;
			if (!hitRenderTarget) return;
			hitRenderTarget.setSize([Math.floor(frameState.size[0] / 2), Math.floor(frameState.size[1] / 2)]);
			this.helper.prepareDrawToRenderTarget(frameState, hitRenderTarget, true);
		}
		do {
			this.helper.makeProjectionTransform(frameState, this.currentFrameStateTransform_);
			translate(this.currentFrameStateTransform_, world * worldWidth, 0);
			const buffers = this.buffers_;
			if (!buffers) continue;
			const styleRenderer = this.styleRenderer_;
			if (!styleRenderer) continue;
			styleRenderer.render(buffers, frameState, () => {
				this.applyUniforms_(buffers.invertVerticesTransform, frameState);
				this.helper.applyHitDetectionUniform(forHitDetection);
			});
		} while (++world < endWorld);
	}
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
		assert(this.hitDetectionEnabled_, "`forEachFeatureAtCoordinate` cannot be used on a WebGL layer if the hit detection logic has been disabled using the `disableHitDetection: true` option.");
		if (!this.styleRenderer_ || !this.hitDetectionEnabled_) return;
		const pixel = apply(frameState.coordinateToPixelTransform, coordinate.slice());
		const data = this.hitRenderTarget_?.readPixel(pixel[0] / 2, pixel[1] / 2);
		if (!data) return;
		const ref = colorDecodeId([
			data[0] / 255,
			data[1] / 255,
			data[2] / 255,
			data[3] / 255
		]);
		const feature = this.batch_.getFeatureFromRef(ref);
		if (feature) return callback(feature, this.getLayer(), null);
	}
	/**
	* Will release a set of Webgl buffers
	* @param {import('../../render/webgl/VectorStyleRenderer.js').WebGLBuffers} buffers Buffers
	*/
	disposeBuffers(buffers) {
		if (!this.helper) return;
		/**
		* @param {Array<import('../../webgl/Buffer.js').default>} typeBuffers Buffers
		*/
		const disposeBuffersOfType = (typeBuffers) => {
			for (const buffer of typeBuffers) if (buffer) this.helper.deleteBuffer(buffer);
		};
		if (buffers.pointBuffers) disposeBuffersOfType(buffers.pointBuffers);
		if (buffers.lineStringBuffers) disposeBuffersOfType(buffers.lineStringBuffers);
		if (buffers.polygonBuffers) disposeBuffersOfType(buffers.polygonBuffers);
		if (buffers.textInstructionsKey) this.styleRenderer_?.disposeTextInstructions(buffers.textInstructionsKey);
	}
	/**
	* Clean up.
	* @override
	*/
	disposeInternal() {
		if (this.buffers_) this.disposeBuffers(this.buffers_);
		if (this.sourceListenKeys_) {
			this.sourceListenKeys_.forEach(function(key) {
				if (key) unlistenByKey(key);
			});
			this.sourceListenKeys_ = null;
		}
		if (this.styleRenderer_) this.styleRenderer_.dispose();
		super.disposeInternal();
	}
	renderDeclutter() {}
};
//#endregion
export { WebGLVectorLayerRenderer as t };

//# sourceMappingURL=VectorLayer.js.map