import Map from '../src/ol/Map.js';
import View from '../src/ol/View.js';
import TileLayer from '../src/ol/layer/Tile.js';
import OSM from '../src/ol/source/OSM.js';

// Define custom HTML element with accessible OpenLayers map
// 定义支持无障碍访问与键盘导航的原生自定义 HTML 元素
class OLComponent extends HTMLElement {
  constructor() {
    super();
    // Attach open shadow root for style encapsulation
    // 创建开放模式的 Shadow DOM 以实现样式隔离
    this.shadow = this.attachShadow({mode: 'open'});

    // Inject OpenLayers core CSS stylesheet
    // 注入 OpenLayers 核心样式表
    const link = document.createElement('link');
    link.setAttribute('rel', 'stylesheet');
    link.setAttribute('href', 'theme/ol.css');
    this.shadow.appendChild(link);

    // Host element display styling
    // 宿主元素块级展示样式
    const style = document.createElement('style');
    style.innerText = `
      :host {
        display: block;
      }
    `;
    this.shadow.appendChild(style);

    // Inner map target container
    // 内部地图挂载目标容器
    const mapTarget = document.createElement('div');
    mapTarget.style.width = '100%';
    mapTarget.style.height = '100%';
    this.shadow.appendChild(mapTarget);

    // Initialize map instance inside shadow root
    // 在 Shadow DOM 内部初始化地图实例
    this.map = new Map({
      target: mapTarget,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
      ],
      view: new View({
        center: [0, 0],
        zoom: 2,
      }),
    });
  }
}

// Register custom element tag <ol-map>
// 注册自定义元素标签 <ol-map>
customElements.define('ol-map', OLComponent);
