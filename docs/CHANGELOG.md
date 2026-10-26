# 更新记录（CHANGELOG）

## 2026-10-26（二）修复界面显示原始 i18n 键 + 站点切换体验优化

### 修复：界面出现 `create.siteLabel` 等原始键路径

**根因**：项目存在两套并行的 i18n 系统，自动导入冲突。

- `nuxt-app/i18n/locales/*.json` —— @nuxtjs/i18n 模块（vue-i18n）读取的数据源
- `nuxt-app/locales/*.json` + `composables/useLocale.ts` —— 一个自定义轻量 i18n，自己实现 `useI18n()`

页面里的 `useI18n()` 依赖自动导入，两个同名导出冲突后实际生效的是模块（vue-i18n）版本，读取的是 `i18n/locales/` 旧文件——上一轮新增的站点/模型文案只写进了 `locales/`，于是缺失的键在界面上直接渲染为 `create.siteLabel`、`create.siteCom`、`create.siteCn` 等键路径。

**修复方式**（统一为单一数据源 + 单一 i18n 系统）：

- 最新文案同步至 `i18n/locales/`，删除重复的 `locales/` 目录
- 删除 `composables/useLocale.ts`，消除 `useI18n` 自动导入冲突，全部页面统一走 @nuxtjs/i18n（vue-i18n）
- `nuxt.config.ts` i18n 增加 `fallbackLocale: 'zh-CN'`（任何语言缺键回落中文，不再裸奔键路径）与 `detectBrowserLanguage`（cookie 持久化语言选择，替代自定义 composable 的 localStorage 方案）
- `app.vue` 增加旧 `localStorage['i18n-locale']` 一次性迁移，老用户刷新后语言不被重置
- 顺带修复 4 条文案中的 `|` 分隔符（`videoGen.pollingStatus` / `videoGen.durationInfo`，中英各 2 条）——`|` 是 vue-i18n 的复数语法字符，会导致渲染异常，已改为 `·`

### 优化：站点切换与 Key 状态体验

- **创作页站点选择器升级**：地球图标 + 每个站点按钮带 Key 状态圆点（绿=已配置 / 黄=未配置，已配置时悬停有呼吸动效），悬停提示该站点域名与 Key 状态
- **全局缺 Key 提示条**：当前站点未配置 Key 时，创作页顶部常显一条提示（含「前往设置」按钮），替代原先分散在图片/视频两个 Tab 内的两张重复警告卡片（已移除）
- **设置页站点切换按钮**同样加入 Key 状态圆点，一眼可见两站配置情况
- 工具行响应式优化：窄屏自动折行，优化模型选择器自适应宽度

### 验证记录

- ✅ `nuxt build` 通过
- ✅ 中文 SSR：`/create`、`/settings` 无任何原始键路径泄漏；站点选择器、状态点、缺 Key 提示条均正常渲染
- ✅ 英文 SSR（cookie `i18n_redirected=en`）：同样无泄漏，Global / China / Optimizer model 等文案正确
- ✅ 两语言 JSON 均通过严格校验（无 `|` / `@` / 裸花括号等 vue-i18n 特殊字符）

### 涉及文件

- 删除：`nuxt-app/locales/`（重复数据源）、`nuxt-app/composables/useLocale.ts`
- 修改：`nuxt-app/i18n/locales/{zh-CN,en}.json`（同步最新文案 + 新增站点提示键 + 清理未引用键）、`nuxt-app/nuxt.config.ts`、`nuxt-app/app.vue`、`nuxt-app/pages/create.vue`、`nuxt-app/pages/settings.vue`、`README.md`

---

## 2026-10-26 双站点支持 + 模型阵容刷新


