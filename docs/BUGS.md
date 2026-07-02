# Bug 记录 & 修复日志

> 记录 Agnes Easy Use 项目开发过程中发现并修复的 Bug，供后续排查参考。

---

## 🔴 已修复

---

### BUG-001 `tm is not defined` — i18n v10 兼容性问题

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/settings.vue` 安全提示渲染
- **根因**: `@nuxtjs/i18n` v10 版本中 `tm()` 辅助函数不可用（v10 API 变更），代码中调用了 `tm()` 导致运行时报错。
- **修复方案**: 放弃动态读取 i18n 键值，改用 `computed` 返回静态中英文数组，根据 `locale.value` 切换。
- **相关文件**: `pages/settings.vue`
- **状态**: ✅ 已修复

---

### BUG-002 安全提示逐字符显示

- **发现时间**: 2026-06 下旬
- **影响范围**: 设置页安全提示区块
- **根因**: `t()` 返回了数组，但模板中用 `v-for` 直接遍历字符串，导致每个字符被当作独立项渲染。
- **修复方案**: 改用 `computed` 返回静态数组（`securityTips`），模板直接用 `v-for="tip in securityTips"`。
- **相关文件**: `pages/settings.vue`
- **状态**: ✅ 已修复

---

### BUG-003 设置页深色主题卡片背景不切换

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/settings.vue` 所有 `style="..."` 内联样式的元素
- **根因**: Vue/ Nuxt 的 `style` 内联属性不支持 `dark:` 前缀（Tailwind 的 dark mode 只处理 class）。内联 `background` 在深色模式下不会自动切换。
- **修复方案**: 将所有内联 `style="background: ..."` 改为 Tailwind 工具类（`class="dark:bg-..."`）。
- **相关文件**: `pages/settings.vue`
- **经验教训**: **永远不要在内联 style 中使用 dark: 前缀**，Tailwind 扫描不到。
- **状态**: ✅ 已修复

---

