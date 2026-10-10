import { Bt as MVT, Dr as Map, Et as WebGLBaseTileLayerRenderer, Ft as STATIC_DRAW, Mn as fromTransform, Mt as ARRAY_BUFFER, Ni as View, Ot as BaseTileRepresentation, Pt as ELEMENT_ARRAY_BUFFER, Rt as VectorTile, Tt as Uniforms$1, aa as create, br as BaseTileLayer, da as translate, jt as WebGLArrayBuffer, kt as AttributeType, la as setFromArray, oa as makeInverse, sa as multiply, ts as EventType_default } from "./common.js";
import { a as convertStyleToShaders, c as createPostProcessDefinition, d as MixedGeometryBatch, f as ShaderBuilder, i as VectorStyleRenderer, l as hasTextStyle, n as applyVectorUniforms, o as toFlatStyleLike, r as WebGLRenderTarget, s as TextUniforms, t as VectorUniforms } from "./vectorUtil.js";
//#region src/ol/webgl/TileGeometry.js
/**
* @module ol/webgl/TileGeometry
*/
/**
* @typedef {import("../VectorRenderTile.js").default} TileType
*/
/**
* @extends {BaseTileRepresentation<TileType>}
*/
var TileGeometry = class extends BaseTileRepresentation {
	/**
	* @param {import("./BaseTileRepresentation.js").TileRepresentationOptions<TileType>} options The tile texture options.
	* @param {import("../render/webgl/VectorStyleRenderer.js").default} styleRenderer Vector style renderer
	*/
	constructor(options, styleRenderer) {
		super(options);
		/**
		* @private
		*/
		this.batch_ = new MixedGeometryBatch();
		/**
		* @private
		*/
		this.styleRenderer_ = styleRenderer;
		/**
		* @type {import("../render/webgl/VectorStyleRenderer.js").WebGLBuffers|null}
		*/
		this.buffers = null;
		/**
		* Each geometry tile also has a mask which consisted of a quad (two triangles); this mask is intended to
		* be rendered to an offscreen buffer, and be used to correctly mask tiles according to their zoom level
		* during rendering; these coordinates are expressed in the same coordinate system as the tile geometries
		*/
		this.maskVertices = new WebGLArrayBuffer(ARRAY_BUFFER, STATIC_DRAW);
		/**
		* @type {number}
		*/
		this.wantedResolution = options.grid.getResolution(options.tile.getTileCoord()[0]);
		this.setTile(options.tile);
	}
	/**
	* @private
	*/
	generateMaskBuffer_() {
		const extent = this.tile.getSourceTiles()[0].extent;
		if (!extent) return;
		const originX = extent[0];
		const originY = extent[1];
		const width = extent[2] - originX;
		const height = extent[3] - originY;
		this.maskVertices.fromArray([
			0,
			0,
			width,
			0,
			width,
			height,
			0,
			height
		]);
		/** @type {import("./Helper.js").default} */ this.helper.flushBufferData(this.maskVertices);
	}
	/**
	* @override
	*/
	uploadTile() {
		if (!this.helper) return;
		this.generateMaskBuffer_();
		this.batch_.clear();
		const sourceTiles = this.tile.getSourceTiles();
		/** @type {Array<import("../Feature.js").default|import("../render/Feature.js").default>} */
		const features = [];
		for (const sourceTile of sourceTiles) {
			const tileFeatures = sourceTile.getFeatures();
			if (!tileFeatures) continue;
			for (let i = 0; i < tileFeatures.length; ++i) features.push(tileFeatures[i]);
		}
		const firstExtent = sourceTiles[0].extent;
		if (!firstExtent) return;
		const tileOriginX = firstExtent[0];
		const tileOriginY = firstExtent[1];
		const transform = translate(create(), -tileOriginX, -tileOriginY);
		this.batch_.addFeatures(features);
		this.styleRenderer_.generateBuffers(this.batch_, transform, this.wantedResolution).then((buffers) => {
			this.buffers = buffers;
			this.setReady();
		});
	}
	/**
	* @override
	*/
	disposeInternal() {
		const helper = this.helper;
		if (this.buffers && helper) {
			/**
			* @param {Array<WebGLArrayBuffer>} typeBuffers Buffers
			*/
			const disposeBuffersOfType = (typeBuffers) => {
				for (const buffer of typeBuffers) if (buffer) helper.deleteBuffer(buffer);
			};
			this.buffers.pointBuffers && disposeBuffersOfType(this.buffers.pointBuffers);
			this.buffers.lineStringBuffers && disposeBuffersOfType(this.buffers.lineStringBuffers);
			this.buffers.polygonBuffers && disposeBuffersOfType(this.buffers.polygonBuffers);
			this.styleRenderer_.disposeTextInstructions(this.buffers.textInstructionsKey ?? "");
		}
		super.disposeInternal();
	}
};
//#endregion
//#region src/ol/renderer/webgl/VectorTileLayer.js
/**
* @module ol/renderer/webgl/VectorTileLayer
*/
var Uniforms = {
	...Uniforms$1,
	...VectorUniforms,
	...TextUniforms,
	TILE_MASK_TEXTURE: "u_depthMask",
	TILE_ZOOM_LEVEL: "u_tileZoomLevel"
};
var Attributes = { POSITION: "a_position" };
/**
* @typedef {import('../../render/webgl/VectorStyleRenderer.js').StyleShaders} StyleShaders
*/
/**
* @typedef {import('../../style/flat.js').FlatStyleLike | Array<StyleShaders> | StyleShaders} LayerStyle
*/
/**
* @typedef {Object} Options
* @property {LayerStyle} style Flat vector style; also accepts shaders
* @property {import('../../style/flat.js').StyleVariables} [variables] Style variables. Each variable must hold a literal value (not
* an expression). These variables can be used as {@link import("../../expr/expression.js").ExpressionValue expressions} in the styles properties
* using the `['var', 'varName']` operator.
* @property {boolean} [disableHitDetection=false] Setting this to true will provide a slight performance boost, but will
* prevent all hit detection on the layer.
* @property {Array<import("./Layer.js").PostProcessesOptions>} [postProcesses] Post-processes definitions
* @property {number} [cacheSize=512] The vector tile cache size.
*/
/**
* @typedef {import("../../layer/VectorTile.js").default} LayerType
*/
/**
* @classdesc
* WebGL renderer for vector tile layers. Experimental.
* @extends {WebGLBaseTileLayerRenderer<any, import("../../VectorRenderTile.js").default, import("../../webgl/TileGeometry.js").default>}
*/
var WebGLVectorTileLayerRenderer = class extends WebGLBaseTileLayerRenderer {
	/**
	* @param {import("../../layer/VectorTile.js").default} tileLayer Tile layer.
	* @param {Options} options Options.
	*/
	constructor(tileLayer, options) {
		super(tileLayer, {
			cacheSize: options.cacheSize,
			uniforms: {
				[Uniforms.TILE_MASK_TEXTURE]: () => this.tileMaskTarget_?.getTexture() ?? null,
				[Uniforms.ONE]: 1
			},
			postProcesses: options.postProcesses ?? []
		});
		/**
		* @type {boolean}
		* @private
		*/
		this.hitDetectionEnabled_ = !options.disableHitDetection;
		/**
		* @type {LayerStyle|null}
		* @private
		*/
		this.style_ = null;
		/**
		* @private
		*/
		this.hasText_ = false;
		/**
		* @type {import('../../style/flat.js').StyleVariables|undefined}
		* @private
		*/
		this.styleVariables_ = void 0;
		/**
		* @type {VectorStyleRenderer|null}
		* @private
		*/
		this.styleRenderer_ = null;
		/**
		* Transform that projects from world to viewport [-1,1]
		* @private
		*/
		this.currentFrameStateTransform_ = create();
		/**
		* @type {WebGLRenderTarget|null}
		* @private
		*/
		this.tileMaskTarget_ = null;
		/**
		* @private
		*/
		this.tileMaskIndices_ = new WebGLArrayBuffer(ELEMENT_ARRAY_BUFFER, STATIC_DRAW);
		this.tileMaskIndices_.fromArray([
			0,
			1,
			3,
			1,
			2,
			3
		]);
		/**
		* @type {Array<import('../../webgl/Helper.js').AttributeDescription>}
		* @private
		*/
		this.tileMaskAttributes_ = [{
			name: Attributes.POSITION,
			size: 2,
			type: AttributeType.FLOAT
		}];
		/**
		* @type {WebGLProgram|undefined}
		* @private
		*/
		this.tileMaskProgram_;
		/**
		* @private
		*/
		this.layerRevision_ = -1;
		/**
		* @private
		*/
		this.skipNextTextRender_ = false;
		this.applyOptions_(options);
	}
	/**
	* @param {Options} options Options.
	* @override
	*/
	reset(options) {
		super.reset(options);
		this.applyOptions_(options);
		if (this.helper) {
			this.createRenderers_();
			this.initTileMask_();
		}
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
		if (newHasText && !this.hasText_) this.setPostProcesses([createPostProcessDefinition(() => this.styleRenderer_?.getTextOverlayCanvas() ?? document.createElement("canvas"), () => {
			return this.styleRenderer_?.getTextOverlayFrameState() ?? this.frameState;
		}), ...this.getPostProcesses()]);
		else if (!newHasText && this.hasText_) this.setPostProcesses(this.getPostProcesses().slice(1));
		this.hasText_ = newHasText;
	}
	/**
	* @private
	*/
	createRenderers_() {
		/**
		* @param {import('../../render/webgl/ShaderBuilder.js').ShaderBuilder} builder Shader builder to configure.
		*/
		function addBuilderParams(builder) {
			const exisitingDiscard = builder.getFragmentDiscardExpression();
			const discardFromMask = `texture2D(${Uniforms.TILE_MASK_TEXTURE}, gl_FragCoord.xy / u_pixelRatio / u_viewportSizePx).r * 50. > ${Uniforms.TILE_ZOOM_LEVEL} + 0.5`;
			builder.setFragmentDiscardExpression(exisitingDiscard !== null ? `(${exisitingDiscard}) || (${discardFromMask})` : discardFromMask);
			builder.addUniform(Uniforms.TILE_MASK_TEXTURE, "sampler2D");
			builder.addUniform(Uniforms.TILE_ZOOM_LEVEL, "float");
		}
		const styleShaders = convertStyleToShaders(this.style_, this.styleVariables_ ?? {});
		for (const styleShader of styleShaders) addBuilderParams(styleShader.builder);
		this.styleRenderer_ = new VectorStyleRenderer(styleShaders, this.styleVariables_ ?? {}, this.helper, this.hitDetectionEnabled_);
	}
	/**
	* @private
	*/
	initTileMask_() {
		this.tileMaskTarget_ = new WebGLRenderTarget(this.helper);
		const builder = new ShaderBuilder().setFillColorExpression(`vec4(${Uniforms.TILE_ZOOM_LEVEL} / 50., 0., 0., 1.)`).addUniform(Uniforms.TILE_ZOOM_LEVEL, "float");
		this.tileMaskProgram_ = this.helper.getProgram(builder.getFillFragmentShader(), builder.getFillVertexShader());
		this.helper.flushBufferData(this.tileMaskIndices_);
	}
	/**
	* @override
	*/
	afterHelperCreated() {
		this.createRenderers_();
		this.initTileMask_();
	}
	/**
	* @param {import("../../webgl/BaseTileRepresentation.js").TileRepresentationOptions<import("../../VectorRenderTile.js").default>} options tile representation options
	* @override
	*/
	createTileRepresentation(options) {
		const tileRep = new TileGeometry(options, this.styleRenderer_);
		const listener = () => {
			if (tileRep.ready) {
				this.getLayer().changed();
				tileRep.removeEventListener(EventType_default.CHANGE, listener);
			}
		};
		tileRep.addEventListener(EventType_default.CHANGE, listener);
		return tileRep;
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @param {boolean} tilesWithAlpha Whether tiles need alpha blending.
	* @override
	*/
	beforeTilesRender(frameState, tilesWithAlpha) {
		super.beforeTilesRender(frameState, true);
		const layerChanged = this.layerRevision_ < this.getLayer().getRevision();
		this.layerRevision_ = this.getLayer().getRevision();
		if (layerChanged) this.skipNextTextRender_ = false;
		this.helper.makeProjectionTransform(frameState, this.currentFrameStateTransform_);
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @override
	*/
	beforeTilesMaskRender(frameState) {
		const tileMaskTarget = this.tileMaskTarget_;
		const tileMaskProgram = this.tileMaskProgram_;
		if (!tileMaskTarget || !tileMaskProgram) return false;
		this.helper.makeProjectionTransform(frameState, this.currentFrameStateTransform_);
		const pixelRatio = frameState.pixelRatio;
		const size = frameState.size;
		tileMaskTarget.setSize([size[0] * pixelRatio, size[1] * pixelRatio]);
		this.helper.prepareDrawToRenderTarget(frameState, tileMaskTarget, true, true);
		this.helper.useProgram(tileMaskProgram, frameState);
		return true;
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @override
	*/
	beforeFinalize(frameState) {
		const styleRenderer = this.styleRenderer_;
		if (this.hasText_ && styleRenderer) styleRenderer.finalizeTextRender(frameState).then(() => {
			if (this.skipNextTextRender_) {
				this.skipNextTextRender_ = false;
				return;
			}
			this.skipNextTextRender_ = true;
			this.layerRevision_++;
			this.getLayer().changed();
		});
	}
	/**
	* @param {import("../../webgl/TileGeometry.js").default} tileRepresentation Tile representation.
	* @param {number} tileZ Tile Z.
	* @param {import("../../extent.js").Extent} extent Render extent.
	* @param {number} depth Depth.
	* @override
	*/
	renderTileMask(tileRepresentation, tileZ, extent, depth) {
		if (!tileRepresentation.ready) return;
		const buffers = tileRepresentation.buffers;
		if (!buffers) return;
		const invertTransform = buffers.invertVerticesTransform;
		setFromArray(this.tmpTransform_, this.currentFrameStateTransform_);
		multiply(this.tmpTransform_, invertTransform);
		this.helper.setUniformMatrixValue(Uniforms.PROJECTION_MATRIX, fromTransform(this.tmpMat4_, this.tmpTransform_));
		makeInverse(this.tmpTransform_, this.tmpTransform_);
		this.helper.setUniformMatrixValue(Uniforms.INVERT_PROJECTION_MATRIX, fromTransform(this.tmpMat4_, this.tmpTransform_));
		this.helper.setUniformFloatValue(Uniforms.DEPTH, depth);
		this.helper.setUniformFloatValue(Uniforms.TILE_ZOOM_LEVEL, tileZ);
		this.helper.setUniformFloatValue(Uniforms.GLOBAL_ALPHA, 1);
		this.applyRenderExtentUniform(extent, makeInverse(this.tmpTransform_, invertTransform));
		this.helper.bindBuffer(
			/** @type {TileGeometry} */
			tileRepresentation.maskVertices
		);
		this.helper.bindBuffer(this.tileMaskIndices_);
		this.helper.enableAttributes(this.tileMaskAttributes_);
		const renderCount = this.tileMaskIndices_.getSize();
		this.helper.drawElements(0, renderCount);
	}
	/**
	* @param {number} alpha Alpha value of the tile
	* @param {import("../../extent.js").Extent} renderExtent Which extent to restrict drawing to
	* @param {import("../../transform.js").Transform} batchInvertTransform Inverse of the transformation in which tile geometries are expressed
	* @param {number} tileZ Tile zoom level
	* @param {number} depth Depth of the tile
	* @param {import("../../Map.js").FrameState} frameState Frame state
	* @private
	*/
	applyUniforms_(alpha, renderExtent, batchInvertTransform, tileZ, depth, frameState) {
		applyVectorUniforms(this.helper, this.currentFrameStateTransform_, batchInvertTransform, frameState);
		this.helper.setUniformFloatValue(Uniforms.GLOBAL_ALPHA, alpha);
		this.helper.setUniformFloatValue(Uniforms.DEPTH, depth);
		this.helper.setUniformFloatValue(Uniforms.TILE_ZOOM_LEVEL, tileZ);
		this.applyRenderExtentUniform(renderExtent, makeInverse(this.tmpTransform_, batchInvertTransform));
	}
	/**
	* @param {import("../../webgl/TileGeometry.js").default} tileRepresentation Tile representation.
	* @param {import("../../transform.js").Transform} tileTransform Tile transform.
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @param {import("../../extent.js").Extent} renderExtent Render extent.
	* @param {number} tileResolution Tile resolution.
	* @param {import("../../size.js").Size} tileSize Tile size.
	* @param {import("../../coordinate.js").Coordinate} tileOrigin Tile origin.
	* @param {import("../../extent.js").Extent} tileExtent Tile extent.
	* @param {number} depth Depth.
	* @param {number} gutter Gutter.
	* @param {number} alpha Alpha.
	* @override
	*/
	renderTile(tileRepresentation, tileTransform, frameState, renderExtent, tileResolution, tileSize, tileOrigin, tileExtent, depth, gutter, alpha) {
		const styleRenderer = this.styleRenderer_;
		if (!styleRenderer) return;
		const tileZ = tileRepresentation.tile.getTileCoord()[0];
		const buffers = tileRepresentation.buffers;
		if (!buffers) return;
		styleRenderer.render(buffers, frameState, () => {
			this.applyUniforms_(alpha, tileExtent, buffers.invertVerticesTransform, tileZ, depth, frameState);
		});
	}
	/**
	* Render declutter items for this layer
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	renderDeclutter(frameState) {}
	/**
	* Clean up.
	* @override
	*/
	disposeInternal() {
		this.styleRenderer_?.dispose();
		super.disposeInternal();
	}
};
//#endregion
//#region src/ol/layer/WebGLVectorTile.js
/**
* @module ol/layer/WebGLVectorTile
*/
/***
* @template T
* @typedef {T extends import("../source/Vector.js").default<infer U extends import("../Feature.js").FeatureLike> ? U : never} ExtractedFeatureType
*/
/**
* @template {import("../source/VectorTile.js").default<FeatureType>} [VectorTileSourceType=import("../source/VectorTile.js").default<*>]
* @template {import('../Feature.js').FeatureLike} [FeatureType=ExtractedFeatureType<VectorTileSourceType>]
* @typedef {Object} Options
* @property {string} [className='ol-layer'] A CSS class name to set to the layer element.
* @property {number} [opacity=1] Opacity (0, 1).
* @property {boolean} [visible=true] Visibility.
* @property {import("../extent.js").Extent} [extent] The bounding extent for layer rendering.  The layer will not be
* rendered outside of this extent.
* FIXME: not supported yet
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
* @property {VectorTileSourceType} [source] Source.
* @property {import('../style/flat.js').FlatStyleLike} style Layer style.
* @property {import('../style/flat.js').StyleVariables} [variables] Style variables. Each variable must hold a literal value (not
* an expression). These variables can be used as {@link import("../expr/expression.js").ExpressionValue expressions} in the styles properties
* using the `['var', 'varName']` operator.
* To update style variables, use the {@link import("./WebGLVector.js").default#updateStyleVariables} method.
* @property {import("./Base.js").BackgroundColor} [background] Background color for the layer. If not specified, no background
* will be rendered.
* FIXME: not supported yet
* @property {boolean} [disableHitDetection=false] Setting this to true will provide a slight performance boost, but will
* prevent all hit detection on the layer.
* @property {Object<string, *>} [properties] Arbitrary observable properties. Can be accessed with `#get()` and `#set()`.
*/
/**
* @classdesc
* Layer optimized for rendering large vector datasets.
*
* **Important: a `WebGLVector` layer must be manually disposed when removed, otherwise the underlying WebGL context
* will not be garbage collected.**
*
* Note that any property set in the options is set as a {@link module:ol/Object~BaseObject}
* property on the layer object; for example, setting `title: 'My Title'` in the
* options means that `title` is observable, and has get/set accessors.
*
* @template {import("../source/VectorTile.js").default<FeatureType>} [VectorTileSourceType=import("../source/VectorTile.js").default<*>]
* @template {import('../Feature.js').FeatureLike} [FeatureType=ExtractedFeatureType<VectorTileSourceType>]
* @extends {BaseTileLayer<VectorTileSourceType, WebGLVectorTileLayerRenderer>}
*/
var WebGLVectorTileLayer = class extends BaseTileLayer {
	/**
	* @param {Options<VectorTileSourceType, FeatureType>} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		const baseOptions = Object.assign({}, options);
		super(baseOptions);
		/**
		* @type {import('../style/flat.js').StyleVariables}
		* @private
		*/
		this.styleVariables_ = options.variables || {};
		/**
		* @private
		*/
		this.style_ = options.style;
		/**
		* @private
		*/
		this.hitDetectionDisabled_ = !!options.disableHitDetection;
	}
	/**
	* @override
	*/
	createRenderer() {
		return new WebGLVectorTileLayerRenderer(this, {
			style: this.style_,
			variables: this.styleVariables_,
			disableHitDetection: this.hitDetectionDisabled_,
			cacheSize: this.getCacheSize()
		});
	}
	/**
	* Update any variables used by the layer style and trigger a re-render.
	* @param {import('../style/flat.js').StyleVariables} variables Variables to update.
	*/
	updateStyleVariables(variables) {
		Object.assign(this.styleVariables_, variables);
		this.changed();
	}
	/**
	* Set the layer style.
	* @param {import('../style/flat.js').FlatStyleLike} style Layer style.
	*/
	setStyle(style) {
		this.style_ = style;
		this.clearRenderer();
		this.changed();
	}
};
//#endregion
//#region examples/webgl-vector-tiles.js
new Map({
	layers: [new WebGLVectorTileLayer({
		source: new VectorTile({
			attributions: "© <a href=\"https://www.mapbox.com/map-feedback/\">Mapbox</a> © <a href=\"https://www.openstreetmap.org/copyright\">OpenStreetMap contributors</a>",
			format: new MVT(),
			url: "https://{a-d}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYWhvY2V2YXIiLCJhIjoiY2t0cGdwMHVnMGdlbzMxbDhwazBic2xrNSJ9.WbcTL9uj8JPAsnT9mgb7oQ"
		}),
		style: [
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"landuse"
					],
					[
						"==",
						["get", "class"],
						"park"
					]
				],
				style: { "fill-color": "#d8e8c8" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"landuse"
					],
					[
						"==",
						["get", "class"],
						"cemetery"
					]
				],
				else: true,
				style: { "fill-color": "#e0e4dd" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"landuse"
					],
					[
						"==",
						["get", "class"],
						"hospital"
					]
				],
				else: true,
				style: { "fill-color": "#fde" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"landuse"
					],
					[
						"==",
						["get", "class"],
						"school"
					]
				],
				else: true,
				style: { "fill-color": "#f0e8f8" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"landuse"
					],
					[
						"==",
						["get", "class"],
						"wood"
					]
				],
				else: true,
				style: { "fill-color": "rgb(233,238,223)" }
			},
			{
				filter: [
					"==",
					["get", "layer"],
					"waterway"
				],
				else: true,
				style: {
					"stroke-color": "#a0c8f0",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"==",
					["get", "layer"],
					"water"
				],
				else: true,
				style: { "fill-color": "#a0c8f0" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"aeroway"
					],
					[
						"==",
						["geometry-type"],
						"Polygon"
					]
				],
				else: true,
				style: { "fill-color": "rgb(242,239,235)" }
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"aeroway"
					],
					[
						"==",
						["geometry-type"],
						"LineString"
					],
					[
						"<=",
						["resolution"],
						76.43702828517625
					]
				],
				else: true,
				style: { "fill-color": "#f0ede9" }
			},
			{
				filter: [
					"==",
					["get", "layer"],
					"building"
				],
				else: true,
				style: {
					"fill-color": "#f2eae2",
					"stroke-color": "#dfdbd7",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"motorway_link"
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"service"
					]
				],
				else: true,
				style: {
					"stroke-color": "#cfcdca",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"any",
						[
							"==",
							["get", "class"],
							"street"
						],
						[
							"==",
							["get", "class"],
							"street_limited"
						]
					]
				],
				else: true,
				style: {
					"stroke-color": "#cfcdca",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"main"
					],
					[
						"<=",
						["resolution"],
						1222.99245256282
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"motorway"
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"path"
					]
				],
				else: true,
				style: {
					"stroke-color": "#cba",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"tunnel"
					],
					[
						"==",
						["get", "class"],
						"major_rail"
					]
				],
				else: true,
				style: {
					"stroke-color": "#bbb",
					"stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"==",
						["get", "class"],
						"motorway_link"
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"any",
						[
							"==",
							["get", "class"],
							"street"
						],
						[
							"==",
							["get", "class"],
							"street_limited"
						]
					],
					[
						"==",
						["geometry-type"],
						"LineString"
					]
				],
				else: true,
				style: {
					"stroke-color": "#cfcdca",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"==",
						["get", "class"],
						"main"
					],
					[
						"<=",
						["resolution"],
						1222.99245256282
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"==",
						["get", "class"],
						"motorway"
					],
					[
						"<=",
						["resolution"],
						4891.96981025128
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"==",
						["get", "class"],
						"path"
					]
				],
				else: true,
				style: {
					"stroke-color": "#cba",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"road"
					],
					[
						"==",
						["get", "class"],
						"major_rail"
					]
				],
				else: true,
				style: {
					"stroke-color": "#bbb",
					"stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"bridge"
					],
					[
						"any",
						[
							"==",
							["get", "class"],
							"motorway"
						],
						[
							"==",
							["get", "class"],
							"motorway_link"
						]
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"bridge"
					],
					[
						"any",
						[
							"==",
							["get", "class"],
							"street"
						],
						[
							"==",
							["get", "class"],
							"street_limited"
						],
						[
							"==",
							["get", "class"],
							"service"
						]
					]
				],
				else: true,
				style: {
					"stroke-color": "#cfcdca",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"bridge"
					],
					[
						"==",
						["get", "class"],
						"main"
					],
					[
						"<=",
						["resolution"],
						1222.99245256282
					]
				],
				else: true,
				style: {
					"stroke-color": "#e9ac77",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"bridge"
					],
					[
						"==",
						["get", "class"],
						"path"
					]
				],
				else: true,
				style: {
					"stroke-color": "#cba",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"bridge"
					],
					[
						"==",
						["get", "class"],
						"major_rail"
					]
				],
				else: true,
				style: {
					"stroke-color": "#bbb",
					"stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"admin"
					],
					[
						">=",
						["get", "admin_level"],
						2
					],
					[
						"==",
						["get", "maritime"],
						0
					]
				],
				else: true,
				style: {
					"stroke-color": "#9e9cab",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"admin"
					],
					[
						">=",
						["get", "admin_level"],
						2
					],
					[
						"==",
						["get", "maritime"],
						1
					]
				],
				else: true,
				style: {
					"stroke-color": "#a0c8f0",
					"stroke-width": 1
				}
			},
			{
				filter: [
					"any",
					[
						"==",
						["get", "layer"],
						"country_label"
					],
					[
						"==",
						["get", "layer"],
						"place_label"
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "bold 11px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#334",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"country_label"
					],
					[
						"==",
						["get", "scalerank"],
						2
					],
					[
						"<=",
						["resolution"],
						19567.87924100512
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "bold 10px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#334",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"country_label"
					],
					[
						"==",
						["get", "scalerank"],
						3
					],
					[
						"<=",
						["resolution"],
						9783.93962050256
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "bold 9px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#334",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"country_label"
					],
					[
						"==",
						["get", "scalerank"],
						4
					],
					[
						"<=",
						["resolution"],
						4891.96981025128
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "bold 8px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#334",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 2
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"marine_label"
					],
					[
						"==",
						["get", "labelrank"],
						1
					],
					[
						"==",
						["geometry-type"],
						"Point"
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "italic 11px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#74aee9",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"marine_label"
					],
					[
						"==",
						["get", "labelrank"],
						2
					],
					[
						"==",
						["geometry-type"],
						"Point"
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "italic 11px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#74aee9",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"marine_label"
					],
					[
						"==",
						["get", "labelrank"],
						3
					],
					[
						"==",
						["geometry-type"],
						"Point"
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "italic 10px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#74aee9",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"marine_label"
					],
					[
						"==",
						["get", "labelrank"],
						4
					],
					[
						"==",
						["geometry-type"],
						"Point"
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "italic 9px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#74aee9",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"place_label"
					],
					[
						"==",
						["get", "type"],
						"city"
					],
					[
						"<=",
						["resolution"],
						1222.99245256282
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "11px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#333",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"place_label"
					],
					[
						"==",
						["get", "type"],
						"town"
					],
					[
						"<=",
						["resolution"],
						305.748113140705
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "9px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#333",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"place_label"
					],
					[
						"==",
						["get", "type"],
						"village"
					],
					[
						"<=",
						["resolution"],
						38.21851414258813
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "8px \"Open Sans\", \"Arial Unicode MS\", sans-serif",
					"text-fill-color": "#333",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			},
			{
				filter: [
					"all",
					[
						"==",
						["get", "layer"],
						"place_label"
					],
					[
						"<=",
						["resolution"],
						19.109257071294063
					],
					[
						"any",
						[
							"==",
							["get", "type"],
							"hamlet"
						],
						[
							"==",
							["get", "type"],
							"suburb"
						],
						[
							"==",
							["get", "type"],
							"neighbourhood"
						]
					]
				],
				else: true,
				style: {
					"text-value": ["get", "name_en"],
					"text-font": "bold 9px \"Arial Narrow\"",
					"text-fill-color": "#633",
					"text-stroke-color": "rgba(255,255,255,0.8)",
					"text-stroke-width": 1
				}
			}
		]
	})],
	target: "map",
	view: new View({
		center: [0, 0],
		zoom: 2,
		multiWorld: true
	})
});
//#endregion

//# sourceMappingURL=webgl-vector-tiles.js.map