> 本次更新依据 Agnes 官方文档（[国际站](https://agnes-ai.com/zh-Hans/docs/overview) / [国内站](https://agnes-ai.cn/zh-Hans/docs/overview)，抓取于 2026-10-26）完成，模型阵容、参数契约与定价状态均与官方文档当时内容对齐。

### 新增：国际站 / 国内站双站点支持

- 新增站点注册表 `nuxt-app/server/utils/agnes.ts`，统一维护两站 API 源与 Key 解析：
  - 国际站：`https://apihub.agnes-ai.com`（控制台 platform.agnes-ai.com）
  - 国内站：`https://api.agnes-ai.cn`（控制台 platform.agnes-ai.cn）
- 4 个服务端代理接口（图片生成 / 视频创建 / 视频状态查询 / 提示词优化）全部支持 `site` 参数（`com` | `cn`，默认 `com`），按站点路由 Base URL 并解析对应 Key。
- 服务端环境变量新增 `AGNES_API_KEY_CN`（国内站兜底 Key），与 `AGNES_API_KEY`（国际站）并列。
- 设置页支持站点切换，两站 Key 独立保存；创作页顶部新增站点切换器，切换后所有请求即时路由到所选站点。
- `useApiKey` 组合式函数重构为多站点 Key 管理；旧版单站点 Key（`agnes` 字段）自动作为两站点的迁移兜底，不丢数据。

### 新增：最新模型

| 模型 | 类型 | 说明 |
| --- | --- | --- |
| `agnes-2.5-flash` | 文本 | `agnes-2.0-flash` 的全量升级（API 兼容），现为提示词优化默认模型；两站当前完全免费 |
| `agnes-video-2.5` | 视频 | 2.5 系列全量版，支持 `720P / 1080P / 1K / 2K` 分辨率档位（按分辨率计费），UI 提供档位选择 |

### 新增：图片档位式尺寸

- `agnes-image-2.1-flash` / `agnes-image-2.5-flash` 支持官方推荐的档位式尺寸：`size ∈ {1K, 2K, 3K, 4K}` + `ratio ∈ {1:1, 3:4, 4:3, 16:9, 9:16, 2:3, 3:2, 21:9}`（如 1K 16:9 = 1312×736）。
- `agnes-image-2.0-flash` 保留精确尺寸写法（1024×768 等）。

### 修正：与官方文档对齐的参数契约

- 图片输入图统一放入 `extra_body.image`（官方明确要求，顶层 `image` 会被忽略）；此前 2.0 / 2.1 使用顶层字段，已修正。
- `agnes-image-2.1-flash` 按最新文档已支持**多图合成**，前端解锁该模式（此前标记为仅单图）。
- 图片默认模型切换为 `agnes-image-2.5-flash`（最新一代）。
- 视频状态查询统一携带 `model_name`（官方推荐所有模式使用，keyframe / reference 模式必须携带）。

### 下架：废弃模型

| 模型 | 原因 |
| --- | --- |
| `agnes-2.0-flash`（文本） | 官方文档明确已废弃；本地保存的旧选择自动迁移到 `agnes-2.5-flash` |
| `agnes-video-v2.0`（视频） | 已从官方文档移除；随之下架其专属参数（自定义 width/height/num_frames/frame_rate、负向提示词） |

### 免费 / 计费状态（截至 2026-10-26，以官方定价页为准）

- 免费：`agnes-2.5-flash`、`agnes-3.0-flash`（文本，两站 ¥0/$0）；`agnes-image-2.0/2.1/2.5-flash`（图片所有档位）；`agnes-video-2.5-flash`（视频，限时免费）。
- 计费：`agnes-video-2.5`（国内站 720P ¥0.15/秒 · 1080P/1K ¥0.25/秒 · 2K ¥0.35/秒；国际站 $0.025 / $0.040 / $0.055 每秒）；`agnes-2.5-pro` / `agnes-2.5-pro-beta`（付费，本项目未接入）。

### 验证记录

使用两站各一把测试 Key 对本地代理做了端到端实测：

- ✅ 提示词优化：国际站 `agnes-2.5-flash`、国内站 `agnes-3.0-flash` 均正常返回
- ✅ 图片生成：国际站 `1K 16:9`、国内站 `2K 1:1` 均正常出图（国内站结果落在 `cos-platform-outputs.agnes-ai.cn`，路由正确）
- ✅ 站点隔离：国际站 Key 路由到国内站返回 401「无效的令牌」，隔离生效
- ✅ 废弃模型：`agnes-2.0-flash`、`agnes-video-v2.0` 请求被 400 拒绝并列出允许的模型
- ✅ 缺 Key：返回 422 `API_KEY_MISSING`
- ⚠️ 视频创建：两站测试时均返回平台侧 `video_queue_full`（503，官方队列满），参数校验已通过、契约无误，属平台负载问题
- ✅ `nuxt build`（cloudflare-pages preset）构建通过；`/`、`/create`、`/settings` SSR 200

### 涉及文件

- 新增：`nuxt-app/server/utils/agnes.ts`、`docs/CHANGELOG.md`
- 重写：`nuxt-app/server/api/generate/image.post.ts`、`nuxt-app/server/api/generate/video.post.ts`
- 修改：`nuxt-app/server/api/optimize-prompt.post.ts`、`nuxt-app/server/api/video/status.get.ts`、`nuxt-app/composables/useApiKey.ts`、`nuxt-app/pages/create.vue`、`nuxt-app/pages/settings.vue`、`nuxt-app/pages/index.vue`、`nuxt-app/nuxt.config.ts`、`nuxt-app/locales/zh-CN.json`、`nuxt-app/locales/en.json`、`README.md`
