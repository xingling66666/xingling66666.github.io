#### 王者自定义房间

#### 项目概述
王者自定义房间是一个用于生成王者荣耀自定义房间链接的 Web 应用。支持自定义英雄属性、兵线、防御塔等配置，并可通过链接分享给他人。

**关于运行环境与 API：**
- **纯前端运行**：本项目前端为纯静态资源，无需 Node.js 环境即可直接在浏览器中运行。
- **API 服务**：根目录下的 `nodejs代码.zip` 是配套的 Node.js 后端源码（对应 `js/services/api.js` 的下的 HERO_API 请求 API 源码）。它主要用于搭建英雄数据接口，以解决浏览器直接请求官方数据时的跨域（CORS）问题。

#### 技术架构
- **UI 框架**：MDUI2 (Material Design 3 UI 框架)
- **模块化**：ES Modules
- **状态管理**：函数式 + 单例模式
- **样式**：CSS3 + CSS 变量

#### 目录结构
```text
project/
├── index.html                    # 主页面（完整功能）
├── openGame.html                 # 打开游戏页面（轻量）
├── openInBrowser.html            # 引导浏览器打开页面（轻量）
├── hero-json-extractor.html      # 英雄数据提取工具页面（纯html）
├── 404.html                      # 404 错误页面（纯html）
├── debug.html                    # 调试/开发者工具页面（纯html）
├── sw.js                         # Service Worker
├── logo-200x200.png              # 网站图标
│
├── js/                           # JavaScript 源码
│   ├── app/                      # 主应用入口
│   │   └── main.js               # 应用主入口，协调初始化
│   │
│   ├── pages/                    # 轻量页面入口
│   │   ├── openGame.js           # openGame.html 入口
│   │   └── openInBrowser.js      # openInBrowser.html 入口
│   │
│   ├── ui/                       # UI 层
│   │   ├── uiManager.js          # UI 管理器（主应用专用）
│   │   └── components/           # UI 组件
│   │       └── dialog/           # 弹窗组件
│   │           └── index.js      # mdui 弹窗封装
│   │
│   ├── modules/                  # 功能模块（自包含）
│   │   ├── heroSelector/         # 英雄选择器
│   │   │   ├── index.js          # 模块入口
│   │   │   ├── state.js          # 状态管理
│   │   │   ├── core.js           # 核心逻辑
│   │   │   ├── renderer.js       # 渲染逻辑
│   │   │   ├── constants.js      # 常量定义
│   │   │   └── panel.js          # 面板初始化
│   │   │
│   │   ├── configSelector/       # 配置选择器
│   │   │   ├── index.js
│   │   │   ├── state.js
│   │   │   ├── core.js
│   │   │   ├── renderer.js
│   │   │   ├── advanced.js       # 高级设置
│   │   │   ├── constants.js
│   │   │   └── panel.js
│   │   │
│   │   ├── mapSelector/          # 地图选择器
│   │   │   ├── index.js
│   │   │   ├── state.js
│   │   │   ├── core.js
│   │   │   ├── renderer.js
│   │   │   └── panel.js
│   │   │
│   │   ├── themePicker/          # 主题选择器
│   │   │   ├── index.js
│   │   │   ├── state.js
│   │   │   ├── core.js
│   │   │   ├── renderer.js
│   │   │   ├── constants.js
│   │   │   └── panel.js
│   │   │
│   │   └── mainPanel/            # 主面板
│   │       ├── index.js
│   │       ├── state.js
│   │       ├── actions.js        # 按钮动作
│   │       ├── events.js         # 事件绑定
│   │       ├── copyRule.js       # 复制规则
│   │       ├── qrcode.js         # 二维码
│   │       └── panel.js
│   │
│   ├── core/                     # 核心业务逻辑
│   │   ├── linkBuilder.js        # 链接构建
│   │   └── mapModeChecker.js     # 地图模式检查
│   │
│   ├── services/                 # 服务层
│   │   ├── api.js                # API 请求
│   │   ├── storage.js            # 本地存储
│   │   └── clipboard.js          # 剪贴板
│   │
│   ├── data/                     # 数据层
│   │   ├── heroData.js           # 英雄数据
│   │   └── mapData.js            # 地图数据
│   │
│   ├── utils/                    # 工具函数
│   │   ├── config/               # 配置工具
│   │   │   ├── index.js
│   │   │   ├── constants.js      # ID 映射表
│   │   │   ├── converter.js      # 配置转换
│   │   │   ├── collector.js      # 配置收集
│   │   │   ├── parser.js         # 配置解析
│   │   │   ├── validator.js      # 配置验证
│   │   │   └── compressor.js     # 配置压缩
│   │   ├── dom.js                # DOM 工具
│   │   └── random.js             # 随机工具
│   │
│   └── config/                   # 全局配置
│       └── constants.js          # 全局常量
│
└── css/                          # 样式文件
    ├── main/                     # 主应用样式
    │   ├── index.css             # 样式入口
    │   ├── base.css              # 基础重置
    │   ├── layout.css            # 布局样式
    │   ├── components.css        # 组件样式
    │   ├── theme.css             # 主题样式
    │   └── responsive.css        # 响应式
    │
    └── pages/                    # 轻量页面样式
        ├── openGame.css
        └── openInBrowser.css
```

#### 文件职责说明

**入口文件**

- `js/app/main.js`：主应用入口
- `js/pages/openGame.js`：打开游戏页面
- `js/pages/openInBrowser.js`：引导浏览器页面

**单文件页面 (纯 HTML/CSS/JS)**

以下页面不依赖外部模块化 JS 文件，所有逻辑直接内嵌在 HTML 文件中：

- `404.html`：404 错误页面
- `debug.html`：调试/开发者工具页面
- `hero-json-extractor.html`：英雄数据提取工具页面

**模块层 (modules/)**

每个模块采用统一的架构：

- `index.js`：模块入口，导出公共 API
- `state.js`：状态管理（单例）
- `core.js`：纯函数核心逻辑
- `renderer.js`：UI 渲染逻辑
- `constants.js`：模块常量
- `panel.js`：面板初始化与事件绑定

**核心层 (core/)**

- `linkBuilder.js`：游戏链接生成、解析
- `mapModeChecker.js`：游戏地图模式可用性检查

**服务层 (services/)**

- `api.js`：HTTP 请求封装
- `storage.js`：localStorage 操作
- `clipboard.js`：剪贴板操作

**工具层 (utils/)**

- `config/`：自定义配置处理工具集
- `dom.js`：DOM 操作工具
- `random.js`：随机函数工具

**Service Worker**

- `sw.js`：**Service Worker** 脚本文件，负责处理离线缓存和网络请求拦截

#### 开发指南

**添加新模块**

1. 在 `js/modules/` 下创建模块目录
2. 按标准结构创建文件：`index.js`, `state.js`, `core.js`, `renderer.js`, `panel.js`
3. 在 `ui/uiManager.js` 中导入并初始化

**添加轻量页面**

1. 在根目录创建 HTML 文件
2. 在 `js/pages/` 创建对应的 JS 入口
3. 在 `css/pages/` 创建对应的样式文件

**代码规范**

- 模块内部使用 `export const` 导出纯函数
- 状态管理使用单例模式，通过 `getState()` / `setState()` 访问
- 组件采用工厂函数 `createXXXPanel()` 创建实例