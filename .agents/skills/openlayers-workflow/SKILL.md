---
name: openlayers-workflow
description: >-
  OpenLayers 文档汉化、示例翻译、专题总结（Summary）编写、站点构建与 GitHub Pages 秒级增量部署全流程标准规范。
  当用户要求：翻译 OpenLayers 示例或页面、更新技术总结文档（如 Style/Interaction 指南）、构建网站、
  排查中文乱码、修改菜单导航、或将项目发布推送到 GitHub Pages (gisnotes.github.io/openlayers) 时使用此技能。
  【开发节奏与元数据规范】：日常翻译阶段聚焦内容本身，严禁擅自自动执行全量构建与部署（必须等用户明确提示）；严禁在示例中自行追加或总结 tags，必须保持原始 tags 不变。
---

# OpenLayers 中文翻译、专题总结与站点发布工作流指南

本技能提炼了当前项目（OpenLayers 中文汉化与 GitHub Pages 发布）的核心工程规范、编译流程、避坑准则、极速提速策略与自动化发布脚本。

---

## 一、 项目背景与工程架构

- **源码分支**：`zhcn`（当前工作分支，追踪所有汉化源码、注释、总结文档与配置）
- **发布分支**：`gh-pages`（纯静态构建产物，对应线上部署分支）
- **线上发布地址**：`https://gisnotes.github.io/openlayers/`
- **Node.js 环境**：Windows 机器上优先通过 NVM 切换或前置 Node v24 运行环境：
  ```powershell
  $env:Path = "C:\Users\Lenovo\AppData\Roaming\nvm\v24.13.0;" + $env:Path;
  ```

### 关键目录与文件职责
```text
openlayers/
├── examples/                    # 示例源码目录（*.html, *.js, *.css）
│   ├── templates/example.html   # 单个示例的基础 HTML 模板（包含顶部导航栏）
│   └── index.html               # 示例总索引列表页（包含顶部导航栏）
├── site/
│   ├── layouts/default.hbs      # 站点全局默认 Handlebars 模板（主站顶部导航栏）
│   ├── src/                     # Metalsmith 站点编译源目录
│   │   ├── summary/index.hbs    # 二级页面：技术专题总结卡片列表（/summary/）
│   │   └── ...                  # 首页、下载页、文档页等
│   ├── summary/                 # 三级页面源 Markdown（如 openlayers-style-guide.md）
│   │   └── *.md                 # 专题指南 Markdown 底稿（单一真实数据源）
│   └── build.js                 # 站点编译脚本（自动挂载 site/summary/*.md 并输出 HTML）
├── tasks/
│   └── prepare-gh-pages.js      # 静态产物组织与 GitHub Pages 路径重写脚本
├── build/
│   ├── examples/                # npm run build-examples 输出目录
│   ├── site-dist/               # 本地预览分发目录（通过 prepare-gh-pages.js --local）
│   └── gh-pages-dist/           # GitHub Pages 发布分发目录（带 /openlayers 前缀）
└── .agents/skills/openlayers-workflow/
    ├── SKILL.md                 # 本规范说明文件
    └── scripts/deploy-gh-pages.js  # 秒级增量推送 gh-pages 脚本
```

---

## 二、 极速开发节奏与提速准则（核心工作流规范）

为了避免每次修改单个文件都需要漫长等待全量编译与检查，所有协助开发必须严格遵守以下提速与触发准则：

### 1. 零构建原则（0 Build）：日常翻译阶段绝对不执行 build
- **无需 build 即可本地实时生效**：
  - 本地预览开发推荐运行：`npm run serve-examples`（或 `npm start`，访问 `http://localhost:5173/`）。
  - **运作原理**：该命令启动的是 Vite 开发热服务器，内部通过 `examples/config/example-builder.js` 中间件动态解析 Handlebars 模板并监听 `examples/` 目录；当 Agent 修改保存 `.html` 或 `.js` 文件时，服务器自动清理缓存并通过 HMR（热模块替换）在浏览器端**毫秒级实时刷新**。
  - **在开发服务器模式下，完全不需要执行任何 build 命令即可实时预览**！
