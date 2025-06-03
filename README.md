---
date: 2025-05-30 16:40:58
title: permalink重写文章路由
permalink: /pages/47a27c
top: 1
author:
  name: 华总
  link: https://xiaoying.org.cn
categories:
  - 工具类
  - 本站插件
---

# vitepress-plugin-sidebar-permalink

VitePress 插件：自动生成 sidebar 侧边栏和 permalink rewrites 映射，支持数字前缀排序、collapsed 配置、permalink 匹配高亮、目录/文件名美化等。

## github地址

::: navCard  2

```yaml
- name: vitepress-plugin-sidebar-permalink
  desc: 这是一个适用于vitepress的 Vite 插件，vitepress启动时，插件会重写路由用permalink作为链接并生成侧边栏。
  img: https://img.xiaoying.org.cn/img/202503231752583.png
  link: https://github.com/liyao52033/vitepress-plugin-sidebar-permalink
  badge: vitepress插件
  badgeType: tip
```

:::

## 安装

::: code-group

```sh [npm]
npm install vitepress-plugin-sidebar-permalink -D
```

```sh [yarn]
yarn add vitepress-plugin-sidebar-permalink -D
```

```sh [pnpm]
pnpm i vitepress-plugin-sidebar-permalink -D
```

:::

## 用法

### 生成路由重写文件

::: code-group
```ts [config.mts]
import SidebarPermalinkPlugin from 'vitepress-plugin-sidebar-permalink'

export default defineConfig({
  vite: {
    plugins: [
      SidebarPermalinkPlugin({
        rewritesPath: docs/rewrites.json,//文件生成位置
        ignoreDirs: []  //忽略目录
      }) 
    ]
  }
})

```
:::

- 配置完成后启动项目，默认在docs目录下生成rewites.json文件，可在`rewritesPath`自定义生成位置
- 插件默认忽略 `['.vitepress', 'node_modules', 'public', "dist"]` 目录，可在`ignoreDirs`中配置
- 必须先生成路由重写文件，然后才能生成侧边栏

### 生成侧边栏

::: code-group

```ts{3,13-14,25,28} [config.mts]
import SidebarPermalinkPlugin from 'vitepress-plugin-sidebar-permalink'
import { genSidebar } from 'vitepress-plugin-sidebar-permalink/sidebar'
import rewritesJson from '../rewrites.json'  //插件自动生成，默认在docs目录下，确保文件存在再引入

//导航栏，可抽离出来从其他文件引入
const navLinks = [
  { text: '组件', link: '/pages/fe4521' },
  { text: '后端', link: '/pages/571de5' },
  { text: '资源', link: '/pages/87a36a' }
]

// 生成侧边栏，先引入插件生成rewritesJson再写下列代码
const sidebarOptions = { collapsed: true }
const sidebar = genSidebar(navLinks, 'docs/articles', rewritesJson.rewrites, sidebarOptions) //'docs/articles'为md文件所在目录

export default defineConfig({
  vite: {
    plugins: [
      SidebarPermalinkPlugin({
        rewritesPath: docs/rewrites.json，//文件生成位置
        ignoreDirs: []  //忽略目录
      }) 
    ]
  },
  rewrites: rewritesJson.rewrites,  // 先引入插件生成rewritesJson再写下列代码
  themeConfig: {
    nav: navLinks,
    sidebar  // 先引入插件生成rewritesJson再写下列代码
  }
})

```
:::

### 修改侧边栏样式

::: code-group
``` ts [theme/index.ts]
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import 'vitepress-plugin-sidebar-permalink/index.css'
export default {
    extends: DefaultTheme,
    enhanceApp({ router }) {
        
    }
} satisfies Theme

```
::: 

## 特性
- 侧边栏自动生成，支持数字前缀排序、collapsed 配置、permalink 匹配高亮、目录/文件名美化
- 保持与 VitePress 官方 sidebar 配置行为一致
- 可直接用于 VitePress config


