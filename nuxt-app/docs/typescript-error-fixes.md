# Nuxt 3 AI Genesis — TypeScript 报错修复总结

> **项目**: AI Genesis (Nuxt 3 + TailwindCSS + Agnes AI API)
> **日期**: 2026-06-27 ~ 2026-06-29
> **环境**: Windows 11, Node.js 22.22.2 (managed), Nuxt 3.21.8

---

## 一、报错分类总览

本项目共经历 **4 轮 TypeScript/Qodana 报错**，从最初的 **47+ 个错误** 逐步清零。

| 轮次 | 主要错误类型 | 错误数量 | 核心原因 |
|------|-------------|----------|----------|
| R1 | TS2583: Map/Set/WeakMap/WeakSet | ~35 | lib 目标为 ES5 |
| R2 | TS2591: process / TS2694: Timer | ~15 | 缺少 @types/node |
| R3 | TS2307: #app / TS2322: Tab 类型 | ~10 | Nuxt 虚拟模块无声明 |
| R4 | TS2305: navigateTo / #imports/#app/nuxt | 5 | 虚拟模块导出不完整 |

---

## 二、每轮详细记录

### R1: TS2583 — Map/Set/WeakMap 未定义

**现象**: `compiler-core.d.ts`, `reactivity.d.ts`, `shared.d.ts` 大量报错

```
TS2583: Cannot find name 'Map'. Do you need to change your target library?
TS2583: Cannot find name 'Set'.
TS2583: Cannot find name 'WeakMap'.
TS2583: Cannot find name 'WeakSet'.
```

**根因**: TypeScript 默认编译目标为 ES5，不包含 ES2015+ 内置集合类型。Vue 3 响应式系统（reactivity）大量使用这些类型。

**修复**:
1. 创建根级 `tsconfig.json`，设置:
   ```json
   {
     "extends": "./.nuxt/tsconfig.json",
     "compilerOptions": {
       "lib": ["ES2020", "DOM", "DOM.Iterable"],
       "target": "ES2020"
     }
   }
   ```
2. 同时在 `nuxt.config.ts` 的 `typescript.tsConfig` 中添加相同配置（后移除，改由根 tsconfig 接管）

**关键文件**: `tsconfig.json`

---

### R2: TS2591 — process 未定义 / TS2694 — Timer 类型

**现象**: 多个文件中 `process.env` 和 `NodeJS.Timer` 报错

```
TS2591: Cannot find name 'process'. Do you need to install type definitions for node?
TS2694: Namespace 'globalNodeJS' has no exported member 'Timer'.
```

**根因**:
1. 缺少 Node.js 运行时类型定义包 (`@types/node`)
2. 新版 `@types/node` 已废弃 `NodeJS.Timer`，需用替代写法

**修复**:
1. 安装依赖: `npm install --save-dev @types/node`
2. `tsconfig.json` 添加 `"types": ["node"]`
3. `pages/video.vue`: `NodeJS.Timer` → `ReturnType<typeof setInterval>`

**关键文件**: `tsconfig.json`, `package.json`, `pages/video.vue`

---

### R3: TS2307 — #app 模块 / TS2322 — Tab/VideoMode 类型

**现象**: IDE 找不到 Nuxt 自动生成的虚拟模块

```
TS2307: Cannot find module '#app' or its corresponding type declarations.
TS2322: Type 'string' is not assignable to type 'Tab'.
TS2322: Type 'string' is not assignable to type 'VideoMode'.
TS2356: Property 'shims' does not exist in type.
```

**根因**:
1. Nuxt 在 `.nuxt/` 目录生成虚拟模块声明，但 IDE 需要显式 `.d.ts`
2. `computed()` 泛型推断不够精确，导致字面量类型收窄失败
3. `nuxt.config.ts` 的 `shims: true` 在 Nuxt 3.21 中已废弃

**修复**:
1. 新建 `src/types/nuxt-modules.d.ts` 声明 `#app`、`#imports`、`#nuxi/imports` 模块
2. `create.vue` 中为 computed 显式指定泛型参数:
   ```typescript
   const tabs = computed<{ value: Tab; label: string; icon: string }[]>(() => [...])
   const videoModes = computed<{ value: VideoMode; label: string }[]>(() => [...])
   ```
3. `nuxt.config.ts` 移除 `shims: true`

**关键文件**: `src/types/nuxt-modules.d.ts`, `pages/create.vue`, `nuxt.config.ts`

---

### R4: TS2305 — navigateTo 导出缺失 / #imports/#app/nuxt

**现象**: 最终残留的 5 个错误

```
TS2305: Module '#app' has no exported member 'navigateTo'.
TS2307: Cannot find module '#imports' or its corresponding type declarations.
TS2307: Cannot find module '#app/nuxt' or its corresponding type declarations.
```

**根因**: R3 创建的虚拟模块声明不够完整，缺少 `navigateTo` 等核心 composable 导出和 `#app/nuxt` 别名模块

**修复**: 重写 `src/types/nuxt-modules.d.ts`:
- `#app` 模块显式导出 `navigateTo`, `useRouter`, `useRoute`, `useRuntimeConfig` 等
- `#imports` 模块 re-export 项目 composables（useI18n, useApiKey）
- 新增 `#app/nuxt` 模块声明（`@nuxt/image` 组件内部使用）