- **严禁擅自执行构建与部署**：
  - Agent 在日常翻译或修改单个示例时，**绝对禁止自行执行 `npm run build-examples`、`prepare-gh-pages.js` 或任何打包部署命令**；
  - 只有当用户明确指示（例如“全部翻译完成，开始构建部署”、“发版”、“推送到线上”等），才统一执行全量构建与秒级增量部署。

### 2. 避免耗时操作的极速策略表

| 操作维度 | 慢速做法（日常严禁） | 推荐极速做法（秒级响应） |
| :--- | :--- | :--- |
| **本地效果预览** | 每次修改都跑 `npm run build-examples` + 静态预览（每次等 16 秒+） | 运行 `npm run serve-examples`（访问 `localhost:5173`），**无需 build，保存文件毫秒级热刷新** |
| **代码语法检查** | 每次跑全量 `npm run lint`（耗时 20 秒+） | 定向检查单个文件：`npx eslint examples/<name>.js`（**耗时 < 1 秒**） |
| **代码提交与部署** | 改一个文件就 commit/push/deploy 一次（容易打断思路且耗时） | **连续批量翻译**，全过程不 build、不 commit，全部完成后由用户手动指示统一发版 |


---

## 三、 翻译与文档规范（避坑核心准则）

### 1. 严格防止中文乱码（编码红线）
- **严禁使用 PowerShell 管道重定向（`>` 或 `>>`）** 以及未指定 UTF-8 的 `Set-Content` / `Get-Content` 读写中文文件。Windows 默认采用 GBK（代码页 936），会导致多字节 UTF-8 中文乱码。
- **文件读写方式**：
  - 必须使用 Antigravity 的 `replace_file_content` / `write_to_file` 工具；
  - 或通过 Node.js 原生脚本执行：`fs.readFileSync(file, 'utf8')` / `fs.writeFileSync(file, content, 'utf8')`。

### 2. 标签保持原貌红线（严禁自行添加或总结 tags）
- **保持原始 tags 绝对不变**：示例 HTML 顶部的 YAML frontmatter 中，`tags:` 字段定义了示例索引的分类徽章与筛选器标签（如 `tags: "cog, projection, proj4js, maptiler"`）。
- **严禁追加中文标签或额外词汇**：不要自行总结添加任何中文或未在原版中存在的 tag（如追加 `英国国家格网, 遥感` 等）。多余的 tags 会生成孤立无用的分类标签，破坏站点统一的筛选索引。

### 3. 超链接与相对路径规范
- **禁止在专题文档中使用线上绝对域名**：不要硬编码 `https://gisnotes.github.io/openlayers/...`。
- **统一使用相对路径**：
  - 在三级页面 `site/summary/openlayers-style-guide.md` 中引用示例：
    - 表格内标识：``[`icon`](../en/latest/examples/icon.html)``
    - 文末附录列表：`1. [icon](../en/latest/examples/icon.html)`
  - 相对路径优势：保证本地静态调试（`localhost:3000`）与 GitHub Pages 线上（`/openlayers/`）均能无缝正确跳转，无需做二次字符串替换。

### 4. 专业词汇翻译规范（红线要求）
- **Raster 术语红线**：`Raster` 必须统一严格翻译为“**栅格**”（**严禁翻译为“光栅”**！例如：`RasterSource` 栅格数据源、`Raster Layer` 栅格图层、`Raster Operation` 栅格像素运算、`Raster Tiles` 栅格切片）。
- **GIS 专用术语标准**：
  - `Vector` 矢量、`Feature` 要素、`Extent` 范围/包络、`Cluster` 聚类/聚合、`Projection` 投影、`Style Function` 动态样式函数、`Declutter` 避让/整理、`Hit Detection` 拾取碰撞检测。
  - 保留英文类名与 API 原貌（如 `ol/style/Icon`、`CircleStyle`、`toContext`、`WebGLTile`、`RasterSource`）。

