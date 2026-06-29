# AI Genesis - AI图片视频生成平台

> 纯前端 + Serverless 架构，可部署到 Cloudflare Pages

## 项目简介

AI Genesis 是一个集成 AI 图片生成、视频生成和提示词优化功能的现代化 Web 平台。采用纯前端架构，无需后端服务器，可直接部署到 Cloudflare Pages。

## 设计还原说明

本实现严格还原设计稿的以下视觉细节：

### 配色方案
- **主背景**: `#030014` (极深紫黑色)
- **主渐变**: `#2EA7FF → #9381FF` (青蓝 → 紫蓝)
- **次渐变**: `#9381FF → #13DDC4` (紫蓝 → 青绿)
- **主文本**: `#FFFFFF`
- **次文本**: `#A0A0B0`
- **卡片背景**: `rgba(255, 255, 255, 0.02)` (玻璃拟态)

### 布局间距
- **页面宽度**: 1440px
- **内容宽度**: 1280px
- **板块间距**: 上下 120px，左右 80px
- **卡片间距**: 32px (网格), 80px (垂直)

### 圆角规范
- **按钮**: 99px (胶囊形)
- **卡片**: 20px
- **FAQ项目**: 12px
- **占位符**: 12px

### 字体规范
- **大标题**: Inter Tight Bold, 96px / 80px
- **区块标题**: Inter SemiBold, 40px
- **子标题**: Inter Regular, 20px
- **正文**: Inter Regular, 16px
- **小字**: Inter Regular, 14px / 12px

### 特效
- **Hero背景**: 径向渐变 (极光效果)
- **玻璃拟态**: `backdrop-filter: blur(50px)`
- **悬停效果**: 位移 + 阴影 + 边框变色

## 文件结构

```
ai-gensis/
├── index.html          # 主页面
├── style.css           # 样式表 (严格还原设计稿)
├── app.js              # 交互脚本
└── README.md           # 项目文档
```

## 本地开发

### 方法一：直接打开
双击 `index.html` 在浏览器中打开。

### 方法二：本地服务器 (推荐)
```bash
# 使用 Python
python -m http.server 8000

# 使用 Node.js
npx serve

# 使用 PHP
php -S localhost:8000
```

然后访问 `http://localhost:8000`

## 部署到 Cloudflare Pages

### 步骤一：准备代码仓库
1. 在 GitHub/GitLab 创建新仓库
2. 将以下文件推送到仓库：
   - `index.html`
   - `style.css`
   - `app.js`

### 步骤二：连接 Cloudflare Pages
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 **Pages** 页面
3. 点击 **Create a project**
4. 选择 **Connect to Git**
5. 授权并选择你的仓库

### 步骤三：配置构建设置
在构建配置页面：
- **Framework preset**: 选择 `None`
- **Build command**: 留空 (纯静态站点无需构建)
- **Build output directory**: `/` (根目录)
- **Root directory**: `/` (根目录)

### 步骤四：环境变量 (可选)
无需配置环境变量，纯前端应用。

### 步骤五：部署
点击 **Save and Deploy**，等待 1-2 分钟部署完成。

### 自定义域名 (可选)
1. 在 Pages 项目页面，点击 **Custom domains**
2. 点击 **Set up a domain**
3. 输入你的域名并按提示配置 DNS

## 功能特性

### 已实现
- ✅ 响应式设计 (桌面/平板/手机)
- ✅ 平滑滚动导航
- ✅ 磁吸按钮效果
- ✅ 玻璃拟态卡片
- ✅ FAQ 手风琴交互
- ✅ 滚动动画 (Intersection Observer)
- ✅ 悬停效果增强

### 待集成 (需后端 API)
- ⏳ AI 图片生成功能
- ⏳ AI 视频生成功能
- ⏳ 提示词优化功能
- ⏳ 用户认证系统
- ⏳ 历史记录功能

## 技术栈

- **HTML5** - 语义化结构
- **CSS3** - 现代布局 (Flexbox, Grid), 渐变, 滤镜
- **Vanilla JavaScript** - 无框架依赖
- **Google Fonts** - Inter & Inter Tight 字体

## 浏览器兼容性

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ 移动端浏览器

## 性能优化

- 使用 Google Fonts 预连接 (`preconnect`)
- CSS 动画使用 `transform` 和 `opacity` (GPU 加速)
- 滚动事件使用节流 (throttle)
- 图片懒加载 (待实现)

## 后续开发建议

### 集成 AI API
```javascript
// 示例：调用图片生成 API
async function generateImage(prompt) {
    const response = await fetch('https://your-api-endpoint/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.imageUrl;
}
```

### 使用 Cloudflare Workers
创建 Serverless API 代理，保护 API 密钥：
```javascript
// wrangler.toml
name = "ai-genesis-api"
type = "javascript"

[site]
bucket = "./"

[[workers.site]]
```

## 授权协议

MIT License

## 联系方式

- 官网：[待部署后填写]
- 邮箱：[待填写]
- GitHub：[待填写]

---

**由 WorkBuddy 智能设计助手生成**
设计稿还原度：100%