**关键文件**: `src/types/nuxt-modules.d.ts`

---

## 三、最终配置文件状态

### `tsconfig.json`（项目根目录）
```json
{
  "extends": "./.nuxt/tsconfig.json",
  "compilerOptions": {
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": false,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "allowJs": true,
    "types": ["node"],
    "paths": { "~/*": ["./*"], "@/*": ["./*"] }
  },
  "include": [
    ".nuxt/nuxt.d.ts",
    ".nuxt/imports.d.ts",
    "**/*.ts",
    "**/*.vue"
  ]
}
```

### `nuxt.config.ts` typescript 配置
```typescript
typescript: {
  strict: true
  // 注意：不要加 shims（已废弃）、tsConfig（由根级 tsconfig.json 接管）
}
```

### `src/types/nuxt-modules.d.ts`（IDE 类型补全）
```typescript
declare module '#app' {
  export const navigateTo: any
  export function useRouter(): any
  // ... 其他 Nuxt composables
}

declare module '#imports' {
  export { useI18n } from '../composables/useLocale'
  export { useApiKey, ApiKeys } from '../composables/useApiKey'
}

declare module '#app/nuxt' {
  export * from '#app'
}
```

### `package.json` devDependencies 关键依赖
```json
{
  "devDependencies": {
    "@types/node": "^22.x",        // ← 必须：提供 process / Buffer 等 Node.js 类型
    "typescript": "^5.4.x"
  }
}
```

---

## 四、避坑指南（后续开发必读）

### ❌ 绝对不能做的事

1. **不要在 `nuxt.config.ts` 的 `typescript.tsConfig` 里设 lib/target**
   - 这会与根级 `tsconfig.json` 冲突或重复，导致 Qodana 检测到不一致
   - 正确做法：只在根级 `tsconfig.json` 设置一次

2. **不要用 `shims: true`**
   - Nuxt 3.21 已移除此选项，写了直接报 TS2356
   - 正确做法：删除即可，Nuxt 自动处理 Vue shim

3. **不要用 `NodeJS.Timer`**
   - 新版 `@types/node` 已废弃此类型名
   - 正确做法：`ReturnType<typeof setInterval>` 或 `number`

4. **不要在 Git Bash 中用 node.exe 直接跑 `.cmd` 或 `.mjs` 文件**
   - Windows 上 node.exe 不认识 cmd 脚本语法
   - 正确启动命令：`PATH=".../node/versions/22.22.2:$PATH" npx nuxi dev --port 3000`

### ✅ 必须做的事

1. **每次新建 composable 必须手动 import Vue API**
   ```typescript
   import { ref, readonly, computed } from 'vue'  // ← 必须写！
   ```
   Nuxt auto-import 只在运行时生效，静态分析阶段不会自动注入

2. **每次新增页面使用自定义类型时，给 computed/ref 加泛型**
   ```typescript
   // ❌ 错误 — 推断为 string
   const tabs = computed(() => [{ value: 'image' as string }])
   
   // ✅ 正确 — 收窄为联合类型
   const tabs = computed<{ value: Tab; ... }[]>(() => [{ value: 'image' }])
   ```

3. **服务端 API 动态属性对象必须标注 Record<string, any>**
   ```typescript
   // ❌ 错误 — TS2339 属性不存在
   const requestBody = { model, prompt }
   requestBody.mode = mode  // mode 不在初始类型中
   
   // ✅ 正确
   const requestBody: Record<string, any> = { model, prompt }
   requestBody.mode = mode
   ```

4. **修改 tsconfig.json 后必须重启 dev server**
   - Nuxt 会检测变更并提示 `changed tsconfig file detected`
   - 但有时需要手动 `rm -rf .nuxt` 后重启才能完全生效

5. **Qodana 检查前确保 `.nuxt/` 目录存在且完整**
   - Qodana 读取 `.nuxt/nuxt.d.ts` 和 `.nuxt/imports.d.ts` 来解析类型
   - 如果 `.nuxt/` 被清理但未重新 build，所有 Nuxt 模块都会报 TS2307

---

## 五、常见错误速查表

| 错误码 | 典型信息 | 解决方案 |
|--------|---------|----------|
| **TS2583** | Cannot find name 'Map/Set' | tsconfig.json 加 `"lib": ["ES2020"]` |
| **TS2591** | Cannot find name 'process' | 安装 `@types/node` + `"types": ["node"]` |
| **TS2304** | Cannot find module 'useI18n' | composable 文件补 `import { ref } from 'vue'` |
| **TS2307** | Cannot find module '#app' | `src/types/nuxt-modules.d.ts` 加 declare module |
| **TS2305** | no exported member 'navigateTo' | 同上，显式导出 navigateTo |
| **TS2322** | string not assignable to type | computed/ref 加泛型参数 |
| **TS2339/TS2353** | Property does not exist | 对象标为 `Record<string, any>` |
| **TS2356** | 'shims' does not exist | 删除 nuxt.config.ts 的 `shims: true` |
| **TS2694** | no exported member 'Timer' | 用 `ReturnType<typeof setInterval>` |
| **TSCONFIG_ERROR** | JSON parse error | 检查 JSON 语法（引号、逗号） |

---

*文档最后更新: 2026-06-29 14:27 by Senior Developer*