### 5. YAML Frontmatter 与 Markdown 排版规范（防止正文字体异常变大）
- **标量语法红线（`docs: |` vs `docs: >`）**：
  - 示例 HTML 中包含学习记录、代码块（```` ```javascript ````）、多级标题（`###`、`####`）或多段落时，YAML frontmatter 的 `docs:` **必须使用字面标量 `docs: |`**，**严禁使用折叠标量 `docs: >`**！
  - **根因警示**：YAML 折叠标量 `>` 会吞噬合并相邻空行。如果使用 `docs: >`，正文段落与下方的 `---` 会被拼成一行 `正文\n---`，触发 CommonMark 的 Setext 二级标题语法，导致整段正文渲染为超大号标题字体；同时代码块首行也会被拼接破坏。
  - 示例文档引言部分统一规范：
    ```yaml
    docs: |
      <p>English description...</p>

      <p>中文说明段落...</p>

      ---

      ### 📚 学习记录与技术深度解读 (Learning Notes)
    ```
- **标量与标题间距**：各级标题（`###`、`####`）与正文、代码块之间必须保留标准独立空行。
- **YAML 冒号转义**：如果 `title:` 或 `shortdesc:` 的内容包含英文半角冒号加空格（`: `），必须整体用双引号包裹（例如：`shortdesc: "Render street names. / 使用 placement: 'line' 沿道路渲染。"`），防止 YAML 解析器误认为是嵌套键值对报错。
- **CommonMark 解析规范**：列表项加粗标志 `**` 避免直接贴紧中文全角冒号 `：`（如 ``**`name`**：`` 在某些解析器下会导致加粗失效）。推荐使用直接的链接格式：`1. [name](url)`。

### 6. 表格边框与排版规范
- **内容表格完整边框**：站点三级专题指南（`site/summary/*.md`）以及示例正文（`#docs`）中的所有内容表格，必须展示完整清晰的细边框（`border: 1px solid #d0d7de`，表头具有浅灰底色 `var(--ol-accent-background-color, #f6f8fa)` 与加粗下底线）。
- **表单布局表格隔离**：示例操作区中的控件表单表格（如 `<table class="controls">`）保持无边框，避免被内容表格样式污染。

### 7. 数学公式排版规范（LaTeX / KaTeX 全局支持）
- **双端环境支持**：示例单页模板（`examples/templates/example.html`）与站点全局模板（`site/layouts/default.hbs`）均已完整集成 KaTeX 渲染引擎。
- **书写规范**：
  - 行内公式：使用 `$ ... $` 或 `\( ... \)` 包裹，例如：`$X \in [-20037508.34, 20037508.34]$`、`$1/4$`、`$3/4$`；
  - 块级独立公式：使用 `$$ ... $$` 或 `\[ ... \]` 包裹，例如：
    ```latex
    $$Q_i = \frac{3}{4}P_i + \frac{1}{4}P_{i+1}$$
    ```
  - KaTeX 自动忽略 `code` 和 `pre` 标签，代码块中的 `$` 变量符号不受干扰。

### 8. Bootstrap 5 版本兼容与 Summary 卡片排版规范（防止文字空白与标题栏溢出）
- **Bootstrap 5.2 版本约束**：
  - 全站（站点模板与全部示例）统一基线为 Bootstrap 5.2.0。Bootstrap 5.2 原生**不存在** Bootstrap 5.3+ 的 `bg-*-subtle` 与 `text-*-emphasis` 类名。
