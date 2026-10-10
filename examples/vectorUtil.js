import { At as DefaultUniform, Br as BooleanType, Ci as createCanvasContext2D, Fn as scale, Fo as assert, Gr as StringType, Hr as NumberArrayType, In as translate, Kn as RenderFeature, Kr as computeGeometryType, Mn as fromTransform, Mt as ARRAY_BUFFER, Nn as reset, Nt as DYNAMIC_DRAW, Pn as rotate, Pt as ELEMENT_ARRAY_BUFFER, Qo as equals, Ur as NumberType, Vr as ColorType, Wi as inflateEnds, Wr as SizeType, Zo as getUid, _t as getStringNumberEquivalent, aa as create$2, bt as stringToGlsl, ct as expressionToGlsl, dt as getGlslSizeFromType, es as Disposable, ft as getGlslTypeFromType, gt as colorToGlsl, ht as UNDEFINED_PROP_VALUE, it as __vitePreload, jn as create$1, jt as WebGLArrayBuffer, kt as AttributeType, la as setFromArray, lt as generateAttributesFromContext, mt as GEOMETRY_TYPE_PROPERTY_NAME, na as apply, oa as makeInverse, ot as UNPACK_COLOR_FN, pt as FEATURE_ID_PROPERTY_NAME, qr as newParsingContext, ra as compose, sa as multiply, st as applyContextToBuilder, ta as transform2D, ut as generateUniformsFromContext, vt as newCompilationContext, yt as numberToGlsl } from "./common.js";
//#region src/ol/style/flat.js
/**
* @module ol/style/flat
*/
/**
* @api
* @fileoverview Vector layers can be styled with an object literal containing properties for
* stroke, fill, image, and text styles.  The types below can be composed into a single object.
* For example, a style with both stroke and fill properties could look like this:
*
*     const style = {
*       'stroke-color': 'yellow',
*       'stroke-width': 1.5,
*       'fill-color': 'orange',
*     };
*
* See details about the available properties depending on what type of symbolizer should be applied:
*  {@link module:ol/style/flat~FlatStroke Stroke} - properties for applying a stroke to lines and polygons
*  {@link module:ol/style/flat~FlatFill Fill} - properties for filling polygons
*  {@link module:ol/style/flat~FlatText Text} - properties for labeling points, lines, and polygons
*  {@link module:ol/style/flat~FlatIcon Icon} - properties for rendering points with an icon
*  {@link module:ol/style/flat~FlatCircle Circle} - properties for rendering points with a circle
*  {@link module:ol/style/flat~FlatShape Shape} - properties for rendering points with a regular shape
*
* To conditionally apply styles based on a filter, a list of {@link module:ol/style/flat~Rule rules} can be used.
* For example, to style points with a big orange circle if the population is greater than 1 million and
* a smaller blue circle otherwise:
*
*     const rules = [
*       {
*         filter: ['>', ['get', 'population'], 1_000_000],
*         style: {
*           'circle-radius': 10,
*           'circle-fill-color': 'red',
*         }
*       },
*       {
*         else: true,
*         style: {
*           'circle-radius': 5,
*           'circle-fill-color': 'blue',
*         },
*       },
*     ];
*/
/**
* A literal boolean (e.g. `true`) or an expression that evaluates to a boolean (e.g. `['>', ['get', 'population'], 1_000_000]`).
*
* @typedef {boolean|Array<*>} BooleanExpression
*/
/**
* A literal string (e.g. `'hello'`) or an expression that evaluates to a string (e.g. `['get', 'greeting']`).
*
* @typedef {string|Array<*>} StringExpression
*/
/**
* A literal number (e.g. `42`) or an expression that evaluates to a number (e.g. `['+', 40, 2]`).
*
* @typedef {number|Array<*>} NumberExpression
*/
/**
* A CSS named color (e.g. `'blue'`), an array of 3 RGB values (e.g. `[0, 255, 0]`), an array of 4 RGBA values
* (e.g. `[0, 255, 0, 0.5]`), or an expression that evaluates to one of these color types (e.g. `['get', 'color']`).
*
* @typedef {import("../color.js").Color|string|Array<*>} ColorExpression
*/
/**
* An array of numbers (e.g. `[1, 2, 3]`) or an expression that evaluates to the same (e.g. `['get', 'values']`).
*
* @typedef {Array<number>|Array<*>} NumberArrayExpression
*/
/**
* An array of two numbers (e.g. `[10, 20]`) or an expression that evaluates to the same (e.g. `['get', 'size']`).
*
* @typedef {number|Array<number>|Array<*>} SizeExpression
*/
/**
* For static styling, the [layer.setStyle()]{@link module:ol/layer/Vector~VectorLayer#setStyle} method
* can be called with an object literal that has fill, stroke, text, icon, regular shape, and/or circle properties.
* @api
*
* @typedef {FlatFill & FlatStroke & FlatText & FlatIcon & FlatShape & FlatCircle} FlatStyle
*/
/**
* A flat style literal or an array of the same.
*
* @typedef {FlatStyle|Array<FlatStyle>|Array<Rule>} FlatStyleLike
*/
/**
* Fill style properties applied to polygon features.
*
* @typedef {Object} FlatFill
* @property {ColorExpression} [fill-color] The fill color. `'none'` means no fill and no hit detection (applies to Canvas only).
* @property {StringExpression} [fill-pattern-src] Fill pattern image source URI. If `fill-color` is defined as well,
* it will be used to tint this image. (Expressions only in Canvas)
* @property {SizeExpression} [fill-pattern-size] Fill pattern image size in pixels.
* Can be used together with `fill-pattern-offset` to define the sub-rectangle to use
* from a fill pattern image sprite sheet.
* @property {SizeExpression} [fill-pattern-offset=[0, 0]] Offset, which, together with the size and the offset origin, define the
* sub-rectangle to use from the original fill pattern image.
* @property {import("./Icon.js").IconOrigin} [fill-pattern-offset-origin='top-left'] Origin of the offset: `bottom-left`, `bottom-right`,
* `top-left` or `top-right`. (WebGL only)
*/
/**
* Stroke style properties applied to line strings and polygon boundaries. To apply a stroke, at least one of
* `stroke-color` or `stroke-width` must be provided.
*
* @typedef {Object} FlatStroke
* @property {ColorExpression} [stroke-color] The stroke color.
* @property {NumberExpression} [stroke-width] Stroke pixel width.
* @property {StringExpression} [stroke-line-cap='round'] Line cap style: `butt`, `round`, or `square`.
* @property {StringExpression} [stroke-line-join='round'] Line join style: `bevel`, `round`, or `miter`.
* @property {NumberArrayExpression} [stroke-line-dash] Line dash pattern.
* @property {NumberExpression} [stroke-line-dash-offset=0] Line dash offset.
* @property {NumberExpression} [stroke-miter-limit=10] Miter limit.
* @property {NumberExpression} [stroke-offset] Stroke offset in pixel along the normal. A positive value offsets the line to the right,
* relative to the direction of the line.
* @property {string} [stroke-pattern-src] Stroke pattern image source URI. If `stroke-color` is defined as well,
* it will be used to tint this image. (WebGL only)
* @property {SizeExpression} [stroke-pattern-offset=[0, 0]] Offset, which, together with the size and the offset origin,
* define the sub-rectangle to use from the original stroke pattern image. (WebGL only)
* @property {import("./Icon.js").IconOrigin} [stroke-pattern-offset-origin='top-left'] Origin of the offset: `bottom-left`, `bottom-right`,
* `top-left` or `top-right`. (WebGL only)
* @property {SizeExpression} [stroke-pattern-size] Stroke pattern image size in pixel. Can be used together with `stroke-pattern-offset` to define the
* sub-rectangle to use from the origin (sprite) fill pattern image. (WebGL only)
* @property {NumberExpression} [stroke-pattern-spacing] Spacing between each pattern occurrence in pixels; 0 if undefined. (WebGL only)
* @property {NumberExpression} [stroke-pattern-start-offset] Stroke pattern offset in pixels at the start of the line. (WebGL only)
* @property {NumberExpression} [z-index] The zIndex of the style.
*/
/**
* Label style properties applied to all features. At a minimum, a `text-value` must be provided.
* Note: text style is currently not supported in WebGL layers
*
* @typedef {Object} FlatText
* @property {StringExpression} [text-value] Text content (with `\n` for line breaks).
* @property {StringExpression} [text-font='10px sans-serif'] Font style as [CSS `font`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font) value.
* @property {NumberExpression} [text-max-angle=Math.PI/4] When `text-placement` is set to `'line'`, allow a maximum angle between adjacent characters.
* The expected value is in radians, and the default is 45° (`Math.PI / 4`).
* @property {NumberExpression} [text-offset-x=0] Horizontal text offset in pixels. A positive will shift the text right.
* @property {NumberExpression} [text-offset-y=0] Vertical text offset in pixels. A positive will shift the text down.
* @property {BooleanExpression} [text-overflow=false] For polygon labels or when `placement` is set to `'line'`, allow text to exceed
* the width of the polygon at the label position or the length of the path that it follows.
* @property {StringExpression} [text-placement='point'] Text placement.
* @property {NumberExpression} [text-repeat] Repeat interval in pixels. When set, the text will be repeated at this interval. Only available when
* `text-placement` is set to `'line'`. Overrides `text-align`.
* @property {SizeExpression} [text-scale] Scale.
* @property {BooleanExpression} [text-rotate-with-view=false] Whether to rotate the text with the view.
* @property {NumberExpression} [text-rotation=0] Rotation in radians (positive rotation clockwise).
* @property {StringExpression} [text-align] Text alignment. Possible values: `'left'`, `'right'`, `'center'`, `'end'` or `'start'`.
* Default is `'center'` for `'text-placement': 'point'`. For `'text-placement': 'line'`, the default is to let the renderer choose a
* placement where `text-max-angle` is not exceeded.
* @property {StringExpression} [text-justify] Text justification within the text box.
* If not set, text is justified towards the `textAlign` anchor.
* Otherwise, use options `'left'`, `'center'`, or `'right'` to justify the text within the text box.
* **Note:** `text-justify` is ignored for immediate rendering and also for `'text-placement': 'line'`.
* @property {StringExpression} [text-baseline='middle'] Text base line. Possible values: `'bottom'`, `'top'`, `'middle'`, `'alphabetic'`,
* `'hanging'`, `'ideographic'`.
* @property {NumberArrayExpression} [text-padding=[0, 0, 0, 0]] Padding in pixels around the text for decluttering and background. The order of
* values in the array is `[top, right, bottom, left]`.
* @property {ColorExpression} [text-fill-color] The fill color. `'none'` means no fill and no hit detection.
* @property {ColorExpression} [text-background-fill-color] The fill color. `'none'` means no fill and no hit detection.
* @property {ColorExpression} [text-stroke-color] The stroke color.
* @property {StringExpression} [text-stroke-line-cap='round'] Line cap style: `butt`, `round`, or `square`.
* @property {StringExpression} [text-stroke-line-join='round'] Line join style: `bevel`, `round`, or `miter`.
* @property {NumberArrayExpression} [text-stroke-line-dash] Line dash pattern.
* @property {NumberExpression} [text-stroke-line-dash-offset=0] Line dash offset.
* @property {NumberExpression} [text-stroke-miter-limit=10] Miter limit.
* @property {NumberExpression} [text-stroke-width] Stroke pixel width.
* @property {ColorExpression} [text-background-stroke-color] The stroke color.
* @property {StringExpression} [text-background-stroke-line-cap='round'] Line cap style: `butt`, `round`, or `square`.
* @property {StringExpression} [text-background-stroke-line-join='round'] Line join style: `bevel`, `round`, or `miter`.
* @property {NumberArrayExpression} [text-background-stroke-line-dash] Line dash pattern.
* @property {NumberExpression} [text-background-stroke-line-dash-offset=0] Line dash offset.
* @property {NumberExpression} [text-background-stroke-miter-limit=10] Miter limit.
* @property {NumberExpression} [text-background-stroke-width] Stroke pixel width.
* @property {import("./Style.js").DeclutterMode} [text-declutter-mode] Declutter mode
* @property {NumberExpression} [z-index] The zIndex of the style.
*/
/**
* Icon style properties applied to point features. `icon-src` must be provided to render
* points with an icon.
*
* @typedef {Object} FlatIcon
* @property {string} [icon-src] Image source URI.
* @property {NumberArrayExpression} [icon-anchor=[0.5, 0.5]] Anchor. Default value is the icon center.
* @property {import("./Icon.js").IconOrigin} [icon-anchor-origin='top-left'] Origin of the anchor: `bottom-left`, `bottom-right`,
* `top-left` or `top-right`.
* @property {import("./Icon.js").IconAnchorUnits} [icon-anchor-x-units='fraction'] Units in which the anchor x value is
* specified. A value of `'fraction'` indicates the x value is a fraction of the icon. A value of `'pixels'` indicates
* the x value in pixels.
* @property {import("./Icon.js").IconAnchorUnits} [icon-anchor-y-units='fraction'] Units in which the anchor y value is
* specified. A value of `'fraction'` indicates the y value is a fraction of the icon. A value of `'pixels'` indicates
* the y value in pixels.
* @property {ColorExpression} [icon-color] Color to tint the icon. If not specified,
* the icon will be left as is.
* @property {null|string} [icon-cross-origin] The `crossOrigin` attribute for loaded images. Note that you must provide a
* `icon-cross-origin` value if you want to access pixel data with the Canvas renderer.
* See https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image for more detail.
* @property {SizeExpression} [icon-offset=[0, 0]] Offset, which, together with the size and the offset origin, define the
* sub-rectangle to use from the original icon image.
* @property {NumberArrayExpression} [icon-displacement=[0,0]] Displacement of the icon.
* @property {import("./Icon.js").IconOrigin} [icon-offset-origin='top-left'] Origin of the offset: `bottom-left`, `bottom-right`,
* `top-left` or `top-right`.
* @property {NumberExpression} [icon-opacity=1] Opacity of the icon.
* @property {SizeExpression} [icon-scale=1] Scale.
* @property {NumberExpression} [icon-width] Width of the icon. If not specified, the actual image width will be used. Cannot be combined
* with `scale`. (Expressions only in WebGL)
* @property {NumberExpression} [icon-height] Height of the icon. If not specified, the actual image height will be used. Cannot be combined
* with `scale`. (Expressions only in WebGL)
* @property {NumberExpression} [icon-rotation=0] Rotation in radians (positive rotation clockwise).
* @property {BooleanExpression} [icon-rotate-with-view=false] Whether to rotate the icon with the view. (Expressions only supported in Canvas)
* @property {SizeExpression} [icon-size] Icon size in pixel. Can be used together with `icon-offset` to define the
* sub-rectangle to use from the origin (sprite) icon image. (Expressions only in WebGL)
* @property {import("./Style.js").DeclutterMode} [icon-declutter-mode] Declutter mode (Canvas only)
* @property {NumberExpression} [z-index] The zIndex of the style. (Canvas only)
*/
/**
* Regular shape style properties for rendering point features. At least `shape-points` must be provided.
*
* @typedef {Object} FlatShape
* @property {NumberExpression} [shape-points] Number of points for stars and regular polygons. In case of a polygon, the number of points
* is the number of sides. (Expressions only in WebGL)
* @property {ColorExpression} [shape-fill-color] The fill color. `'none'` means no fill and no hit detection.
* @property {ColorExpression} [shape-stroke-color] The stroke color.
* @property {NumberExpression} [shape-stroke-width] Stroke pixel width.
* @property {StringExpression} [shape-stroke-line-cap='round'] Line cap style: `butt`, `round`, or `square`. (Canvas only)
* @property {StringExpression} [shape-stroke-line-join='round'] Line join style: `bevel`, `round`, or `miter`. (Canvas only)
* @property {NumberArrayExpression} [shape-stroke-line-dash] Line dash pattern. (Canvas only)
* @property {NumberExpression} [shape-stroke-line-dash-offset=0] Line dash offset. (Canvas only)
* @property {NumberExpression} [shape-stroke-miter-limit=10] Miter limit. (Canvas only)
* @property {NumberExpression} [shape-radius] Radius of a regular polygon. (Expressions only in WebGL)
* @property {NumberExpression} [shape-radius2] Second radius to make a star instead of a regular polygon. (Expressions only in WebGL)
* @property {NumberExpression} [shape-angle=0] Shape's angle in radians. A value of 0 will have one of the shape's point facing up. (Expressions only in WebGL)
* @property {NumberArrayExpression} [shape-displacement=[0,0]] Displacement of the shape
* @property {NumberExpression} [shape-opacity] Shape opacity. (WebGL only)
* @property {NumberExpression} [shape-rotation=0] Rotation in radians (positive rotation clockwise).
* @property {BooleanExpression} [shape-rotate-with-view=false] Whether to rotate the shape with the view. (Expression only supported in Canvas)
* @property {SizeExpression} [shape-scale=1] Scale. Unless two-dimensional scaling is required a better
* result may be obtained with appropriate settings for `shape-radius` and `shape-radius2`.
* @property {import("./Style.js").DeclutterMode} [shape-declutter-mode] Declutter mode. (Canvas only)
* @property {NumberExpression} [z-index] The zIndex of the style. (Canvas only)
*/
/**
* Circle style properties for rendering point features. At least `circle-radius` must be provided.
*
* @typedef {Object} FlatCircle
* @property {NumberExpression} [circle-radius] Circle radius.
* @property {ColorExpression} [circle-fill-color] The fill color. `'none'` means no fill and no hit detection.
* @property {ColorExpression} [circle-stroke-color] The stroke color.
* @property {NumberExpression} [circle-stroke-width] Stroke pixel width.
* @property {StringExpression} [circle-stroke-line-cap='round'] Line cap style: `butt`, `round`, or `square`. (Canvas only)
* @property {StringExpression} [circle-stroke-line-join='round'] Line join style: `bevel`, `round`, or `miter`. (Canvas only)
* @property {NumberArrayExpression} [circle-stroke-line-dash] Line dash pattern. (Canvas only)
* @property {NumberExpression} [circle-stroke-line-dash-offset=0] Line dash offset. (Canvas only)
* @property {NumberExpression} [circle-stroke-miter-limit=10] Miter limit. (Canvas only)
* @property {NumberArrayExpression} [circle-displacement=[0,0]] displacement
* @property {SizeExpression} [circle-scale=1] Scale. A two-dimensional scale will produce an ellipse.
* Unless two-dimensional scaling is required a better result may be obtained with an appropriate setting for `circle-radius`.
* @property {NumberExpression} [circle-opacity] Circle opacity. (WebGL only)
* @property {NumberExpression} [circle-rotation=0] Rotation in radians
* (positive rotation clockwise, meaningful only when used in conjunction with a two-dimensional scale).
* @property {BooleanExpression} [circle-rotate-with-view=false] Whether to rotate the shape with the view (Expression only supported in Canvas)
* (meaningful only when used in conjunction with a two-dimensional scale).
* @property {import("./Style.js").DeclutterMode} [circle-declutter-mode] Declutter mode (Canvas only)
* @property {NumberExpression} [z-index] The zIndex of the style. (Canvas only)
*/
/**
* These default style properties are applied when no other style is given.
*
* @typedef {Object} DefaultStyle
* @property {string} fill-color `'rgba(255,255,255,0.4)'`
* @property {string} stroke-color `'#3399CC'`
* @property {number} stroke-width `1.25`
* @property {number} circle-radius `5`
* @property {string} circle-fill-color `'rgba(255,255,255,0.4)'`
* @property {number} circle-stroke-width `1.25`
* @property {string} circle-stroke-color `'#3399CC'`
*/
/**
* @return {DefaultStyle} The default flat style.
*/
function createDefaultStyle() {
	return {
		"fill-color": "rgba(255,255,255,0.4)",
		"stroke-color": "#3399CC",
		"stroke-width": 1.25,
		"circle-radius": 5,
		"circle-fill-color": "rgba(255,255,255,0.4)",
		"circle-stroke-width": 1.25,
		"circle-stroke-color": "#3399CC"
	};
}
/**
* A rule is used to conditionally apply a style. If the rule's filter evaluates to true,
* the style will be applied.
*
* @typedef {Object} Rule
* @property {FlatStyle|Array<FlatStyle>} style The style to be applied if the filter matches.
* @property {import("../expr/expression.js").EncodedExpression} [filter] The filter used
* to determine if a style applies. If no filter is included, the rule always applies
* (unless it is an else rule).
* @property {boolean} [else] If true, the rule applies only if no other previous rule applies.
* If the else rule also has a filter, the rule will not apply if the filter does not match.
*/
/**
* Style variables are provided as an object. The variables can be read in a {@link import("../expr/expression.js").ExpressionValue style expression}
* using the `['var', 'varName']` operator.
* Each variable must hold a literal value (not an expression).
* @typedef {Object<string, number|Array<number>|string|boolean>} StyleVariables
*/
//#endregion
//#region src/ol/render/webgl/bufferUtil.js
var LINESTRING_ANGLE_COSINE_CUTOFF = .985;
//#endregion
//#region src/ol/render/webgl/float64Util.js
/**
* Returns a low part of a float value that can be encoded to Float32 without recision loss
* @param {number} float Number in float64 precision
* @return {number} Low part of the float value
*/
function getLowPart(float) {
	return float - getHighPart(float);
}
/**
* Returns a high part of a float value that can be encoded to Float32 without precision loss
* @param {number} float Number in float64 precision
* @return {number} High part of the float value
*/
function getHighPart(float) {
	return Math.fround(float);
}
//#endregion
//#region src/ol/render/webgl/ShaderBuilder.js
/**
* Class for generating shaders from literal style objects
* @module ol/render/webgl/ShaderBuilder
*/
var COMMON_HEADER = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float u_one;
uniform mat4 u_projectionMatrix;
uniform mat4 u_invertProjectionMatrix;
uniform vec2 u_viewportSizePx;
uniform float u_pixelRatio;
uniform float u_globalAlpha;
uniform float u_time;
uniform float u_zoom;
uniform float u_resolution;
uniform float u_rotation;
uniform vec4 u_renderExtent;
uniform float u_depth;
uniform mediump int u_hitDetection;

// these 64-bits floats are split into high/low
uniform vec2 u_df_patternOriginX;
uniform vec2 u_df_patternOriginY;
uniform vec2 u_df_patternScaleRatio;

const float PI = 3.141592653589793238;
const float TWO_PI = 2.0 * PI;
float currentLineMetric = 0.; // an actual value will be used in the stroke shaders

vec2 pxToWorld(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return (u_invertProjectionMatrix * vec4(screenPos, 0.0, 1.0)).xy;
}

vec2 worldToPx(vec2 worldPos) {
  vec4 screenPos = u_projectionMatrix * vec4(worldPos, 0.0, 1.0);
  return (0.5 * screenPos.xy + 0.5) * u_viewportSizePx;
}
${UNPACK_COLOR_FN}

vec2 df_from(float value) {
  return vec2(value, 0.);
}

float df_float(vec2 df) {
  return df.x;
}

vec2 df_add(vec2 dfa, vec2 dfb) {
  vec2 dfc;
  float t1, t2, e;
  
  t1 = dfa.x * u_one + dfb.x * u_one;
  e = t1 * u_one - dfa.x * u_one;
  t2 = ((dfb.x - e) + (dfa.x - (t1 - e))) * u_one + dfa.y + dfb.y * u_one;
  
  dfc.x = t1 * u_one + t2 * u_one;
  dfc.y = t2 - (dfc.x - t1) * u_one;
  return dfc;
}

vec2 df_sub(vec2 dfa, vec2 dfb) {
  vec2 dfc;
  float e, t1, t2;
  
  t1 = dfa.x - dfb.x;
  e = t1 - dfa.x;
  t2 = ((-dfb.x - e) + (dfa.x - (t1 - e))) + dfa.y - dfb.y;
  
  dfc.x = t1 + t2;
  dfc.y = t2 - (dfc.x - t1);
  return dfc;
}

vec2 df_mul(vec2 dfa, vec2 dfb) {
  vec2 dfc;
  float c11, c21, c2, e, t1, t2;
  float a1, a2, b1, b2, cona, conb, split = 4097.;

  cona = dfa.x * split * u_one;
  conb = dfb.x * split * u_one;
  a1 = cona * u_one - (cona - dfa.x);
  b1 = conb * u_one - (conb - dfb.x);
  a2 = dfa.x * u_one - a1;
  b2 = dfb.x * u_one - b1 * u_one;

  c11 = dfa.x * u_one * dfb.x * u_one;
  c21 = a2 * b2 * u_one + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11))) * u_one;

  c2 = dfa.x * dfb.y * u_one + dfa.y * dfb.x * u_one;

  t1 = c11 + c2 * u_one;
  e = t1 - c11 * u_one;
  t2 = dfa.y * dfb.y * u_one + ((c2 - e) + (c11 - (t1 - e))) + c21 * u_one;

  dfc.x = t1 * u_one + t2 * u_one;
  dfc.y = t2 - (dfc.x - t1) * u_one;

  return dfc;
}

vec2 df_div(vec2 dfa, vec2 dfb) {
  vec2 dfc;
  float c11, c21, c2, e, t1, t2, t11, t12, t21, t22;
  float a1, a2, b1, b2, cona, conb, split = 4097.;
  float s1, s2;
  
  s1 = dfa.x / dfb.x * u_one;
  cona = s1 * split * u_one;
  conb = dfb.x * split * u_one;
  a1 = cona - (cona - s1) * u_one;
  b1 = conb - (conb - dfb.x) * u_one;
  a2 = s1 - a1 * u_one;
  b2 = dfb.x - b1 * u_one;
  
  c11 = s1 * dfb.x * u_one;
  c21 = (((a1 * b1 - c11) + a1 * b2) + a2 * b1) + a2 * b2 * u_one;
  
  c2 = s1 * dfb.y * u_one;
  
  t1 = c11 + c2 * u_one;
  e  = t1 - c11 * u_one;
  t2 = ((c2 - e) + (c11 - (t1 - e))) + c21 * u_one;
  
  t12 = t1 + t2 * u_one;
  t22 = t2 - (t12 - t1) * u_one;
  
  t11 = dfa.x - t12 * u_one;
  e   = t11 - dfa.x * u_one;
  t21 = ((-t12 - e) + (dfa.x - (t11 - e))) + dfa.y - t22 * u_one;
  
  s2 = (t11 + t21) / dfb.x * u_one;
  
  dfc.x = s1 + s2 * u_one;
  dfc.y = s2 - (dfc.x - s1) * u_one;
  
  return dfc;
}

float df_mod(vec2 df, vec2 m) {
  vec2 q = df_div(df, m) * u_one;
  float qf = floor(q.x);
  float frac = q.x - qf + q.y * u_one;
  if (frac < 0.0) qf -= 1.0;
  if (frac >= 1.0) qf += 1.0;
  vec2 prod = df_mul(df_from(qf), m);
  vec2 rem = df_add(df_from(df.x), df_from(-prod.x)) * u_one;
  rem.y += df.y - prod.y;
  return rem.x + rem.y * u_one;
}

