# Agnes Easy Use

一个开箱即用的 Agnes AI 可视化创作工具，集成图片生成、视频生成和提示词优化能力。

本项目完全免费、开源、可自部署。你只需要填入自己的 Agnes API Key，就可以在网页里直接使用 Agnes 的图片、视频和文本能力，不需要自己手写接口请求。

> 如果这个项目帮你少折腾了一点，欢迎点一个 Star。它会让我知道这个小工具真的有人在用。

## 核心亮点

- 完全免费：项目代码免费开源，不收取任何额外服务费。
- 集成 Agnes：已接入 Agnes 图片、视频和文本模型接口。
- 可视化操作：用表单完成创作，不需要自己拼 API 参数。
- 本地保存 Key：API Key 存在浏览器本地，也支持服务端环境变量。
- 支持自部署：可以部署到自己的服务器、Vercel、Cloudflare Pages 或其他 Node/Nuxt 环境。
- 中英文界面：内置 i18n，多语言切换。
- 深浅色主题：支持浅色和深色模式。

## 已集成的 Agnes 功能

### 图片生成

支持 Agnes 图片模型：

- `agnes-image-2.0-flash`
- `agnes-image-2.1-flash`

已实现能力：

- 文生图
- 图生图
- 多图参考生成
- 图片尺寸选择
- 图片结果预览
- 图片下载
- 生成历史记录

### 视频生成

支持 Agnes 视频模型：

- `agnes-video-v2.0`

已实现能力：

- 文生视频
- 图生视频
- 多图视频
- 关键帧视频
- 视频比例选择
- 视频时长选择
- 负向提示词
- 任务状态轮询
- 视频预览和下载

### 提示词优化

支持 Agnes 文本模型：

- `agnes-2.0-flash`

已实现能力：

- 将简单描述优化成更适合 AI 绘图的提示词
- 自动补充风格、光影、构图、画质等描述
- 一键回填到图片生成输入框

## 免费说明

这个项目本身完全免费：

- 不卖会员
- 不收接口中转费
- 不限制本地部署
- 不绑定任何商业后台
- 不上传你的 API Key 到作者服务器

但需要注意：Agnes API 本身可能需要你自己的账号额度或 API Key。项目只是一个免费客户端，实际模型调用仍由 Agnes API 提供。

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/dmw-net/agnes_easyUse.git
cd agnes_easyUse/nuxt-app
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动开发服务

```bash
npm run dev
```

默认访问：

```text
http://localhost:3000
```

### 4. 配置 Agnes API Key

打开页面后进入“设置”页面，填入你的 Agnes API Key。

也可以通过环境变量配置：

```bash
AGNES_API_KEY=your_agnes_api_key
```

## 项目结构

```text
.
├── nuxt-app/                         # Nuxt 3 主应用
│   ├── pages/                        # 页面
│   │   ├── create.vue                # 图片/视频创作页
│   │   ├── settings.vue              # API Key 设置页
│   │   └── video.vue                 # 视频生成页
│   ├── server/api/                   # Agnes API 服务端代理
│   │   ├── generate/image.post.ts    # 图片生成
│   │   ├── generate/video.post.ts    # 视频生成
│   │   ├── optimize-prompt.post.ts   # 提示词优化
│   │   └── video/status.get.ts       # 视频状态查询
│   ├── locales/                      # 中英文语言包
│   └── package.json
├── Agnes 2.0 Flash.md                # Agnes 文本模型接口文档
├── Agnes Image 2.0 Flash.md          # Agnes 图片模型接口文档
├── Agnes Image 2.1 Flash.md          # Agnes 图片模型接口文档
├── Agnes Video V2.0.md               # Agnes 视频模型接口文档
└── README.md
```

## 部署

这是一个 Nuxt 3 项目，可以部署到支持 Node.js 的平台。

常用命令：

```bash
cd nuxt-app
npm run build
npm run preview
```

如果部署到云平台，建议配置环境变量：

```text
AGNES_API_KEY=your_agnes_api_key
```

当然，也可以不配置环境变量，让用户在前端设置页自行填写 API Key。

## 安全提示

- 如果是个人本地使用，可以直接在设置页填写 API Key。
- 如果是公开部署给多人使用，建议用服务端环境变量配置 API Key。
- 不建议把真实 API Key 写死在代码里。
- 不要把 `.env` 文件提交到仓库。

## 求一个 Star

如果你觉得这个项目有用，欢迎顺手点个 Star：

[GitHub: dmw-net/agnes_easyUse](https://github.com/dmw-net/agnes_easyUse)

Star 不花钱，但对开源项目非常有帮助：

- 让更多人看到这个工具
- 给作者一点继续维护的动力
- 也方便你以后回来找到项目

## 赞赏支持

项目完全免费。如果它帮你节省了时间，或者你希望我继续维护、适配更多 Agnes 能力，可以随缘赞赏。

赞赏码图片请放到下面两个路径：

```text
docs/sponsor-wechat.png
docs/sponsor-alipay.png
```

当前仓库暂未附带真实收款码，避免误导或显示失效图片。添加图片后，可以把下面这段取消注释：

```html
<p align="center">
  <img src="docs/sponsor-wechat.png" alt="微信赞赏码" width="220" />
  <img src="docs/sponsor-alipay.png" alt="支付宝赞赏码" width="220" />
</p>
```

没有赞赏也完全没关系，点个 Star 就已经很够意思了。

## 技术栈

- Nuxt 3
- Vue 3
- TypeScript
- Tailwind CSS
- Agnes API

## 许可证

MIT License
