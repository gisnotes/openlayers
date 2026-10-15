# OpenLayers 离屏画布（OffscreenCanvas）与多线程 Web Worker 渲染实战架构指南

> 在传统 WebGIS 架构中，所有图层渲染、投影计算、矢量瓦片（MVT PBF）反序列化和文本注记排版都运行在浏览器的**主线程（Main Thread）**上。当加载复杂矢量切片或高密度数据时，主线程 CPU 很容易被打满，导致页面滚动卡顿、按钮点击迟钝甚至掉帧白屏。
>
> 随着现代浏览器标准对 **`OffscreenCanvas`（离屏画布）** 与 **Transferable `ImageBitmap`（零拷贝显存转移）** 的完善支持，OpenLayers 实现了将繁重的渲染作业完全剥离到后台 **Web Worker** 子线程的革命性能力。本文基于 2 个官方核心前沿示例（`offscreen-canvas.html`、`tiled-layer-rendering-in-offscreen-canvas.html`），系统解构全图层委托与瓦片微任务多线程架构的底层原理与生产选型。

---

## 1. 架构总览：两种离屏多线程渲染范式

根据渲染粒度与生命周期的不同，OpenLayers 在 Web Worker 中的实践分为两大流派：

```mermaid
flowchart TD
    subgraph MainThread [主线程 (Main Thread / UI & Gesture)]
        UserGesture["用户缩放/平移手势<br/>(60-120 FPS 极速响应)"]
        TransformComp["仿射变换补偿器<br/>updateContainerTransform()"]
        DisplayCanvas["宿主画布 / DOM 容器"]
    end

    subgraph Mode1 [范式一：全幅委托架构 (offscreen-canvas)]
        WorkerFull["Worker 全图渲染器"]
        HeadlessMVT["Mapbox 矢量瓦片引擎<br/>MVT 解码 + 样式排版"]
        OffCanvasFull["OffscreenCanvas (全屏尺寸)"]
    end

    subgraph Mode2 [范式二：瓦片级微任务架构 (tiled-layer)]
        TileLoader["ImageTileSource.loader"]
        WorkerPool["Worker 瓦片烘焙池"]
        OffCanvasTile["OffscreenCanvas (512×512)"]
    end

    UserGesture -->|同步状态| TransformComp
    TransformComp --> DisplayCanvas

    UserGesture -.->|postMessage 异步帧状态| WorkerFull
    WorkerFull --> HeadlessMVT --> OffCanvasFull
    OffCanvasFull -->|ImageBitmap 零拷贝传输| DisplayCanvas

    TileLoader -.->|请求单个切片 [z,x,y]| WorkerPool
    WorkerPool --> OffCanvasTile
    OffCanvasTile -->|ImageBitmap| TileLoader --> DisplayCanvas
```

### 1.1 两种离屏方案综合特征对比

| 维度 / 模式 | 范式一：全幅图层委托架构 | 范式二：瓦片级微任务架构 |
| :--- | :--- | :--- |
| **典型示例** | `offscreen-canvas.html` | `tiled-layer-rendering-in-offscreen-canvas.html` |
| **Worker 内部对象** | 无头图层组、TileQueue、MVT 解析器 | 完整的无头 `ol/Map` 与独立 `View` |
| **画布规格** | 随视口动态调整（如 1920×1080） | 固定切片网格规格（如 512×512） |
| **手势延迟补偿** | **必需**：通过 CSS Transform 补偿时空差 | **天然免除**：由主线程标准 TileLayer 自动无缝拼接 |
| **要素拾取 (Hit Detect)** | 需通过 `postMessage` 异步委托 Worker 拾取 | 无法直接拾取（切片已完全栅格化） |
| **工程复杂度** | 极高（涉及样式同步、雪碧图传递、字体替换） | 较低（结构清晰，极易扩展为多 Worker 线程池） |
| **最适业务场景** | 超复杂 Mapbox 矢量切片底图（MVT）流畅运行 | 自定义栅格瓦片滤镜、离线切片预烘焙、大量切片并行加载 |

---

## 2. 全幅图层委托与时空仿射补偿机制（`offscreen-canvas.html`）

在 `offscreen-canvas.html` 中，主线程与 Worker 之间存在典型的“交互快、渲染慢”异步时空差。

### 2.1 仿射矩阵几何补偿（Anti-Jitter Transform）
当用户拖拽地图时，主线程立刻获得最新的 `mainThreadFrameState`，而 Worker 可能还在渲染 16ms 之前的 `workerFrameState`。若直接将 Worker 传回的图像贴在屏幕上，会出现严重的画面拉扯和抖动。