`;
var DEFAULT_STYLE = createDefaultStyle();
/**
* @typedef {Object} AttributeDescription
* @property {string} name Attribute name, as will be declared in the header of the vertex shader (including a_)
* @property {string} type Attribute GLSL type, either `float`, `vec2`, `vec4`...
* @property {string} varyingName Varying name, as will be declared in the header of both shaders (including v_)
* @property {string} varyingType Varying type, either `float`, `vec2`, `vec4`...
* @property {string} varyingExpression GLSL expression to assign to the varying in the vertex shader (e.g. `unpackColor(a_myAttr)`)
*/
/**
* @typedef {Object} UniformDescription
* @property {string} name Uniform name, as will be declared in the header of the vertex shader (including u_)
* @property {string} type Uniform GLSL type, either `float`, `vec2`, `vec4`...
*/
/**
* @classdesc
* This class implements a classic builder pattern for generating many different types of shaders.
* Methods can be chained, e. g.:
*
* ```js
* const shader = new ShaderBuilder()
*   .addAttribute('a_width', 'float')
*   .addUniform('u_time', 'float)
*   .setColorExpression('...')
*   .setSymbolSizeExpression('...')
*   .getSymbolFragmentShader();
* ```
*
* A note on [alpha premultiplication](https://en.wikipedia.org/wiki/Alpha_compositing#Straight_versus_premultiplied):
* The ShaderBuilder class expects all colors to **not having been alpha-premultiplied!** This is because alpha
* premultiplication is done at the end of each fragment shader.
*/
var ShaderBuilder = class {
	constructor() {
		/**
		* Uniforms; these will be declared in the header (should include the type).
		* @type {Array<UniformDescription>}
		* @private
		*/
		this.uniforms_ = [];
		/**
		* Attributes; these will be declared in the header (should include the type).
		* @type {Array<AttributeDescription>}
		* @private
		*/
		this.attributes_ = [];
		/**
		* @type {boolean}
		* @private
		*/
		this.hasSymbol_ = false;
		/**
		* @type {string}
		* @private
		*/
		this.symbolSizeExpression_ = `vec2(${numberToGlsl(DEFAULT_STYLE["circle-radius"])} + ${numberToGlsl(DEFAULT_STYLE["circle-stroke-width"] * .5)})`;
		/**
		* @type {string}
		* @private
		*/
		this.symbolRotationExpression_ = "0.0";
		/**
		* @type {string}
		* @private
		*/
		this.symbolOffsetExpression_ = "vec2(0.0)";
		/**
		* @type {string}
		* @private
		*/
		this.symbolColorExpression_ = colorToGlsl(DEFAULT_STYLE["circle-fill-color"]);
		/**
		* @type {string}
		* @private
		*/
		this.texCoordExpression_ = "vec4(0.0, 0.0, 1.0, 1.0)";
		/**
		* @type {string|null}
		* @private
		*/
		this.fragmentDiscardExpression_ = null;
		/**
		* @type {string|null}
		* @private
		*/
		this.shapeDiscardExpression_ = null;
		/**
		* @type {boolean}
		* @private
		*/
		this.symbolRotateWithView_ = false;
		/**
		* @type {boolean}
		* @private
		*/
		this.hasStroke_ = false;
		/**
		* @type {string}
		* @private
		*/
		this.strokeWidthExpression_ = numberToGlsl(DEFAULT_STYLE["stroke-width"]);
		/**
		* @type {string}
		* @private
		*/
		this.strokeColorExpression_ = colorToGlsl(DEFAULT_STYLE["stroke-color"]);
		/**
		* @private
		*/
		this.strokeOffsetExpression_ = "0.";
		/**
		* @private
		*/
		this.strokeCapExpression_ = stringToGlsl("round");
		/**
		* @private
		*/
		this.strokeJoinExpression_ = stringToGlsl("round");
		/**
		* @private
		*/
		this.strokeMiterLimitExpression_ = "10.";
		/**
		* @private
		*/
		this.strokeDistanceFieldExpression_ = "-1000.";
		/**
		* @private
		* @type {string|null}
		*/
		this.strokePatternLengthExpression_ = null;
		/**
		* @type {boolean}
		* @private
		*/
		this.hasFill_ = false;
		/**
		* @type {string}
		* @private
		*/
		this.fillColorExpression_ = colorToGlsl(DEFAULT_STYLE["fill-color"]);
		/**
		* @private
		* @type {string|null}
		*/
		this.fillPatternSizeExpression_ = null;
		/**
		* @type {Array<string>}
		* @private
		*/
		this.vertexShaderFunctions_ = [];
		/**
		* @type {Array<string>}
		* @private
		*/
		this.fragmentShaderFunctions_ = [];
	}
	/**
	* Adds a uniform accessible in both fragment and vertex shaders.
	* The given name should include a type, such as `sampler2D u_texture`.
	* @param {string} name Uniform name, including the `u_` prefix
	* @param {'float'|'vec2'|'vec3'|'vec4'|'sampler2D'} type GLSL type
	* @return {ShaderBuilder} the builder object
	*/
	addUniform(name, type) {
		this.uniforms_.push({
			name,
			type
		});
		return this;
	}
	/**
	* Adds an attribute accessible in the vertex shader, read from the geometry buffer.
	* The given name should include a type, such as `vec2 a_position`.
	* Attributes will also be made available under the same name in fragment shaders.
	* @param {string} name Attribute name, including the `a_` prefix
	* @param {'float'|'vec2'|'vec3'|'vec4'} type GLSL type
	* @param {string} [varyingExpression] Expression which will be assigned to the varying in the vertex shader, and
	* passed on to the fragment shader.
	* @param {'float'|'vec2'|'vec3'|'vec4'} [varyingType] Type of the attribute after transformation;
	* e.g. `vec4` after unpacking color components
	* @return {ShaderBuilder} the builder object
	*/
	addAttribute(name, type, varyingExpression, varyingType) {
		this.attributes_.push({
			name,
			type,
			varyingName: name.replace(/^a_/, "v_"),
			varyingType: varyingType ?? type,
			varyingExpression: varyingExpression ?? name
		});
		return this;
	}
	/**
	* Sets an expression to compute the size of the shape.
	* This expression can use all the uniforms and attributes available
	* in the vertex shader, and should evaluate to a `vec2` value.
	* @param {string} expression Size expression
	* @return {ShaderBuilder} the builder object
	*/
	setSymbolSizeExpression(expression) {
		this.hasSymbol_ = true;
		this.symbolSizeExpression_ = expression;
		return this;
	}
	/**
	* @return {string} The current symbol size expression
	*/
	getSymbolSizeExpression() {
		return this.symbolSizeExpression_;
	}
	/**
	* Sets an expression to compute the rotation of the shape.
	* This expression can use all the uniforms and attributes available
	* in the vertex shader, and should evaluate to a `float` value in radians.
	* @param {string} expression Size expression
	* @return {ShaderBuilder} the builder object
	*/
	setSymbolRotationExpression(expression) {
		this.symbolRotationExpression_ = expression;
		return this;
	}
	/**
	* Sets an expression to compute the offset of the symbol from the point center.
	* This expression can use all the uniforms and attributes available
	* in the vertex shader, and should evaluate to a `vec2` value.
	* @param {string} expression Offset expression
	* @return {ShaderBuilder} the builder object
	*/
	setSymbolOffsetExpression(expression) {
		this.symbolOffsetExpression_ = expression;
		return this;
	}
	/**
	* @return {string} The current symbol offset expression
	*/
	getSymbolOffsetExpression() {
		return this.symbolOffsetExpression_;
	}
	/**
	* Sets an expression to compute the color of the shape.
	* This expression can use all the uniforms, varyings and attributes available
	* in the fragment shader, and should evaluate to a `vec4` value.
	* @param {string} expression Color expression
	* @return {ShaderBuilder} the builder object
	*/
	setSymbolColorExpression(expression) {
		this.hasSymbol_ = true;
		this.symbolColorExpression_ = expression;
		return this;
	}
	/**
	* @return {string} The current symbol color expression
	*/
	getSymbolColorExpression() {
		return this.symbolColorExpression_;
	}
	/**
	* Sets an expression to compute the texture coordinates of the vertices.
	* This expression can use all the uniforms and attributes available
	* in the vertex shader, and should evaluate to a `vec4` value.
	* @param {string} expression Texture coordinate expression
	* @return {ShaderBuilder} the builder object
	*/
	setTextureCoordinateExpression(expression) {
		this.texCoordExpression_ = expression;
		return this;
	}
	/**
	* Sets an expression to determine whether a fragment (pixel) should be discarded,
	* i.e. not drawn at all. If the expression evaluates to `true`, the fragment is discarded.
	* This expression can use all the uniforms, varyings and attributes available
	* in the fragment shader, and should evaluate to a `bool` value (it will be
	* used in an `if` statement)
	* @param {string} expression Fragment discard expression
	* @return {ShaderBuilder} the builder object
	*/
	setFragmentDiscardExpression(expression) {
		this.fragmentDiscardExpression_ = expression;
		return this;
	}
	/**
	* @return {string|null} The current fragment discard expression; null if none has been set
	*/
	getFragmentDiscardExpression() {
		return this.fragmentDiscardExpression_;
	}
	/**
	* Sets an expression to determine whether a whole shape (triangle) should be filtered out
	* and not rasterized at all. If the expression evaluates to `true`, the shape is discarded.
	* This is more performant than the fragment discard expression because the fragment shader will not run at all.
	* This expression can use all the uniforms, varyings and attributes available
	* in the vertex shader, and should evaluate to a `bool` value.
	* @param {string} expression Shape discard expression
	* @return {ShaderBuilder} the builder object
	*/
	setShapeDiscardExpression(expression) {
		this.shapeDiscardExpression_ = expression;
		return this;
	}
	/**
	* @return {string|null} The current shape discard expression; null if none has been set
	*/
	getShapeDiscardExpression() {
		return this.shapeDiscardExpression_;
	}
	/**
	* Sets whether the symbols should rotate with the view or stay aligned with the map.
	* Note: will only be used for point geometry shaders.
	* @param {boolean} rotateWithView Rotate with view
	* @return {ShaderBuilder} the builder object
	*/
	setSymbolRotateWithView(rotateWithView) {
		this.symbolRotateWithView_ = rotateWithView;
		return this;
	}
	/**
	* @param {string} expression Stroke width expression, returning value in pixels
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeWidthExpression(expression) {
		this.hasStroke_ = true;
		this.strokeWidthExpression_ = expression;
		return this;
	}
	/**
	* @param {string} expression Stroke color expression, evaluate to `vec4`: can rely on currentLengthPx and currentRadiusPx
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeColorExpression(expression) {
		this.hasStroke_ = true;
		this.strokeColorExpression_ = expression;
		return this;
	}
	/**
	* @return {string} The current stroke color expression
	*/
	getStrokeColorExpression() {
		return this.strokeColorExpression_;
	}
	/**
	* @param {string} expression Stroke color expression, evaluate to `float`
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeOffsetExpression(expression) {
		this.strokeOffsetExpression_ = expression;
		return this;
	}
	/**
	* @param {string} expression Stroke line cap expression, evaluate to `float`
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeCapExpression(expression) {
		this.strokeCapExpression_ = expression;
		return this;
	}
	/**
	* @param {string} expression Stroke line join expression, evaluate to `float`
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeJoinExpression(expression) {
		this.strokeJoinExpression_ = expression;
		return this;
	}
	/**
	* @param {string} expression Stroke miter limit expression, evaluate to `float`
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeMiterLimitExpression(expression) {
		this.strokeMiterLimitExpression_ = expression;
		return this;
	}
	/**
	* @param {string} expression Stroke distance field expression, evaluate to `float`
	* This can override the default distance field; can rely on currentLengthPx and currentRadiusPx
	* @return {ShaderBuilder} the builder object
	*/
	setStrokeDistanceFieldExpression(expression) {
		this.strokeDistanceFieldExpression_ = expression;
		return this;
	}
	/**
	* Defining a pattern length for a stroke lets us avoid having visual artifacts when
	* a linestring is very long and thus has very high "distance" attributes on its vertices.
	* If we apply a pattern or dash array to a stroke we know for certain that the full distance value
	* is not necessary and can be trimmed down using `mod(currentDistance, patternLength)`.
	* @param {string} expression Stroke expression that evaluates to a`float; value is expected to be
	* in pixels.
	* @return {ShaderBuilder} the builder object
	*/
	setStrokePatternLengthExpression(expression) {
		this.strokePatternLengthExpression_ = expression;
		return this;
	}
	/**
	* @return {string|null} The current stroke pattern length expression.
	*/
	getStrokePatternLengthExpression() {
		return this.strokePatternLengthExpression_;
	}
	/**
	* @param {string} expression Fill color expression, evaluate to `vec4`
	* @return {ShaderBuilder} the builder object
	*/
	setFillColorExpression(expression) {
		this.hasFill_ = true;
		this.fillColorExpression_ = expression;
		return this;
	}
	/**
	* @return {string} The current fill color expression
	*/
	getFillColorExpression() {
		return this.fillColorExpression_;
	}
	/**
	* Defining a pattern size for a fill pattern lets us avoid having visual artifacts that typically appear
	* when zoomed in above zoom levels 14~15. If we can compute the fill pattern size we can more efficiently
	* compute the offset of the pattern on screen, thus avoiding precision issues.
	* @param {string} expression Size expression that evaluates to a `vec2` in pixels
	* @return {ShaderBuilder} the builder object
	*/
	setFillPatternSizeExpression(expression) {
		this.fillPatternSizeExpression_ = expression;
		return this;
	}
	/**
	* @return {string|null} The current fill pattern size expression.
	*/
	getFillPatternSizeExpression() {
		return this.fillPatternSizeExpression_;
	}
	addVertexShaderFunction(code) {
		if (this.vertexShaderFunctions_.includes(code)) return this;
		this.vertexShaderFunctions_.push(code);
		return this;
	}
	addFragmentShaderFunction(code) {
		if (this.fragmentShaderFunctions_.includes(code)) return this;
		this.fragmentShaderFunctions_.push(code);
		return this;
	}
	/**
	* Generates a symbol vertex shader from the builder parameters
	* @return {string|null} The full shader as a string; null if no size or color specified
	*/
	getSymbolVertexShader() {
		if (!this.hasSymbol_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
attribute vec2 a_position;
attribute vec2 a_localPosition;
attribute vec2 a_hitColor;

varying vec2 v_texCoord;
varying vec2 v_quadCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;

${this.attributes_.map((attribute) => `attribute ${attribute.type} ${attribute.name};
varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.vertexShaderFunctions_.join("\n")}
vec2 pxToScreen(vec2 coordPx) {
  vec2 scaled = coordPx / u_viewportSizePx / 0.5;
  return scaled;
}

vec2 screenToPx(vec2 coordScreen) {
  return (coordScreen * 0.5 + 0.5) * u_viewportSizePx;
}

void main(void) {
  v_quadSizePx = ${this.symbolSizeExpression_};
  vec2 halfSizePx = v_quadSizePx * 0.5;
  vec2 centerOffsetPx = ${this.symbolOffsetExpression_};
  vec2 offsetPx = centerOffsetPx + a_localPosition * halfSizePx * vec2(1., -1.);
  float angle = ${this.symbolRotationExpression_}${this.symbolRotateWithView_ ? " + u_rotation" : ""};
  float c = cos(-angle);
  float s = sin(-angle);
  offsetPx = vec2(c * offsetPx.x - s * offsetPx.y, s * offsetPx.x + c * offsetPx.y);
  vec4 center = u_projectionMatrix * vec4(a_position, 0.0, 1.0);
  gl_Position = center + vec4(pxToScreen(offsetPx), u_depth, 0.);
  vec4 texCoord = ${this.texCoordExpression_};
  float u = mix(texCoord.s, texCoord.p, a_localPosition.x * 0.5 + 0.5);
  float v = mix(texCoord.t, texCoord.q, a_localPosition.y * 0.5 + 0.5);
  v_texCoord = vec2(u, v);
  v_hitColor = unpackColor(a_hitColor);
  v_angle = angle;
  c = cos(-v_angle);
  s = sin(-v_angle);
  centerOffsetPx = vec2(c * centerOffsetPx.x - s * centerOffsetPx.y, s * centerOffsetPx.x + c * centerOffsetPx.y);
  v_centerPx = screenToPx(center.xy) + centerOffsetPx;
${this.attributes_.map((attribute) => `  ${attribute.varyingName} = ${attribute.varyingExpression};`).join("\n")}
${this.shapeDiscardExpression_ ? `  if (${this.shapeDiscardExpression_}) { gl_Position = vec4(2.0, 2.0, 0.0, 0.0); }` : ""}
}`;
	}
	/**
	* Generates a symbol fragment shader from the builder parameters
	* @return {string|null} The full shader as a string; null if no size or color specified
	*/
	getSymbolFragmentShader() {
		if (!this.hasSymbol_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
varying vec2 v_texCoord;
varying vec4 v_hitColor;
varying vec2 v_centerPx;
varying float v_angle;
varying vec2 v_quadSizePx;
${this.attributes_.map((attribute) => `varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}

void main(void) {
${this.attributes_.map((attribute) => `  ${attribute.varyingType} ${attribute.name} = ${attribute.varyingName}; // assign to original attribute name`).join("\n")}
${this.fragmentDiscardExpression_ ? `  if (${this.fragmentDiscardExpression_}) { discard; }` : ""}
  vec2 coordsPx = gl_FragCoord.xy / u_pixelRatio - v_centerPx; // relative to center
  float c = cos(v_angle);
  float s = sin(v_angle);
  coordsPx = vec2(c * coordsPx.x - s * coordsPx.y, s * coordsPx.x + c * coordsPx.y);
  gl_FragColor = ${this.symbolColorExpression_};
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.05) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
	}
	/**
	* Generates a stroke vertex shader from the builder parameters
	* @return {string|null} The full shader as a string; null if no size or color specified
	*/
	getStrokeVertexShader() {
		if (!this.hasStroke_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
attribute vec2 a_segmentStart;
attribute vec2 a_segmentEnd;
attribute vec2 a_localPosition;
attribute float a_measureStart;
attribute float a_measureEnd;
attribute float a_angleTangentSum;
attribute float a_distanceLow;
attribute float a_distanceHigh;
attribute vec2 a_joinAngles;
attribute vec2 a_hitColor;

varying vec2 v_segmentStartPx;
varying vec2 v_segmentEndPx;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distancePx;
varying float v_measureStart;
varying float v_measureEnd;

${this.attributes_.map((attribute) => `attribute ${attribute.type} ${attribute.name};
varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.vertexShaderFunctions_.join("\n")}

vec4 pxToScreen(vec2 pxPos) {
  vec2 screenPos = 2.0 * pxPos / u_viewportSizePx - 1.0;
  return vec4(screenPos, u_depth, 1.0);
}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

vec2 getJoinOffsetDirection(vec2 normalPx, float joinAngle) {
  float halfAngle = joinAngle / 2.0;
  float c = cos(halfAngle);
  float s = sin(halfAngle);
  vec2 angleBisectorNormal = vec2(s * normalPx.x + c * normalPx.y, -c * normalPx.x + s * normalPx.y);
  float length = 1.0 / s;
  return angleBisectorNormal * length;
}

vec2 getOffsetPoint(vec2 point, vec2 normal, float joinAngle, float offsetPx) {
  // if on a cap or the join angle is too high, offset the line along the segment normal
  if (cos(joinAngle) > 0.998 || isCap(joinAngle)) {
    return point - normal * offsetPx;
  }
  // offset is applied along the inverted normal (positive offset goes "right" relative to line direction)
  return point - getJoinOffsetDirection(normal, joinAngle) * offsetPx;
}

void main(void) {
  v_angleStart = a_joinAngles.x;
  v_angleEnd = a_joinAngles.y;
  float startEndRatio = a_localPosition.x * 0.5 + 0.5;
  currentLineMetric = mix(a_measureStart, a_measureEnd, startEndRatio);
  // we're reading the fractional part while keeping the sign (so -4.12 gives -0.12, 3.45 gives 0.45)

  float lineWidth = ${this.strokeWidthExpression_};
  float lineOffsetPx = ${this.strokeOffsetExpression_};

  // compute segment start/end in px with offset
  vec2 segmentStartPx = worldToPx(a_segmentStart);
  vec2 segmentEndPx = worldToPx(a_segmentEnd);
  vec2 tangentPx = normalize(segmentEndPx - segmentStartPx);
  vec2 normalPx = vec2(-tangentPx.y, tangentPx.x);
  segmentStartPx = getOffsetPoint(segmentStartPx, normalPx, v_angleStart, lineOffsetPx),
  segmentEndPx = getOffsetPoint(segmentEndPx, normalPx, v_angleEnd, lineOffsetPx);

  // compute current vertex position
  float normalDir = -1. * a_localPosition.y;
  float tangentDir = -1. * a_localPosition.x;
  float angle = mix(v_angleStart, v_angleEnd, startEndRatio);
  vec2 joinDirection;
  vec2 positionPx = mix(segmentStartPx, segmentEndPx, startEndRatio);
  // if angle is too high, do not make a proper join
  if (cos(angle) > ${LINESTRING_ANGLE_COSINE_CUTOFF} || isCap(angle)) {
    joinDirection = normalPx * normalDir - tangentPx * tangentDir;
  } else {
    joinDirection = getJoinOffsetDirection(normalPx * normalDir, angle);
  }
  positionPx = positionPx + joinDirection * (lineWidth * 0.5 + 1.); // adding 1 pixel for antialiasing
  gl_Position = pxToScreen(positionPx);

  v_segmentStartPx = segmentStartPx;
  v_segmentEndPx = segmentEndPx;
  v_width = lineWidth;
  v_hitColor = unpackColor(a_hitColor);

  v_distancePx = a_distanceLow / u_resolution - (lineOffsetPx * a_angleTangentSum);
  float distanceHighPx = a_distanceHigh / u_resolution;
  ${this.strokePatternLengthExpression_ !== null ? `v_distancePx = mod(v_distancePx, ${this.strokePatternLengthExpression_});
  distanceHighPx = mod(distanceHighPx, ${this.strokePatternLengthExpression_});
  ` : ""}v_distancePx += distanceHighPx;

  v_measureStart = a_measureStart;
  v_measureEnd = a_measureEnd;
${this.attributes_.map((attribute) => `  ${attribute.varyingName} = ${attribute.varyingExpression};`).join("\n")}
${this.shapeDiscardExpression_ ? `  if (${this.shapeDiscardExpression_}) { gl_Position = vec4(2.0, 2.0, 0.0, 0.0); }` : ""}
}`;
	}
	/**
	* Generates a stroke fragment shader from the builder parameters
	*
	* @return {string|null} The full shader as a string; null if no size or color specified
	*/
	getStrokeFragmentShader() {
		if (!this.hasStroke_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
varying vec2 v_segmentStartPx;
varying vec2 v_segmentEndPx;
varying float v_angleStart;
varying float v_angleEnd;
varying float v_width;
varying vec4 v_hitColor;
varying float v_distancePx;
varying float v_measureStart;
varying float v_measureEnd;
${this.attributes_.map((attribute) => `varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}

bool isCap(float joinAngle) {
  return joinAngle < -0.1;
}

float segmentDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  vec2 tangent = normalize(end - start);
  vec2 normal = vec2(-tangent.y, tangent.x);
  vec2 startToPoint = point - start;
  return abs(dot(startToPoint, normal)) - width * 0.5;
}

float buttCapDistanceField(vec2 point, vec2 start, vec2 end) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  return dot(startToPoint, -tangent);
}

float squareCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return buttCapDistanceField(point, start, end) - width * 0.5;
}

float roundCapDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  float onSegment = max(0., 1000. * dot(point - start, end - start)); // this is very high when inside the segment
  return length(point - start) - width * 0.5 - onSegment;
}

float roundJoinDistanceField(vec2 point, vec2 start, vec2 end, float width) {
  return roundCapDistanceField(point, start, end, width);
}

float bevelJoinField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  vec2 startToPoint = point - start;
  vec2 tangent = normalize(end - start);
  float c = cos(joinAngle * 0.5);
  float s = sin(joinAngle * 0.5);
  float direction = -sign(sin(joinAngle));
  vec2 bisector = vec2(c * tangent.x - s * tangent.y, s * tangent.x + c * tangent.y);
  float radius = width * 0.5 * s;
  return dot(startToPoint, bisector * direction) - radius;
}

float miterJoinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle) {
  if (cos(joinAngle) > ${LINESTRING_ANGLE_COSINE_CUTOFF}) { // avoid risking a division by zero
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  float miterLength = 1. / sin(joinAngle * 0.5);
  float miterLimit = ${this.strokeMiterLimitExpression_};
  if (miterLength > miterLimit) {
    return bevelJoinField(point, start, end, width, joinAngle);
  }
  return -1000.;
}

float capDistanceField(vec2 point, vec2 start, vec2 end, float width, float capType) {
   if (capType == ${stringToGlsl("butt")}) {
    return buttCapDistanceField(point, start, end);
  } else if (capType == ${stringToGlsl("square")}) {
    return squareCapDistanceField(point, start, end, width);
  }
  return roundCapDistanceField(point, start, end, width);
}

float joinDistanceField(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float joinType) {
  if (joinType == ${stringToGlsl("bevel")}) {
    return bevelJoinField(point, start, end, width, joinAngle);
  } else if (joinType == ${stringToGlsl("miter")}) {
    return miterJoinDistanceField(point, start, end, width, joinAngle);
  }
  return roundJoinDistanceField(point, start, end, width);
}

float computeSegmentPointDistance(vec2 point, vec2 start, vec2 end, float width, float joinAngle, float capType, float joinType) {
  if (isCap(joinAngle)) {
    return capDistanceField(point, start, end, width, capType);
  }
  return joinDistanceField(point, start, end, width, joinAngle, joinType);
}

float distanceFromSegment(vec2 point, vec2 start, vec2 end) {
  vec2 tangent = end - start;
  vec2 startToPoint = point - start;
  // inspire by capsule fn in https://iquilezles.org/articles/distfunctions/
  float h = clamp(dot(startToPoint, tangent) / dot(tangent, tangent), 0.0, 1.0);
  return length(startToPoint - tangent * h);
}

void main(void) {
${this.attributes_.map((attribute) => `  ${attribute.varyingType} ${attribute.name} = ${attribute.varyingName}; // assign to original attribute name`).join("\n")}

  vec2 currentPointPx = gl_FragCoord.xy / u_pixelRatio;
  vec2 worldPos = pxToWorld(currentPointPx);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }

  float segmentLengthPx = length(v_segmentEndPx - v_segmentStartPx);
  segmentLengthPx = max(segmentLengthPx, 1.17549429e-38); // avoid divide by zero
  vec2 segmentTangent = (v_segmentEndPx - v_segmentStartPx) / segmentLengthPx;
  vec2 segmentNormal = vec2(-segmentTangent.y, segmentTangent.x);
  vec2 startToPointPx = currentPointPx - v_segmentStartPx;
  float lengthToPointPx = max(0., min(dot(segmentTangent, startToPointPx), segmentLengthPx));
  float currentLengthPx = lengthToPointPx + v_distancePx;
  float currentRadiusPx = distanceFromSegment(currentPointPx, v_segmentStartPx, v_segmentEndPx);
  float currentRadiusRatio = dot(segmentNormal, startToPointPx) * 2. / v_width;
  currentLineMetric = mix(v_measureStart, v_measureEnd, lengthToPointPx / segmentLengthPx);

${this.fragmentDiscardExpression_ ? `  if (${this.fragmentDiscardExpression_}) { discard; }` : ""}

  float capType = ${this.strokeCapExpression_};
  float joinType = ${this.strokeJoinExpression_};
  float segmentStartDistance = computeSegmentPointDistance(currentPointPx, v_segmentStartPx, v_segmentEndPx, v_width, v_angleStart, capType, joinType);
  float segmentEndDistance = computeSegmentPointDistance(currentPointPx, v_segmentEndPx, v_segmentStartPx, v_width, v_angleEnd, capType, joinType);
  float distanceField = max(
    segmentDistanceField(currentPointPx, v_segmentStartPx, v_segmentEndPx, v_width),
    max(segmentStartDistance, segmentEndDistance)
  );
  distanceField = max(distanceField, ${this.strokeDistanceFieldExpression_});

  vec4 color = ${this.strokeColorExpression_};
  color.a *= smoothstep(0.5, -0.5, distanceField);
  gl_FragColor = color;
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
	}
	/**
	* Generates a fill vertex shader from the builder parameters
	*
	* @return {string|null} The full shader as a string; null if no color specified
	*/
	getFillVertexShader() {
		if (!this.hasFill_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
attribute vec2 a_position;
attribute vec2 a_hitColor;

varying vec4 v_hitColor;
varying vec2 v_patternOriginPx;
varying vec2 v_patternSizePx;

${this.attributes_.map((attribute) => `attribute ${attribute.type} ${attribute.name};
varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.vertexShaderFunctions_.join("\n")}
void main(void) {
  gl_Position = u_projectionMatrix * vec4(a_position, u_depth, 1.0);
  v_hitColor = unpackColor(a_hitColor);
${this.fillPatternSizeExpression_ !== null ? `
  // this computes the pattern offset in screenspace using double-float arithmetics
  v_patternSizePx = ${this.fillPatternSizeExpression_};
  vec2 patternSizeScaledX = df_mul(df_from(v_patternSizePx.x), u_df_patternScaleRatio);
  vec2 patternSizeScaledY = df_mul(df_from(v_patternSizePx.y), u_df_patternScaleRatio);
  v_patternOriginPx = vec2(
    df_mod(u_df_patternOriginX, patternSizeScaledX),
    df_mod(u_df_patternOriginY, patternSizeScaledY)
  );

  // reapply rotation to the pattern origin
  v_patternOriginPx -= u_viewportSizePx / 2.; // translate to viewport center
  v_patternOriginPx = vec2(
    cos(-u_rotation) * v_patternOriginPx.x - sin(-u_rotation) * v_patternOriginPx.y,
    sin(-u_rotation) * v_patternOriginPx.x + cos(-u_rotation) * v_patternOriginPx.y
  );
  v_patternOriginPx += u_viewportSizePx / 2.; // translate back
` : "  v_patternOriginPx = vec2(0.);"}
${this.attributes_.map((attribute) => `  ${attribute.varyingName} = ${attribute.varyingExpression};`).join("\n")}
${this.shapeDiscardExpression_ ? `  if (${this.shapeDiscardExpression_}) { gl_Position = vec4(2.0, 2.0, 0.0, 0.0); }` : ""}
}`;
	}
	/**
	* Generates a fill fragment shader from the builder parameters
	* @return {string|null} The full shader as a string; null if no color specified
	*/
	getFillFragmentShader() {
		if (!this.hasFill_) return null;
		return `${COMMON_HEADER}
${this.uniforms_.map((uniform) => `uniform ${uniform.type} ${uniform.name};`).join("\n")}
varying vec4 v_hitColor;
varying vec2 v_patternOriginPx;
varying vec2 v_patternSizePx;
${this.attributes_.map((attribute) => `varying ${attribute.varyingType} ${attribute.varyingName};`).join("\n")}
${this.fragmentShaderFunctions_.join("\n")}

void main(void) {
${this.attributes_.map((attribute) => `  ${attribute.varyingType} ${attribute.name} = ${attribute.varyingName}; // assign to original attribute name`).join("\n")}
  vec2 pxPos = gl_FragCoord.xy / u_pixelRatio;
  vec2 worldPos = pxToWorld(pxPos);
  if (
    abs(u_renderExtent[0] - u_renderExtent[2]) > 0.0 && (
      worldPos[0] < u_renderExtent[0] ||
      worldPos[1] < u_renderExtent[1] ||
      worldPos[0] > u_renderExtent[2] ||
      worldPos[1] > u_renderExtent[3]
    )
  ) {
    discard;
  }
${this.fragmentDiscardExpression_ ? `  if (${this.fragmentDiscardExpression_}) { discard; }` : ""}
  gl_FragColor = ${this.fillColorExpression_};
  gl_FragColor.a *= u_globalAlpha;
  gl_FragColor.rgb *= gl_FragColor.a;
  if (u_hitDetection > 0) {
    if (gl_FragColor.a < 0.1) { discard; };
    gl_FragColor = v_hitColor;
  }
}`;
	}
};
//#endregion
//#region src/ol/render/webgl/MixedGeometryBatch.js
/**
* @module ol/render/webgl/MixedGeometryBatch
*/
/**
* @typedef {import("../../Feature.js").default} Feature
*/
/**
* @typedef {import("../../geom/Geometry.js").Type} GeometryType
*/
/**
* @typedef {Object} GeometryBatchItem Object that holds a reference to a feature as well as the raw coordinates of its various geometries
* @property {Feature|RenderFeature} feature Feature
* @property {Array<Array<number>>} flatCoordss Array of flat coordinates arrays, one for each geometry related to the feature
* @property {number} [verticesCount] Only defined for linestring and polygon batches
* @property {number} [ringsCount] Only defined for polygon batches
* @property {Array<Array<number>>} [ringsVerticesCounts] Array of vertices counts in each ring for each geometry; only defined for polygons batches
* @property {number} [ref] The reference in the global batch (used for hit detection)
*/
/**
* @typedef {PointGeometryBatch|LineStringGeometryBatch|PolygonGeometryBatch} GeometryBatch
*/
/**
* @typedef {Object} PolygonGeometryBatch A geometry batch specific to polygons
* @property {Object<string, GeometryBatchItem>} entries Dictionary of all entries in the batch with associated computed values.
* One entry corresponds to one feature. Key is feature uid.
* @property {number} geometriesCount Amount of geometries in the batch.
* @property {number} verticesCount Amount of vertices from geometries in the batch.
* @property {number} ringsCount How many outer and inner rings in this batch.
*/
/**
* @typedef {Object} LineStringGeometryBatch A geometry batch specific to lines
* @property {Object<string, GeometryBatchItem>} entries Dictionary of all entries in the batch with associated computed values.
* One entry corresponds to one feature. Key is feature uid.
* @property {number} geometriesCount Amount of geometries in the batch.
* @property {number} verticesCount Amount of vertices from geometries in the batch.
*/
/**
* @typedef {Object} PointGeometryBatch A geometry batch specific to points
* @property {Object<string, GeometryBatchItem>} entries Dictionary of all entries in the batch with associated computed values.
* One entry corresponds to one feature. Key is feature uid.
* @property {number} geometriesCount Amount of geometries in the batch.
*/
/**
* @classdesc This class is used to group several geometries of various types together for faster rendering.
* Three inner batches are maintained for polygons, lines and points. Each time a feature is added, changed or removed
* from the batch, these inner batches are modified accordingly in order to keep them up-to-date.
*
* A feature can be present in several inner batches, for example a polygon geometry will be present in the polygon batch
* and its linear rings will be present in the line batch. Multi geometries are also broken down into individual geometries
* and added to the corresponding batches in a recursive manner.
*
* Corresponding {@link module:ol/render/webgl/BatchRenderer} instances are then used to generate the render instructions
* and WebGL buffers (vertices and indices) for each inner batches; render instructions are stored on the inner batches,
* alongside the transform used to convert world coords to screen coords at the time these instructions were generated.
* The resulting WebGL buffers are stored on the batches as well.
*
* An important aspect of geometry batches is that there is no guarantee that render instructions and WebGL buffers
* are synchronized, i.e. render instructions can describe a new state while WebGL buffers might not have been written yet.
* This is why two world-to-screen transforms are stored on each batch: one for the render instructions and one for
* the WebGL buffers.
*/
var MixedGeometryBatch = class MixedGeometryBatch {
	constructor() {
		/**
		* @private
		*/
		this.globalCounter_ = 0;
		/**
		* Refs are used as keys for hit detection.
		* @type {Map<number, Feature|RenderFeature>}
		* @private
		*/
		this.refToFeature_ = /* @__PURE__ */ new Map();
		/**
		* Features are split in "entries", which are individual geometries. We use the following map to share a single ref for all those entries.
		* @type {Map<string, number>}
		* @private
		*/
		this.uidToRef_ = /* @__PURE__ */ new Map();
		/**
		* The precision in WebGL shaders is limited.
		* To keep the refs as small as possible we maintain an array of freed up references.
		* @type {Array<number>}
		* @private
		*/
		this.freeGlobalRef_ = [];
		/**
		* @type {PolygonGeometryBatch}
		*/
		this.polygonBatch = {
			entries: {},
			geometriesCount: 0,
			verticesCount: 0,
			ringsCount: 0
		};
		/**
		* @type {PointGeometryBatch}
		*/
		this.pointBatch = {
			entries: {},
			geometriesCount: 0
		};
		/**
		* @type {LineStringGeometryBatch}
		*/
		this.lineStringBatch = {
			entries: {},
			geometriesCount: 0,
			verticesCount: 0
		};
	}
	/**
	* @param {Array<Feature|RenderFeature>} features Array of features to add to the batch
	* @param {import("../../proj.js").TransformFunction} [projectionTransform] Projection transform.
	*/
	addFeatures(features, projectionTransform) {
		for (let i = 0; i < features.length; i++) this.addFeature(features[i], projectionTransform);
	}
	/**
	* @param {Feature|RenderFeature} feature Feature to add to the batch
	* @param {import("../../proj.js").TransformFunction} [projectionTransform] Projection transform.
	*/
	addFeature(feature, projectionTransform) {
		let geometry = feature.getGeometry();
		if (!geometry) return;
		if (projectionTransform) {
			geometry = geometry.clone();
			geometry.applyTransform(projectionTransform);
		}
		this.addGeometry_(geometry, feature);
	}
	/**
	* @param {Feature|RenderFeature} feature Feature
	* @return {GeometryBatchItem|void} the cleared entry
	* @private
	*/
	clearFeatureEntryInPointBatch_(feature) {
		const featureUid = getUid(feature);
		const entry = this.pointBatch.entries[featureUid];
		if (!entry) return;
		this.pointBatch.geometriesCount -= entry.flatCoordss.length;
		delete this.pointBatch.entries[featureUid];
		return entry;
	}
	/**
	* @param {Feature|RenderFeature} feature Feature
	* @return {GeometryBatchItem|void} the cleared entry
	* @private
	*/
	clearFeatureEntryInLineStringBatch_(feature) {
		const featureUid = getUid(feature);
		const entry = this.lineStringBatch.entries[featureUid];
		if (!entry) return;
		this.lineStringBatch.verticesCount -= entry.verticesCount ?? 0;
		this.lineStringBatch.geometriesCount -= entry.flatCoordss.length;
		delete this.lineStringBatch.entries[featureUid];
		return entry;
	}
	/**
	* @param {Feature|RenderFeature} feature Feature
	* @return {GeometryBatchItem|void} the cleared entry
	* @private
	*/
	clearFeatureEntryInPolygonBatch_(feature) {
		const featureUid = getUid(feature);
		const entry = this.polygonBatch.entries[featureUid];
		if (!entry) return;
		this.polygonBatch.verticesCount -= entry.verticesCount ?? 0;
		this.polygonBatch.ringsCount -= entry.ringsCount ?? 0;
		this.polygonBatch.geometriesCount -= entry.flatCoordss.length;
		delete this.polygonBatch.entries[featureUid];
		return entry;
	}
	/**
	* @param {import("../../geom.js").Geometry|RenderFeature} geometry Geometry
	* @param {Feature|RenderFeature} feature Feature
	* @private
	*/
	addGeometry_(geometry, feature) {
		const type = geometry.getType();
		switch (type) {
			case "GeometryCollection": {
				const geometries = geometry.getGeometriesArray();
				for (const geometry of geometries) this.addGeometry_(geometry, feature);
				break;
			}
			case "MultiPolygon": {
				const multiPolygonGeom = geometry;
				this.addCoordinates_(type, multiPolygonGeom.getFlatCoordinates(), multiPolygonGeom.getEndss(), feature, getUid(feature), multiPolygonGeom.getStride());
				break;
			}
			case "MultiLineString": {
				const multiLineGeom = geometry;
				this.addCoordinates_(type, multiLineGeom.getFlatCoordinates(), multiLineGeom.getEnds(), feature, getUid(feature), multiLineGeom.getStride());
				break;
			}
			case "MultiPoint": {
				const multiPointGeom = geometry;
				this.addCoordinates_(type, multiPointGeom.getFlatCoordinates(), null, feature, getUid(feature), multiPointGeom.getStride());
				break;
			}
			case "Polygon": {
				const polygonGeom = geometry;
				this.addCoordinates_(type, polygonGeom.getFlatCoordinates(), polygonGeom.getEnds(), feature, getUid(feature), polygonGeom.getStride());
				break;
			}
			case "Point": {
				const pointGeom = geometry;
				this.addCoordinates_(type, pointGeom.getFlatCoordinates(), null, feature, getUid(feature), pointGeom.getStride());
				break;
			}
			case "LineString":
			case "LinearRing": {
				const lineGeom = geometry;
				const stride = lineGeom.getStride();
				this.addCoordinates_(type, lineGeom.getFlatCoordinates(), null, feature, getUid(feature), stride, lineGeom.getLayout?.());
				break;
			}
			default:
		}
	}
	/**
	* @param {GeometryType} type Geometry type
	* @param {Array<number>} flatCoords Flat coordinates
	* @param {Array<number> | Array<Array<number>> | null} ends Coordinate ends
	* @param {Feature|RenderFeature} feature Feature
	* @param {string} featureUid Feature uid
	* @param {number|null} stride Stride
	* @param {import('../../geom/Geometry.js').GeometryLayout|null} [layout] Layout
	* @private
	*/
	addCoordinates_(type, flatCoords, ends, feature, featureUid, stride, layout) {
		/** @type {number} */
		let verticesCount;
		switch (type) {
			case "MultiPolygon": {
				const multiPolygonEndss = ends;
				for (let i = 0, ii = multiPolygonEndss.length; i < ii; i++) {
					let polygonEnds = multiPolygonEndss[i];
					const prevPolygonEnds = i > 0 ? multiPolygonEndss[i - 1] : null;
					const startIndex = prevPolygonEnds ? prevPolygonEnds[prevPolygonEnds.length - 1] : 0;
					const endIndex = polygonEnds[polygonEnds.length - 1];
					polygonEnds = startIndex > 0 ? polygonEnds.map((end) => end - startIndex) : polygonEnds;
					this.addCoordinates_("Polygon", flatCoords.slice(startIndex, endIndex), polygonEnds, feature, featureUid, stride, layout);
				}
				break;
			}
			case "MultiLineString": {
				const multiLineEnds = ends;
				for (let i = 0, ii = multiLineEnds.length; i < ii; i++) {
					const startIndex = i > 0 ? multiLineEnds[i - 1] : 0;
					this.addCoordinates_("LineString", flatCoords.slice(startIndex, multiLineEnds[i]), null, feature, featureUid, stride, layout);
				}
				break;
			}
			case "MultiPoint": {
				const pointStride = stride ?? 2;
				for (let i = 0, ii = flatCoords.length; i < ii; i += pointStride) this.addCoordinates_("Point", flatCoords.slice(i, i + 2), null, feature, featureUid, 2, void 0);
				break;
			}
			case "Polygon": {
				if (!ends) break;
				const polygonEnds = ends;
				const effectiveStride = stride ?? 2;
				if (feature instanceof RenderFeature) {
					const multiPolygonEnds = inflateEnds(flatCoords, polygonEnds);
					if (multiPolygonEnds.length > 1) {
						this.addCoordinates_("MultiPolygon", flatCoords, multiPolygonEnds, feature, featureUid, stride, layout);
						return;
					}
				}
				if (!this.polygonBatch.entries[featureUid]) this.polygonBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
					feature,
					flatCoordss: [],
					verticesCount: 0,
					ringsCount: 0,
					ringsVerticesCounts: []
				});
				verticesCount = flatCoords.length / effectiveStride;
				const ringsCount = polygonEnds.length;
				const ringsVerticesCount = polygonEnds.map((end, ind, arr) => ind > 0 ? (end - arr[ind - 1]) / effectiveStride : end / effectiveStride);
				this.polygonBatch.verticesCount += verticesCount;
				this.polygonBatch.ringsCount += ringsCount;
				this.polygonBatch.geometriesCount++;
				const polygonEntry = this.polygonBatch.entries[featureUid];
				if (!polygonEntry || !polygonEntry.ringsVerticesCounts) break;
				polygonEntry.flatCoordss.push(getFlatCoordinatesXY(flatCoords, effectiveStride));
				polygonEntry.ringsVerticesCounts.push(ringsVerticesCount);
				polygonEntry.verticesCount = (polygonEntry.verticesCount ?? 0) + verticesCount;
				polygonEntry.ringsCount = (polygonEntry.ringsCount ?? 0) + ringsCount;
				for (let i = 0, ii = polygonEnds.length; i < ii; i++) {
					const startIndex = i > 0 ? polygonEnds[i - 1] : 0;
					this.addCoordinates_("LinearRing", flatCoords.slice(startIndex, polygonEnds[i]), null, feature, featureUid, effectiveStride, layout ?? void 0);
				}
				break;
			}
			case "Point":
				if (!this.pointBatch.entries[featureUid]) this.pointBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
					feature,
					flatCoordss: []
				});
				this.pointBatch.geometriesCount++;
				this.pointBatch.entries[featureUid].flatCoordss.push(flatCoords);
				break;
			case "LineString":
			case "LinearRing": {
				const lineStride = stride ?? 2;
				if (!this.lineStringBatch.entries[featureUid]) this.lineStringBatch.entries[featureUid] = this.addRefToEntry_(featureUid, {
					feature,
					flatCoordss: [],
					verticesCount: 0
				});
				verticesCount = flatCoords.length / lineStride;
				this.lineStringBatch.verticesCount += verticesCount;
				this.lineStringBatch.geometriesCount++;
				const lineEntry = this.lineStringBatch.entries[featureUid];
				if (!lineEntry) break;
				lineEntry.flatCoordss.push(getFlatCoordinatesXYM(flatCoords, lineStride, layout ?? ""));
				lineEntry.verticesCount = (lineEntry.verticesCount ?? 0) + verticesCount;
				break;
			}
			default:
		}
	}
	/**
	* @param {string} featureUid Feature uid
	* @param {GeometryBatchItem} entry The entry to add
	* @return {GeometryBatchItem} the added entry
	* @private
	*/
	addRefToEntry_(featureUid, entry) {
		const currentRef = this.uidToRef_.get(featureUid);
		const ref = currentRef || this.freeGlobalRef_.pop() || ++this.globalCounter_;
		entry.ref = ref;
		if (!currentRef) {
			this.refToFeature_.set(ref, entry.feature);
			this.uidToRef_.set(featureUid, ref);
		}
		return entry;
	}
	/**
	* Return a ref to the pool of available refs.
	* @param {number} ref the ref to return
	* @param {string} featureUid the feature uid
	* @private
	*/
	removeRef_(ref, featureUid) {
		if (!ref) throw new Error("This feature has no ref: " + featureUid);
		this.refToFeature_.delete(ref);
		this.uidToRef_.delete(featureUid);
		this.freeGlobalRef_.push(ref);
	}
	/**
	* @param {Feature|RenderFeature} feature Feature
	* @param {import("../../proj.js").TransformFunction} [projectionTransform] Projection transform.
	*/
	changeFeature(feature, projectionTransform) {
		if (!this.uidToRef_.get(getUid(feature))) return;
		this.removeFeature(feature);
		let geometry = feature.getGeometry();
		if (!geometry) return;
		if (projectionTransform) {
			geometry = geometry.clone();
			geometry.applyTransform(projectionTransform);
		}
		this.addGeometry_(geometry, feature);
	}
	/**
	* @param {Feature|RenderFeature} feature Feature
	*/
	removeFeature(feature) {
		let entry = this.clearFeatureEntryInPointBatch_(feature);
		entry = this.clearFeatureEntryInPolygonBatch_(feature) || entry;
		entry = this.clearFeatureEntryInLineStringBatch_(feature) || entry;
		if (entry && entry.ref !== void 0) this.removeRef_(entry.ref, getUid(entry.feature));
	}
	clear() {
		this.polygonBatch.entries = {};
		this.polygonBatch.geometriesCount = 0;
		this.polygonBatch.verticesCount = 0;
		this.polygonBatch.ringsCount = 0;
		this.lineStringBatch.entries = {};
		this.lineStringBatch.geometriesCount = 0;
		this.lineStringBatch.verticesCount = 0;
		this.pointBatch.entries = {};
		this.pointBatch.geometriesCount = 0;
		this.globalCounter_ = 0;
		this.freeGlobalRef_ = [];
		this.refToFeature_.clear();
		this.uidToRef_.clear();
	}
	/**
	* Resolve the feature associated to a ref.
	* @param {number} ref Hit detected ref
	* @return {Feature|RenderFeature|undefined} feature
	*/
	getFeatureFromRef(ref) {
		return this.refToFeature_.get(ref);
	}
	isEmpty() {
		return this.globalCounter_ === 0;
	}
	/**
	* Will return a new instance of this class that only contains the features
	* for which the provided callback returned true
	* @param {function((Feature|RenderFeature)): boolean} featureFilter Feature filter callback
	* @return {MixedGeometryBatch} Filtered geometry batch
	*/
	filter(featureFilter) {
		const filtered = new MixedGeometryBatch();
		filtered.globalCounter_ = this.globalCounter_;
		filtered.uidToRef_ = this.uidToRef_;
		filtered.refToFeature_ = this.refToFeature_;
		let empty = true;
		for (const feature of this.refToFeature_.values()) if (featureFilter(feature)) {
			filtered.addFeature(feature);
			empty = false;
		}
		if (empty) return new MixedGeometryBatch();
		return filtered;
	}
};
/**
* @param {Array<number>} flatCoords Flat coords
* @param {number} stride Stride
* @return {Array<number>} Flat coords with only XY components
*/
function getFlatCoordinatesXY(flatCoords, stride) {
	if (stride === 2) return flatCoords;
	return flatCoords.filter((v, i) => i % stride < 2);
}
/**
* @param {Array<number>} flatCoords Flat coords
* @param {number} stride Stride
* @param {string} layout Layout
* @return {Array<number>} Flat coords with only XY components
*/
function getFlatCoordinatesXYM(flatCoords, stride, layout) {
	if (stride === 3 && layout === "XYM") return flatCoords;
	if (stride === 4) return flatCoords.filter((v, i) => i % stride !== 2);
	if (stride === 3) return flatCoords.map((v, i) => i % stride !== 2 ? v : 0);
	return new Array(flatCoords.length * 1.5).fill(0).map((v, i) => i % 3 === 2 ? 0 : flatCoords[Math.round(i / 1.5)]);
}
//#endregion
//#region src/ol/webgl/LabelsArray.js
/**
* @module ol/webgl/LabelsArray
*/
var textEncoder = new TextEncoder();
var chunkSize = 1e5;
/**
* @classdesc
* This class stores text values using typed arrays internally.
* Labels are stored as separate UTF-8 characters in a single Uint8Array.
* The Uint8Array is resized when the capacity exceeds to avoid costly concatenation.
*/
var LabelsArray = class {
	constructor() {
		/**
		* @private
		*/
		this.array_ = new Uint8Array(chunkSize);
		this.actualSize_ = 0;
		/**
		* @type {Map<string, Array<number>>}
		* @private
		*/
		this.labelPositionMap_ = /* @__PURE__ */ new Map();
	}
	/**
	* @param {string} label Label to append to the end of the array
	* @return {Array<number>} An array containing 1/ the position of the label in the typed array and 2/ the size of the label in the array
	*/
	push(label) {
		if (label === "") return [0, 0];
		if (this.labelPositionMap_.has(label)) return this.labelPositionMap_.get(label);
		const encoded = textEncoder.encode(label);
		if (this.actualSize_ + encoded.length > this.array_.length) {
			const newArray = new Uint8Array(this.array_.length + chunkSize);
			newArray.set(this.array_);
			this.array_ = newArray;
		}
		const position = this.actualSize_;
		this.array_.set(encoded, position);
		this.actualSize_ += encoded.length;
		const result = [position, encoded.length];
		this.labelPositionMap_.set(label, result);
		return result;
	}
	/**
	* @return {Uint8Array} Typed array containing the encoded labels.
	*/
	getArray() {
		return this.array_;
	}
};
//#endregion
//#region src/ol/worker/webgl.js
function create() {
	const source = "/**\n * A vertex in a circular doubly linked list representing a polygon ring.\n * `prev`/`next` are always linked (set immediately after {@link createNode}), so they're typed\n * non-null; `prevZ`/`nextZ` are the z-order list links and are null at the ends.\n *\n * @typedef {object} Node\n * @property {number} i vertex index in the coordinates array\n * @property {number} x vertex x coordinate\n * @property {number} y vertex y coordinate\n * @property {Node} prev previous vertex node in the polygon ring\n * @property {Node} next next vertex node in the polygon ring\n * @property {number} z z-order curve value; doubles as the owning block index during eliminateHoles\n * @property {Node | null} prevZ previous node in z-order\n * @property {Node | null} nextZ next node in z-order\n */\n\n// single-vertex holes to preserve through filterPoints (steiner points); kept off the Node\n// shape since they're rare — the empty-set fast path means non-steiner inputs pay nothing\n/** @type {Set<Node>} */\nconst steiners = new Set();\n\n// set by filterPoints whenever it removes at least one node; read by earcutLinked's stall\n// handler to decide whether another clip pass is worth attempting before the costlier stages\nlet filteredOut = false;\n\n/**\n * Triangulate a polygon given as a flat array of vertex coordinates.\n *\n * @param {ArrayLike<number>} data flat array of vertex coordinates\n * @param {ArrayLike<number> | null} [holeIndices] indices (in vertices, not coordinates) where each hole ring starts\n * @param {number} [dim=2] number of coordinates per vertex in `data`\n * @returns {number[]} triangles as triplets of vertex indices into `data`\n * @example earcut([10,0, 0,50, 60,60, 70,10]); // [1,0,3, 3,2,1]\n */\nfunction earcut(data, holeIndices, dim = 2) {\n\n    const hasHoles = holeIndices && holeIndices.length;\n    const outerLen = hasHoles ? holeIndices[0] * dim : data.length;\n    if (steiners.size) steiners.clear();\n\n    let outerNode = linkedList(data, 0, outerLen, dim, true);\n    /** @type {number[]} */\n    const triangles = [];\n\n    if (!outerNode || outerNode.next === outerNode.prev) return triangles;\n\n    let minX = 0, minY = 0, invSize = 0;\n\n    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);\n\n    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox\n    if (data.length > 80 * dim) {\n        minX = data[0];\n        minY = data[1];\n        let maxX = minX;\n        let maxY = minY;\n\n        for (let i = dim; i < outerLen; i += dim) {\n            const x = data[i];\n            const y = data[i + 1];\n            if (x < minX) minX = x;\n            if (y < minY) minY = y;\n            if (x > maxX) maxX = x;\n            if (y > maxY) maxY = y;\n        }\n\n        // minX, minY and invSize are later used to transform coords into integers for z-order calculation\n        invSize = Math.max(maxX - minX, maxY - minY);\n        invSize = invSize !== 0 ? 32767 / invSize : 0;\n    }\n\n    earcutLinked(outerNode, triangles, minX, minY, invSize);\n\n    return triangles;\n}\n\n// create a circular doubly linked list from polygon points in the specified winding order\n/** @param {ArrayLike<number>} data @param {number} start @param {number} end @param {number} dim @param {boolean} clockwise @returns {Node | null} */\nfunction linkedList(data, start, end, dim, clockwise) {\n    /** @type {Node | null} */\n    let last = null;\n\n    if (clockwise === (signedArea(data, start, end, dim) > 0)) {\n        for (let i = start; i < end; i += dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);\n    } else {\n        for (let i = end - dim; i >= start; i -= dim) last = insertNode(i / dim | 0, data[i], data[i + 1], last);\n    }\n\n    if (last && equals(last, last.next)) {\n        removeNode(last);\n        last = last.next;\n    }\n\n    return last;\n}\n\n// Remove collinear or coincident points; removability depends only on a node's immediate\n// neighbors, so we sweep forward and re-check the predecessor after each removal. With no `end`\n// we sweep the whole ring, lapping until nothing is removable (the fixpoint the clipper needs).\n// With an explicit `end` we heal only the dirty window around a bridge/diagonal cut, stopping at\n// `end` rather than lapping — O(window) instead of O(ring).\n/** @param {Node} start @param {Node} [end] @returns {Node} */\nfunction filterPoints(start, end = start) {\n    const full = end === start;\n\n    let p = start, again;\n    do {\n        again = false;\n        if (p !== p.next && (steiners.size === 0 || !steiners.has(p)) &&\n            (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {\n            if (full || p === end) end = p.prev; // pull the stop bound back past the removal\n            filteredOut = true;\n            removeNode(p);\n            p = p.prev;         // re-check the predecessor\n            again = true;\n        } else if (full || p !== end) {\n            p = p.next;\n            again = !full;      // local heal: keep looping until the sweep reaches end\n        }\n    } while (again || p !== end);\n\n    return end;\n}\n\n// main ear slicing loop which triangulates a polygon (given as a linked list)\n/** @param {Node} ear @param {number[]} triangles @param {number} minX @param {number} minY @param {number} invSize */\nfunction earcutLinked(ear, triangles, minX, minY, invSize) {\n    // interlink polygon nodes in z-order\n    if (invSize) indexCurve(ear, minX, minY, invSize);\n\n    let stop = ear, cured = false;\n\n    // iterate through ears, slicing them one by one\n    while (ear.prev !== ear.next) {\n        const prev = ear.prev;\n        /** @type {Node} */\n        const next = ear.next;\n\n        if (area(prev, ear, next) < 0 && (invSize ? isEarHashed(ear, minX, minY, invSize) : isEar(ear))) {\n            triangles.push(prev.i, ear.i, next.i); // cut off the triangle\n\n            removeNode(ear);\n            ear = next;\n            stop = next;\n            continue;\n        }\n\n        ear = next;\n\n        // if we looped through the whole remaining polygon and can't find any more ears\n        if (ear === stop) {\n            // try filtering collinear/coincident points and slicing again — repeat as long as\n            // filtering actually removes nodes, since each removal can expose new ears\n            filteredOut = false;\n            ear = filterPoints(ear);\n            if (filteredOut) { stop = ear; continue; }\n\n            // filtering is exhausted: cure small local self-intersections once, then retry\n            if (!cured) {\n                ear = cureLocalIntersections(ear, triangles);\n                stop = ear;\n                cured = true;\n                continue;\n            }\n\n            // as a last resort, try splitting the remaining polygon into two\n            splitEarcut(ear, triangles, minX, minY, invSize);\n            break;\n        }\n    }\n}\n\n// check whether a polygon node forms a valid ear with adjacent nodes\n/** @param {Node} ear @returns {boolean} */\nfunction isEar(ear) {\n    // reflex check (area(a, b, c) >= 0) is hoisted into the earcutLinked caller to avoid non-inlined call here\n    const a = ear.prev, b = ear, c = ear.next,\n        ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y,\n        x0 = Math.min(ax, bx, cx), // triangle bbox\n        y0 = Math.min(ay, by, cy),\n        x1 = Math.max(ax, bx, cx),\n        y1 = Math.max(ay, by, cy);\n\n    // make sure we don't have other points inside the potential ear\n    let p = c.next;\n    while (p !== a) {\n        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && !(ax === p.x && ay === p.y) &&\n            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;\n        p = p.next;\n    }\n    return true;\n}\n\n/** @param {Node} ear @param {number} minX @param {number} minY @param {number} invSize @returns {boolean} */\nfunction isEarHashed(ear, minX, minY, invSize) {\n    // reflex check is hoisted into the earcutLinked caller (see isEar)\n    const a = ear.prev, b = ear, c = ear.next,\n        ax = a.x, bx = b.x, cx = c.x, ay = a.y, by = b.y, cy = c.y,\n        x0 = Math.min(ax, bx, cx), // triangle bbox\n        y0 = Math.min(ay, by, cy),\n        x1 = Math.max(ax, bx, cx),\n        y1 = Math.max(ay, by, cy),\n        minZ = zOrder(x0, y0, minX, minY, invSize), // z-order range for the current triangle bbox;\n        maxZ = zOrder(x1, y1, minX, minY, invSize);\n\n    let p = ear.prevZ;\n    while (p && p.z >= minZ) { // look for points inside the triangle in decreasing z-order\n        if (p.x >= x0 && p.x <= x1 && p.y >= y0 && p.y <= y1 && p !== c && !(ax === p.x && ay === p.y) &&\n            pointInTriangle(ax, ay, bx, by, cx, cy, p.x, p.y) && area(p.prev, p, p.next) >= 0) return false;\n        p = p.prevZ;\n    }\n    let n = ear.nextZ;\n    while (n && n.z <= maxZ) { // look for points in increasing z-order\n        if (n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1 && n !== c && !(ax === n.x && ay === n.y) &&\n            pointInTriangle(ax, ay, bx, by, cx, cy, n.x, n.y) && area(n.prev, n, n.next) >= 0) return false;\n        n = n.nextZ;\n    }\n    return true;\n}\n\n// go through all polygon nodes and cure small local self-intersections\n/** @param {Node} start @param {number[]} triangles @returns {Node} */\nfunction cureLocalIntersections(start, triangles) {\n    let p = start;\n    let cured = false;\n    do {\n        const a = p.prev,\n            b = p.next.next;\n\n        if (intersects(a, p, p.next, b, false) && locallyInside(a, b) && locallyInside(b, a)) {\n\n            triangles.push(a.i, p.i, b.i);\n\n            // remove two nodes involved\n            removeNode(p);\n            removeNode(p.next);\n\n            p = start = b;\n            cured = true;\n        }\n        p = p.next;\n    } while (p !== start);\n\n    return cured ? filterPoints(p) : p;\n}\n\n// try splitting polygon into two and triangulate them independently\n/** @param {Node} start @param {number[]} triangles @param {number} minX @param {number} minY @param {number} invSize */\nfunction splitEarcut(start, triangles, minX, minY, invSize) {\n    // look for a valid diagonal that divides the polygon into two\n    let a = start;\n    do {\n        let b = a.next.next;\n        while (b !== a.prev) {\n            if (a.i !== b.i && isValidDiagonal(a, b)) {\n                // split the polygon in two by the diagonal\n                let c = splitPolygon(a, b);\n\n                // filter colinear points around the cuts\n                a = filterPoints(a, a.next);\n                c = filterPoints(c, c.next);\n\n                // run earcut on each half\n                earcutLinked(a, triangles, minX, minY, invSize);\n                earcutLinked(c, triangles, minX, minY, invSize);\n                return;\n            }\n            b = b.next;\n        }\n        a = a.next;\n    } while (a !== start);\n}\n\n// true only while eliminateHoles merges holes, so removeNode keeps the block index live (growBlock)\nlet indexActive = false;\n\n// link every hole into the outer loop, producing a single-ring polygon without holes\n/** @param {ArrayLike<number>} data @param {ArrayLike<number>} holeIndices @param {Node} outerNode @param {number} dim @returns {Node} */\nfunction eliminateHoles(data, holeIndices, outerNode, dim) {\n    const queue = [];\n\n    for (let i = 0, len = holeIndices.length; i < len; i++) {\n        const start = holeIndices[i] * dim;\n        const end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;\n        const list = /** @type {Node} */ (linkedList(data, start, end, dim, false));\n        if (list === list.next) steiners.add(list);\n        queue.push(getLeftmost(list));\n    }\n\n    queue.sort(compareXYSlope);\n\n    // block-bbox index for findHoleBridge, grown append-only as holes merge (see notes\n    // above buildBlockIndex). Seed it with the outer ring, then append each merged hole.\n    buildBlockIndex(data.length / dim, holeIndices.length);\n    indexSegment(outerNode, outerNode);\n\n    // process holes from left to right; indexActive lets removeNode keep block bboxes live as\n    // filterPoints heals edges during merges (see growBlock)\n    indexActive = true;\n    for (let i = 0; i < queue.length; i++) {\n        outerNode = eliminateHole(queue[i], outerNode);\n    }\n    indexActive = false;\n\n    // collapse collinear/coincident points across the whole merged ring once before clipping\n    return filterPoints(outerNode);\n}\n\n/** @param {Node} a @param {Node} b @returns {number} */\nfunction compareXYSlope(a, b) {\n    // when the left-most point of 2 holes meet at a vertex, sort the holes counterclockwise so that when we find\n    // the bridge to the outer shell is always the point that they meet at.\n    return a.x - b.x || a.y - b.y ||\n        (a.next.y - a.y) / (a.next.x - a.x) -\n        (b.next.y - b.y) / (b.next.x - b.x);\n}\n\n// find a bridge between vertices that connects hole with an outer ring and link it\n/** @param {Node} hole @param {Node} outerNode @returns {Node} */\nfunction eliminateHole(hole, outerNode) {\n    const bridge = findHoleBridge(hole, outerNode);\n    if (!bridge) {\n        return outerNode;\n    }\n\n    const bridgeReverse = splitPolygon(bridge, hole);\n\n    // index the merged-in segment before filtering: in ring order the splice runs\n    // bridge -> hole -> bridgeReverse -> bridge2 -> (bridge's old next), covering the\n    // hole's edges and both new slit edges. filterPoints below only drops collinear /\n    // coincident points, so these bboxes stay valid (conservative) supersets.\n    const bridge2 = bridgeReverse.next;\n    indexSegment(bridge, bridge2.next);\n\n    // heal collinear/coincident points around the two new slit edges\n    filterPoints(bridgeReverse, bridgeReverse.next);\n    return filterPoints(bridge, bridge.next);\n}\n\n// Block-bbox index for findHoleBridge (issue #183): one [minX,minY,maxX,maxY] bbox per K\n// consecutive ring edges, in a flat Float64Array, so the leftward-ray scan can skip whole\n// blocks in O(1) instead of walking the entire merged ring. Grown append-only — the outer\n// ring seeds it, then each merged hole appends a segment (head node, stop node, K-blocks\n// over head..stop); independent segments, not a ring tiling, since splices land mid-ring.\n// Buffers are sized once from the input upper bound and reused across calls.\n//\n// filterPoints only drops collinear/coincident points, so a stale bbox stays a conservative\n// superset of its live edges (never a false skip); the scan skips dead nodes (p.prev.next !==\n// p) and lazily advances a dead stop. Blocks are scanned in append (not ring) order, so the\n// chosen bridge can differ from the un-indexed code — a different but equally valid result.\nconst K = 16; // edges per block\n\nlet blockBBox = new Float64Array(0); // [minX,minY,maxX,maxY] per block\nlet numBlocks = 0;\n/** @type {Node[]} */\nconst blockHead = []; // first node of each block's segment\n/** @type {Node[]} */\nconst blockStop = []; // node just past each block's segment (exclusive walk bound)\n\n/** @param {number} maxNodes @param {number} numHoles */\nfunction buildBlockIndex(maxNodes, numHoles) {\n    // upper bound: every input node indexed once, +2 bridge nodes per hole, plus a partial\n    // trailing block per appended segment (outer ring + one per hole)\n    const maxBlocks = Math.ceil((maxNodes + 2 * numHoles) / K) + numHoles + 2;\n    if (blockBBox.length < maxBlocks * 4) blockBBox = new Float64Array(maxBlocks * 4);\n    numBlocks = 0;\n}\n\n// index the ring run head..stop (exclusive) as ceil(len / K) blocks; head === stop means\n// the whole ring. each block's bbox covers both endpoints of every edge it owns.\n/** @param {Node} head @param {Node} stop */\nfunction indexSegment(head, stop) {\n    let p = head;\n    do {\n        const b = numBlocks++;\n        blockHead[b] = p;\n        let minX = p.x, minY = p.y, maxX = p.x, maxY = p.y;\n        let k = 0;\n        do {\n            const c = p.next; // edge p->c; bbox must bound both endpoints\n            p.z = b; // reuse z as the owning block during eliminateHoles (see growBlock)\n            if (c.x < minX) minX = c.x; if (c.x > maxX) maxX = c.x;\n            if (c.y < minY) minY = c.y; if (c.y > maxY) maxY = c.y;\n            p = c;\n        } while (++k < K && p !== stop);\n        blockStop[b] = p;\n        const g = b * 4;\n        blockBBox[g] = minX; blockBBox[g + 1] = minY; blockBBox[g + 2] = maxX; blockBBox[g + 3] = maxY;\n    } while (p !== stop);\n}\n\n// when filterPoints heals an edge head->tail (removing the collinear node between them), the\n// healed edge can extend past head's frozen block bbox if its old far endpoint lived in another\n// block; grow head's block bbox to cover tail so the leftward-ray prune can't false-skip it.\n/** @param {Node} head @param {Node} tail */\nfunction growBlock(head, tail) {\n    const g = head.z * 4;\n    if (tail.x < blockBBox[g]) blockBBox[g] = tail.x;\n    if (tail.y < blockBBox[g + 1]) blockBBox[g + 1] = tail.y;\n    if (tail.x > blockBBox[g + 2]) blockBBox[g + 2] = tail.x;\n    if (tail.y > blockBBox[g + 3]) blockBBox[g + 3] = tail.y;\n}\n\n/** @param {number} b @returns {Node} */\nfunction liveBlockStop(b) {\n    let stop = blockStop[b];\n    while (stop.prev.next !== stop) stop = stop.next;\n    blockStop[b] = stop;\n    return stop;\n}\n\n// the block's head node can be removed by filterPoints during merges; advance it to the next\n// live node so the walk doesn't start on (and immediately terminate at) a dead node. For the\n// single full-ring seed block (head === stop) the same forward advance keeps them equal, so the\n// do-while still laps the whole ring instead of collapsing to an empty walk.\n/** @param {number} b @returns {Node} */\nfunction liveBlockHead(b) {\n    let head = blockHead[b];\n    while (head.prev.next !== head) head = head.next;\n    blockHead[b] = head;\n    return head;\n}\n\n// David Eberly's algorithm for finding a bridge between hole and outer polygon\n/** @param {Node} hole @param {Node} outerNode @returns {Node | null} */\nfunction findHoleBridge(hole, outerNode) {\n    let p = outerNode;\n    const hx = hole.x;\n    const hy = hole.y;\n    let qx = -Infinity;\n    /** @type {Node | undefined} */\n    let m;\n\n    // find a segment intersected by a ray from the hole's leftmost point to the left;\n    // segment's endpoint with lesser x will be potential connection point\n    // unless they intersect at a vertex, then choose the vertex\n    if (equals(hole, p)) return p;\n\n    // scan blocks; skip any whose bbox can't hold a crossing that beats qx and lies left\n    // of hx (the prune Morton order can't express — explicit per-axis [minY,maxY]/[minX,maxX])\n    for (let b = 0, g = 0; b < numBlocks; b++, g += 4) {\n        if (hy < blockBBox[g + 1] || hy > blockBBox[g + 3] || blockBBox[g] > hx || blockBBox[g + 2] <= qx) continue;\n\n        // ensure the walk's exclusive bound is live so we don't overrun into other blocks\n        const stop = liveBlockStop(b);\n\n        p = liveBlockHead(b);\n        do {\n            if (p.prev.next === p) { // skip nodes removed by filterPoints (stale in the index)\n                if (equals(hole, p.next)) return p.next;\n                else if (hy <= p.y && hy >= p.next.y && p.next.y !== p.y) {\n                    const x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);\n                    if (x <= hx && x > qx) {\n                        qx = x;\n                        m = p.x < p.next.x ? p : p.next;\n                        if (x === hx) return m; // hole touches outer segment; pick leftmost endpoint\n                    }\n                }\n            }\n            p = p.next;\n        } while (p !== stop);\n    }\n\n    if (!m) return null;\n\n    // look for points inside the triangle of hole point, segment intersection and endpoint;\n    // if there are no points found, we have a valid connection;\n    // otherwise choose the point of the minimum angle with the ray as connection point\n\n    const mx = m.x;\n    const my = m.y;\n    const tminY = Math.min(hy, my); // the triangle's y span; x span is [mx, hx]\n    const tmaxY = Math.max(hy, my);\n    let tanMin = Infinity;\n\n    // scan the same blocks; skip any whose bbox can't overlap the triangle's [mx,hx]×[tminY,tmaxY] box\n    for (let b = 0, g = 0; b < numBlocks; b++, g += 4) {\n        if (blockBBox[g + 2] < mx || blockBBox[g] > hx || blockBBox[g + 3] < tminY || blockBBox[g + 1] > tmaxY) continue;\n\n        const stop = liveBlockStop(b);\n\n        p = liveBlockHead(b);\n        do {\n            if (p.prev.next === p && hx >= p.x && p.x >= mx && hx !== p.x && // skip dead nodes\n                    pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {\n\n                const tan = Math.abs(hy - p.y) / (hx - p.x); // tangential\n\n                // if hole point sits on p's horizontal edge (T-junction touch): the bridge runs\n                // along that edge — locallyInside rejects it as collinear, but it's valid\n                if ((locallyInside(p, hole) || (p.y === hy && p.next.y === hy && p.next.x > hx)) &&\n                    (tan < tanMin || (tan === tanMin && (p.x > m.x || (p.x === m.x && sectorContainsSector(m, p)))))) {\n                    m = p;\n                    tanMin = tan;\n                }\n            }\n\n            p = p.next;\n        } while (p !== stop);\n    }\n\n    return m;\n}\n\n// whether sector in vertex m contains sector in vertex p in the same coordinates\n/** @param {Node} m @param {Node} p @returns {boolean} */\nfunction sectorContainsSector(m, p) {\n    return area(m.prev, m, p.prev) < 0 && area(p.next, m, m.next) < 0;\n}\n\n// scratch buffers reused across calls and grown on demand: two node-ref arrays that\n// ping-pong during the radix passes, plus parallel z-value arrays so the passes read\n// z from contiguous memory instead of dereferencing each node. 256-entry histogram for\n// 8-bit digits; the small histogram keeps per-call setup cheap (most rings are short)\n/** @type {Node[]} */\nconst sortArr = [];\n/** @type {Node[]} */\nlet sortBuf = [];\nlet zArr = new Uint32Array(0);\nlet zBuf = new Uint32Array(0);\nconst counts = new Uint32Array(256);\n\n// interlink polygon nodes in z-order: collect into an array, sort by z, relink\n/** @param {Node} start @param {number} minX @param {number} minY @param {number} invSize */\nfunction indexCurve(start, minX, minY, invSize) {\n    let p = start;\n    let n = 0;\n    do {\n        // always (re)compute: z may still hold a block index left over from eliminateHoles\n        p.z = zOrder(p.x, p.y, minX, minY, invSize);\n        sortArr[n++] = p;\n        p = p.next;\n    } while (p !== start);\n\n    sortNodes(n);\n\n    /** @type {Node | null} */\n    let prev = null;\n    for (let i = 0; i < n; i++) {\n        const node = sortArr[i];\n        node.prevZ = prev;\n        if (prev) prev.nextZ = node;\n        prev = node;\n    }\n    /** @type {Node} */ (prev).nextZ = null;\n\n    // drop the node refs but keep the capacity: setting length to 0 leaves sortBuf unresized\n    // (its growth is gated on zArr), so the radix scatter regrows it out of order every call\n    sortArr.fill(/** @type {Node} */ (/** @type {unknown} */ (null)), 0, n);\n    sortBuf.fill(/** @type {Node} */ (/** @type {unknown} */ (null)), 0, n);\n}\n\n// sort the first n nodes of sortArr by z, in place: insertion sort for small n (cheaper\n// than histogram setup), else LSD radix in four 8-bit passes (covering z's 30 bits)\n/** @param {number} n */\nfunction sortNodes(n) {\n    if (n <= 32) {\n        for (let i = 1; i < n; i++) {\n            const node = sortArr[i], z = node.z;\n            let j = i - 1;\n            while (j >= 0 && sortArr[j].z > z) { sortArr[j + 1] = sortArr[j]; j--; }\n            sortArr[j + 1] = node;\n        }\n        return;\n    }\n\n    if (zArr.length < n) {\n        zArr = new Uint32Array(n);\n        zBuf = new Uint32Array(n);\n        sortBuf = new Array(n);\n    }\n    for (let i = 0; i < n; i++) zArr[i] = sortArr[i].z;\n\n    // even pass count lands the sorted result back in sortArr\n    radixPass(n, sortArr, zArr, sortBuf, zBuf, 0);\n    radixPass(n, sortBuf, zBuf, sortArr, zArr, 8);\n    radixPass(n, sortArr, zArr, sortBuf, zBuf, 16);\n    radixPass(n, sortBuf, zBuf, sortArr, zArr, 24);\n}\n\n// one LSD radix pass: stably scatter the first n nodes (and their z) from src to dst,\n// bucketed by the 8-bit digit of z at the given bit shift\n/** @param {number} n @param {Node[]} src @param {Uint32Array} srcZ @param {Node[]} dst @param {Uint32Array} dstZ @param {number} shift */\nfunction radixPass(n, src, srcZ, dst, dstZ, shift) {\n    counts.fill(0);\n    for (let i = 0; i < n; i++) counts[(srcZ[i] >>> shift) & 0xff]++;\n    // turn per-bucket counts into start offsets (prefix sum)\n    let sum = 0;\n    for (let b = 0; b < 256; b++) { const c = counts[b]; counts[b] = sum; sum += c; }\n    for (let i = 0; i < n; i++) {\n        const z = srcZ[i];\n        const pos = counts[(z >>> shift) & 0xff]++;\n        dst[pos] = src[i];\n        dstZ[pos] = z;\n    }\n}\n\n// z-order of a point given coords and inverse of the longer side of data bbox\n/** @param {number} x @param {number} y @param {number} minX @param {number} minY @param {number} invSize @returns {number} */\nfunction zOrder(x, y, minX, minY, invSize) {\n    // coords are transformed into non-negative 15-bit integer range\n    x = (x - minX) * invSize | 0;\n    y = (y - minY) * invSize | 0;\n\n    x = (x | (x << 8)) & 0x00FF00FF;\n    x = (x | (x << 4)) & 0x0F0F0F0F;\n    x = (x | (x << 2)) & 0x33333333;\n    x = (x | (x << 1)) & 0x55555555;\n\n    y = (y | (y << 8)) & 0x00FF00FF;\n    y = (y | (y << 4)) & 0x0F0F0F0F;\n    y = (y | (y << 2)) & 0x33333333;\n    y = (y | (y << 1)) & 0x55555555;\n\n    return x | (y << 1);\n}\n\n// find the leftmost node of a polygon ring\n/** @param {Node} start @returns {Node} */\nfunction getLeftmost(start) {\n    let p = start,\n        leftmost = start;\n    do {\n        if (p.x < leftmost.x || (p.x === leftmost.x && p.y < leftmost.y)) leftmost = p;\n        p = p.next;\n    } while (p !== start);\n\n    return leftmost;\n}\n\n// check if a point lies within a convex triangle\n/** @param {number} ax @param {number} ay @param {number} bx @param {number} by @param {number} cx @param {number} cy @param {number} px @param {number} py @returns {boolean} */\nfunction pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {\n    return (cx - px) * (ay - py) >= (ax - px) * (cy - py) &&\n           (ax - px) * (by - py) >= (bx - px) * (ay - py) &&\n           (bx - px) * (cy - py) >= (cx - px) * (by - py);\n}\n\n// check if a diagonal between two polygon nodes is valid (lies in polygon interior)\n/** @param {Node} a @param {Node} b @returns {boolean} true when the diagonal is valid */\nfunction isValidDiagonal(a, b) {\n    const zeroLength = equals(a, b) && area(a.prev, a, a.next) > 0 && area(b.prev, b, b.next) > 0; // degenerate case\n    return a.next.i !== b.i && (zeroLength || locallyInside(a, b) && locallyInside(b, a) && // // locally visible\n        (area(a.prev, a, b.prev) !== 0 || area(a, b.prev, b) !== 0)) && // no opposite-facing sectors\n        !intersectsPolygon(a, b) && (zeroLength || middleInside(a, b)); // doesn't intersect other edges, diagonal inside polygon\n}\n\n// signed area of a triangle\n/** @param {Node} p @param {Node} q @param {Node} r @returns {number} */\nfunction area(p, q, r) {\n    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);\n}\n\n// check if two points are equal\n/** @param {Node} p1 @param {Node} p2 @returns {boolean} */\nfunction equals(p1, p2) {\n    return p1.x === p2.x && p1.y === p2.y;\n}\n\n// check if two segments intersect; by default includes collinear boundary touches\n/** @param {Node} p1 @param {Node} q1 @param {Node} p2 @param {Node} q2 @param {boolean} [includeBoundary] @returns {boolean} */\nfunction intersects(p1, q1, p2, q2, includeBoundary = true) {\n    const o1 = area(p1, q1, p2);\n    const o2 = area(p1, q1, q2);\n    const o3 = area(p2, q2, p1);\n    const o4 = area(p2, q2, q1);\n\n    if (((o1 > 0 && o2 < 0) || (o1 < 0 && o2 > 0)) && ((o3 > 0 && o4 < 0) || (o3 < 0 && o4 > 0))) return true;\n\n    if (!includeBoundary) return false;\n\n    if (o1 === 0 && onSegment(p1, p2, q1)) return true; // p1, q1 and p2 are collinear and p2 lies on p1q1\n    if (o2 === 0 && onSegment(p1, q2, q1)) return true; // p1, q1 and q2 are collinear and q2 lies on p1q1\n    if (o3 === 0 && onSegment(p2, p1, q2)) return true; // p2, q2 and p1 are collinear and p1 lies on p2q2\n    if (o4 === 0 && onSegment(p2, q1, q2)) return true; // p2, q2 and q1 are collinear and q1 lies on p2q2\n\n    return false;\n}\n\n// for collinear points p, q, r, check if point q lies on segment pr\n/** @param {Node} p @param {Node} q @param {Node} r @returns {boolean} */\nfunction onSegment(p, q, r) {\n    return q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y);\n}\n\n// check if a polygon diagonal intersects any polygon segments\n/** @param {Node} a @param {Node} b @returns {boolean} */\nfunction intersectsPolygon(a, b) {\n    // diagonal bbox; an edge whose bbox can't overlap it can't intersect it, so\n    // skip the orientation test for those (the common case — the diagonal is short)\n    const minX = Math.min(a.x, b.x);\n    const maxX = Math.max(a.x, b.x);\n    const minY = Math.min(a.y, b.y);\n    const maxY = Math.max(a.y, b.y);\n\n    let p = a;\n    do {\n        const n = p.next;\n        if ((p.x > maxX && n.x > maxX) || (p.x < minX && n.x < minX) ||\n            (p.y > maxY && n.y > maxY) || (p.y < minY && n.y < minY)) {\n            p = n;\n            continue;\n        }\n        if (p.i !== a.i && n.i !== a.i && p.i !== b.i && n.i !== b.i &&\n                intersects(p, n, a, b)) return true;\n        p = n;\n    } while (p !== a);\n\n    return false;\n}\n\n// check if a polygon diagonal is locally inside the polygon\n/** @param {Node} a @param {Node} b @returns {boolean} */\nfunction locallyInside(a, b) {\n    return area(a.prev, a, a.next) < 0 ?\n        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :\n        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;\n}\n\n// check if the middle point of a polygon diagonal is inside the polygon\n/** @param {Node} a @param {Node} b @returns {boolean} */\nfunction middleInside(a, b) {\n    let p = a;\n    let inside = false;\n    const px = (a.x + b.x) / 2;\n    const py = (a.y + b.y) / 2;\n    do {\n        const n = p.next;\n        if (((p.y > py) !== (n.y > py)) && (px < (n.x - p.x) * (py - p.y) / (n.y - p.y) + p.x))\n            inside = !inside;\n        p = n;\n    } while (p !== a);\n\n    return inside;\n}\n\n// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;\n// if one belongs to the outer ring and another to a hole, it merges it into a single ring\n/** @param {Node} a @param {Node} b @returns {Node} */\nfunction splitPolygon(a, b) {\n    const a2 = createNode(a.i, a.x, a.y),\n        b2 = createNode(b.i, b.x, b.y),\n        an = a.next,\n        bp = b.prev;\n\n    a.next = b;\n    b.prev = a;\n\n    a2.next = an;\n    an.prev = a2;\n\n    b2.next = a2;\n    a2.prev = b2;\n\n    bp.next = b2;\n    b2.prev = bp;\n\n    return b2;\n}\n\n// create a node and optionally link it with previous one (in a circular doubly linked list)\n/** @param {number} i @param {number} x @param {number} y @param {Node | null} last @returns {Node} */\nfunction insertNode(i, x, y, last) {\n    const p = createNode(i, x, y);\n\n    if (!last) {\n        p.prev = p;\n        p.next = p;\n\n    } else {\n        p.next = last.next;\n        p.prev = last;\n        last.next.prev = p;\n        last.next = p;\n    }\n    return p;\n}\n\n/** @param {Node} p */\nfunction removeNode(p) {\n    p.next.prev = p.prev;\n    p.prev.next = p.next;\n\n    if (p.prevZ) p.prevZ.nextZ = p.nextZ;\n    if (p.nextZ) p.nextZ.prevZ = p.prevZ;\n\n    // keep the hole-bridge index's block bboxes covering the healed prev->next edge\n    if (indexActive) growBlock(p.prev, p.next);\n}\n\n/** @param {number} i @param {number} x @param {number} y @returns {Node} */\nfunction createNode(i, x, y) {\n    // prev/next are assigned by the caller before any read, so the null init is cast away here\n    return /** @type {Node} */ (/** @type {unknown} */ ({\n        i, // vertex index in coordinates array\n        x, y, // vertex coordinates\n        prev: null, // previous and next vertex nodes in a polygon ring\n        next: null,\n        z: 0, // z-order curve value; doubles as owning block in the hole-bridge index during eliminateHoles\n        prevZ: null, // previous and next nodes in z-order\n        nextZ: null\n    }));\n}\n\n/** @param {ArrayLike<number>} data @param {number} start @param {number} end @param {number} dim @returns {number} */\nfunction signedArea(data, start, end, dim) {\n    let sum = 0;\n    for (let i = start, j = end - dim; i < end; i += dim) {\n        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);\n        j = i;\n    }\n    return sum;\n}\n\n/**\n * @module ol/math\n */\n\n/**\n * Takes a number and clamps it to within the provided bounds.\n * @param {number} value The input number.\n * @param {number} min The minimum value to return.\n * @param {number} max The maximum value to return.\n * @return {number} The input number if it is within bounds, or the nearest\n *     number within the bounds.\n */\nfunction clamp(value, min, max) {\n  return Math.min(Math.max(value, min), max);\n}\n\n/**\n * @module ol/coordinate\n */\n\n/**\n * Compute the angle between p0pA and p0pB\n * @param {Coordinate} p0 Point 0\n * @param {Coordinate} pA Point A\n * @param {Coordinate} pB Point B\n * @return {number} a value in [0, 2PI]\n */\nfunction angleBetween(p0, pA, pB) {\n  const lenA = Math.sqrt(\n    (pA[0] - p0[0]) * (pA[0] - p0[0]) + (pA[1] - p0[1]) * (pA[1] - p0[1]),\n  );\n  const tangentA = [(pA[0] - p0[0]) / lenA, (pA[1] - p0[1]) / lenA];\n  const orthoA = [-tangentA[1], tangentA[0]];\n  const lenB = Math.sqrt(\n    (pB[0] - p0[0]) * (pB[0] - p0[0]) + (pB[1] - p0[1]) * (pB[1] - p0[1]),\n  );\n  const tangentB = [(pB[0] - p0[0]) / lenB, (pB[1] - p0[1]) / lenB];\n\n  // this angle can be clockwise or anticlockwise; hence the computation afterwards\n  let angle =\n    lenA === 0 || lenB === 0\n      ? 0\n      : Math.acos(\n          clamp(tangentB[0] * tangentA[0] + tangentB[1] * tangentA[1], -1, 1),\n        );\n  angle = Math.max(angle, 0.00001); // avoid a zero angle otherwise this is detected as a line cap\n  const isClockwise = tangentB[0] * orthoA[0] + tangentB[1] * orthoA[1] > 0;\n  return !isClockwise ? Math.PI * 2 - angle : angle;\n}\n\n/**\n * @module ol/asserts\n */\n\n/**\n * @param {*} assertion Assertion we expected to be truthy.\n * @param {string} errorMessage Error message.\n */\nfunction assert(assertion, errorMessage) {\n  if (!assertion) {\n    throw new Error(errorMessage);\n  }\n}\n\n/**\n * @module ol/transform\n */\n\n/**\n * An array representing an affine 2d transformation for use with\n * {@link module:ol/transform} functions. The array has 6 elements.\n * @typedef {!Array<number>} Transform\n * @api\n */\n\n/**\n * Collection of affine 2d transformation functions. The functions work on an\n * array of 6 elements. The element order is compatible with the [SVGMatrix\n * interface](https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix) and is\n * a subset (elements a to f) of a 3×3 matrix:\n * ```\n * [ a c e ]\n * [ b d f ]\n * [ 0 0 1 ]\n * ```\n */\n\n/** @type {Transform} */\nconst IDENTITY_TRANSFORM = [1, 0, 0, 1, 0, 0];\n\n/**\n * @private\n * @type {Transform}\n */\nnew Array(6);\n\n/**\n * Create an identity transform.\n * @return {!Transform} Identity transform.\n */\nfunction create() {\n  return IDENTITY_TRANSFORM.slice(0);\n}\n\n/**\n * Transforms the given coordinate with the given transform returning the\n * resulting, transformed coordinate. The coordinate will be modified in-place.\n *\n * @param {Transform} transform The transformation.\n * @param {import(\"./coordinate.js\").Coordinate|import(\"./pixel.js\").Pixel} coordinate The coordinate to transform.\n * @return {import(\"./coordinate.js\").Coordinate|import(\"./pixel.js\").Pixel} return coordinate so that operations can be\n *     chained together.\n */\nfunction apply(transform, coordinate) {\n  const x = coordinate[0];\n  const y = coordinate[1];\n  coordinate[0] = transform[0] * x + transform[2] * y + transform[4];\n  coordinate[1] = transform[1] * x + transform[3] * y + transform[5];\n  return coordinate;\n}\n\n/**\n * Invert the given transform.\n * @param {!Transform} target Transform to be set as the inverse of\n *     the source transform.\n * @param {!Transform} source The source transform to invert.\n * @return {!Transform} The inverted (target) transform.\n */\nfunction makeInverse(target, source) {\n  const det = determinant(source);\n  assert(det !== 0, 'Transformation matrix cannot be inverted');\n\n  const a = source[0];\n  const b = source[1];\n  const c = source[2];\n  const d = source[3];\n  const e = source[4];\n  const f = source[5];\n\n  target[0] = d / det;\n  target[1] = -b / det;\n  target[2] = -c / det;\n  target[3] = a / det;\n  target[4] = (c * f - d * e) / det;\n  target[5] = -(a * f - b * e) / det;\n\n  return target;\n}\n\n/**\n * Returns the determinant of the given matrix.\n * @param {!Transform} mat Matrix.\n * @return {number} Determinant.\n */\nfunction determinant(mat) {\n  return mat[0] * mat[3] - mat[1] * mat[2];\n}\n\n/**\n * Utilities for filling WebGL buffers\n * @module ol/render/webgl/bufferUtil\n */\n\nconst LINESTRING_ANGLE_COSINE_CUTOFF = 0.985;\n\n/** @type {Array<number>} */\nconst tmpArray_ = [];\n\n/**\n * An object holding positions both in an index and a vertex buffer.\n * @typedef {Object} BufferPositions\n * @property {number} vertexAttributesPosition Position in the vertex buffer\n * @property {number} instanceAttributesPosition Position in the vertex buffer\n * @property {number} indicesPosition Position in the index buffer\n */\nconst bufferPositions_ = {\n  vertexAttributesPosition: 0,\n  instanceAttributesPosition: 0,\n  indicesPosition: 0,\n};\n\n/**\n * Pushes a quad (two triangles) based on a point geometry\n * @param {Float32Array} instructions Array of render instructions for points.\n * @param {number} elementIndex Index from which render instructions will be read.\n * @param {Float32Array} instanceAttributesBuffer Buffer in the form of a typed array.\n * @param {number} customAttributesSize Amount of custom attributes for each element.\n * @param {BufferPositions} [bufferPositions] Buffer write positions; if not specified, positions will be set at 0.\n * @return {BufferPositions} New buffer positions where to write next\n * @property {number} vertexAttributesPosition New position in the vertex buffer where future writes should start.\n * @property {number} indicesPosition New position in the index buffer where future writes should start.\n * @private\n */\nfunction writePointFeatureToBuffers(\n  instructions,\n  elementIndex,\n  instanceAttributesBuffer,\n  customAttributesSize,\n  bufferPositions,\n) {\n  const x = instructions[elementIndex++];\n  const y = instructions[elementIndex++];\n\n  // read custom numerical attributes on the feature\n  const customAttrs = tmpArray_;\n  customAttrs.length = customAttributesSize;\n  for (let i = 0; i < customAttrs.length; i++) {\n    customAttrs[i] = instructions[elementIndex + i];\n  }\n\n  let instPos = bufferPositions\n    ? bufferPositions.instanceAttributesPosition\n    : 0;\n\n  instanceAttributesBuffer[instPos++] = x;\n  instanceAttributesBuffer[instPos++] = y;\n  if (customAttrs.length) {\n    instanceAttributesBuffer.set(customAttrs, instPos);\n    instPos += customAttrs.length;\n  }\n\n  bufferPositions_.instanceAttributesPosition = instPos;\n  return bufferPositions_;\n}\n\n/**\n * Pushes a single quad to form a line segment; also includes a computation for the join angles with previous and next\n * segment, in order to be able to offset the vertices correctly in the shader.\n * Join angles are between 0 and 2PI.\n * This also computes the length of the current segment and the sum of the join angle tangents in order\n * to store this information on each subsequent segment along the line. This is necessary to correctly render dashes\n * and symbols along the line.\n *\n *   pB (before)                          pA (after)\n *    X             negative             X\n *     \\             offset             /\n *      \\                              /\n *       \\   join              join   /\n *        \\ angle 0          angle 1 /\n *         \\←---                ←---/      positive\n *          \\   ←--          ←--   /        offset\n *           \\     ↑       ↓      /\n *            X────┴───────┴─────X\n *            p0                  p1\n *\n * @param {Float32Array} instructions Array of render instructions for lines.s\n * @param {number} segmentStartIndex Index of the segment start point from which render instructions will be read.\n * @param {number} segmentEndIndex Index of the segment end point from which render instructions will be read.\n * @param {number|null} beforeSegmentIndex Index of the point right before the segment (null if none, e.g this is a line start)\n * @param {number|null} afterSegmentIndex Index of the point right after the segment (null if none, e.g this is a line end)\n * @param {Array<number>} instanceAttributesArray Array containing instance attributes.\n * @param {Array<number>} customAttributes Array of custom attributes value\n * @param {import('../../transform.js').Transform} toWorldTransform Transform matrix used to obtain world coordinates from instructions\n * @param {number} currentLength Cumulated length of segments processed so far\n * @param {number} currentAngleTangentSum Cumulated tangents of the join angles processed so far\n * @return {{length: number, angle: number}} Cumulated length with the newly processed segment (in world units), new sum of the join angle tangents\n * @private\n */\nfunction writeLineSegmentToBuffers(\n  instructions,\n  segmentStartIndex,\n  segmentEndIndex,\n  beforeSegmentIndex,\n  afterSegmentIndex,\n  instanceAttributesArray,\n  customAttributes,\n  toWorldTransform,\n  currentLength,\n  currentAngleTangentSum,\n) {\n  // The segment is composed of two positions called P0[x0, y0] and P1[x1, y1]\n  // Depending on whether there are points before and after the segment, its final shape\n  // will be different\n  const p0 = [\n    instructions[segmentStartIndex],\n    instructions[segmentStartIndex + 1],\n  ];\n  const p1 = [instructions[segmentEndIndex], instructions[segmentEndIndex + 1]];\n\n  const m0 = instructions[segmentStartIndex + 2];\n  const m1 = instructions[segmentEndIndex + 2];\n\n  // to compute join angles we need to reproject coordinates back in world units\n  const p0world = apply(toWorldTransform, [...p0]);\n  const p1world = apply(toWorldTransform, [...p1]);\n\n  // a negative angle indicates a line cap\n  let angle0 = -1;\n  let angle1 = -1;\n  let newAngleTangentSum = currentAngleTangentSum;\n\n  const joinBefore = beforeSegmentIndex !== null;\n  const joinAfter = afterSegmentIndex !== null;\n\n  // add vertices and adapt offsets for P0 in case of join\n  if (joinBefore) {\n    // B for before\n    const pB = [\n      instructions[beforeSegmentIndex],\n      instructions[beforeSegmentIndex + 1],\n    ];\n    const pBworld = apply(toWorldTransform, [...pB]);\n    angle0 = angleBetween(p0world, p1world, pBworld);\n\n    // only add to the sum if the angle isn't too close to 0 or 2PI\n    if (Math.cos(angle0) <= LINESTRING_ANGLE_COSINE_CUTOFF) {\n      newAngleTangentSum += Math.tan((angle0 - Math.PI) / 2);\n    }\n  }\n  // adapt offsets for P1 in case of join; add to angle sum\n  if (joinAfter) {\n    // A for after\n    const pA = [\n      instructions[afterSegmentIndex],\n      instructions[afterSegmentIndex + 1],\n    ];\n    const pAworld = apply(toWorldTransform, [...pA]);\n    angle1 = angleBetween(p1world, p0world, pAworld);\n\n    // only add to the sum if the angle isn't too close to 0 or 2PI\n    if (Math.cos(angle1) <= LINESTRING_ANGLE_COSINE_CUTOFF) {\n      newAngleTangentSum += Math.tan((Math.PI - angle1) / 2);\n    }\n  }\n\n  const maxPrecision = Math.pow(2, 24);\n  const distanceLow = currentLength % maxPrecision;\n  const distanceHigh = Math.floor(currentLength / maxPrecision) * maxPrecision;\n\n  instanceAttributesArray.push(\n    p0[0],\n    p0[1],\n    m0,\n    p1[0],\n    p1[1],\n    m1,\n    angle0,\n    angle1,\n    distanceLow,\n    distanceHigh,\n    currentAngleTangentSum,\n  );\n  instanceAttributesArray.push(...customAttributes);\n\n  return {\n    length:\n      currentLength +\n      Math.sqrt(\n        (p1world[0] - p0world[0]) * (p1world[0] - p0world[0]) +\n          (p1world[1] - p0world[1]) * (p1world[1] - p0world[1]),\n      ),\n    angle: newAngleTangentSum,\n  };\n}\n\n/**\n * Pushes several triangles to form a polygon, including holes\n * @param {Float32Array} instructions Array of render instructions for lines.\n * @param {number} polygonStartIndex Index of the polygon start point from which render instructions will be read.\n * @param {Array<number>} vertexArray Array containing vertices.\n * @param {Array<number>} indexArray Array containing indices.\n * @param {number} customAttributesSize Amount of custom attributes for each element.\n * @return {number} Next polygon instructions index\n * @private\n */\nfunction writePolygonTrianglesToBuffers(\n  instructions,\n  polygonStartIndex,\n  vertexArray,\n  indexArray,\n  customAttributesSize,\n) {\n  const instructionsPerVertex = 2; // x, y\n  const attributesPerVertex = 2 + customAttributesSize;\n  let instructionsIndex = polygonStartIndex;\n  const customAttributes = instructions.slice(\n    instructionsIndex,\n    instructionsIndex + customAttributesSize,\n  );\n  instructionsIndex += customAttributesSize;\n  const ringsCount = instructions[instructionsIndex++];\n  let verticesCount = 0;\n  const holes = new Array(ringsCount - 1);\n  for (let i = 0; i < ringsCount; i++) {\n    verticesCount += instructions[instructionsIndex++];\n    if (i < ringsCount - 1) {\n      holes[i] = verticesCount;\n    }\n  }\n  const flatCoords = instructions.slice(\n    instructionsIndex,\n    instructionsIndex + verticesCount * instructionsPerVertex,\n  );\n\n  // pushing to vertices and indices!! this is where the magic happens\n  const result = earcut(flatCoords, holes, instructionsPerVertex);\n  for (let i = 0; i < result.length; i++) {\n    indexArray.push(result[i] + vertexArray.length / attributesPerVertex);\n  }\n  for (let i = 0; i < flatCoords.length; i += 2) {\n    vertexArray.push(flatCoords[i], flatCoords[i + 1], ...customAttributes);\n  }\n\n  return instructionsIndex + verticesCount * instructionsPerVertex;\n}\n\n/**\n * @module ol/render/webgl/constants\n */\n\n/**\n * @enum {string}\n */\nconst WebGLWorkerMessageType = {\n  GENERATE_POLYGON_BUFFERS: 'GENERATE_POLYGON_BUFFERS',\n  GENERATE_POINT_BUFFERS: 'GENERATE_POINT_BUFFERS',\n  GENERATE_LINE_STRING_BUFFERS: 'GENERATE_LINE_STRING_BUFFERS',\n};\n\n/**\n * @typedef {Object} WebGLWorkerGenerateBuffersMessage\n * This message will trigger the generation of a vertex and an index buffer based on the given render instructions.\n * When the buffers are generated, the worked will send a message of the same type to the main thread, with\n * the generated buffers in it.\n * Note that any addition properties present in the message *will* be sent back to the main thread.\n * @property {WebGLWorkerMessageType} type Message type\n * @property {ArrayBufferLike} renderInstructions render instructions raw binary buffer.\n * @property {number} [customAttributesSize] Amount of hit detection + custom attributes count in the render instructions.\n * @property {ArrayBuffer} [indicesBuffer] Indices array raw binary buffer (sent by the worker).\n * @property {ArrayBuffer} [vertexAttributesBuffer] Vertex attributes array raw binary buffer (sent by the worker).\n * @property {ArrayBuffer} [instanceAttributesBuffer] Instance attributes array raw binary buffer (sent by the worker).\n * @property {import(\"../../transform.js\").Transform} [renderInstructionsTransform] Transformation matrix used to project the instructions coordinates\n * @property {number} [id] Message id; will be used both in request and response as a means of identification\n */\n\n/**\n * @typedef {Object} TextOverlayWorkerMessage\n * These messages are used to prepare text rendering on the text overlay worker:\n * - BUILD_INSTRUCTIONS is used to transform render instructions into canvas text rendering batches\n * - RENDER is used to actually draw all current text rendering batches on the offscreen canvas; the render list is cleared after each render\n * @property {TextOverlayWorkerMessageType} type Message type\n * @property {ArrayBuffer} [polygonRenderInstructions] Polygon render instructions array buffer\n * @property {ArrayBuffer} [lineStringRenderInstructions] Line string render instructions array buffer\n * @property {ArrayBuffer} [pointRenderInstructions] Point render instructions array buffer\n * @property {ImageBitmap} [imageData] Rendered canvas\n * @property {import(\"../../Map.js\").FrameState} [frameState] Frame state of the rendered image\n * @property {string} [instructionsSetKey] Key corresponding to a generated text instructions set\n * @property {import('../../style/flat.js').FlatStyleLike} [style] Flat style\n * @property {Uint8Array} [labelsArray] Labels array\n * @property {Object<string, number>} [customAttributesSizes] Size of each custom attribute (by name)\n * @property {import(\"../../transform.js\").Transform} [renderInstructionsTransform] Transformation matrix used to project the instructions coordinates\n * @property {number} [resolution] View resolution, required for the BUILD_INSTRUCTIONS step\n * @property {number} [id] Message id; will be used both in request and response as a means of identification\n */\n\n/**\n * A worker that does cpu-heavy tasks related to webgl rendering.\n * @module ol/worker/webgl\n */\n\n/** @type {any} */\nconst worker = self;\n\nworker.onmessage = (/** @type {MessageEvent} */ event) => {\n  const received = event.data;\n  switch (received.type) {\n    case WebGLWorkerMessageType.GENERATE_POINT_BUFFERS: {\n      const baseIndicesAttrsCount = 2; // x, y\n      const baseInstructionsCount = 2;\n\n      const customAttrsCount = received.customAttributesSize;\n      const instructionsCount = baseInstructionsCount + customAttrsCount;\n      const renderInstructions = new Float32Array(received.renderInstructions);\n\n      const elementsCount = renderInstructions.length / instructionsCount;\n      const instanceAttributesCount =\n        elementsCount * (baseIndicesAttrsCount + customAttrsCount);\n      const indicesBuffer = Uint32Array.from([0, 1, 3, 1, 2, 3]);\n      const vertexAttributesBuffer = Float32Array.from([\n        -1, -1, 1, -1, 1, 1, -1, 1,\n      ]); // local position\n      const instanceAttributesBuffer = new Float32Array(\n        instanceAttributesCount,\n      );\n\n      let bufferPositions;\n      for (let i = 0; i < renderInstructions.length; i += instructionsCount) {\n        bufferPositions = writePointFeatureToBuffers(\n          renderInstructions,\n          i,\n          instanceAttributesBuffer,\n          customAttrsCount,\n          bufferPositions,\n        );\n      }\n\n      /** @type {import('../render/webgl/constants.js').WebGLWorkerGenerateBuffersMessage} */\n      const message = Object.assign(\n        {\n          indicesBuffer: indicesBuffer.buffer,\n          vertexAttributesBuffer: vertexAttributesBuffer.buffer,\n          instanceAttributesBuffer: instanceAttributesBuffer.buffer,\n          renderInstructions: renderInstructions.buffer,\n        },\n        received,\n      );\n\n      worker.postMessage(message, [\n        vertexAttributesBuffer.buffer,\n        instanceAttributesBuffer.buffer,\n        indicesBuffer.buffer,\n        renderInstructions.buffer,\n      ]);\n      break;\n    }\n    case WebGLWorkerMessageType.GENERATE_LINE_STRING_BUFFERS: {\n      /** @type {Array<number>} */\n      const instanceAttributes = [];\n\n      const customAttrsCount = received.customAttributesSize;\n      const instructionsPerVertex = 3;\n\n      const renderInstructions = new Float32Array(received.renderInstructions);\n      let currentInstructionsIndex = 0;\n\n      const transform = received.renderInstructionsTransform;\n      const invertTransform = create();\n      makeInverse(invertTransform, transform);\n\n      let verticesCount, customAttributes;\n      while (currentInstructionsIndex < renderInstructions.length) {\n        customAttributes = Array.from(\n          renderInstructions.slice(\n            currentInstructionsIndex,\n            currentInstructionsIndex + customAttrsCount,\n          ),\n        );\n        currentInstructionsIndex += customAttrsCount;\n        verticesCount = renderInstructions[currentInstructionsIndex++];\n\n        const firstInstructionsIndex = currentInstructionsIndex;\n        const lastInstructionsIndex =\n          currentInstructionsIndex +\n          (verticesCount - 1) * instructionsPerVertex;\n        const isLoop =\n          renderInstructions[firstInstructionsIndex] ===\n            renderInstructions[lastInstructionsIndex] &&\n          renderInstructions[firstInstructionsIndex + 1] ===\n            renderInstructions[lastInstructionsIndex + 1];\n\n        let currentLength = 0;\n        let currentAngleTangentSum = 0;\n\n        // last point is only a segment end, do not loop over it\n        for (let i = 0; i < verticesCount - 1; i++) {\n          let beforeIndex = null;\n          if (i > 0) {\n            beforeIndex =\n              currentInstructionsIndex + (i - 1) * instructionsPerVertex;\n          } else if (isLoop) {\n            beforeIndex = lastInstructionsIndex - instructionsPerVertex;\n          }\n          let afterIndex = null;\n          if (i < verticesCount - 2) {\n            afterIndex =\n              currentInstructionsIndex + (i + 2) * instructionsPerVertex;\n          } else if (isLoop) {\n            afterIndex = firstInstructionsIndex + instructionsPerVertex;\n          }\n          const measures = writeLineSegmentToBuffers(\n            renderInstructions,\n            currentInstructionsIndex + i * instructionsPerVertex,\n            currentInstructionsIndex + (i + 1) * instructionsPerVertex,\n            beforeIndex,\n            afterIndex,\n            instanceAttributes,\n            customAttributes,\n            invertTransform,\n            currentLength,\n            currentAngleTangentSum,\n          );\n          currentLength = measures.length;\n          currentAngleTangentSum = measures.angle;\n        }\n        currentInstructionsIndex += verticesCount * instructionsPerVertex;\n      }\n\n      const indicesBuffer = Uint32Array.from([0, 1, 3, 1, 2, 3]);\n      const vertexAttributesBuffer = Float32Array.from([\n        -1, -1, 1, -1, 1, 1, -1, 1,\n      ]); // local position\n      const instanceAttributesBuffer = Float32Array.from(instanceAttributes);\n\n      /** @type {import('../render/webgl/constants.js').WebGLWorkerGenerateBuffersMessage} */\n      const message = Object.assign(\n        {\n          indicesBuffer: indicesBuffer.buffer,\n          vertexAttributesBuffer: vertexAttributesBuffer.buffer,\n          instanceAttributesBuffer: instanceAttributesBuffer.buffer,\n          renderInstructions: renderInstructions.buffer,\n        },\n        received,\n      );\n\n      worker.postMessage(message, [\n        vertexAttributesBuffer.buffer,\n        instanceAttributesBuffer.buffer,\n        indicesBuffer.buffer,\n        renderInstructions.buffer,\n      ]);\n      break;\n    }\n    case WebGLWorkerMessageType.GENERATE_POLYGON_BUFFERS: {\n      /** @type {Array<number>} */\n      const vertices = [];\n      /** @type {Array<number>} */\n      const indices = [];\n\n      const customAttrsCount = received.customAttributesSize;\n      const renderInstructions = new Float32Array(received.renderInstructions);\n\n      let currentInstructionsIndex = 0;\n      while (currentInstructionsIndex < renderInstructions.length) {\n        currentInstructionsIndex = writePolygonTrianglesToBuffers(\n          renderInstructions,\n          currentInstructionsIndex,\n          vertices,\n          indices,\n          customAttrsCount,\n        );\n      }\n\n      const indicesBuffer = Uint32Array.from(indices);\n      const vertexAttributesBuffer = Float32Array.from(vertices);\n      const instanceAttributesBuffer = Float32Array.from([]); // TODO\n\n      /** @type {import('../render/webgl/constants.js').WebGLWorkerGenerateBuffersMessage} */\n      const message = Object.assign(\n        {\n          indicesBuffer: indicesBuffer.buffer,\n          vertexAttributesBuffer: vertexAttributesBuffer.buffer,\n          instanceAttributesBuffer: instanceAttributesBuffer.buffer,\n          renderInstructions: renderInstructions.buffer,\n        },\n        received,\n      );\n\n      worker.postMessage(message, [\n        vertexAttributesBuffer.buffer,\n        instanceAttributesBuffer.buffer,\n        indicesBuffer.buffer,\n        renderInstructions.buffer,\n      ]);\n      break;\n    }\n    // pass\n  }\n};";
	return new Worker(typeof Blob === "undefined" ? "data:application/javascript;base64," + Buffer.from(source, "binary").toString("base64") : URL.createObjectURL(new Blob([source], { type: "application/javascript" })));
}
//#endregion
//#region src/ol/render/webgl/constants.js
/**
* @module ol/render/webgl/constants
*/
/**
* @enum {string}
*/
var WebGLWorkerMessageType = {
	GENERATE_POLYGON_BUFFERS: "GENERATE_POLYGON_BUFFERS",
	GENERATE_POINT_BUFFERS: "GENERATE_POINT_BUFFERS",
	GENERATE_LINE_STRING_BUFFERS: "GENERATE_LINE_STRING_BUFFERS"
};
/**
* @enum {string}
*/
var TextOverlayWorkerMessageType = {
	BUILD_INSTRUCTIONS: "BUILD_INSTRUCTIONS",
	DISPOSE_INSTRUCTIONS: "DISPOSE_INSTRUCTIONS",
	RENDER: "RENDER"
};
/**
* @typedef {Object} WebGLWorkerGenerateBuffersMessage
* This message will trigger the generation of a vertex and an index buffer based on the given render instructions.
* When the buffers are generated, the worked will send a message of the same type to the main thread, with
* the generated buffers in it.
* Note that any addition properties present in the message *will* be sent back to the main thread.
* @property {WebGLWorkerMessageType} type Message type
* @property {ArrayBufferLike} renderInstructions render instructions raw binary buffer.
* @property {number} [customAttributesSize] Amount of hit detection + custom attributes count in the render instructions.
* @property {ArrayBuffer} [indicesBuffer] Indices array raw binary buffer (sent by the worker).
* @property {ArrayBuffer} [vertexAttributesBuffer] Vertex attributes array raw binary buffer (sent by the worker).
* @property {ArrayBuffer} [instanceAttributesBuffer] Instance attributes array raw binary buffer (sent by the worker).
* @property {import("../../transform.js").Transform} [renderInstructionsTransform] Transformation matrix used to project the instructions coordinates
* @property {number} [id] Message id; will be used both in request and response as a means of identification
*/
/**
* @typedef {Object} TextOverlayWorkerMessage
* These messages are used to prepare text rendering on the text overlay worker:
* - BUILD_INSTRUCTIONS is used to transform render instructions into canvas text rendering batches
* - RENDER is used to actually draw all current text rendering batches on the offscreen canvas; the render list is cleared after each render
* @property {TextOverlayWorkerMessageType} type Message type
* @property {ArrayBuffer} [polygonRenderInstructions] Polygon render instructions array buffer
* @property {ArrayBuffer} [lineStringRenderInstructions] Line string render instructions array buffer
* @property {ArrayBuffer} [pointRenderInstructions] Point render instructions array buffer
* @property {ImageBitmap} [imageData] Rendered canvas
* @property {import("../../Map.js").FrameState} [frameState] Frame state of the rendered image
* @property {string} [instructionsSetKey] Key corresponding to a generated text instructions set
* @property {import('../../style/flat.js').FlatStyleLike} [style] Flat style
* @property {Uint8Array} [labelsArray] Labels array
* @property {Object<string, number>} [customAttributesSizes] Size of each custom attribute (by name)
* @property {import("../../transform.js").Transform} [renderInstructionsTransform] Transformation matrix used to project the instructions coordinates
* @property {number} [resolution] View resolution, required for the BUILD_INSTRUCTIONS step
* @property {number} [id] Message id; will be used both in request and response as a means of identification
*/
//#endregion
//#region src/ol/render/webgl/encodeUtil.js
/**
* Utilities for encoding/decoding values to be used in shaders
* @module ol/render/webgl/encodeUtil
*/
/**
* Generates a color array based on a numerical id, and pack it just like the `packColor` function of 'ol/render/webgl/compileUtil.js'.
* Note: the range for each component is 0 to 1 with 256 steps
* @param {number} id Id
* @param {Array<number>} [array] Reusable array
* @return {Array<number>} Packed color array with two components
*/
function colorEncodeIdAndPack(id, array) {
	array = array || [];
	const radix = 256;
	const divide = radix - 1;
	const r = Math.floor(id / radix / radix / radix) / divide;
	const g = Math.floor(id / radix / radix) % radix / divide;
	const b = Math.floor(id / radix) % radix / divide;
	const a = id % radix / divide;
	array[0] = r * 256 * 255 + g * 255;
	array[1] = b * 256 * 255 + a * 255;
	return array;
}
/**
* Reads an id from a color-encoded array
* Note: the expected range for each component is 0 to 1 with 256 steps.
* @param {Array<number>} color Color array containing the encoded id; color components are in the range 0 to 1
* @return {number} Decoded id
*/
function colorDecodeId(color) {
	let id = 0;
	const radix = 256;
	const mult = radix - 1;
	id += Math.round(color[0] * radix * radix * radix * mult);
	id += Math.round(color[1] * radix * radix * mult);
	id += Math.round(color[2] * radix * mult);
	id += Math.round(color[3] * mult);
	return id;
}
//#endregion
//#region src/ol/render/webgl/renderinstructions.js
/**
* @module ol/render/webgl/renderinstructions
*/
/**
* @param {Float32Array} renderInstructions Render instructions
* @param {import('../../webgl/LabelsArray.js').default} labels Typed array of the values of string attributes, encoded as UTF-8 and appended next to each other
* @param {import('./VectorStyleRenderer.js').AttributeDefinitions} customAttributes Custom attributes
* @param {import("./MixedGeometryBatch.js").GeometryBatchItem} batchEntry Batch item
* @param {number} currentIndex Current index
* @return {number} The amount of values pushed
*/
function pushCustomAttributesInRenderInstructions(renderInstructions, labels, customAttributes, batchEntry, currentIndex) {
	let shift = 0;
	for (const key in customAttributes) {
		const attr = customAttributes[key];
		const value = attr.callback.call(batchEntry, batchEntry.feature);
		if (typeof value === "string") {
			const [labelPosition, labelLength] = labels.push(value);
			renderInstructions[currentIndex + shift++] = getStringNumberEquivalent(value);
			renderInstructions[currentIndex + shift++] = labelPosition;
			renderInstructions[currentIndex + shift++] = labelLength;
			continue;
		}
		const arrayValue = Array.isArray(value) ? value : void 0;
		let first = arrayValue ? arrayValue[0] : value;
		if (first === -9999999) console.warn("The \"has\" operator might return false positives.");
		if (first === void 0) first = UNDEFINED_PROP_VALUE;
		else if (first === null) first = 0;
		renderInstructions[currentIndex + shift++] = first;
		if (!attr.size || attr.size === 1) continue;
		renderInstructions[currentIndex + shift++] = arrayValue?.[1] ?? -9999999;
		if (attr.size < 3) continue;
		renderInstructions[currentIndex + shift++] = arrayValue?.[2] ?? -9999999;
		if (attr.size < 4) continue;
		renderInstructions[currentIndex + shift++] = arrayValue?.[3] ?? -9999999;
	}
	return shift;
}
/**
* @param {import('./VectorStyleRenderer.js').AttributeDefinitions} customAttributes Custom attributes
* @return {number} Cumulated size of all attributes
*/
function getCustomAttributesSize(customAttributes) {
	return Object.keys(customAttributes).reduce((prev, curr) => prev + (customAttributes[curr].size || 1), 0);
}
/**
* Render instructions for lines are structured like so:
* [ x0, y0, customAttr0, ... , xN, yN, customAttrN ]
* @param {import("./MixedGeometryBatch.js").PointGeometryBatch} batch Point geometry batch
* @param {Float32Array} renderInstructions Render instructions
* @param {import('../../webgl/LabelsArray.js').default} labels Typed array of the values of string attributes, encoded as UTF-8 and appended next to each other
* @param {import('./VectorStyleRenderer.js').AttributeDefinitions} customAttributes Custom attributes
* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
* @return {Float32Array} Generated render instructions
*/
function generatePointRenderInstructions(batch, renderInstructions, labels, customAttributes, transform) {
	const totalInstructionsCount = (2 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount;
	if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) renderInstructions = new Float32Array(totalInstructionsCount);
	const tmpCoords = [];
	let renderIndex = 0;
	for (const featureUid in batch.entries) {
		const batchEntry = batch.entries[featureUid];
		for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
			tmpCoords[0] = batchEntry.flatCoordss[i][0];
			tmpCoords[1] = batchEntry.flatCoordss[i][1];
			apply(transform, tmpCoords);
			renderInstructions[renderIndex++] = tmpCoords[0];
			renderInstructions[renderIndex++] = tmpCoords[1];
			renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, labels, customAttributes, batchEntry, renderIndex);
		}
	}
	return renderInstructions;
}
/**
* Render instructions for lines are structured like so:
* [ customAttr0, ... , customAttrN, numberOfVertices0, x0, y0, ... , xN, yN, numberOfVertices1, ... ]
* @param {import("./MixedGeometryBatch.js").LineStringGeometryBatch} batch Line String geometry batch
* @param {Float32Array} renderInstructions Render instructions
* @param {import('../../webgl/LabelsArray.js').default} labels Typed array of the values of string attributes, encoded as UTF-8 and appended next to each other
* @param {import('./VectorStyleRenderer.js').AttributeDefinitions} customAttributes Custom attributes
* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
* @return {Float32Array} Generated render instructions
*/
function generateLineStringRenderInstructions(batch, renderInstructions, labels, customAttributes, transform) {
	const totalInstructionsCount = 3 * batch.verticesCount + (1 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount;
	if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) renderInstructions = new Float32Array(totalInstructionsCount);
	/** @type {Array<number>} */
	const flatCoords = [];
	let renderIndex = 0;
	for (const featureUid in batch.entries) {
		const batchEntry = batch.entries[featureUid];
		for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
			flatCoords.length = batchEntry.flatCoordss[i].length;
			transform2D(batchEntry.flatCoordss[i], 0, flatCoords.length, 3, transform, flatCoords, 3);
			renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, labels, customAttributes, batchEntry, renderIndex);
			renderInstructions[renderIndex++] = flatCoords.length / 3;
			for (let j = 0, jj = flatCoords.length; j < jj; j += 3) {
				renderInstructions[renderIndex++] = flatCoords[j];
				renderInstructions[renderIndex++] = flatCoords[j + 1];
				renderInstructions[renderIndex++] = flatCoords[j + 2];
			}
		}
	}
	return renderInstructions;
}
/**
* Render instructions for polygons are structured like so:
* [ customAttr0, ..., customAttrN, numberOfRings, numberOfVerticesInRing0, ..., numberOfVerticesInRingN, x0, y0, ..., xN, yN, numberOfRings,... ]
* @param {import("./MixedGeometryBatch.js").PolygonGeometryBatch} batch Polygon geometry batch
* @param {Float32Array} renderInstructions Render instructions
* @param {import('../../webgl/LabelsArray.js').default} labels Typed array of the values of string attributes, encoded as UTF-8 and appended next to each other
* @param {import('./VectorStyleRenderer.js').AttributeDefinitions} customAttributes Custom attributes
* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
* @return {Float32Array} Generated render instructions
*/
function generatePolygonRenderInstructions(batch, renderInstructions, labels, customAttributes, transform) {
	const totalInstructionsCount = 2 * batch.verticesCount + (1 + getCustomAttributesSize(customAttributes)) * batch.geometriesCount + batch.ringsCount;
	if (!renderInstructions || renderInstructions.length !== totalInstructionsCount) renderInstructions = new Float32Array(totalInstructionsCount);
	/** @type {Array<number>} */
	const flatCoords = [];
	let renderIndex = 0;
	for (const featureUid in batch.entries) {
		const batchEntry = batch.entries[featureUid];
		for (let i = 0, ii = batchEntry.flatCoordss.length; i < ii; i++) {
			const ringsVerticesCounts = batchEntry.ringsVerticesCounts?.[i];
			if (!ringsVerticesCounts) continue;
			flatCoords.length = batchEntry.flatCoordss[i].length;
			transform2D(batchEntry.flatCoordss[i], 0, flatCoords.length, 2, transform, flatCoords);
			renderIndex += pushCustomAttributesInRenderInstructions(renderInstructions, labels, customAttributes, batchEntry, renderIndex);
			renderInstructions[renderIndex++] = ringsVerticesCounts.length;
			for (let j = 0, jj = ringsVerticesCounts.length; j < jj; j++) renderInstructions[renderIndex++] = ringsVerticesCounts[j];
			for (let j = 0, jj = flatCoords.length; j < jj; j += 2) {
				renderInstructions[renderIndex++] = flatCoords[j];
				renderInstructions[renderIndex++] = flatCoords[j + 1];
			}
		}
	}
	return renderInstructions;
}
//#endregion
//#region src/ol/render/webgl/serialize.js
/**
* This will serialize a frame state into a cloneable object.
* Note: the user projection is written as code in the frame state because it won't be available in the worker.
* Caveat: this won't work for custom/non-standard projections!
* @param {import("../../Map.js").FrameState} frameState Frame state
* @return {Object} Serialized as object
*/
function serializeFrameState(frameState) {
	const viewState = frameState.viewState;
	return {
		viewState: {
			...viewState,
			projection: viewState.projection.getCode()
		},
		viewHints: frameState.viewHints,
		pixelRatio: frameState.pixelRatio,
		size: frameState.size,
		extent: frameState.extent,
		coordinateToPixelTransform: frameState.coordinateToPixelTransform,
		pixelToCoordinateTransform: frameState.pixelToCoordinateTransform,
		layerStatesArray: frameState.layerStatesArray.map((l) => ({
			zIndex: l.zIndex,
			visible: l.visible,
			extent: l.extent,
			maxResolution: l.maxResolution,
			minResolution: l.minResolution,
			managed: l.managed,
			opacity: l.opacity
		})),
		time: frameState.time,
		layerIndex: frameState.layerIndex
	};
}
//#endregion
//#region src/ol/render/webgl/style.js
/**
* Utilities for parsing flat styles for WebGL renderers
* @module ol/render/webgl/style
*/
/**
* @param {import("../../style/flat.js").FlatStyle} style Style.
* @param {string} key Property key.
* @return {*} Style property value.
*/
function styleProp(style, key) {
	return style[key];
}
/**
* @param {import("../../expr/gpu.js").CompilationContext} context Compilation context.
* @param {import("../../expr/expression.js").EncodedExpression|undefined} value Expression value.
* @param {import("../../expr/expression.js").ValueType} expectedType Expected type.
* @param {import("../../expr/expression.js").ParsingContext} [parsingContext] Parsing context.
* @return {string} GLSL expression string.
*/
function styleExpressionToGlsl(context, value, expectedType, parsingContext) {
	return expressionToGlsl(context, value, expectedType, parsingContext);
}
/**
* see https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
* @param {Object|string} input The hash input, either an object or string
* @return {string} Hash (if the object cannot be serialized, it is based on `getUid`)
*/
function computeHash(input) {
	return (JSON.stringify(input).split("").reduce((prev, curr) => (prev << 5) - prev + curr.charCodeAt(0), 0) >>> 0).toString();
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader builder
* @param {import("../../expr/gpu.js").CompilationContext} vertContext Vertex shader compilation context
* @param {'shape-'|'circle-'|'icon-'} prefix Properties prefix
*/
function parseCommonSymbolProperties(style, builder, vertContext, prefix) {
	if (`${prefix}radius` in style && prefix !== "icon-") {
		let radius = styleExpressionToGlsl(vertContext, style[`${prefix}radius`], NumberType);
		if (`${prefix}radius2` in style) {
			const radius2 = styleExpressionToGlsl(vertContext, styleProp(style, `${prefix}radius2`), NumberType);
			radius = `max(${radius}, ${radius2})`;
		}
		if (`${prefix}stroke-width` in style) radius = `(${radius} + ${styleExpressionToGlsl(vertContext, style[`${prefix}stroke-width`], NumberType)} * 0.5)`;
		builder.setSymbolSizeExpression(`vec2(${radius} * 2. + 0.5)`);
	}
	if (`${prefix}scale` in style) {
		const scale = styleExpressionToGlsl(vertContext, style[`${prefix}scale`], SizeType);
		builder.setSymbolSizeExpression(`${builder.getSymbolSizeExpression()} * ${scale}`);
	}
	if (`${prefix}displacement` in style) builder.setSymbolOffsetExpression(styleExpressionToGlsl(vertContext, style[`${prefix}displacement`], NumberArrayType));
	if (`${prefix}rotation` in style) builder.setSymbolRotationExpression(styleExpressionToGlsl(vertContext, style[`${prefix}rotation`], NumberType));
	if (`${prefix}rotate-with-view` in style) builder.setSymbolRotateWithView(!!style[`${prefix}rotate-with-view`]);
}
/**
* @param {string} distanceField The distance field expression
* @param {string|null} fillColor The fill color expression; null if no fill
* @param {string|null} strokeColor The stroke color expression; null if no stroke
* @param {string|null} strokeWidth The stroke width expression; null if no stroke
* @param {string|null} opacity The opacity expression; null if no stroke
* @return {string} The final color expression, based on the distance field and given params
*/
function getColorFromDistanceField(distanceField, fillColor, strokeColor, strokeWidth, opacity) {
	let color = "vec4(0.)";
	if (fillColor !== null) color = fillColor;
	if (strokeColor !== null && strokeWidth !== null) {
		const strokeFillRatio = `smoothstep(-${strokeWidth} + 0.63, -${strokeWidth} - 0.58, ${distanceField})`;
		color = `mix(${strokeColor}, ${color}, ${strokeFillRatio})`;
	}
	const shapeOpacity = `(1.0 - smoothstep(-0.63, 0.58, ${distanceField}))`;
	let result = `${color} * vec4(1.0, 1.0, 1.0, ${shapeOpacity})`;
	if (opacity !== null) result = `${result} * vec4(1.0, 1.0, 1.0, ${opacity})`;
	return result;
}
/**
* This will parse an image property provided by `<prefix>-src`
* The image size expression in GLSL will be returned
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {'icon-'|'fill-pattern-'|'stroke-pattern-'} prefix Property prefix
* @param {string} textureId A identifier that will be used in the generated uniforms: `sample2d u_texture<id>` and `vec2 u_texture<id>_size`
* @return {string} The image size expression
*/
function parseImageProperties(style, builder, uniforms, prefix, textureId) {
	const image = new Image();
	image.crossOrigin = styleProp(style, `${prefix}cross-origin`) === void 0 ? "anonymous" : styleProp(style, `${prefix}cross-origin`);
	assert(typeof styleProp(style, `${prefix}src`) === "string", `WebGL layers do not support expressions for the ${prefix}src style property`);
	image.src = styleProp(style, `${prefix}src`);
	uniforms[`u_texture${textureId}_size`] = () => {
		return image.complete ? [image.width, image.height] : [0, 0];
	};
	builder.addUniform(`u_texture${textureId}_size`, "vec2");
	const size = `u_texture${textureId}_size`;
	uniforms[`u_texture${textureId}`] = image;
	builder.addUniform(`u_texture${textureId}`, "sampler2D");
	return size;
}
/**
* This will parse an image's offset properties provided by `<prefix>-offset`, `<prefix>-offset-origin` and `<prefix>-size`
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {'icon-'|'fill-pattern-'|'stroke-pattern-'} prefix Property prefix
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context (vertex or fragment)
* @param {string} imageSize Pixel size of the full image as a GLSL expression
* @param {string} sampleSize Pixel size of the sample in the image as a GLSL expression
* @return {string} The offset expression
*/
function parseImageOffsetProperties(style, prefix, context, imageSize, sampleSize) {
	let offsetExpression = styleExpressionToGlsl(context, style[`${prefix}offset`], SizeType);
	if (`${prefix}offset-origin` in style) switch (style[`${prefix}offset-origin`]) {
		case "top-right":
			offsetExpression = `vec2(${imageSize}.x, 0.) + ${sampleSize} * vec2(-1., 0.) + ${offsetExpression} * vec2(-1., 1.)`;
			break;
		case "bottom-left":
			offsetExpression = `vec2(0., ${imageSize}.y) + ${sampleSize} * vec2(0., -1.) + ${offsetExpression} * vec2(1., -1.)`;
			break;
		case "bottom-right":
			offsetExpression = `${imageSize} - ${sampleSize} - ${offsetExpression}`;
			break;
		default:
	}
	return offsetExpression;
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseCircleProperties(style, builder, uniforms, context) {
	context.functions["circleDistanceField"] = `float circleDistanceField(vec2 point, float radius) {
  return length(point) - radius;
}`;
	parseCommonSymbolProperties(style, builder, context, "circle-");
	let opacity = null;
	if ("circle-opacity" in style) opacity = styleExpressionToGlsl(context, style["circle-opacity"], NumberType);
	let currentPoint = "coordsPx";
	if ("circle-scale" in style) currentPoint = `coordsPx / ${styleExpressionToGlsl(context, style["circle-scale"], SizeType)}`;
	let fillColor = null;
	if ("circle-fill-color" in style) fillColor = styleExpressionToGlsl(context, style["circle-fill-color"], ColorType);
	let strokeColor = null;
	if ("circle-stroke-color" in style) strokeColor = styleExpressionToGlsl(context, style["circle-stroke-color"], ColorType);
	let radius = styleExpressionToGlsl(context, style["circle-radius"], NumberType);
	let strokeWidth = null;
	if ("circle-stroke-width" in style) {
		strokeWidth = styleExpressionToGlsl(context, style["circle-stroke-width"], NumberType);
		radius = `(${radius} + ${strokeWidth} * 0.5)`;
	}
	const colorExpression = getColorFromDistanceField(`circleDistanceField(${currentPoint}, ${radius})`, fillColor, strokeColor, strokeWidth, opacity);
	builder.setSymbolColorExpression(colorExpression);
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseShapeProperties(style, builder, uniforms, context) {
	context.functions["round"] = `float round(float v) {
  return sign(v) * floor(abs(v) + 0.5);
}`;
	context.functions["starDistanceField"] = `float starDistanceField(vec2 point, float numPoints, float radius, float radius2, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round(beta / alpha) * alpha; // angle in sector
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  vec2 tipToPoint = inSector + vec2(-radius, 0.);
  vec2 edgeNormal = vec2(radius2 * sin(alpha * 0.5), -radius2 * cos(alpha * 0.5) + radius);
  return dot(normalize(edgeNormal), tipToPoint);
}`;
	context.functions["regularDistanceField"] = `float regularDistanceField(vec2 point, float numPoints, float radius, float angle) {
  float startAngle = -PI * 0.5 + angle; // tip starts upwards and rotates clockwise with angle
  float c = cos(startAngle);
  float s = sin(startAngle);
  vec2 pointRotated = vec2(c * point.x - s * point.y, s * point.x + c * point.y);
  float alpha = TWO_PI / numPoints; // the angle of one sector
  float radiusIn = radius * cos(PI / numPoints);
  float beta = atan(pointRotated.y, pointRotated.x);
  float gamma = round((beta - alpha * 0.5) / alpha) * alpha + alpha * 0.5; // angle in sector from mid
  c = cos(-gamma);
  s = sin(-gamma);
  vec2 inSector = vec2(c * pointRotated.x - s * pointRotated.y, abs(s * pointRotated.x + c * pointRotated.y));
  return inSector.x - radiusIn;
}`;
	parseCommonSymbolProperties(style, builder, context, "shape-");
	let opacity = null;
	if ("shape-opacity" in style) opacity = styleExpressionToGlsl(context, style["shape-opacity"], NumberType);
	let currentPoint = "coordsPx";
	if ("shape-scale" in style) currentPoint = `coordsPx / ${styleExpressionToGlsl(context, style["shape-scale"], SizeType)}`;
	let fillColor = null;
	if ("shape-fill-color" in style) fillColor = styleExpressionToGlsl(context, style["shape-fill-color"], ColorType);
	let strokeColor = null;
	if ("shape-stroke-color" in style) strokeColor = styleExpressionToGlsl(context, style["shape-stroke-color"], ColorType);
	let strokeWidth = null;
	if ("shape-stroke-width" in style) strokeWidth = styleExpressionToGlsl(context, style["shape-stroke-width"], NumberType);
	const numPoints = styleExpressionToGlsl(context, style["shape-points"], NumberType);
	let angle = "0.";
	if ("shape-angle" in style) angle = styleExpressionToGlsl(context, style["shape-angle"], NumberType);
	let shapeField;
	let radius = styleExpressionToGlsl(context, style["shape-radius"], NumberType);
	if (strokeWidth !== null) radius = `${radius} + ${strokeWidth} * 0.5`;
	if ("shape-radius2" in style) {
		let radius2 = styleExpressionToGlsl(context, style["shape-radius2"], NumberType);
		if (strokeWidth !== null) radius2 = `${radius2} + ${strokeWidth} * 0.5`;
		shapeField = `starDistanceField(${currentPoint}, ${numPoints}, ${radius}, ${radius2}, ${angle})`;
	} else shapeField = `regularDistanceField(${currentPoint}, ${numPoints}, ${radius}, ${angle})`;
	const colorExpression = getColorFromDistanceField(shapeField, fillColor, strokeColor, strokeWidth, opacity);
	builder.setSymbolColorExpression(colorExpression);
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseIconProperties(style, builder, uniforms, context) {
	let color = "vec4(1.0)";
	if ("icon-color" in style) color = styleExpressionToGlsl(context, style["icon-color"], ColorType);
	if ("icon-opacity" in style) color = `${color} * vec4(1.0, 1.0, 1.0, ${styleExpressionToGlsl(context, style["icon-opacity"], NumberType)})`;
	const textureId = computeHash(style["icon-src"]);
	const sizeExpression = parseImageProperties(style, builder, uniforms, "icon-", textureId);
	builder.setSymbolColorExpression(`${color} * texture2D(u_texture${textureId}, v_texCoord)`).setSymbolSizeExpression(sizeExpression);
	if ("icon-width" in style && "icon-height" in style) builder.setSymbolSizeExpression(`vec2(${styleExpressionToGlsl(context, style["icon-width"], NumberType)}, ${styleExpressionToGlsl(context, style["icon-height"], NumberType)})`);
	if ("icon-offset" in style && "icon-size" in style) {
		const sampleSize = styleExpressionToGlsl(context, style["icon-size"], NumberArrayType);
		const fullsize = builder.getSymbolSizeExpression();
		builder.setSymbolSizeExpression(sampleSize);
		const offset = parseImageOffsetProperties(style, "icon-", context, "v_quadSizePx", sampleSize);
		builder.setTextureCoordinateExpression(`(vec4((${offset}).xyxy) + vec4(0., 0., ${sampleSize})) / (${fullsize}).xyxy`);
	}
	parseCommonSymbolProperties(style, builder, context, "icon-");
	if ("icon-anchor" in style) {
		const anchor = styleExpressionToGlsl(context, style["icon-anchor"], NumberArrayType);
		let scale = `1.0`;
		if (`icon-scale` in style) scale = styleExpressionToGlsl(context, style[`icon-scale`], SizeType);
		let shiftPx;
		if (style["icon-anchor-x-units"] === "pixels" && style["icon-anchor-y-units"] === "pixels") shiftPx = `${anchor} * ${scale}`;
		else if (style["icon-anchor-x-units"] === "pixels") shiftPx = `${anchor} * vec2(vec2(${scale}).x, v_quadSizePx.y)`;
		else if (style["icon-anchor-y-units"] === "pixels") shiftPx = `${anchor} * vec2(v_quadSizePx.x, vec2(${scale}).x)`;
		else shiftPx = `${anchor} * v_quadSizePx`;
		let offsetPx = `v_quadSizePx * vec2(0.5, -0.5) + ${shiftPx} * vec2(-1., 1.)`;
		if ("icon-anchor-origin" in style) switch (style["icon-anchor-origin"]) {
			case "top-right":
				offsetPx = `v_quadSizePx * -0.5 + ${shiftPx}`;
				break;
			case "bottom-left":
				offsetPx = `v_quadSizePx * 0.5 - ${shiftPx}`;
				break;
			case "bottom-right":
				offsetPx = `v_quadSizePx * vec2(-0.5, 0.5) + ${shiftPx} * vec2(1., -1.)`;
				break;
			default:
		}
		builder.setSymbolOffsetExpression(`${builder.getSymbolOffsetExpression()} + ${offsetPx}`);
	}
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader Builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseStrokeProperties(style, builder, uniforms, context) {
	if ("stroke-color" in style) builder.setStrokeColorExpression(styleExpressionToGlsl(context, style["stroke-color"], ColorType));
	if ("stroke-pattern-src" in style) {
		const textureId = computeHash(style["stroke-pattern-src"]);
		const sizeExpression = parseImageProperties(style, builder, uniforms, "stroke-pattern-", textureId);
		let sampleSizeExpression = sizeExpression;
		let offsetExpression = "vec2(0.)";
		if ("stroke-pattern-offset" in style && "stroke-pattern-size" in style) {
			sampleSizeExpression = styleExpressionToGlsl(context, style[`stroke-pattern-size`], NumberArrayType);
			offsetExpression = parseImageOffsetProperties(style, "stroke-pattern-", context, sizeExpression, sampleSizeExpression);
		}
		let spacingExpression = "0.";
		if ("stroke-pattern-spacing" in style) spacingExpression = styleExpressionToGlsl(context, style["stroke-pattern-spacing"], NumberType);
		let startOffsetExpression = "0.";
		if ("stroke-pattern-start-offset" in style) startOffsetExpression = styleExpressionToGlsl(context, style["stroke-pattern-start-offset"], NumberType);
		context.functions["sampleStrokePattern"] = `vec4 sampleStrokePattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, float spacingPx, float startOffsetPx, float currentLengthPx, float currentRadiusRatio, float lineWidth) {
  float currentLengthScaled = (currentLengthPx - startOffsetPx) * sampleSize.y / lineWidth;
  float spacingScaled = spacingPx * sampleSize.y / lineWidth;
  float uCoordPx = mod(currentLengthScaled, (sampleSize.x + spacingScaled));
  float isInsideOfPattern = step(uCoordPx, sampleSize.x);
  float vCoordPx = (-currentRadiusRatio * 0.5 + 0.5) * sampleSize.y;
  // make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  uCoordPx = clamp(uCoordPx, 0.5, sampleSize.x - 0.5);
  vCoordPx = clamp(vCoordPx, 0.5, sampleSize.y - 0.5);
  vec2 texCoord = (vec2(uCoordPx, vCoordPx) + textureOffset) / textureSize;
  return texture2D(texture, texCoord) * vec4(1.0, 1.0, 1.0, isInsideOfPattern);
}`;
		const textureName = `u_texture${textureId}`;
		let tintExpression = "1.";
		if ("stroke-color" in style) tintExpression = builder.getStrokeColorExpression();
		builder.setStrokeColorExpression(`${tintExpression} * sampleStrokePattern(${textureName}, ${sizeExpression}, ${offsetExpression}, ${sampleSizeExpression}, ${spacingExpression}, ${startOffsetExpression}, currentLengthPx, currentRadiusRatio, v_width)`);
		context.functions["computeStrokePatternLength"] = `float computeStrokePatternLength(vec2 sampleSize, float spacingPx, float lineWidth) {
  float patternLengthPx = sampleSize.x / sampleSize.y * lineWidth;
  return patternLengthPx + spacingPx;
}`;
		builder.setStrokePatternLengthExpression(`computeStrokePatternLength(${sampleSizeExpression}, ${spacingExpression}, v_width)`);
	}
	if ("stroke-width" in style) builder.setStrokeWidthExpression(styleExpressionToGlsl(context, style["stroke-width"], NumberType));
	if ("stroke-offset" in style) builder.setStrokeOffsetExpression(styleExpressionToGlsl(context, style["stroke-offset"], NumberType));
	if ("stroke-line-cap" in style) builder.setStrokeCapExpression(styleExpressionToGlsl(context, style["stroke-line-cap"], StringType));
	if ("stroke-line-join" in style) builder.setStrokeJoinExpression(styleExpressionToGlsl(context, style["stroke-line-join"], StringType));
	if ("stroke-miter-limit" in style) builder.setStrokeMiterLimitExpression(styleExpressionToGlsl(context, style["stroke-miter-limit"], NumberType));
	if ("stroke-line-dash" in style) {
		context.functions["getSingleDashDistance"] = `float getSingleDashDistance(float distance, float radius, float dashOffset, float dashLength, float dashLengthTotal, float capType, float lineWidth) {
  float localDistance = mod(distance, dashLengthTotal);
  float distanceSegment = abs(localDistance - dashOffset - dashLength * 0.5) - dashLength * 0.5;
  distanceSegment = min(distanceSegment, dashLengthTotal - localDistance);
  if (capType == ${stringToGlsl("square")}) {
    distanceSegment -= lineWidth * 0.5;
  } else if (capType == ${stringToGlsl("round")}) {
    distanceSegment = min(distanceSegment, sqrt(distanceSegment * distanceSegment + radius * radius) - lineWidth * 0.5);
  }
  return distanceSegment;
}`;
		let dashPattern = style["stroke-line-dash"].map((v) => styleExpressionToGlsl(context, v, NumberType));
		if (dashPattern.length % 2 === 1) dashPattern = [...dashPattern, ...dashPattern];
		let offsetExpression = "0.";
		if ("stroke-line-dash-offset" in style) offsetExpression = styleExpressionToGlsl(context, style["stroke-line-dash-offset"], NumberType);
		const dashFunctionName = `dashDistanceField_${computeHash(style["stroke-line-dash"])}`;
		const dashLengthsParamsDef = dashPattern.map((v, i) => `float dashLength${i}`).join(", ");
		const totalLengthDef = dashPattern.map((v, i) => `dashLength${i}`).join(" + ");
		let currentDashOffset = "0.";
		let distanceExpression = `getSingleDashDistance(distance, radius, ${currentDashOffset}, dashLength0, totalDashLength, capType, lineWidth)`;
		for (let i = 2; i < dashPattern.length; i += 2) {
			currentDashOffset = `${currentDashOffset} + dashLength${i - 2} + dashLength${i - 1}`;
			distanceExpression = `min(${distanceExpression}, getSingleDashDistance(distance, radius, ${currentDashOffset}, dashLength${i}, totalDashLength, capType, lineWidth))`;
		}
		context.functions[dashFunctionName] = `float ${dashFunctionName}(float distance, float radius, float capType, float lineWidth, ${dashLengthsParamsDef}) {
  float totalDashLength = ${totalLengthDef};
  return ${distanceExpression};
}`;
		const dashLengthsCalls = dashPattern.map((v, i) => `${v}`).join(", ");
		builder.setStrokeDistanceFieldExpression(`${dashFunctionName}(currentLengthPx + ${offsetExpression}, currentRadiusPx, capType, v_width, ${dashLengthsCalls})`);
		let patternLength = dashPattern.join(" + ");
		if (builder.getStrokePatternLengthExpression()) {
			context.functions["combinePatternLengths"] = `float combinePatternLengths(float patternLength1, float patternLength2) {
  return patternLength1 * patternLength2;
}`;
			patternLength = `combinePatternLengths(${builder.getStrokePatternLengthExpression()}, ${patternLength})`;
		}
		builder.setStrokePatternLengthExpression(patternLength);
	}
}
/**
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader Builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseFillProperties(style, builder, uniforms, context) {
	if ("fill-color" in style) builder.setFillColorExpression(styleExpressionToGlsl(context, style["fill-color"], ColorType));
	if ("fill-pattern-src" in style) {
		const textureId = computeHash(style["fill-pattern-src"]);
		const sizeExpression = parseImageProperties(style, builder, uniforms, "fill-pattern-", textureId);
		builder.setFillPatternSizeExpression(sizeExpression);
		let offsetExpression = "vec2(0.)";
		if ("fill-pattern-offset" in style && "fill-pattern-size" in style) {
			const specifiedSizeExpression = styleExpressionToGlsl(context, style[`fill-pattern-size`], NumberArrayType);
			builder.setFillPatternSizeExpression(specifiedSizeExpression);
			offsetExpression = parseImageOffsetProperties(style, "fill-pattern-", context, sizeExpression, `v_patternSizePx`);
		}
		context.functions["sampleFillPattern"] = `vec4 sampleFillPattern(sampler2D texture, vec2 textureSize, vec2 textureOffset, vec2 sampleSize, vec2 patternOriginPx, vec2 pxPosition, float sampleScaleRatio) {
  vec2 pxRelativePos = pxPosition - patternOriginPx;

  // rotate the relative position from origin by the current view rotation
  pxRelativePos = vec2(pxRelativePos.x * cos(u_rotation) - pxRelativePos.y * sin(u_rotation), pxRelativePos.x * sin(u_rotation) + pxRelativePos.y * cos(u_rotation));
  // sample position is computed according to the sample offset & size
  vec2 samplePos = mod(pxRelativePos / sampleScaleRatio, sampleSize);
  // also make sure that we're not sampling too close to the borders to avoid interpolation with outside pixels
  samplePos = clamp(samplePos, vec2(0.5), sampleSize - vec2(0.5));
  samplePos.y = sampleSize.y - samplePos.y; // invert y axis so that images appear upright
  return texture2D(texture, (samplePos + textureOffset) / textureSize);
}`;
		const textureName = `u_texture${textureId}`;
		let tintExpression = "1.";
		if ("fill-color" in style) tintExpression = builder.getFillColorExpression();
		builder.setFillColorExpression(`${tintExpression} * sampleFillPattern(${textureName}, ${sizeExpression}, ${offsetExpression}, v_patternSizePx, v_patternOriginPx, pxPos, df_float(u_df_patternScaleRatio))`);
	}
}
/**
* This only compiles the expressions used in the text style properties; this has no impact on the
* shaders but the properties and variables used there will be collected
* @param {import("../../style/flat.js").FlatStyle} style Style
* @param {ShaderBuilder} builder Shader Builder
* @param {Object<string,import("../../webgl/Helper.js").UniformValue>} uniforms Uniforms
* @param {import("../../expr/gpu.js").CompilationContext} context Shader compilation context
*/
function parseTextProperties(style, builder, uniforms, context) {
	/**
	* @param {import("../../expr/gpu.js").CompilationContext} ctx Shader compilation context.
	* @param {import("../../expr/expression.js").EncodedExpression|undefined} value Expression value.
	* @param {import("../../expr/expression.js").ValueType} expectedType Expected expression type.
	*/
	function safeExpressionToGlsl(ctx, value, expectedType) {
		try {
			styleExpressionToGlsl(ctx, value, expectedType);
		} catch {}
	}
	if ("text-value" in style) safeExpressionToGlsl(context, style["text-value"], StringType);
	if ("text-font" in style) safeExpressionToGlsl(context, style["text-font"], StringType);
	if ("text-max-angle" in style) safeExpressionToGlsl(context, style["text-max-angle"], NumberType);
	if ("text-offset-x" in style) safeExpressionToGlsl(context, style["text-offset-x"], NumberType);
	if ("text-offset-y" in style) safeExpressionToGlsl(context, style["text-offset-y"], NumberType);
	if ("text-overflow" in style) safeExpressionToGlsl(context, style["text-overflow"], BooleanType);
	if ("text-placement" in style) safeExpressionToGlsl(context, style["text-placement"], StringType);
	if ("text-repeat" in style) safeExpressionToGlsl(context, style["text-repeat"], NumberType);
	if ("text-scale" in style) safeExpressionToGlsl(context, style["text-scale"], SizeType);
	if ("text-rotate-with-view" in style) safeExpressionToGlsl(context, style["text-rotate-with-view"], BooleanType);
	if ("text-rotation" in style) safeExpressionToGlsl(context, style["text-rotation"], NumberType);
	if ("text-align" in style) safeExpressionToGlsl(context, style["text-align"], StringType);
	if ("text-justify" in style) safeExpressionToGlsl(context, style["text-justify"], StringType);
	if ("text-baseline" in style) safeExpressionToGlsl(context, style["text-baseline"], StringType);
	if ("text-padding" in style) safeExpressionToGlsl(context, style["text-padding"], NumberArrayType);
	if ("text-fill-color" in style) safeExpressionToGlsl(context, style["text-fill-color"], ColorType);
	if ("text-stroke-color" in style) safeExpressionToGlsl(context, style["text-stroke-color"], ColorType);
	if ("text-stroke-line-cap" in style) safeExpressionToGlsl(context, style["text-stroke-line-cap"], StringType);
	if ("text-stroke-line-join" in style) safeExpressionToGlsl(context, style["text-stroke-line-join"], StringType);
	if ("text-stroke-line-dash" in style) safeExpressionToGlsl(context, style["text-stroke-line-dash"], NumberArrayType);
	if ("text-stroke-line-dash-offset" in style) safeExpressionToGlsl(context, style["text-stroke-line-dash-offset"], NumberType);
	if ("text-stroke-miter-limit" in style) safeExpressionToGlsl(context, style["text-stroke-miter-limit"], NumberType);
	if ("text-stroke-width" in style) safeExpressionToGlsl(context, style["text-stroke-width"], NumberType);
	if ("text-background-fill-color" in style) safeExpressionToGlsl(context, style["text-background-fill-color"], ColorType);
	if ("text-background-stroke-color" in style) safeExpressionToGlsl(context, style["text-background-stroke-color"], ColorType);
	if ("text-background-stroke-line-cap" in style) safeExpressionToGlsl(context, style["text-background-stroke-line-cap"], StringType);
	if ("text-background-stroke-line-join" in style) safeExpressionToGlsl(context, style["text-background-stroke-line-join"], StringType);
	if ("text-background-stroke-line-dash" in style) safeExpressionToGlsl(context, style["text-background-stroke-line-dash"], NumberArrayType);
	if ("text-background-stroke-line-dash-offset" in style) safeExpressionToGlsl(context, style["text-background-stroke-line-dash-offset"], NumberType);
	if ("text-background-stroke-miter-limit" in style) safeExpressionToGlsl(context, style["text-background-stroke-miter-limit"], NumberType);
	if ("text-background-stroke-width" in style) safeExpressionToGlsl(context, style["text-background-stroke-width"], NumberType);
	if ("z-index" in style) safeExpressionToGlsl(context, style["z-index"], NumberType);
}
/**
* @typedef {Object} StyleParseResult
* @property {ShaderBuilder} builder Shader builder pre-configured according to a given style
* @property {import("./VectorStyleRenderer.js").UniformDefinitions} uniforms Uniform definitions
* @property {import("./VectorStyleRenderer.js").AttributeDefinitions} attributes Attribute definitions
* @property {import("../../style/flat.js").Rule} [sourceRule] Style and filter that was parsed (if any)
*/
/**
* Parses a {@link import("../../style/flat.js").FlatStyle} object and returns a {@link ShaderBuilder}
* object that has been configured according to the given style, as well as `attributes` and `uniforms`
* arrays to be fed to the `WebGLPointsRenderer` class.
*
* Also returns `uniforms` and `attributes` properties as expected by the
* {@link module:ol/renderer/webgl/PointsLayer~WebGLPointsLayerRenderer}.
*
* @param {import("../../style/flat.js").FlatStyle} style Flat style.
* @param {import('../../style/flat.js').StyleVariables} [variables] Style variables.
* @param {import("../../expr/expression.js").EncodedExpression} [filter] Filter (if any)
* @return {StyleParseResult} Result containing shader params, attributes and uniforms.
*/
function parseLiteralStyle(style, variables, filter) {
	const context = newCompilationContext(variables);
	const builder = new ShaderBuilder();
	/** @type {Object<string,import("../../webgl/Helper.js").UniformValue>} */
	const uniforms = {};
	if ("icon-src" in style) parseIconProperties(style, builder, uniforms, context);
	else if ("shape-points" in style) parseShapeProperties(style, builder, uniforms, context);
	else if ("circle-radius" in style) parseCircleProperties(style, builder, uniforms, context);
	parseStrokeProperties(style, builder, uniforms, context);
	parseFillProperties(style, builder, uniforms, context);
	parseTextProperties(style, builder, uniforms, context);
	if (filter) {
		const filterContext = newParsingContext(variables);
		const parsedFilter = styleExpressionToGlsl(context, filter, BooleanType, filterContext);
		if (filterContext.mCoordinate) builder.setFragmentDiscardExpression(`!${parsedFilter}`);
		else builder.setShapeDiscardExpression(`!${parsedFilter}`);
	}
	/**
	* @type {import('./VectorStyleRenderer.js').AttributeDefinitions}
	*/
	const attributes = {};
	/**
	* @param {string} contextPropName Compilation context property name.
	* @param {string} glslPropName GLSL attribute or uniform name.
	* @param {import("../../expr/expression.js").ValueType} type Value type.
	* @param {(feature: import("../../Feature.js").FeatureLike) => *} callback Feature value callback.
	*/
	function defineSpecialInput(contextPropName, glslPropName, type, callback) {
		if (!context[contextPropName]) return;
		const glslType = getGlslTypeFromType(type);
		const attrSize = getGlslSizeFromType(type);
		builder.addAttribute(`a_${glslPropName}`, glslType);
		attributes[glslPropName] = {
			size: attrSize,
			callback
		};
	}
	defineSpecialInput("geometryType", GEOMETRY_TYPE_PROPERTY_NAME, StringType, (feature) => {
		const geometry = feature.getGeometry();
		if (!geometry) return 0;
		return getStringNumberEquivalent(computeGeometryType(geometry));
	});
	defineSpecialInput("featureId", FEATURE_ID_PROPERTY_NAME, StringType | NumberType, (feature) => {
		const id = feature.getId() ?? null;
		return typeof id === "string" ? getStringNumberEquivalent(id) : id;
	});
	applyContextToBuilder(builder, context);
	return {
		builder,
		attributes: {
			...attributes,
			...generateAttributesFromContext(context)
		},
		uniforms: {
			...uniforms,
			...generateUniformsFromContext(context, variables)
		}
	};
}
//#endregion
//#region src/ol/render/webgl/textUtil.js
var TextUniforms = {
	TEXT_OVERLAY_TEXTURE: "u_textOverlay",
	TEXT_OVERLAY_MATRIX: "u_textOverlayMatrix"
};
/**
* @param {import('../../style/flat.js').FlatStyleLike} style Single flat style
* @return {boolean} Whether the style has text-related properties
*/
function hasTextStyle(style) {
	let result = false;
	function check(style) {
		for (const prop in style) if (prop === "text-value") {
			result = true;
			return;
		}
	}
	if (Array.isArray(style)) {
		for (let i = 0, ii = style.length; i < ii; i++) {
			const rule = style[i];
			if ("style" in rule && Array.isArray(rule.style)) for (let j = 0, jj = rule.style.length; j < jj; j++) check(rule.style[j]);
			else if ("style" in rule) check(rule.style);
			else check(rule);
			if (result) return result;
		}
		return result;
	}
	check(style);
	return result;
}
/**
* @param {function(): HTMLCanvasElement} textOverlayCanvasGetter Function that returns the canvas where the text overlay was rendered
* @param {function(): import('../../Map.js').FrameState} textOverlayFrameStateGetter Function that returns the frame state used for rendering the text overlay
* @return {import("../../renderer/webgl/Layer.js").PostProcessesOptions} Post-process definition for text rendering
*/
function createPostProcessDefinition(textOverlayCanvasGetter, textOverlayFrameStateGetter) {
	const tmpMatrix = create$1();
	return {
		fragmentShader: `
      precision mediump float;
    
      uniform sampler2D u_image;
      uniform sampler2D ${TextUniforms.TEXT_OVERLAY_TEXTURE};
      uniform mat4 ${TextUniforms.TEXT_OVERLAY_MATRIX};
      
      varying vec2 v_texCoord;
    
      void main() {
        vec4 color = texture2D(u_image, v_texCoord);
    
        vec2 coords = v_texCoord * 2. - vec2(1.);
        coords = (${TextUniforms.TEXT_OVERLAY_MATRIX} * vec4(coords.xy, 0., 1.)).xy;
        coords = coords * 0.5 + vec2(0.5);
        float outOfBounds = clamp(step(1., coords.x) + step(1., coords.y) + step(0., -coords.x) + step(0., -coords.y), 0., 1.);
    
        vec4 textColor = texture2D(${TextUniforms.TEXT_OVERLAY_TEXTURE}, vec2(coords.x, 1. - coords.y));
        textColor.a *= 1. - outOfBounds; // if we're sampling out of the text overlay, make alpha 0 to avoid drawing anything

        gl_FragColor = textColor.a * textColor + (1. - textColor.a) * color;
      }`,
		uniforms: {
			[TextUniforms.TEXT_OVERLAY_TEXTURE]: textOverlayCanvasGetter,
			[TextUniforms.TEXT_OVERLAY_MATRIX]: (frameState) => {
				const textOverlayCanvas = textOverlayCanvasGetter();
				const textOverlayFrameState = textOverlayFrameStateGetter();
				if (!textOverlayCanvas || !textOverlayFrameState) return tmpMatrix;
				const textOverlayViewState = textOverlayFrameState.viewState;
				const viewState = frameState.viewState;
				const center = viewState.center;
				const resolution = viewState.resolution;
				const rotation = viewState.rotation;
				const size = frameState.size;
				const renderedCenter = textOverlayViewState.center;
				const renderedResolution = textOverlayViewState.resolution;
				const renderedRotation = textOverlayViewState.rotation;
				const renderedWidth = textOverlayCanvas.width;
				const renderedHeight = textOverlayCanvas.height;
				reset(tmpMatrix);
				scale(tmpMatrix, 1 / renderedResolution / (renderedWidth / 2), 1 / renderedResolution / (renderedHeight / 2), 1, tmpMatrix);
				rotate(tmpMatrix, renderedRotation, tmpMatrix);
				translate(tmpMatrix, center[0] - renderedCenter[0], center[1] - renderedCenter[1], 0, tmpMatrix);
				rotate(tmpMatrix, -rotation, tmpMatrix);
				scale(tmpMatrix, resolution * size[0] / 2, resolution * size[1] / 2, 1, tmpMatrix);
				return tmpMatrix;
			}
		}
	};
}
new RenderFeature("Point", [0, 0], [], 2, {}, "dummy");
new TextDecoder();
//#endregion
//#region src/ol/render/webgl/VectorStyleRenderer.js
/**
* @module ol/render/webgl/VectorStyleRenderer
*/
var tmpColor = [];
/** @type {Worker|undefined} */
var WEBGL_WORKER;
function getWebGLWorker() {
	if (!WEBGL_WORKER) WEBGL_WORKER = create();
	return WEBGL_WORKER;
}
var workerMessageCounter = 0;
/**
*
* @param {Worker} worker Worker to send the message to
* @param {Object} message Message
* @param {Array<Transferable>} [transferables] Transferables
* @return {Promise<Object>} Response received by the worker
*/
function messageWorker(worker, message, transferables) {
	const messageId = workerMessageCounter++;
	if (transferables) worker.postMessage({
		...message,
		id: messageId
	}, transferables);
	else worker.postMessage({
		...message,
		id: messageId
	});
	return new Promise((resolve) => {
		const handleMessage = (event) => {
			const received = event.data;
			if (received.id !== messageId) return;
			worker.removeEventListener("message", handleMessage);
			resolve(received);
		};
		worker.addEventListener("message", handleMessage);
	});
}
/**
* Names of attributes made available to the vertex shader.
* Please note: changing these *will* break custom shaders!
* @enum {string}
*/
var Attributes = {
	POSITION: "a_position",
	LOCAL_POSITION: "a_localPosition",
	SEGMENT_START: "a_segmentStart",
	SEGMENT_END: "a_segmentEnd",
	MEASURE_START: "a_measureStart",
	MEASURE_END: "a_measureEnd",
	ANGLE_TANGENT_SUM: "a_angleTangentSum",
	JOIN_ANGLES: "a_joinAngles",
	DISTANCE_LOW: "a_distanceLow",
	DISTANCE_HIGH: "a_distanceHigh"
};
/**
* @typedef {Object} AttributeDefinition A description of a custom attribute to be passed on to the GPU, with a value different
* for each feature.
* @property {number} [size] Amount of numerical values composing the attribute, either 1, 2, 3 or 4; in case size is > 1, the return value
* of the callback should be an array; if unspecified, assumed to be a single float value
* @property {function(this:import("./MixedGeometryBatch.js").GeometryBatchItem, import("../../Feature.js").FeatureLike):number|Array<number>} callback This callback computes the numerical value of the
* attribute for a given feature.
*/
/**
* @typedef {Object<string, AttributeDefinition>} AttributeDefinitions
* @typedef {Object<string, import("../../webgl/Helper.js").UniformValue>} UniformDefinitions
*/
/**
* @typedef {Array<WebGLArrayBuffer>} WebGLArrayBufferSet Buffers organized like so: [indicesBuffer, vertexAttributesBuffer, instanceAttributesBuffer]
*/
/**
* @typedef {Object} WebGLBuffers
* Anything set to null means there's nothing to render for that category.
* @property {WebGLArrayBufferSet|null} polygonBuffers Array containing indices and vertices buffers for polygons
* @property {WebGLArrayBufferSet|null} lineStringBuffers Array containing indices and vertices buffers for line strings
* @property {WebGLArrayBufferSet|null} pointBuffers Array containing indices and vertices buffers for points
* @property {string|null} textInstructionsKey Key corresponding to a text instructions set
* @property {import("../../transform.js").Transform} invertVerticesTransform Inverse of the transform applied when generating buffers
*/
/**
* @typedef {Object} RenderInstructions
* @property {Float32Array|null} polygonInstructions Polygon instructions; null if nothing to render
* @property {Float32Array|null} lineStringInstructions LineString instructions; null if nothing to render
* @property {Float32Array|null} pointInstructions Point instructions; null if nothing to render
*/
/**
* @typedef {Object} ShaderProgram An object containing both shaders (vertex and fragment)
* @property {string} vertex Vertex shader source
* @property {string} fragment Fragment shader source
*/
/**
* @typedef {import('./style.js').StyleParseResult} StyleShaders
*/
/**
* @typedef {import('../../style/flat.js').FlatStyleLike} FlatStyleLike
*/
/**
* @typedef {import('../../style/flat.js').FlatStyle} FlatStyle
*/
/**
* @typedef {import('../../style/flat.js').Rule} FlatStyleRule
*/
/**
* @typedef {Object} SubRenderPass
* @property {string} vertexShader Vertex shader
* @property {string} fragmentShader Fragment shader
* @property {Array<import('../../webgl/Helper.js').AttributeDescription>} attributesDesc Attributes description, defined for each primitive vertex
* @property {Array<import('../../webgl/Helper.js').AttributeDescription>} instancedAttributesDesc Attributes description, defined once per primitive
* @property {number} instancePrimitiveVertexCount Number of vertices per instance primitive in this render pass
* @property {WebGLProgram} [program] Program; this has to be recreated if the helper is lost/changed
*/
/**
* @typedef {Object} RenderPass
* @property {SubRenderPass} [fillRenderPass] Fill render pass; undefined if no fill in pass
* @property {SubRenderPass} [strokeRenderPass] Stroke render pass; undefined if no stroke in pass
* @property {SubRenderPass} [symbolRenderPass] Symbol render pass; undefined if no symbol in pass
*/
/**
* @classdesc This class is responsible for:
* 1. generating WebGL buffers according to a provided style, using a MixedGeometryBatch as input
* 2. rendering geometries contained in said buffers
*
* A VectorStyleRenderer instance can be created either from a literal style or from shaders.
* The shaders should not be provided explicitly but instead as a preconfigured ShaderBuilder instance.
*
* The `generateBuffers` method returns a promise resolving to WebGL buffers that are intended to be rendered by the
* same renderer.
*/
var VectorStyleRenderer = class extends Disposable {
	/**
	* @param {FlatStyleLike|StyleShaders|Array<StyleShaders>} styles Vector styles expressed as flat styles, flat style rules or style shaders
	* @param {import('../../style/flat.js').StyleVariables} variables Style variables
	* @param {import('../../webgl/Helper.js').default} helper Helper
	* @param {boolean} [enableHitDetection] Whether to enable the hit detection (needs compatible shader)
	*/
	constructor(styles, variables, helper, enableHitDetection) {
		super();
		/**
		* @private
		* @type {import('../../webgl/Helper.js').default}
		*/
		this.helper_;
		/**
		* @private
		*/
		this.hitDetectionEnabled_ = !!enableHitDetection;
		/**
		* Flat style like; if shaders are given as input, will use the `sourceRule` property of the shaders
		* `null` if no Flat style equivalent is available (e.g. custom-made shaders); in that case no text rendering will happen
		* @type {FlatStyleLike|null}
		*/
		this.flatStyle = toFlatStyleLike(styles);
		/**
		* @type {Array<StyleShaders>}
		* @private
		*/
		this.styleShaders = convertStyleToShaders(styles, variables);
		/**
		* @type {AttributeDefinitions}
		* @private
		*/
		this.customAttributes_ = {};
		/**
		@type {UniformDefinitions}
		* @private
		*/
		this.uniforms_ = {};
		if (this.hitDetectionEnabled_) this.customAttributes_["hitColor"] = {
			callback() {
				return colorEncodeIdAndPack(this.ref ?? 0, tmpColor);
			},
			size: 2
		};
		for (const styleShader of this.styleShaders) {
			for (const attributeName in styleShader.attributes) {
				if (attributeName in this.customAttributes_) continue;
				this.customAttributes_[attributeName] = styleShader.attributes[attributeName];
			}
			for (const uniformName in styleShader.uniforms) {
				if (uniformName in this.uniforms_) continue;
				this.uniforms_[uniformName] = styleShader.uniforms[uniformName];
			}
		}
		/**
		* @type {Array<RenderPass>}
		* @private
		*/
		this.renderPasses_ = this.styleShaders.map((styleShader) => {
			/** @type {RenderPass} */
			const renderPass = {};
			const customAttributesDesc = Object.entries(this.customAttributes_).map(([name, value]) => {
				return {
					name: name in styleShader.attributes || name === "hitColor" ? `a_${name}` : null,
					size: value.size || 1,
					type: AttributeType.FLOAT
				};
			});
			if (styleShader.builder.getFillVertexShader()) renderPass.fillRenderPass = {
				vertexShader: styleShader.builder.getFillVertexShader(),
				fragmentShader: styleShader.builder.getFillFragmentShader(),
				attributesDesc: [{
					name: Attributes.POSITION,
					size: 2,
					type: AttributeType.FLOAT
				}, ...customAttributesDesc],
				instancedAttributesDesc: [],
				instancePrimitiveVertexCount: 3
			};
			if (styleShader.builder.getStrokeVertexShader()) renderPass.strokeRenderPass = {
				vertexShader: styleShader.builder.getStrokeVertexShader(),
				fragmentShader: styleShader.builder.getStrokeFragmentShader(),
				attributesDesc: [{
					name: Attributes.LOCAL_POSITION,
					size: 2,
					type: AttributeType.FLOAT
				}],
				instancedAttributesDesc: [
					{
						name: Attributes.SEGMENT_START,
						size: 2,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.MEASURE_START,
						size: 1,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.SEGMENT_END,
						size: 2,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.MEASURE_END,
						size: 1,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.JOIN_ANGLES,
						size: 2,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.DISTANCE_LOW,
						size: 1,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.DISTANCE_HIGH,
						size: 1,
						type: AttributeType.FLOAT
					},
					{
						name: Attributes.ANGLE_TANGENT_SUM,
						size: 1,
						type: AttributeType.FLOAT
					},
					...customAttributesDesc
				],
				instancePrimitiveVertexCount: 6
			};
			if (styleShader.builder.getSymbolVertexShader()) renderPass.symbolRenderPass = {
				vertexShader: styleShader.builder.getSymbolVertexShader(),
				fragmentShader: styleShader.builder.getSymbolFragmentShader(),
				attributesDesc: [{
					name: Attributes.LOCAL_POSITION,
					size: 2,
					type: AttributeType.FLOAT
				}],
				instancedAttributesDesc: [{
					name: Attributes.POSITION,
					size: 2,
					type: AttributeType.FLOAT
				}, ...customAttributesDesc],
				instancePrimitiveVertexCount: 6
			};
			return renderPass;
		});
		this.hasFill_ = this.renderPasses_.some((pass) => pass.fillRenderPass);
		this.hasStroke_ = this.renderPasses_.some((pass) => pass.strokeRenderPass);
		this.hasSymbol_ = this.renderPasses_.some((pass) => pass.symbolRenderPass);
		this.hasText_ = this.flatStyle && hasTextStyle(this.flatStyle);
		if (this.hasText_) {
			/**
			* @private
			*/
			this.textOverlayCanvas_ = createCanvasContext2D().canvas;
			/**
			* @type {CanvasRenderingContext2D|null}
			* @private
			*/
			this.textOverlayContext_ = this.textOverlayCanvas_.getContext("2d");
			/**
			* @type {import("../../Map.js").FrameState|null}
			* @private
			*/
			this.textOverlayRenderFrameState_ = null;
			/**
			* @type {Promise<Worker>}
			* @private
			*/
			this.textOverlayWorker_ = __vitePreload(async () => {
				const { create } = await import("./textOverlay.js");
				return { create };
			}, [], import.meta.url).then(({ create }) => create());
			/** @type {Set<string>} */
			this.textOverlayRenderList_ = /* @__PURE__ */ new Set();
		}
		this.setHelper(helper);
	}
	/**
	* @param {import('./MixedGeometryBatch.js').default} geometryBatch Geometry batch
	* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
	* @param {number} resolution View resolution; used for text render instructions if any
	* @return {Promise<WebGLBuffers>} A promise resolving to WebGL buffers; buffer sets are set to `null` if nothing to render
	*/
	async generateBuffers(geometryBatch, transform, resolution) {
		const invertVerticesTransform = makeInverse(create$2(), transform);
		if (geometryBatch.isEmpty()) return {
			polygonBuffers: null,
			lineStringBuffers: null,
			pointBuffers: null,
			invertVerticesTransform,
			textInstructionsKey: null
		};
		const labelsArray = new LabelsArray();
		const renderInstructions = this.generateRenderInstructions_(geometryBatch, labelsArray, transform);
		const [textInstructionsKey, polygonBuffers, lineStringBuffers, pointBuffers] = await Promise.all([
			this.hasText_ ? this.generateTextInstructions_(renderInstructions, labelsArray, transform, resolution) : null,
			this.hasFill_ ? this.generateBuffersForType_(renderInstructions.polygonInstructions, "Polygon", transform) : null,
			this.hasStroke_ ? this.generateBuffersForType_(renderInstructions.lineStringInstructions, "LineString", transform) : null,
			this.hasSymbol_ ? this.generateBuffersForType_(renderInstructions.pointInstructions, "Point", transform) : null
		]);
		return {
			polygonBuffers: polygonBuffers ?? null,
			lineStringBuffers: lineStringBuffers ?? null,
			pointBuffers: pointBuffers ?? null,
			invertVerticesTransform,
			textInstructionsKey
		};
	}
	/**
	* @param {import('./MixedGeometryBatch.js').default} geometryBatch Geometry batch
	* @param {LabelsArray} labelsArray Labels array
	* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
	* @return {RenderInstructions} Render instructions
	* @private
	*/
	generateRenderInstructions_(geometryBatch, labelsArray, transform) {
		return {
			polygonInstructions: this.hasFill_ || this.hasText_ ? generatePolygonRenderInstructions(geometryBatch.polygonBatch, /* @__PURE__ */ new Float32Array(0), labelsArray, this.customAttributes_, transform) : null,
			lineStringInstructions: this.hasStroke_ || this.hasText_ ? generateLineStringRenderInstructions(geometryBatch.lineStringBatch, /* @__PURE__ */ new Float32Array(0), labelsArray, this.customAttributes_, transform) : null,
			pointInstructions: this.hasSymbol_ || this.hasText_ ? generatePointRenderInstructions(geometryBatch.pointBatch, /* @__PURE__ */ new Float32Array(0), labelsArray, this.customAttributes_, transform) : null
		};
	}
	/**
	* @param {Float32Array|null} renderInstructions Render instructions
	* @param {import("../../geom/Geometry.js").Type} geometryType Geometry type
	* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
	* @return {Promise<WebGLArrayBufferSet|undefined>|null} Indices buffer and vertices buffer; null if nothing to render
	* @private
	*/
	generateBuffersForType_(renderInstructions, geometryType, transform) {
		if (renderInstructions === null) return null;
		let messageType;
		switch (geometryType) {
			case "Polygon":
				messageType = WebGLWorkerMessageType.GENERATE_POLYGON_BUFFERS;
				break;
			case "LineString":
				messageType = WebGLWorkerMessageType.GENERATE_LINE_STRING_BUFFERS;
				break;
			case "Point":
				messageType = WebGLWorkerMessageType.GENERATE_POINT_BUFFERS;
				break;
			default: return null;
		}
		/** @type {import('./constants.js').WebGLWorkerGenerateBuffersMessage} */
		const message = {
			type: messageType,
			renderInstructions: renderInstructions.buffer,
			renderInstructionsTransform: transform,
			customAttributesSize: getCustomAttributesSize(this.customAttributes_)
		};
		return messageWorker(getWebGLWorker(), message, [renderInstructions.buffer]).then((data) => {
			if (!this.helper_.getGL()) return;
			const received = data;
			if (!received.indicesBuffer || !received.vertexAttributesBuffer || !received.instanceAttributesBuffer) return;
			const indicesBuffer = new WebGLArrayBuffer(ELEMENT_ARRAY_BUFFER, DYNAMIC_DRAW).fromArrayBuffer(received.indicesBuffer);
			const vertexAttributesBuffer = new WebGLArrayBuffer(ARRAY_BUFFER, DYNAMIC_DRAW).fromArrayBuffer(received.vertexAttributesBuffer);
			const instanceAttributesBuffer = new WebGLArrayBuffer(ARRAY_BUFFER, DYNAMIC_DRAW).fromArrayBuffer(received.instanceAttributesBuffer);
			this.helper_.flushBufferData(indicesBuffer);
			this.helper_.flushBufferData(vertexAttributesBuffer);
			this.helper_.flushBufferData(instanceAttributesBuffer);
			return [
				indicesBuffer,
				vertexAttributesBuffer,
				instanceAttributesBuffer
			];
		});
	}
	/**
	* @param {RenderInstructions} renderInstructions Render instructions
	* @param {import('../../webgl/LabelsArray.js').default} labelsArray Labels array
	* @param {import("../../transform.js").Transform} transform Transform to apply to coordinates
	* @param {number} resolution View resolution to be used as a basis when computing text overflow
	* @return {Promise<string|null>|null} Resolves to a key corresponding to the text draw instructions; null if no text to render
	* @private
	*/
	generateTextInstructions_(renderInstructions, labelsArray, transform, resolution) {
		const transferables = [labelsArray.getArray().buffer];
		let polygonRenderInstructions = null;
		let lineStringRenderInstructions = null;
		let pointRenderInstructions = null;
		if (renderInstructions.polygonInstructions) {
			polygonRenderInstructions = new Float32Array(renderInstructions.polygonInstructions).buffer;
			transferables.push(polygonRenderInstructions);
		}
		if (renderInstructions.lineStringInstructions) {
			lineStringRenderInstructions = new Float32Array(renderInstructions.lineStringInstructions).buffer;
			transferables.push(lineStringRenderInstructions);
		}
		if (renderInstructions.pointInstructions) {
			pointRenderInstructions = new Float32Array(renderInstructions.pointInstructions).buffer;
			transferables.push(pointRenderInstructions);
		}
		const customAttributesSizes = Object.keys(this.customAttributes_).reduce((prev, curr) => ({
			...prev,
			[curr]: this.customAttributes_[curr].size || 1
		}), {});
		/** @type {import('./constants.js').TextOverlayWorkerMessage} */
		const message = {
			type: TextOverlayWorkerMessageType.BUILD_INSTRUCTIONS,
			polygonRenderInstructions: polygonRenderInstructions ?? void 0,
			lineStringRenderInstructions: lineStringRenderInstructions ?? void 0,
			pointRenderInstructions: pointRenderInstructions ?? void 0,
			labelsArray: labelsArray.getArray(),
			style: this.flatStyle ?? void 0,
			customAttributesSizes,
			renderInstructionsTransform: transform,
			resolution
		};
		return this.textOverlayWorker_.then((worker) => messageWorker(worker, message, transferables)).then((data) => {
			return data.instructionsSetKey ?? null;
		});
	}
	/**
	* Render the geometries in the given buffers.
	* @param {WebGLBuffers} buffers WebGL Buffers to draw
	* @param {import("../../Map.js").FrameState} frameState Frame state
	* @param {function(): void} preRenderCallback This callback will be called right before drawing, and can be used to set uniforms
	*/
	render(buffers, frameState, preRenderCallback) {
		for (const renderPass of this.renderPasses_) {
			renderPass.fillRenderPass && buffers.polygonBuffers && this.renderInternal_(buffers.polygonBuffers[0], buffers.polygonBuffers[1], buffers.polygonBuffers[2], renderPass.fillRenderPass, frameState, preRenderCallback);
			renderPass.strokeRenderPass && buffers.lineStringBuffers && this.renderInternal_(buffers.lineStringBuffers[0], buffers.lineStringBuffers[1], buffers.lineStringBuffers[2], renderPass.strokeRenderPass, frameState, preRenderCallback);
			renderPass.symbolRenderPass && buffers.pointBuffers && this.renderInternal_(buffers.pointBuffers[0], buffers.pointBuffers[1], buffers.pointBuffers[2], renderPass.symbolRenderPass, frameState, preRenderCallback);
		}
		if (buffers.textInstructionsKey) this.renderText_(buffers);
	}
	/**
	* @param {WebGLArrayBuffer} indicesBuffer Indices buffer
	* @param {WebGLArrayBuffer} vertexAttributesBuffer Vertex attributes buffer
	* @param {WebGLArrayBuffer} instanceAttributesBuffer Instance attributes buffer
	* @param {SubRenderPass} subRenderPass Render pass (program, attributes, etc.) specific to one geometry type
	* @param {import("../../Map.js").FrameState} frameState Frame state.
	* @param {function(): void} preRenderCallback This callback will be called right before drawing, and can be used to set uniforms
	* @private
	*/
	renderInternal_(indicesBuffer, vertexAttributesBuffer, instanceAttributesBuffer, subRenderPass, frameState, preRenderCallback) {
		const renderCount = indicesBuffer.getSize();
		if (renderCount === 0) return;
		const usesInstancedRendering = subRenderPass.instancedAttributesDesc.length;
		const program = subRenderPass.program;
		if (!program) return;
		this.helper_.useProgram(program, frameState);
		this.helper_.bindBuffer(vertexAttributesBuffer);
		this.helper_.bindBuffer(indicesBuffer);
		this.helper_.enableAttributes(subRenderPass.attributesDesc);
		this.helper_.bindBuffer(instanceAttributesBuffer);
		this.helper_.enableAttributesInstanced(subRenderPass.instancedAttributesDesc);
		preRenderCallback();
		if (usesInstancedRendering) {
			const instanceAttributesStride = subRenderPass.instancedAttributesDesc.reduce((prev, curr) => prev + (curr.size || 1), 0);
			const instanceCount = instanceAttributesBuffer.getSize() / instanceAttributesStride;
			this.helper_.drawElementsInstanced(0, renderCount, instanceCount);
		} else this.helper_.drawElements(0, renderCount);
	}
	/**
	* @param {WebGLBuffers} buffers WebGL Buffers to draw
	* @private
	*/
	renderText_(buffers) {
		const key = buffers.textInstructionsKey;
		if (key) this.textOverlayRenderList_.add(key);
	}
	/**
	* Render the geometries in the given buffers.
	* @param {import("../../Map.js").FrameState} frameState Frame state
	* @return {Promise<void>} A promise resolving after the post rendering step is over
	*/
	finalizeTextRender(frameState) {
		if (!this.hasText_) return Promise.resolve();
		const textOverlayCanvas = this.textOverlayCanvas_;
		const textOverlayContext = this.textOverlayContext_;
		const message = {
			type: TextOverlayWorkerMessageType.RENDER,
			frameState: serializeFrameState(frameState),
			batchesToRender: this.textOverlayRenderList_
		};
		return this.textOverlayWorker_.then((worker) => messageWorker(worker, message)).then((data) => {
			const received = data;
			if (received.imageData) {
				this.textOverlayRenderFrameState_ = received.frameState !== void 0 ? received.frameState : null;
				const imageData = received.imageData;
				if (imageData.width !== textOverlayCanvas.width || imageData.height !== textOverlayCanvas.height) {
					textOverlayCanvas.width = imageData.width;
					textOverlayCanvas.height = imageData.height;
				} else textOverlayContext.clearRect(0, 0, textOverlayCanvas.width, textOverlayCanvas.height);
				textOverlayContext.drawImage(imageData, 0, 0);
				imageData.close();
			}
			this.textOverlayRenderList_.clear();
		});
	}
	/**
	* @param {import('../../webgl/Helper.js').default} helper Helper
	* @param {WebGLBuffers|null} [buffers] WebGL Buffers to reload if any
	*/
	setHelper(helper, buffers = null) {
		this.helper_ = helper;
		for (const renderPass of this.renderPasses_) {
			if (renderPass.fillRenderPass) renderPass.fillRenderPass.program = this.helper_.getProgram(renderPass.fillRenderPass.fragmentShader, renderPass.fillRenderPass.vertexShader);
			if (renderPass.strokeRenderPass) renderPass.strokeRenderPass.program = this.helper_.getProgram(renderPass.strokeRenderPass.fragmentShader, renderPass.strokeRenderPass.vertexShader);
			if (renderPass.symbolRenderPass) renderPass.symbolRenderPass.program = this.helper_.getProgram(renderPass.symbolRenderPass.fragmentShader, renderPass.symbolRenderPass.vertexShader);
		}
		this.helper_.addUniforms(this.uniforms_);
		if (buffers) {
			if (buffers.polygonBuffers) {
				this.helper_.flushBufferData(buffers.polygonBuffers[0]);
				this.helper_.flushBufferData(buffers.polygonBuffers[1]);
				this.helper_.flushBufferData(buffers.polygonBuffers[2]);
			}
			if (buffers.lineStringBuffers) {
				this.helper_.flushBufferData(buffers.lineStringBuffers[0]);
				this.helper_.flushBufferData(buffers.lineStringBuffers[1]);
				this.helper_.flushBufferData(buffers.lineStringBuffers[2]);
			}
			if (buffers.pointBuffers) {
				this.helper_.flushBufferData(buffers.pointBuffers[0]);
				this.helper_.flushBufferData(buffers.pointBuffers[1]);
				this.helper_.flushBufferData(buffers.pointBuffers[2]);
			}
		}
	}
	getTextOverlayCanvas() {
		return this.textOverlayCanvas_;
	}
	getTextOverlayFrameState() {
		return this.textOverlayRenderFrameState_;
	}
	/**
	* Dispose of text instructions in worker.
	* @param {string} key Key corresponding to the instructions set to dispose
	*/
	disposeTextInstructions(key) {
		this.textOverlayWorker_?.then((worker) => worker.postMessage({
			type: TextOverlayWorkerMessageType.DISPOSE_INSTRUCTIONS,
			instructionsSetKey: key
		}));
	}
	/**
	* Clean up.
	* @override
	*/
	disposeInternal() {
		this.textOverlayWorker_?.then((worker) => worker.terminate());
		super.disposeInternal();
	}
};
/**
* @param {FlatStyleLike|StyleShaders|Array<StyleShaders>} styleOrShaders Either a flat style or shaders
* @return {FlatStyleLike|null} Will return null if the original flat style could not be found
*/
function toFlatStyleLike(styleOrShaders) {
	if (Array.isArray(styleOrShaders)) {
		if (styleOrShaders.some((s) => "builder" in s && !("sourceRule" in s))) return null;
		if (styleOrShaders.some((s) => "builder" in s)) return styleOrShaders.flatMap((style) => {
			const sourceRule = style.sourceRule;
			return sourceRule ? [sourceRule] : [];
		});
		return styleOrShaders;
	}
	if ("builder" in styleOrShaders) {
		if (!("sourceRule" in styleOrShaders)) return null;
		const sourceRule = styleOrShaders.sourceRule;
		if (!sourceRule) return null;
		return [sourceRule];
	}
	return styleOrShaders;
}
/**
* Breaks down a vector style into an array of prebuilt shader builders with attributes and uniforms
* @param {FlatStyleLike|StyleShaders|Array<StyleShaders>} style Vector style
* @param {import('../../style/flat.js').StyleVariables} variables Style variables
* @return {Array<StyleShaders>} Array of style shaders
*/
function convertStyleToShaders(style, variables) {
	const asArray = Array.isArray(style) ? style : [style];
	if ("style" in asArray[0]) {
		/** @type {Array<StyleShaders>} */
		const shaders = [];
		const rules = asArray;
		const previousFilters = [];
		for (const rule of rules) {
			/** @type {Array<FlatStyle>} */
			const ruleStyles = Array.isArray(rule.style) ? rule.style : [rule.style];
			/** @type {import("../../expr/expression.js").EncodedExpression|undefined} */
			let currentFilter = rule.filter;
			if (rule.else && previousFilters.length) {
				currentFilter = ["all", ...previousFilters.map((filter) => ["!", filter])];
				if (rule.filter) currentFilter.push(rule.filter);
				if (currentFilter.length < 3) currentFilter = currentFilter[1];
			}
			if (rule.filter) previousFilters.push(rule.filter);
			const styleShaders = ruleStyles.map((style) => ({
				...parseLiteralStyle(style, variables, currentFilter),
				sourceRule: rule
			}));
			shaders.push(...styleShaders);
		}
		return shaders;
	}
	if ("builder" in asArray[0]) return asArray;
	return asArray.map((style) => ({
		...parseLiteralStyle(style, variables, void 0),
		sourceRule: { style }
	}));
}
//#endregion
//#region src/ol/webgl/RenderTarget.js
/**
* A wrapper class to simplify rendering to a texture instead of the final canvas
* @module ol/webgl/RenderTarget
*/
var tmpArray4 = /* @__PURE__ */ new Uint8Array(4);
/**
* @classdesc
* This class is a wrapper around the association of both a `WebGLTexture` and a `WebGLFramebuffer` instances,
* simplifying initialization and binding for rendering.
*/
var WebGLRenderTarget = class {
	/**
	* @param {import("./Helper.js").default} helper WebGL helper; mandatory.
	* @param {Array<number>} [size] Expected size of the render target texture; note: this can be changed later on.
	*/
	constructor(helper, size) {
		/**
		* @private
		* @type {import("./Helper.js").default}
		*/
		this.helper_ = helper;
		const gl = helper.getGL();
		/**
		* @private
		* @type {WebGLTexture}
		*/
		this.texture_ = gl.createTexture();
		/**
		* @private
		* @type {WebGLFramebuffer}
		*/
		this.framebuffer_ = gl.createFramebuffer();
		/**
		* @private
		* @type {WebGLRenderbuffer}
		*/
		this.depthbuffer_ = gl.createRenderbuffer();
		/**
		* @type {Array<number>}
		* @private
		*/
		this.size_ = size || [1, 1];
		/**
		* @type {Uint8Array}
		* @private
		*/
		this.data_ = /* @__PURE__ */ new Uint8Array(0);
		/**
		* @type {boolean}
		* @private
		*/
		this.dataCacheDirty_ = true;
		this.updateSize_();
	}
	/**
	* Changes the size of the render target texture. Note: will do nothing if the size
	* is already the same.
	* @param {Array<number>} size Expected size of the render target texture
	*/
	setSize(size) {
		if (equals(size, this.size_)) return;
		this.size_[0] = size[0];
		this.size_[1] = size[1];
		this.updateSize_();
	}
	/**
	* Returns the size of the render target texture
	* @return {Array<number>} Size of the render target texture
	*/
	getSize() {
		return this.size_;
	}
	/**
	* This will cause following calls to `#readAll` or `#readPixel` to download the content of the
	* render target into memory, which is an expensive operation.
	* This content will be kept in cache but should be cleared after each new render.
	*/
	clearCachedData() {
		this.dataCacheDirty_ = true;
	}
	/**
	* Returns the full content of the frame buffer as a series of r, g, b, a components
	* in the 0-255 range (unsigned byte).
	* @return {Uint8Array} Integer array of color values
	*/
	readAll() {
		if (this.dataCacheDirty_) {
			const size = this.size_;
			const gl = this.helper_.getGL();
			gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer_);
			gl.readPixels(0, 0, size[0], size[1], gl.RGBA, gl.UNSIGNED_BYTE, this.data_);
			this.dataCacheDirty_ = false;
		}
		return this.data_;
	}
	/**
	* Reads one pixel of the frame buffer as an array of r, g, b, a components
	* in the 0-255 range (unsigned byte).
	* If x and/or y are outside of existing data, an array filled with 0 is returned.
	* @param {number} x Pixel coordinate
	* @param {number} y Pixel coordinate
	* @return {Uint8Array} Integer array with one color value (4 components)
	*/
	readPixel(x, y) {
		if (x < 0 || y < 0 || x > this.size_[0] || y >= this.size_[1]) {
			tmpArray4[0] = 0;
			tmpArray4[1] = 0;
			tmpArray4[2] = 0;
			tmpArray4[3] = 0;
			return tmpArray4;
		}
		this.readAll();
		const index = Math.floor(x) + (this.size_[1] - Math.floor(y) - 1) * this.size_[0];
		tmpArray4[0] = this.data_[index * 4];
		tmpArray4[1] = this.data_[index * 4 + 1];
		tmpArray4[2] = this.data_[index * 4 + 2];
		tmpArray4[3] = this.data_[index * 4 + 3];
		return tmpArray4;
	}
	/**
	* @return {WebGLTexture} Texture to render to
	*/
	getTexture() {
		return this.texture_;
	}
	/**
	* @return {WebGLFramebuffer} Frame buffer of the render target
	*/
	getFramebuffer() {
		return this.framebuffer_;
	}
	/**
	* @return {WebGLRenderbuffer} Depth buffer of the render target
	*/
	getDepthbuffer() {
		return this.depthbuffer_;
	}
	/**
	* @private
	*/
	updateSize_() {
		const size = this.size_;
		const gl = this.helper_.getGL();
		this.texture_ = this.helper_.createTexture(size, null, this.texture_);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer_);
		gl.viewport(0, 0, size[0], size[1]);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture_, 0);
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthbuffer_);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, size[0], size[1]);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthbuffer_);
		this.data_ = new Uint8Array(size[0] * size[1] * 4);
	}
};
//#endregion
//#region src/ol/renderer/webgl/vectorUtil.js
/**
* @module ol/renderer/webgl/vectorUtil
*/
var VectorUniforms = {
	PATTERN_ORIGIN_X_DOUBLE: "u_df_patternOriginX",
	PATTERN_ORIGIN_Y_DOUBLE: "u_df_patternOriginY",
	PATTERN_SCALE_RATIO_DOUBLE: "u_df_patternScaleRatio",
	ONE: "u_one"
};
var tmpCoords = [0, 0];
var tmpCoords2 = [0, 0];
var tmpTransform = create$2();
var tmpMat4 = create$1();
/**
* Applies uniforms used in vector rendering
* @param {import('../../webgl/Helper.js').default} helper Helper
* @param {import('../../transform.js').Transform} worldToViewTransform Transform
* @param {import('../../transform.js').Transform} geometryInvertTransform Transform.
* @param {import('../../Map.js').FrameState} frameState Frame state.
*/
function applyVectorUniforms(helper, worldToViewTransform, geometryInvertTransform, frameState) {
	setFromArray(tmpTransform, worldToViewTransform);
	multiply(tmpTransform, geometryInvertTransform);
	helper.setUniformMatrixValue(DefaultUniform.PROJECTION_MATRIX, fromTransform(tmpMat4, tmpTransform));
	makeInverse(tmpTransform, tmpTransform);
	helper.setUniformMatrixValue(DefaultUniform.INVERT_PROJECTION_MATRIX, fromTransform(tmpMat4, tmpTransform));
	tmpCoords[0] = 0;
	tmpCoords[1] = 0;
	const size = frameState.size;
	const resolution = frameState.viewState.resolution;
	const center = frameState.viewState.center;
	compose(tmpTransform, size[0] / 2, size[1] / 2, 1 / resolution, 1 / resolution, 0, -center[0], -center[1]);
	apply(tmpTransform, tmpCoords);
	tmpCoords2[0] = getHighPart(tmpCoords[0]);
	tmpCoords2[1] = getLowPart(tmpCoords[0]);
	helper.setUniformFloatVec2(VectorUniforms.PATTERN_ORIGIN_X_DOUBLE, tmpCoords2);
	tmpCoords2[0] = getHighPart(tmpCoords[1]);
	tmpCoords2[1] = getLowPart(tmpCoords[1]);
	helper.setUniformFloatVec2(VectorUniforms.PATTERN_ORIGIN_Y_DOUBLE, tmpCoords2);
	const scaleRatio = Math.pow(2, (frameState.viewState.zoom + .5) % 1 - .5);
	tmpCoords[0] = getHighPart(scaleRatio);
	tmpCoords[1] = getLowPart(scaleRatio);
	helper.setUniformFloatVec2(VectorUniforms.PATTERN_SCALE_RATIO_DOUBLE, tmpCoords);
}
//#endregion
export { convertStyleToShaders as a, createPostProcessDefinition as c, MixedGeometryBatch as d, ShaderBuilder as f, VectorStyleRenderer as i, hasTextStyle as l, applyVectorUniforms as n, toFlatStyleLike as o, WebGLRenderTarget as r, TextUniforms as s, VectorUniforms as t, colorDecodeId as u };

//# sourceMappingURL=vectorUtil.js.map