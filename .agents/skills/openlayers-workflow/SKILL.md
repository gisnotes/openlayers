---
name: openlayers-workflow
description: >-
  OpenLayers 文档汉化、示例翻译、专题总结（Summary）编写、站点构建与 GitHub Pages 秒级增量部署全流程标准规范。
  当用户要求：翻译 OpenLayers 示例或页面、更新技术总结文档（如 Style/Interaction 指南）、构建网站、
  排查中文乱码、修改菜单导航、或将项目发布推送到 GitHub Pages (gisnotes.github.io/openlayers) 时使用此技能。
---

# OpenLayers 中文翻译、专题总结与站点发布工作流指南

本技能提炼了当前项目（OpenLayers 中文汉化与 GitHub Pages 发布）的核心工程规范、编译流程、避坑准则与自动化发布脚本。

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

## 二、 翻译与文档规范（避坑核心准则）

### 1. 严格防止中文乱码（编码红线）
- **严禁使用 PowerShell 管道重定向（`>` 或 `>>`）** 以及未指定 UTF-8 的 `Set-Content` / `Get-Content` 读写中文文件。Windows 默认采用 GBK（代码页 936），会导致多字节 UTF-8 中文乱码。
- **文件读写方式**：
  - 必须使用 Antigravity 的 `replace_file_content` / `write_to_file` 工具；
  - 或通过 Node.js 原生脚本执行：`fs.readFileSync(file, 'utf8')` / `fs.writeFileSync(file, content, 'utf8')`。

### 2. 超链接与相对路径规范
- **禁止在专题文档中使用线上绝对域名**：不要硬编码 `https://gisnotes.github.io/openlayers/...`。
- **统一使用相对路径**：
  - 在三级页面 `site/summary/openlayers-style-guide.md` 中引用示例：
    - 表格内标识：``[`icon`](../en/latest/examples/icon.html)``
    - 文末附录列表：`1. [icon](../en/latest/examples/icon.html)`
  - 相对路径优势：保证本地静态调试（`localhost:3000`）与 GitHub Pages 线上（`/openlayers/`）均能无缝正确跳转，无需做二次字符串替换。

### 3. Markdown 语法与排版避坑
- **CommonMark 解析规范**：列表项加粗标志 `**` 避免直接贴紧中文全角冒号 `：`（如 ``**`name`**：`` 在某些解析器下会导致加粗失效）。推荐使用直接的链接格式：`1. [name](url)`。
- **专业词汇标准**：
  - GIS 专用术语规范翻译（例如：`Vector` 矢量、`Feature` 要素、`Extent` 范围/包络、`Cluster` 聚类/聚合、`Projection` 投影、`Style Function` 动态样式函数）。
  - 保留英文类名与 API 原貌（如 `ol/style/Icon`、`CircleStyle`、`toContext`、`WebGLTile`）。

---

## 三、 Summary 专题体系与页面联动

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

## 四、 标准构建与验证命令

执行任何构建前，先确保环境变量包含 Node v24：
```powershell
$env:Path = "C:\Users\Lenovo\AppData\Roaming\nvm\v24.13.0;" + $env:Path;
```

### 1. 修改示例代码/翻译时
```powershell
# 仅重新打包全部示例（耗时约 14 秒）
npm run build-examples
```

### 2. 修改网站页面、模板或 Summary 文档时
```powershell
# 仅编译站点页面（耗时约 3~5 秒）
npm run build-site
```

### 3. 组织分发产物（必跑）
```powershell
# 同时生成 GitHub Pages 发布产物 (build/gh-pages-dist) 与本地预览产物 (build/site-dist)
node tasks/prepare-gh-pages.js; node tasks/prepare-gh-pages.js --local
```

### 4. 本地启动服务预览
```powershell
npx vite preview --outDir build/site-dist --port 3000
```

---

## 五、 双分支提交与秒级增量部署

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

## 六、 常见问题与自查手册

| 现象 / 报错 | 根本原因 | 解决方案 |
| :--- | :--- | :--- |
| Markdown 中文变成乱码 | 使用了 Windows 默认 GBK 编码重定向或保存 | 使用 Node.js 原生以 UTF-8 读取或用 Antigravity 工具从原版恢复 |
| 列表加粗未渲染出效果 | `**` 与全角冒号 `：` 直接紧贴 | 将格式转为标准 `1. [name](url)` 超链接列表 |
| 二级页面打不开三级页面 | 金属匠构建未包含 `site/summary/*.md` | 检查 `site/build.js` 是否已包含 `copySummaryFiles()` 逻辑，并执行 `npm run build-site` |
| GitHub Pages 访问样式丢失或 404 | 静态文件链接未带 `/openlayers/` 前缀 | 运行 `node tasks/prepare-gh-pages.js`，该脚本会自动完成根路径补全 |
| gh-pages 推送卡住几分钟 | 全量空仓库重新上传 2500+ 文件 | 采用 `deploy-gh-pages.js` 执行基于 `git commit-tree` 的增量推送 |