- **文字空白隐形根因与防范**：
  - 在 `.badge` 中若误用未定义的 `text-*-emphasis`，会导致文字颜色回退至 `.badge` 默认的 `#fff`（纯白文字），若同时使用未定义的 `bg-*-subtle`（无背景色，透出卡片纯白底色），就会直接产生“白底白字”的文字看似空白看不见的 Bug。
  - **防范机制**：已在 `site/src/theme/site.css` 中完整 Polyfill 了全部 `bg-*-subtle`、`text-*-emphasis` 色值及兜底安全着色 `.badge[class*="-subtle"] { color: var(--ol-foreground-color); }`，保证文字永远具备高对比度可视性。
- **卡片顶部标题栏防溢出（Flex 自动换行规范）**：
  - 卡片顶部徽章容器统一使用 `<div class="summary-card-badges d-flex flex-wrap align-items-center mb-3">`。
  - **严禁**使用未声明 `flex-wrap` 的 `d-flex align-items-center` 硬塞 3 个以上带有较长中文标题或英文长模块名的徽章（卡片在 3 列栅格下可用内容宽度仅约 324px，3 个徽章不换行必定顶破右边界）。
  - `summary-card-badges` 已内置 `flex-wrap: wrap`、`gap: 0.35rem`、`margin-right: 0 !important` 与 `font-size: 0.75rem`，长标题徽章会自动平滑折行到底部，紧凑且绝对不溢出卡片。

### 9. Mermaid 流程图与架构图渲染与排版规范（防止无法渲染与语法崩溃）
- **全局原生渲染支持（严禁在 Markdown 头部注入冗余 head 脚本）**：
  - 站点全局模板（`site/layouts/default.hbs`）和示例单页模板（`examples/templates/example.html`）已在底层全量集成了 Mermaid 10 引擎及 DOM 自动装配逻辑（自动探测 `<pre><code class="language-mermaid">`，解除 Prism 代码块包裹并无缝替换为 `<div class="mermaid">` 执行 `mermaid.run()`）。
  - **红线要求**：在编写任何 `site/summary/*.md` 专题指南时，**严禁在 YAML frontmatter 中手动注入 `head: - '<script ...mermaid...>'` 冗余内嵌脚本**！Frontmatter 保持纯粹清爽的元数据即可：
    ```yaml
    ---
    title: OpenLayers XXX 体系全景实战指南
    layout: default.hbs
    ---
    ```
- **四大语法转义与双引号包裹铁律（杜绝 Mermaid 语法解析崩溃 / Parse error: got 'PS'）**：
  1. **节点文案双引号包裹**：
     - 在 `flowchart`、`graph`、`stateDiagram-v2` 等图表中，只要节点文案包含**中文、半角圆括号 `()`、方括号 `[]`、冒号 `:`、斜杠 `/`、加号 `+`、逗号 `,`、尖括号 `<>` 或空格**，**必须整体用英文双引号 `["..."]` 包裹**！
     - 常见正确范式：
       - 矩形节点：`UseImage["选用 ImageArcGISRest (单图视口出图)"]`、`DrawInt["Draw 交互: 生成多边形"]`
       - 菱形判断：`ActiveMode{"当前激活模式"}`、`HasCache{"服务端是否已生成静态切片缓存?"}`
       - 圆角/药丸节点：`Start(["ArcGIS MapServer 接入需求"])`
       - 圆柱体数据库节点：`Source[("VectorSource 数据源")]`
       - 复合说明节点：`HighPerf["优先采用 XYZ / ImageTile + WebGLTile"]`
  2. **子图标题（`subgraph`）必须使用双引号中括号**：
     - **极高频崩溃点**：Mermaid 语法中 `subgraph ID [Label (with parens)]` 的括号会被词法分析器误认为起始标记（PS 异常），导致整图崩溃！
     - **规范**：只要子图显示名带有括号、斜杠或中文，**必须**写为：`subgraph SubgraphId ["子图中文名称 (English / Detail)"]`。
     - ❌ `subgraph Mode1 [模式一：ol/layer/Vector (实时矢量渲染)]`（致命语法错误）
     - ✅ `subgraph Mode1 ["模式一：ol/layer/Vector (实时矢量渲染)"]`（正确）
  3. **连接线/边标签（Edge Label `|...|`）必须双引号包裹**：
     - 只要边标签文字包含**圆括号 `()`、方括号 `[]`、冒号 `:`、斜杠 `/`、反引号、大于/小于号**，必须写成 `-->|"说明文本 (包含括号)"|`。
     - ❌ `-->|HTTP 传输 (宽带占用高)|` 或 `-.->|popstate (前进/后退)|`（致命语法错误）
     - ✅ `-->|"HTTP 传输 (宽带占用高)"|` 或 `-.->|"popstate (前进/后退)"|`（正确）
  4. **状态图（`stateDiagram-v2`）状态转移标签规范**：
     - 在状态图的转移线上，如 `StateA --> StateB: 转移描述`，**描述文案中严禁出现第二个冒号 `:`**，否则解析器会将其错误识别为双重状态转移；文案中如需说明格式，请使用中文括号或短横线代替英文冒号。
     - 状态转移线上严禁插入 HTML 换行标签 `<br/>`，如需多行请拆分状态或转移路径。
