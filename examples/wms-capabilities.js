import WMSCapabilities from '../src/ol/format/WMSCapabilities.js';

// Instantiate the WMSCapabilities parser
// 实例化 WMSCapabilities 元数据解析器
const parser = new WMSCapabilities();

// Fetch sample WMS Capabilities XML document and parse it into a JavaScript object
// 请求示例 WMS Capabilities XML 文档并将其解析为结构化 JavaScript 对象
fetch('data/ogcsample.xml')
  .then(function (response) {
    return response.text();
  })
  .then(function (text) {
    const result = parser.read(text);
    // Render formatted JSON in the pre container
    // 将格式化后的 JSON 字符串呈现在 DOM 容器中
    document.getElementById('log').innerText = JSON.stringify(result, null, 2);
  });