### BUG-004 原生 `<select>` 深色模式下拉层白色背景

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/create.vue` 视频生成 Tab 的所有 `<select>` 下拉框
- **根因**: 原生 `<select>` 的下拉选项面板（option dropdown）由操作系统渲染，不受 CSS `background` 控制，Windows 深色模式下仍显示白色背景。
- **修复方案**: 创建自定义组件 `components/AppSelect.vue`，完全用 `<button>` + `<div>` 模拟下拉面板，样式 100% 可控。
- **相关文件**: `components/AppSelect.vue`、`pages/create.vue`
- **状态**: ✅ 已修复（但见 BUG-005）

---

### BUG-005 `AppSelect.vue` 深色模式样式不生效（Scoped CSS 陷阱）

- **发现时间**: 2026-07-01
- **影响范围**: `AppSelect.vue` 深色模式下的触发按钮和下拉面板
- **根因**: 组件使用 `<style scoped>`，深色模式选择器写成 `:global(.dark) .select-dropdown`。但 Vue scoped 会给所有选择器自动加上 `[data-v-xxxx]` 属性限定，导致 `.dark` 在 `<html>` 上、`[data-v-xxxx]` 在组件内部，两者不匹配，样式被忽略。
- **修复方案**: 彻底移除 scoped CSS 中的 `:global(.dark)`  hack，改为在模板 `class` 中直接使用 Tailwind 的 `dark:` 前缀工具类（如 `dark:bg-[#16162a]` `dark:border-white/[0.06]`），让 Tailwind 在构建时生成正确的 `[data-v-xxxx]` 限定深色选择器。
- **相关文件**: `components/AppSelect.vue`（完全重写）
- **经验教训**: **Scoped CSS + `:global(.dark)` 是反模式**。要么用 Tailwind `dark:` 工具类，要么用非 scoped `<style>` 并手动加 `:deep()`。
- **状态**: ✅ 已修复

---

### BUG-006 深色主题整体过亮

- **发现时间**: 2026-07-01
- **影响范围**: 全局深色模式视觉体验
- **根因**: 原深色背景 `#030014` 偏紫且不够暗，白色叠加层透明度过高（`[0.05]`），纯白文字（`text-white`）在深色背景上过刺眼。
- **修复方案**:
  - 主背景: `#030014` → `#050508`（更接近纯黑，减少紫色调）
  - 白色叠加层透明度减半: `[0.05]` → `[0.02]`，`[0.1]` → `[0.05]`
  - 纯白文字改柔和白: `text-white` → `dark:text-white/90`
- **相关文件**: `tailwind.config.js`、`assets/styles/main.css`、`pages/create.vue`、`pages/settings.vue`、`app.vue`、`components/AppSelect.vue`
- **状态**: ✅ 已修复

---

### BUG-007 视频生成 API 参数无效

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/create.vue` 视频生成 Tab、API 调用
- **根因**: 前端传了 `duration` 和 `aspect_ratio` 两个字段给 Agnes Video V2.0 API，但 API 实际接收的是 `width`、`height`（由分辨率决定）、`num_frames`（需满足 `8n+1`，最大 441）、`frame_rate`（1-60）。`duration` 和 `aspect_ratio` 不是有效参数，导致生成失败或参数被忽略。
- **修复方案**:
  - 分辨率选择改为传 `width` + `height`（如 1920×1080）
  - 帧率选择改为 `frame_rate` 字段
  - 自定义总帧数改为 `num_frames` 字段，并加 `8n+1` 校验
  - `generateVideo()` 方法参数与 API 对齐
- **相关文件**: `pages/create.vue`、`server/api/generate/video.post.ts`
- **状态**: ✅ 已修复

---

### BUG-008 品牌名不统一（AI Genesis 残留）

- **发现时间**: 2026-06 下旬
- **影响范围**: 全局 UI 文案、i18n 语言包、页脚版权
- **根因**: 项目早期命名为 "AI Genesis"，后更名为 "Agnes Easy Use"，但部分文件（语言包、页脚、README）中仍有残留。
- **修复方案**: 全局搜索 `AI Genesis`，全部替换为 `Agnes Easy Use`；同步更新 i18n 的 `zh-CN.json` / `en.json`、页脚文案、README。
- **相关文件**: 全局
- **状态**: ✅ 已修复

---

### BUG-009 版权年份错误

- **发现时间**: 2026-06 下旬
- **影响范围**: `app.vue` 页脚
- **根因**: 页脚硬编码 `© 2024`，实际已是 2026 年。
- **修复方案**: 改为 `© 2026`（或进一步优化为动态 `new Date().getFullYear()`）。
- **相关文件**: `app.vue`
- **状态**: ✅ 已修复

---

### BUG-010 首页功能卡片无点击跳转

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/index.vue`
- **根因**: 首页三张功能卡片（图片生成 / 视频生成 / 提示词优化）是静态 `<div>`，没有链接到对应功能页，用户无法直接进入创作界面。
- **修复方案**:
  - 图片生成 → `<NuxtLink to="/create">`
  - 视频生成 → `<NuxtLink to="/create?tab=video">`
  - 提示词优化 → `<NuxtLink to="/create">`
  - 添加 `cursor-pointer hover:scale-[1.02] transition-transform` 微交互
- **相关文件**: `pages/index.vue`
- **状态**: ✅ 已修复

---

### BUG-011 `/video` 独立页面多余

- **发现时间**: 2026-06 下旬
- **影响范围**: `pages/video.vue`（已删除）
- **根因**: 视频生成功能被实现为独立页面 `/video`，但用户期望在创作界面内通过 Tab 切换，而非跳转新页面。独立页面导致导航不一致。
- **修复方案**: 删除 `pages/video.vue`，视频生成功能合并进 `pages/create.vue`，通过 `route.query.tab` 参数控制默认选中 Tab。
- **相关文件**: `pages/create.vue`（新增 Tab 切换逻辑）、删除 `pages/video.vue`
- **状态**: ✅ 已修复

---

### BUG-012 语言/主题切换器左右排布不美观

- **发现时间**: 2026-06 下旬
- **影响范围**: `app.vue` 导航栏右侧
- **根因**: 语言切换按钮和主题切换按钮并排显示，在移动端窄屏下挤占空间，且交互不够直观。
- **修复方案**: 改为单按钮循环切换：
  - 语言按钮：`zh-CN` → `en` → `zh-CN`（循环）
  - 主题按钮：`light` → `dark` → `light`（循环）
  - 按钮文字/图标实时反映当前状态
- **相关文件**: `app.vue`
- **状态**: ✅ 已修复

---

## 🟡 已知问题（待修复）

### KNOWN-001 赞赏二维码图片路径硬编码

- **描述**: `pages/settings.vue` 中赞赏区块的图片路径为 `public/docs/sponsor-wechat.png`，若用户未放置图片，区块不显示（已是预期行为），但缺少文档说明需要放置哪些文件。
- **建议**: 在 README 或 docs/ 中补充"如何启用赞赏功能"说明。
- **优先级**: 低

---

### KNOWN-002 `npm run dev` 端口冲突后无提示

- **描述**: 3000 端口被占用时，Nuxt 自动切换到 3001，但终端输出中 `NuxtDevTools` 链接仍是 `localhost:3000`（实际是 3001），容易混淆。
- **建议**: 启动时检查端口占用，给出更明确提示；或固定用 3001 并在 README 中说明。
- **优先级**: 低

---

## 📋 排查经验总结

### Tailwind Dark Mode 最佳实践

1. **永远用 `dark:` 工具类**，不要用内联 `style` + `dark:` 前缀（无效）
2. **Scoped CSS 中不要用 `:global(.dark)`**（属性选择器不匹配）
3. 正确写法：
   ```html
   <!-- ✅ 正确 -->
   <div class="bg-white dark:bg-gray-900 dark:border-white/10">
   
   <!-- ❌ 错误 -->
   <div style="background: white; dark:background: gray-900;">
   ```
4. 自定义颜色值用 `dark:bg-[#16162a]` 格式，Tailwind 会正确生成

### Nuxt i18n v10 注意事项

- `tm()` 在 v10 中不可用，用静态数组或 `t()` 返回字符串
- 动态列表用 `computed` 返回数组，不要用 i18n 函数

### 视频生成 API 参数规范

| 参数 | 类型 | 约束 |
|------|------|------|
| `width` | number | 与 `height` 配套，由分辨率选择决定 |
| `height` | number | 与 `width` 配套 |
| `num_frames` | number | 需满足 `8n+1`，最大值 441 |
| `frame_rate` | number | 1-60 |
| `prompt` | string | 提示词 |
| `negative_prompt` | string | 可选，负面提示词 |

---

*本文档随开发进程持续更新。*