- **响应式排版自适应**：
  - 全局样式（`site/src/theme/site.css`）已为 `.mermaid` 容器内置了 `overflow-x: auto;`、中英文居中、主题自适应灰底及细边框。对于复杂大图，在移动端与较小视口下会自动出现水平平滑滑动条，绝不顶破主容器布局。

---

## 四、 Summary 专题体系与页面联动

项目现已支持三级页面架构：
1. **顶部一级菜单**：`Docs -> Summary`（带 `<i class="fa fa-clipboard-list"></i>` 图标）。
   - 维护在 4 处模板中：
     - `site/layouts/default.hbs`
     - `examples/templates/example.html`
     - `examples/index.html`
     - `config/jsdoc/api/template/tmpl/layout.tmpl`
2. **二级页面（Technical Summaries 汇总）**：[`site/src/summary/index.hbs`](file:///d:/Users/Downloads/openlayers/site/src/summary/index.hbs)
   - 路由：`/summary/`
   - 展示各大专题技术卡片（如 Style、Interaction 等）。
3. **三级页面（技术专题指南）**：[`site/summary/*.md`](file:///d:/Users/Downloads/openlayers/site/summary/)
   - Markdown 原文保存在 `site/summary/`，不要在 `site/src/summary/` 下保留多余的 `.md` 文件。
   - `site/build.js` 会在编译时自动临时拷贝 `site/summary/*.md` 到 `site/src/summary/`，编译生成 HTML 到 `site/build/summary/*.html` 后自动清理临时文件，保持工作区绝对干净。
4. **自动写作润色（强制联动 `humanizer-zh` 技能）**：
   - 在生成、编写或更新任何技术专题总结（`site/summary/*.md`）时，**必须自动加载并严格遵循 [`.agents/skills/humanizer-zh/SKILL.md`](../humanizer-zh/SKILL.md) 规范**。
   - 彻底去除“起跑式铺垫”（如“让我们深入看看...”）、“伪深度格言”、“意义拔高”（如“标志着全新时代的到来”）和 AI 模板化套话（如“赋能、闭环、至关重要”）。
   - 坚持工程师视角、直入主题、语言通透自然；完整保护代码块、参数类型、数据表格与相对链接。

---

## 五、 标准构建与验证命令（仅在用户提示构建时执行）

执行任何构建前，先确保环境变量包含 Node v24：
```powershell
$env:Path = "C:\Users\Lenovo\AppData\Roaming\nvm\v24.13.0;" + $env:Path;
```

### 1. 修改示例代码/翻译时
```powershell
# 仅重新打包全部示例（耗时约 14~16 秒）
npm run build-examples
```

### 2. 修改网站页面、模板或 Summary 文档时
```powershell
# 仅编译站点页面（耗时约 3~5 秒）
npm run build-site
```

### 3. 组织分发产物与 jsDelivr CDN 加速（必跑）
```powershell
# 同时生成 GitHub Pages 发布产物 (build/gh-pages-dist) 与本地预览产物 (build/site-dist)
node tasks/prepare-gh-pages.js; node tasks/prepare-gh-pages.js --local
```

- **双模自动化机制**：
  - **本地开发与本地预览（`--local`）**：产物 `build/site-dist` 严格保持本地相对路径（`data/...`），完全离线零依赖，开箱即测；
  - **线上发布 GitHub Pages（默认）**：产物 `build/gh-pages-dist` 会自动将所有示例引用的 `data/...` 静态资源重写为 jsDelivr 高速 CDN 链接（`https://cdn.jsdelivr.net/gh/gisnotes/openlayers@gh-pages/examples/data/...`）。享受全球 Anycast CDN 节点加速、原生 CORS 跨域许可以及自动 Gzip/Brotli 高压缩率（如 5.4MB 大体积 GeoJSON 压缩至 916KB 直出），彻底消除国内直连 GitHub Pages 静态数据卡顿的痛点。

### 4. 本地启动服务预览
```powershell
npx vite preview --outDir build/site-dist --port 3000
```

---

## 六、 双分支提交与秒级增量部署（仅在用户提示发布时执行）

### 步骤 1：提交源码到 `zhcn` 分支
```powershell
git add <修改的文件>
git commit -m "docs: 详细中文描述"
git push origin zhcn
```

### 步骤 2：秒级增量推送到 GitHub Pages（`gh-pages` 分支）
> **注意**：切勿在 `build/gh-pages-dist` 内部执行全量 `git init` + `git push -f`，这会导致重新上传 100MB+ 全量静态文件（极其缓慢且易网络超时）。

直接运行专用的秒级增量部署脚本：
```powershell
$env:Path = "C:\Users\Lenovo\AppData\Roaming\nvm\v24.13.0;" + $env:Path;
node .agents/skills/openlayers-workflow/scripts/deploy-gh-pages.js "本次发布的简要说明"
```

该脚本的自动化逻辑：
1. 自动执行 `git fetch origin gh-pages` 获取远程最新提交树；
2. 利用主仓库的 Object Store 创建增量索引文件；
3. 执行 `git commit-tree` 仅基于变动的增量生成 Commit 对象；
4. 几秒钟内完成向远程 `origin/gh-pages` 的增量推送，省时 90% 以上。

---

## 七、 常见问题与自查手册

| 现象 / 报错 | 根本原因 | 解决方案 |
| :--- | :--- | :--- |
| Markdown 中文变成乱码 | 使用了 Windows 默认 GBK 编码重定向或保存 | 使用 Node.js 原生以 UTF-8 读取或用 Antigravity 工具从原版恢复 |
| 示例标签出现多余中文分类 | 翻译时自行给 frontmatter 的 `tags:` 追加了中文 | 保持原始英文 `tags:` 不变，禁止自行总结标签 |
| 列表加粗未渲染出效果 | `**` 与全角冒号 `：` 直接紧贴 | 将格式转为标准 `1. [name](url)` 超链接列表 |
| 二级页面打不开三级页面 | 金属匠构建未包含 `site/summary/*.md` | 检查 `site/build.js` 是否已包含 `copySummaryFiles()` 逻辑，并执行 `npm run build-site` |
| GitHub Pages 访问样式丢失或 404 | 静态文件链接未带 `/openlayers/` 前缀 | 运行 `node tasks/prepare-gh-pages.js`，该脚本会自动完成根路径补全 |
| gh-pages 推送卡住几分钟 | 全量空仓库重新上传 2500+ 文件 | 采用 `deploy-gh-pages.js` 执行基于 `git commit-tree` 的增量推送 |
