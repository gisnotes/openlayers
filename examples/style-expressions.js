import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import GeoJSON from '../src/ol/format/GeoJSON.js';
import Layer from '../src/ol/layer/Vector.js';
import Source from '../src/ol/source/Vector.js';

// GeoJSON format reader used across vector sources
// 共享的 GeoJSON 格式解析器实例
const format = new GeoJSON();

const map = new Map({
  layers: [
    // Layer 1: Land polygons with uniform literal style
    // 图层 1：全球陆地多边形底图，使用固定的字面量扁平样式（所有陆地多边形统一填充暗灰蓝色）
    new Layer({
      background: '#1a2b39', // Ocean background color / 海洋背景底色
      source: new Source({
        url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_land.geojson',
        format,
      }),
      style: {
        'fill-color': 'darkgray',
      },
    }),
    // Layer 2: Populated places points with expression-driven radius
    // 图层 2：居民点散点图层，圆点半径由要素属性表达式动态驱动
    new Layer({
      source: new Source({
        url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson',
        format,
      }),
      style: {
        // Use the 'get' expression to read the 'scalerank' property directly as the circle radius
        // 使用 ['get', 'scalerank'] 表达式动态读取要素属性中的等级数字作为圆点半径
        'circle-radius': ['get', 'scalerank'],
        'circle-fill-color': 'gray',
        'circle-stroke-color': 'white',
        'circle-stroke-width': 0.5,
      },
    }),
    // Layer 3: Rule-based text labels with filters, 'else' branching, and decluttering
    // 图层 3：基于规则数组的城市地名文本标注，展示条件过滤、else 分支与标注防重叠避让
    new Layer({
      source: new Source({
        url: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_populated_places_simple.geojson',
        format,
      }),
      // Enable collision detection to prevent overlapping text labels
      // 开启文本标注碰撞检测避让机制，避免地名密集时发生文字重叠遮挡
      declutter: true,
      style: [
        // Rule 1: Megacities (population > 10,000,000)
        // 规则 1：超大城市（人口大于 1000 万），显示 "省/州, 国家"，字号较大 (16px)
        {
          filter: ['>', ['get', 'pop_max'], 10_000_000],
          style: {
            'text-value': [
              'concat',
              ['get', 'adm1name'],
              ', ',
              ['get', 'adm0name'],
            ],
            'text-font': '16px sans-serif',
            'text-fill-color': 'white',
            'text-stroke-color': 'gray',
            'text-stroke-width': 2,
          },
        },
        // Rule 2: Large cities (population > 5,000,000, but not matching Rule 1)
        // 规则 2：特大城市（人口大于 500 万且未命中规则 1），仅显示简短城市名，字号较小 (12px)
        {
          else: true,
          filter: ['>', ['get', 'pop_max'], 5_000_000],
          style: {
            'text-value': ['get', 'nameascii'],
            'text-font': '12px sans-serif',
            'text-fill-color': 'white',
            'text-stroke-color': 'gray',
            'text-stroke-width': 2,
          },
        },
      ],
    }),
  ],
  target: 'map',
  view: new View({
    center: [0, 0],
    zoom: 1,
  }),
});
