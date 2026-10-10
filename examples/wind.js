import { r as __toESM } from "./rolldown-runtime.js";
import { An as DataTileSource, At as DefaultUniform, Bo as DEVICE_PIXEL_RATIO, Cn as GeoJSON, Ct as Uniforms, Dr as Map, Ft as STATIC_DRAW, Mt as ARRAY_BUFFER, Ni as View, Oa as transform, St as Attributes, Un as VectorSource, Vr as ColorType, _t as getStringNumberEquivalent, br as BaseTileLayer, ct as expressionToGlsl, gr as wrapX, jt as WebGLArrayBuffer, mr as createXYZ, t as require_colormap, ti as Property_default, va as get, vt as newCompilationContext, wt as WebGLTileLayerRenderer, xt as uniformNameForVariable } from "./common.js";
import { t as WebGLVectorLayer } from "./WebGLVector.js";
//#region src/ol/renderer/webgl/FlowLayer.js
var import_colormap = /* @__PURE__ */ __toESM(require_colormap(), 1);
/**
* @module ol/renderer/webgl/FlowLayer
*/
/**
* @typedef {import("../../layer/Flow.js").default} LayerType
*/
/**
* @typedef {Object} Options
* @property {number} maxSpeed The maximum particle speed in the input data.
* @property {number} [speedFactor=0.001] A larger factor increases the rate at which particles cross the screen.
* @property {number} [particles=65536] The number of particles to render.
* @property {number} [cacheSize=512] The texture cache size.
* @property {string} tileVertexShader The flow tile vertex shader.
* @property {string} tileFragmentShader The flow tile fragment shader.
* @property {string} textureVertexShader Generic texture fragment shader.
* @property {string} textureFragmentShader Generic texture fragment shader.
* @property {string} particlePositionVertexShader The particle position vertex shader.
* @property {string} particlePositionFragmentShader The particle position fragment shader.
* @property {string} particleColorVertexShader The particle color vertex shader.
* @property {string} particleColorFragmentShader The particle color fragment shader.
*/
/**
* Shader uniforms.
* @enum {string}
*/
var U = {
	TEXTURE: "u_texture",
	VELOCITY_TEXTURE: "u_velocityTexture",
	POSITION_TEXTURE: "u_positionTexture",
	PARTICLE_COUNT_SQRT: "u_particleCountSqrt",
	MAX_SPEED: "u_maxSpeed",
	GAIN: "u_gain",
	OFFSET: "u_offset",
	IS_FLOAT: "u_isFloat",
	RANDOM_SEED: "u_randomSeed",
	SPEED_FACTOR: "u_speedFactor",
	DROP_RATE: "u_dropRate",
	DROP_RATE_BUMP: "u_dropRateBump",
	OPACITY: "u_opacity",
	ROTATION: DefaultUniform.ROTATION,
	VIEWPORT_SIZE_PX: DefaultUniform.VIEWPORT_SIZE_PX
};
/**
* Shader attributes.
* @enum {string}
*/
var A = {
	POSITION: "a_position",
	INDEX: "a_index"
};
/**
* Shader varyings.
* @enum {string}
*/
var V = { POSITION: "v_position" };
/**
* @classdesc
* Experimental WebGL renderer for vector fields.
* @extends {WebGLTileLayerRenderer<LayerType>}
*/
var FlowLayerRenderer = class extends WebGLTileLayerRenderer {
	/**
	* @param {LayerType} layer The tiled field layer.
	* @param {Options} options The renderer options.
	*/
	constructor(layer, options) {
		super(layer, {
			vertexShader: options.tileVertexShader,
			fragmentShader: options.tileFragmentShader,
			cacheSize: options.cacheSize,
			postProcesses: [{}],
			uniforms: { [U.MAX_SPEED]: options.maxSpeed }
		});
		/**
		* @type {string}
		* @private
		*/
		this.particleColorFragmentShader_ = options.particleColorFragmentShader;
		/**
		* @type {WebGLTexture|null}
		* @private
		*/
		this.velocityTexture_ = null;
		/**
		* @type {number}
		* @private
		*/
		this.particleCountSqrt_ = options.particles ? Math.ceil(Math.sqrt(options.particles)) : 256;
		/**
		* @type {WebGLArrayBuffer}
		* @private
		*/
		this.particleIndexBuffer_;
		/**
		* @type {WebGLArrayBuffer}
		* @private
		*/
		this.quadBuffer_;
		/**
		* @type {WebGLProgram}
		* @private
		*/
		this.particlePositionProgram_;
		/**
		* @type {string}
		* @private
		*/
		this.particlePositionVertexShader_ = options.particlePositionVertexShader;
		/**
		* @type {string}
		* @private
		*/
		this.particlePositionFragmentShader_ = options.particlePositionFragmentShader;
		/**
		* @type {WebGLTexture}
		* @private
		*/
		this.previousPositionTexture_;
		/**
		* @type {WebGLTexture}
		* @private
		*/
		this.nextPositionTexture_;
		/**
		* @type {WebGLProgram}
		* @private
		*/
		this.particleColorProgram_;
		/**
		* @type {string}
		* @private
		*/
		this.particleColorVertexShader_ = options.particleColorVertexShader;
		/**
		* @type {string}
		* @private
		*/
		this.particleColorFragmentShader_ = options.particleColorFragmentShader;
		/**
		* @type {WebGLProgram}
		* @private
		*/
		this.textureProgram_;
		/**
		* @type {string}
		* @private
		*/
		this.textureVertexShader_ = options.textureVertexShader;
		/**
		* @type {string}
		* @private
		*/
		this.textureFragmentShader_ = options.textureFragmentShader;
		/**
		* @type {WebGLTexture}
		* @private
		*/
		this.previousTrailsTexture_;
		/**
		* @type {WebGLTexture}
		* @private
		*/
		this.nextTrailsTexture_;
		/**
		* @type {number}
		* @private
		*/
		this.fadeOpacity_ = .996;
		/**
		* @type {number}
		* @private
		*/
		this.maxSpeed_ = options.maxSpeed;
		/**
		* @type {number}
		* @private
		*/
		this.speedFactor_ = options.speedFactor || .001;
		/**
		* @type {number}
		* @private
		*/
		this.dropRate_ = .003;
		/**
		* @type {number}
		* @private
		*/
		this.dropRateBump_ = .01;
		/**
		* @type {Array<number>}
		* @private
		*/
		this.tempVec2_ = [0, 0];
		/**
		* @type {number}
		* @private
		*/
		this.renderedWidth_ = 0;
		/**
		* @type {number}
		* @private
		*/
		this.renderedHeight_ = 0;
	}
	/**
	* @override
	*/
	afterHelperCreated() {
		super.afterHelperCreated();
		const helper = this.helper;
		const gl = helper.getGL();
		this.framebuffer_ = gl.createFramebuffer();
		const particleCount = this.particleCountSqrt_ * this.particleCountSqrt_;
		const particleIndices = new Float32Array(particleCount);
		for (let i = 0; i < particleCount; ++i) particleIndices[i] = i;
		const particleIndexBuffer = new WebGLArrayBuffer(ARRAY_BUFFER, STATIC_DRAW);
		particleIndexBuffer.setArray(particleIndices);
		helper.flushBufferData(particleIndexBuffer);
		this.particleIndexBuffer_ = particleIndexBuffer;
		const quadIndices = new Float32Array([
			0,
			0,
			1,
			0,
			0,
			1,
			0,
			1,
			1,
			0,
			1,
			1
		]);
		const quadBuffer = new WebGLArrayBuffer(ARRAY_BUFFER, STATIC_DRAW);
		quadBuffer.setArray(quadIndices);
		helper.flushBufferData(quadBuffer);
		this.quadBuffer_ = quadBuffer;
		const particlePositions = new Uint8Array(particleCount * 4);
		for (let i = 0; i < particlePositions.length; ++i) particlePositions[i] = Math.floor(Math.random() * 256);
		this.previousPositionTexture_ = helper.createTexture([this.particleCountSqrt_, this.particleCountSqrt_], particlePositions, void 0, true);
		this.nextPositionTexture_ = helper.createTexture([this.particleCountSqrt_, this.particleCountSqrt_], particlePositions, void 0, true);
		this.particlePositionProgram_ = helper.getProgram(this.particlePositionFragmentShader_, this.particlePositionVertexShader_);
		this.particleColorProgram_ = helper.getProgram(this.particleColorFragmentShader_, this.particleColorVertexShader_);
		this.textureProgram_ = helper.getProgram(this.textureFragmentShader_, this.textureVertexShader_);
	}
	createSizeDependentTextures_() {
		const helper = this.helper;
		const gl = helper.getGL();
		const canvas = helper.getCanvas();
		const screenWidth = canvas.width;
		const screenHeight = canvas.height;
		const blank = new Uint8Array(screenWidth * screenHeight * 4);
		if (this.nextTrailsTexture_) gl.deleteTexture(this.nextTrailsTexture_);
		this.nextTrailsTexture_ = helper.createTexture([screenWidth, screenHeight], blank, void 0, true);
		if (this.previousTrailsTexture_) gl.deleteTexture(this.previousTrailsTexture_);
		this.previousTrailsTexture_ = helper.createTexture([screenWidth, screenHeight], blank, void 0, true);
	}
	/**
	* @override
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	beforeFinalize(frameState) {
		const helper = this.helper;
		const gl = helper.getGL();
		const canvas = helper.getCanvas();
		const screenWidth = canvas.width;
		const screenHeight = canvas.height;
		if (this.renderedWidth_ != screenWidth || this.renderedHeight_ != screenHeight) this.createSizeDependentTextures_();
		const size = [screenWidth, screenHeight];
		this.velocityTexture_ = helper.createTexture(size, null, this.velocityTexture_ ?? void 0);
		gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, screenWidth, screenHeight, 0);
		this.drawParticleTrails_(frameState);
		this.updateParticlePositions_(frameState);
		frameState.animate = true;
		this.renderedWidth_ = screenWidth;
		this.renderedHeight_ = screenHeight;
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	drawParticleTrails_(frameState) {
		const helper = this.helper;
		const gl = helper.getGL();
		helper.bindFrameBuffer(this.framebuffer_ ?? null, this.nextTrailsTexture_ ?? null);
		this.drawTexture_(this.previousTrailsTexture_ ?? void 0, this.fadeOpacity_);
		this.drawParticleColor_(frameState);
		helper.bindInitialFrameBuffer();
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.drawTexture_(this.nextTrailsTexture_ ?? void 0, 1);
		gl.disable(gl.BLEND);
		const current = this.nextTrailsTexture_;
		this.nextTrailsTexture_ = this.previousTrailsTexture_;
		this.previousTrailsTexture_ = current;
	}
	/**
	* @param {WebGLTexture|undefined} texture The texture to draw.
	* @param {number} opacity The opacity.
	*/
	drawTexture_(texture, opacity) {
		if (!texture) return;
		const helper = this.helper;
		const gl = helper.getGL();
		helper.useProgram(this.textureProgram_);
		helper.bindTexture(texture, 0, U.TEXTURE);
		helper.bindAttribute(this.quadBuffer_, A.POSITION, 2);
		this.helper.setUniformFloatValue(U.OPACITY, opacity);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	drawParticleColor_(frameState) {
		const helper = this.helper;
		const gl = helper.getGL();
		helper.useProgram(this.particleColorProgram_);
		const particleCount = this.particleCountSqrt_ * this.particleCountSqrt_;
		helper.bindAttribute(this.particleIndexBuffer_, A.INDEX, 1);
		const previousPositionTexture = this.previousPositionTexture_;
		if (previousPositionTexture) helper.bindTexture(previousPositionTexture, 0, U.POSITION_TEXTURE);
		const velocityTexture = this.velocityTexture_;
		if (velocityTexture) helper.bindTexture(velocityTexture, 1, U.VELOCITY_TEXTURE);
		this.helper.setUniformFloatValue(U.PARTICLE_COUNT_SQRT, this.particleCountSqrt_);
		const rotation = this.tempVec2_;
		rotation[0] = Math.cos(-frameState.viewState.rotation);
		rotation[1] = Math.sin(-frameState.viewState.rotation);
		this.helper.setUniformFloatVec2(U.ROTATION, rotation);
		this.helper.setUniformFloatValue(U.MAX_SPEED, this.maxSpeed_);
		gl.drawArrays(gl.POINTS, 0, particleCount);
	}
	/**
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	*/
	updateParticlePositions_(frameState) {
		const helper = this.helper;
		const gl = helper.getGL();
		helper.useProgram(this.particlePositionProgram_);
		gl.viewport(0, 0, this.particleCountSqrt_, this.particleCountSqrt_);
		helper.bindFrameBuffer(this.framebuffer_ ?? null, this.nextPositionTexture_ ?? null);
		const previousPositionTexture = this.previousPositionTexture_;
		if (previousPositionTexture) helper.bindTexture(previousPositionTexture, 0, U.POSITION_TEXTURE);
		const velocityTexture = this.velocityTexture_;
		if (velocityTexture) helper.bindTexture(velocityTexture, 1, U.VELOCITY_TEXTURE);
		helper.bindAttribute(this.quadBuffer_, A.POSITION, 2);
		helper.setUniformFloatValue(U.RANDOM_SEED, Math.random());
		helper.setUniformFloatValue(U.SPEED_FACTOR, this.speedFactor_);
		helper.setUniformFloatValue(U.DROP_RATE, this.dropRate_);
		helper.setUniformFloatValue(U.DROP_RATE_BUMP, this.dropRateBump_);
		const rotation = this.tempVec2_;
		rotation[0] = Math.cos(-frameState.viewState.rotation);
		rotation[1] = Math.sin(-frameState.viewState.rotation);
		this.helper.setUniformFloatVec2(U.ROTATION, rotation);
		const size = frameState.size;
		this.helper.setUniformFloatVec2(U.VIEWPORT_SIZE_PX, [size[0], size[1]]);
		gl.drawArrays(gl.TRIANGLES, 0, 6);
		const current = this.nextPositionTexture_;
		this.nextPositionTexture_ = this.previousPositionTexture_;
		this.previousPositionTexture_ = current;
	}
};
//#endregion
//#region src/ol/layer/Flow.js
/**
* @module ol/layer/Flow
*/
/**
* @typedef {import("../source/DataTile.js").default} SourceType
*/
/**
* @typedef {Object} Style
* Translates tile data to rendered pixels.
*
* @property {Object<string, (string|number)>} [variables] Style variables.  Each variable must hold a number or string.  These
* variables can be used in the `color` {@link import("../expr/expression.js").ExpressionValue expression} using
* the `['var', 'varName']` operator.  To update style variables, use the {@link import("./WebGLTile.js").default#updateStyleVariables} method.
* @property {import("../expr/expression.js").ExpressionValue} [color] An expression applied to color values.
*/
/**
* @typedef {Object} Options
* @property {number} maxSpeed The maximum particle speed.
* @property {number} [speedFactor=0.001] A larger factor increases the rate at which particles cross the screen.
* @property {number} [particles=65536] The number of particles to render.
* @property {Style} [style] Style to apply to the layer.
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
* @property {number} [preload=0] Preload. Load low-resolution tiles up to `preload` levels. `0`
* means no preloading.
* @property {SourceType} [source] Source for this layer.
* @property {import("../Map.js").default} [map] Sets the layer as overlay on a map. The map will not manage
* this layer in its layers collection, and the layer will be rendered on top. This is useful for
* temporary layers. The standard way to add a layer to a map and have it managed by the map is to
* use {@link module:ol/Map~Map#addLayer}.
* @property {boolean} [useInterimTilesOnError=true] Use interim tiles on error.
* @property {number} [cacheSize=512] The internal texture cache size.  This needs to be large enough to render
* two zoom levels worth of tiles.
*/
var tileVertexShader = `
  attribute vec2 ${Attributes.TEXTURE_COORD};
  uniform mat4 ${Uniforms.TILE_TRANSFORM};
  uniform float ${Uniforms.TEXTURE_PIXEL_WIDTH};
  uniform float ${Uniforms.TEXTURE_PIXEL_HEIGHT};
  uniform float ${Uniforms.TEXTURE_RESOLUTION};
  uniform float ${Uniforms.DEPTH};

  varying vec2 v_textureCoord;
  varying vec2 v_localMapCoord;

  void main() {
    v_textureCoord = ${Attributes.TEXTURE_COORD};
    v_localMapCoord = vec2(
      ${Uniforms.TEXTURE_RESOLUTION} * ${Uniforms.TEXTURE_PIXEL_WIDTH} * v_textureCoord[0],
      -1. * ${Uniforms.TEXTURE_RESOLUTION} * ${Uniforms.TEXTURE_PIXEL_HEIGHT} * v_textureCoord[1]
    );
    gl_Position = ${Uniforms.TILE_TRANSFORM} * vec4(${Attributes.TEXTURE_COORD}, ${Uniforms.DEPTH}, 1.0);
  }
`;
var tileFragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform vec4 ${Uniforms.RENDER_EXTENT};
  uniform float ${U.MAX_SPEED};
  uniform sampler2D ${Uniforms.TILE_TEXTURE_ARRAY}[1];

  varying vec2 v_textureCoord;
  varying vec2 v_localMapCoord;

  void main() {
    if (
      v_localMapCoord[0] < ${Uniforms.RENDER_EXTENT}[0] ||
      v_localMapCoord[1] < ${Uniforms.RENDER_EXTENT}[1] ||
      v_localMapCoord[0] > ${Uniforms.RENDER_EXTENT}[2] ||
      v_localMapCoord[1] > ${Uniforms.RENDER_EXTENT}[3]
    ) {
      discard;
    }

    vec4 velocity = texture2D(${Uniforms.TILE_TEXTURE_ARRAY}[0],  v_textureCoord);
    gl_FragColor = vec4((velocity.xy + ${U.MAX_SPEED}) / (2.0 * ${U.MAX_SPEED}), 0, 1);
  }
`;
/**
* Sets up a varying position for rendering textures.
*/
var quadVertexShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  attribute vec2 ${A.POSITION};

  varying vec2 ${V.POSITION};

  void main() {
    ${V.POSITION} = ${A.POSITION};
    gl_Position = vec4(1.0 - 2.0 * ${A.POSITION}, 0, 1);
  }
`;
/**
* Sampes a texture and renders it with a new opacity.
*/
var textureFragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform sampler2D ${U.TEXTURE};
  uniform float ${U.OPACITY};

  varying vec2 ${V.POSITION};

  void main() {
    vec4 color = texture2D(${U.TEXTURE}, 1.0 - ${V.POSITION});
    gl_FragColor = vec4(floor(255.0 * color * ${U.OPACITY}) / 255.0);
  }
`;
/**
* Samples current particle positions, determines new positions based on velocity, and
* encodes the new position as a color.
*/
var particlePositionFragmentShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  uniform sampler2D ${U.POSITION_TEXTURE};
  uniform sampler2D ${U.VELOCITY_TEXTURE};
  uniform float ${U.RANDOM_SEED};
  uniform float ${U.SPEED_FACTOR};
  uniform float ${U.DROP_RATE};
  uniform float ${U.DROP_RATE_BUMP};
  uniform vec2 ${U.ROTATION};
  uniform vec2 ${U.VIEWPORT_SIZE_PX};

  varying vec2 ${V.POSITION};

  // pseudo-random generator
  const vec3 randConstants = vec3(12.9898, 78.233, 4375.85453);

  float rand(const vec2 co) {
    float t = dot(randConstants.xy, co);
    return fract(sin(t) * (randConstants.z + t));
  }

  void main() {
    vec4 positionColor = texture2D(${U.POSITION_TEXTURE}, ${V.POSITION});

    // decode particle position from pixel RGBA
    vec2 particlePosition = vec2(
      positionColor.r / 255.0 + positionColor.b,
      positionColor.g / 255.0 + positionColor.a
    );

    vec4 velocityColor = texture2D(${U.VELOCITY_TEXTURE}, particlePosition);
    if (velocityColor.a == 0.0) {
      discard;
    }

    float vx = 2.0 * velocityColor.r - 1.0;
    float vy = 2.0 * velocityColor.g - 1.0;

    // normalized veloicty (magnitude 0 - 1)
    vec2 velocity = vec2(
      vx * ${U.ROTATION}.x - vy * ${U.ROTATION}.y,
      vx * ${U.ROTATION}.y + vy * ${U.ROTATION}.x
    );

    // account for aspect ratio (square particle position texture, non-square map)
    float aspectRatio = ${U.VIEWPORT_SIZE_PX}.x / ${U.VIEWPORT_SIZE_PX}.y;
    vec2 offset = vec2(velocity.x / aspectRatio, velocity.y) * ${U.SPEED_FACTOR};

    // update particle position, wrapping around the edge
    particlePosition = fract(1.0 + particlePosition + offset);

    // a random seed to use for the particle drop
    vec2 seed = (particlePosition + ${V.POSITION}) * ${U.RANDOM_SEED};

    // drop rate is a chance a particle will restart at random position, to avoid degeneration
    float dropRate = ${U.DROP_RATE} + length(velocity) * ${U.DROP_RATE_BUMP};
    float drop = step(1.0 - dropRate, rand(seed));

    vec2 randomPosition = vec2(rand(seed + 1.3), rand(seed + 2.1));
    particlePosition = mix(particlePosition, randomPosition, drop);

    // encode the new particle position back into RGBA
    gl_FragColor = vec4(
      fract(particlePosition * 255.0),
      floor(particlePosition * 255.0) / 255.0
    );
  }
`;
/**
* Samples the particle position texture to decode the particle position
* based on pixel color.
*/
var particleColorVertexShader = `
  #ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
  #else
  precision mediump float;
  #endif

  attribute float ${A.INDEX};

  uniform sampler2D ${U.POSITION_TEXTURE};
  uniform float ${U.PARTICLE_COUNT_SQRT};

  varying vec2 ${V.POSITION};

  void main() {
    vec4 color = texture2D(
      ${U.POSITION_TEXTURE},
      vec2(
        fract(${A.INDEX} / ${U.PARTICLE_COUNT_SQRT}),
        floor(${A.INDEX} / ${U.PARTICLE_COUNT_SQRT}) / ${U.PARTICLE_COUNT_SQRT}
      )
    );

    ${V.POSITION} = vec2(
      color.r / 255.0 + color.b,
      color.g / 255.0 + color.a
    );

    gl_PointSize = 1.0;
    gl_Position = vec4(
      2.0 * ${V.POSITION}.x - 1.0,
      2.0 * ${V.POSITION}.y - 1.0,
      0,
      1
    );
  }
`;
/**
* @typedef {Object} ParsedStyle
* @property {string} tileVertexShader The flow tile vertex shader.
* @property {string} tileFragmentShader The flow tile fragment shader.
* @property {string} textureVertexShader Generic texture fragment shader.
* @property {string} textureFragmentShader Generic texture fragment shader.
* @property {string} particlePositionVertexShader The particle position vertex shader.
* @property {string} particlePositionFragmentShader The particle position fragment shader.
* @property {string} particleColorVertexShader The particle color vertex shader.
* @property {string} particleColorFragmentShader The particle color fragment shader.
*/
/**
* @param {Style} style The layer style.
* @return {ParsedStyle} Shaders and uniforms generated from the style.
*/
function parseStyle(style) {
	const context = newCompilationContext();
	const pipeline = [];
	if (style.color !== void 0) {
		const color = expressionToGlsl(context, style.color, ColorType);
		pipeline.push(`color = ${color};`);
	}
	if (context.variables.size > 1 && !style.variables) throw new Error(`Missing variables in style (expected ${Array.from(context.variables.keys())})`);
	/** @type {Object<string,import("../webgl/Helper.js").UniformValue>} */
	const uniforms = {};
	for (const [variableName] of context.variables.entries()) {
		const variables = style.variables || {};
		if (!(variableName in variables)) throw new Error(`Missing '${variableName}' in style variables`);
		const uniformName = uniformNameForVariable(variableName);
		uniforms[uniformName] = function() {
			let value = variables[variableName];
			if (typeof value === "string") value = getStringNumberEquivalent(value);
			return value !== void 0 ? value : -9999999;
		};
	}
	const uniformDeclarations = Object.keys(uniforms).map(function(name) {
		return `uniform float ${name};`;
	});
	const functionDefintions = Object.keys(context.functions).map(function(name) {
		return context.functions[name];
	});
	return {
		tileVertexShader,
		tileFragmentShader,
		particleColorVertexShader,
		particleColorFragmentShader: `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif

    uniform sampler2D ${U.VELOCITY_TEXTURE};
    uniform float ${U.MAX_SPEED};
    uniform vec2 ${U.ROTATION};

    ${uniformDeclarations.join("\n")}

    varying vec2 ${V.POSITION};
    
    ${functionDefintions.join("\n")}

    void main() {
      vec4 velocityColor = texture2D(${U.VELOCITY_TEXTURE}, ${V.POSITION});

      float vx = mix(-${U.MAX_SPEED}, ${U.MAX_SPEED}, velocityColor.r);
      float vy = mix(-${U.MAX_SPEED}, ${U.MAX_SPEED}, velocityColor.g);

      vec2 velocity = vec2(
        vx * ${U.ROTATION}.x - vy * ${U.ROTATION}.y,
        vx * ${U.ROTATION}.y + vy * ${U.ROTATION}.x
      );

      float a_prop_speed = length(velocity);

      vec4 color;

      ${pipeline.join("\n")}

      if (color.a == 0.0) {
        discard;
      }

      gl_FragColor = color;
    }
  `,
		particlePositionVertexShader: quadVertexShader,
		particlePositionFragmentShader,
		textureVertexShader: quadVertexShader,
		textureFragmentShader
	};
}
/**
* @type {Array<SourceType>}
*/
var sources = [];
/**
* @classdesc
* Experimental layer that renders particles moving through a vector field.
*
* @extends BaseTileLayer<SourceType, FlowLayerRenderer>
* @fires import("../render/Event.js").RenderEvent#prerender
* @fires import("../render/Event.js").RenderEvent#postrender
*/
var FlowLayer = class extends BaseTileLayer {
	/**
	* @param {Options} options Flow layer options.
	*/
	constructor(options) {
		const baseOptions = Object.assign({}, options);
		delete baseOptions.maxSpeed;
		delete baseOptions.speedFactor;
		delete baseOptions.particles;
		super(baseOptions);
		/**
		* @type {Style}
		* @private
		*/
		this.style_ = options.style || {};
		if (!(options.maxSpeed > 0)) throw new Error("maxSpeed is required");
		/**
		* @type {number}
		* @private
		*/
		this.maxSpeed_ = options.maxSpeed;
		/**
		* @type {number}
		* @private
		*/
		this.speedFactor_ = options.speedFactor ?? .001;
		/**
		* @type {number}
		* @private
		*/
		this.particles_ = options.particles ?? 65536;
		/**
		* @type {Object<string, (string|number)>}
		* @private
		*/
		this.styleVariables_ = this.style_.variables || {};
		this.addChangeListener(Property_default.SOURCE, this.handleSourceUpdate_);
	}
	/**
	* @private
	*/
	handleSourceUpdate_() {
		const renderer = this.getRenderer();
		if (renderer) renderer.clearCache();
	}
	/**
	* Update any variables used by the layer style and trigger a re-render.
	* @param {Object<string, number>} variables Variables to update.
	*/
	updateStyleVariables(variables) {
		Object.assign(this.styleVariables_, variables);
		this.changed();
	}
	/**
	* Gets the sources for this layer, for a given extent and resolution.
	* @param {import("../extent.js").Extent} extent Extent.
	* @param {number} resolution Resolution.
	* @return {Array<SourceType>} Sources.
	*/
	getSources(extent, resolution) {
		const source = this.getSource();
		sources.length = 0;
		if (source) sources.push(source);
		return sources;
	}
	/**
	* @override
	*/
	createRenderer() {
		const parsedStyle = parseStyle(this.style_);
		return new FlowLayerRenderer(this, {
			...parsedStyle,
			cacheSize: this.getCacheSize(),
			maxSpeed: this.maxSpeed_,
			speedFactor: this.speedFactor_,
			particles: this.particles_
		});
	}
};
/**
* Clean up underlying WebGL resources.
* @function
*/
FlowLayer.prototype.dispose;
//#endregion
//#region examples/wind.js
var windData = new Promise((resolve, reject) => {
	const image = new Image();
	image.onload = () => {
		const canvas = document.createElement("canvas");
		const width = image.width;
		const height = image.height;
		canvas.width = width;
		canvas.height = height;
		const context = canvas.getContext("2d");
		context.drawImage(image, 0, 0);
		const data = context.getImageData(0, 0, width, height).data;
		resolve({
			data,
			width,
			height
		});
	};
	image.onerror = () => {
		reject(/* @__PURE__ */ new Error("failed to load"));
	};
	image.src = "./data/wind.png";
});
function bilinearInterpolation(xAlong, yAlong, v11, v21, v12, v22) {
	const q11 = (1 - xAlong) * (1 - yAlong) * v11;
	const q21 = xAlong * (1 - yAlong) * v21;
	const q12 = (1 - xAlong) * yAlong * v12;
	const q22 = xAlong * yAlong * v22;
	return q11 + q21 + q12 + q22;
}
function interpolatePixels(xAlong, yAlong, p11, p21, p12, p22) {
	return p11.map((_, i) => bilinearInterpolation(xAlong, yAlong, p11[i], p21[i], p12[i], p22[i]));
}
var dataTileGrid = createXYZ();
var dataTileSize = 256;
var inputImageProjection = get("EPSG:4326");
var dataTileProjection = get("EPSG:3857");
var inputBands = 4;
var dataBands = 3;
var minU = -21.32;
var deltaU = 26.8 - minU;
var minV = -21.57;
var deltaV = 21.42 - minV;
var wind = new DataTileSource({
	transition: 0,
	wrapX: true,
	async loader(z, x, y) {
		const { data: inputData, width: inputWidth, height: inputHeight } = await windData;
		const tileCoord = wrapX(dataTileGrid, [
			z,
			x,
			y
		], dataTileProjection);
		const extent = dataTileGrid.getTileCoordExtent(tileCoord);
		const resolution = dataTileGrid.getResolution(z);
		const data = new Float32Array(dataTileSize * dataTileSize * dataBands);
		for (let row = 0; row < dataTileSize; ++row) {
			let offset = row * dataTileSize * dataBands;
			const mapY = extent[3] - row * resolution;
			for (let col = 0; col < dataTileSize; ++col) {
				const [lon, lat] = transform([extent[0] + col * resolution, mapY], dataTileProjection, inputImageProjection);
				const x = inputWidth * (lon + 180) / 360;
				let x1 = Math.floor(x);
				let x2 = Math.ceil(x);
				const xAlong = x - x1;
				if (x1 < 0) x1 += inputWidth;
				if (x2 >= inputWidth) x2 -= inputWidth;
				const y = inputHeight * (90 - lat) / 180;
				let y1 = Math.floor(y);
				let y2 = Math.ceil(y);
				const yAlong = y - y1;
				if (y1 < 0) y1 = 0;
				if (y2 >= inputHeight) y2 = inputHeight - 1;
				const interpolated = interpolatePixels(xAlong, yAlong, ...[
					[x1, y1],
					[x2, y1],
					[x1, y2],
					[x2, y2]
				].map(([cx, cy]) => {
					const inputOffset = (cy * 360 + cx) * inputBands;
					return [inputData[inputOffset], inputData[inputOffset + 1]];
				}));
				const u = minU + deltaU * interpolated[0] / 255;
				const v = minV + deltaV * interpolated[1] / 255;
				data[offset] = u;
				data[offset + 1] = v;
				offset += dataBands;
			}
		}
		return data;
	}
});
var maxSpeed = 20;
var colors = (0, import_colormap.default)({
	colormap: "viridis",
	nshades: 10,
	alpha: .75,
	format: "rgba"
});
var colorStops = [];
for (let i = 0; i < colors.length; ++i) {
	colorStops.push(i * maxSpeed / (colors.length - 1));
	colorStops.push(colors[i]);
}
new Map({
	target: "map",
	pixelRatio: Math.min(DEVICE_PIXEL_RATIO, 2),
	layers: [new WebGLVectorLayer({
		source: new VectorSource({
			url: "https://openlayers.org/data/vector/ocean.json",
			format: new GeoJSON()
		}),
		style: { "fill-color": "#555555" }
	}), new FlowLayer({
		source: wind,
		maxSpeed,
		style: { color: [
			"interpolate",
			["linear"],
			["get", "speed"],
			...colorStops
		] }
	})],
	view: new View({
		center: [0, 0],
		zoom: 0
	})
});
//#endregion

//# sourceMappingURL=wind.js.map