示例在主线程构建了 `updateContainerTransform()`：
```javascript
function updateContainerTransform() {
  if (workerFrameState) {
    const viewState = mainThreadFrameState.viewState;
    const renderedViewState = workerFrameState.viewState;
    const dx = renderedViewState.center[0] - viewState.center[0];
    const dy = renderedViewState.center[1] - viewState.center[1];
    
    // 逆向计算主线程与 Worker 渲染帧的旋转、缩放与位移偏差
    compose(
      transform,
      (Math.cos(rotation) * dx + Math.sin(rotation) * dy) / resolution,
      (Math.sin(rotation) * dx - Math.cos(rotation) * dy) / resolution,
      renderedResolution / resolution,
      renderedResolution / resolution,
      rotation - renderedRotation,
      0, 0
    );
    transformContainer.style.transform = toTransformString(transform);
  }
}
```
通过该矩阵变换，主线程将上一个旧帧作为临时纹理拉伸对齐，新帧送达后瞬间替换，保证了 60FPS 视觉平滑无缝。

### 2.2 雪碧图显存零拷贝转移（Transferable ImageBitmap）
Worker 无法直接通过 DOM 加载外部图像，主线程通过 `new Image()` 下载雪碧图后，将其转换为 `ImageBitmap`，并通过 Transferable 对象所有权转移给 Worker：
```javascript
createImageBitmap(image, 0, 0, image.width, image.height).then((imageBitmap) => {
  worker.postMessage(
    { action: 'imageLoaded', image: imageBitmap, src: msg.src },
    [imageBitmap] // 第二个参数传入转移列表，瞬间转移显存句柄
  );
});
```

---

## 3. 瓦片级微任务架构与无头地图（`tiled-layer-rendering-in-offscreen-canvas.html`）

瓦片级模式将主线程与子线程的关系精简到极致：

### 3.1 自定义 Tile Loader 与任务队列
```javascript
new ImageTileSource({
  tileSize: 512,
  loader: (z, x, y) => {
    return new Promise((resolve) => {
      // 注册单次响应回调
      const handleMessage = ({ data: { action, imageData } }) => {
        if (action !== 'rendered') return;
        worker.removeEventListener('message', handleMessage);
        resolve(imageData); // resolve ImageBitmap，直接渲染为瓦片
      };
      worker.addEventListener('message', handleMessage);
      worker.postMessage({ action: 'render', tile: [z, x, y] });
    });
  },
});
```

### 3.2 Worker 内部的无头微地图烘焙
Worker 内部创建了挂载在 `new OffscreenCanvas(512, 512)` 上的无头 `Map`：
```javascript
worker.addEventListener('message', async ({ data: { action, tile } }) => {
  if (action !== 'render') return;
  // 动态将视图精准对齐到切片包围盒
  map.setView(new View({
    center: tileGrid.getTileCoordCenter(tile),
    resolution: tileGrid.getResolution(tile[0]),
  }));
  map.once('rendercomplete', () => {
    const imageData = canvas.transferToImageBitmap();
    worker.postMessage({ action: 'rendered', imageData }, [imageData]);
  });
});
```

---

## 4. 跨线程空间要素拾取（Cross-Thread Hit Detection）

在全幅 Worker 模式中，DOM 命中检测（`map.forEachFeatureAtPixel`）无法直接跨线程访问要素。系统采用了异步通信代理通道：
1. **主线程捕获**：
   ```javascript
   map.on('pointermove', (evt) => {
     if (evt.dragging) return;
     worker.postMessage({ action: 'requestFeatures', pixel: evt.pixel });
   });
   ```
2. **Worker 拾取并序列化属性**：
   ```javascript
   const observables = layersInView.map((l) => l.getFeatures(event.data.pixel));
   Promise.all(observables).then((res) => {
     const features = res.flat();
     worker.postMessage({
       action: 'getFeatures',
       features: features.map((e) => e.getProperties()), // 仅序列化业务属性
     });
   });
   ```

---

## 5. 生产级工程踩坑与避坑指南

### 5.1 字体环境与缺失替代（Font Fallback）
- **陷阱**：Mapbox 样式表通常指定 `Noto Sans Regular` 或 `Roboto`。Web Worker 内部既没有 `document.fonts` 也没有浏览器的 DOM 字体渲染树。若未进行拦截，文本渲染将失败或崩溃。
- **解决方案**：在 Worker 中配置 `getFont()` 函数，强制将复杂网络字体映射到标准通用字体族：
  ```javascript
  function getFont(font) {
    return font[0].replace('Noto Sans', 'serif').replace('Roboto', 'sans-serif');
  }
  ```

### 5.2 并发与丢帧锁（Rendering Mutex）
主线程的 `postMessage` 是异步非阻塞的。如果在 `rendering = true` 期间持续向 Worker 发送新的 `render` 帧，Worker 消息队列堆积会引发几十帧的恶性延迟。必须设置渲染互斥锁：
```javascript
if (!rendering) {
  rendering = true;
  worker.postMessage({ action: 'render', ... });
} else {
  frameState.animate = true; // 保持主线程动画循环，等待完成后立即补发
}
```

### 5.3 跨域（CORS）与 Transferable 显存防暴涨
- `ImageBitmap` 转移具有**破坏性**（调用 `transferToImageBitmap()` 后原画布内容被清空并重置）。
- 确保所有瓦片和字体资源允许跨域访问（`Access-Control-Allow-Origin: *`），否则 `createImageBitmap()` 会抛出安全上下文受限异常。
