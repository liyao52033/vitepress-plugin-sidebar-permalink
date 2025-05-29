# vitepress-plugin-sidebar-permalink

VitePress 插件：自动生成 sidebar 侧边栏和 permalink rewrites 映射，支持数字前缀排序、collapsed 配置、permalink 匹配高亮、目录/文件名美化等。

## 用法

```ts [config.mts]
import { SidebarPermalinkPlugin, genSidebar } from 'vitepress-plugin-sidebar-permalink'
import rewritesJson from '../rewrites.json'  //插件自动生成

//侧边栏，可抽离出来从其他文件引入
const navLinks = [
  { text: '组件', link: '/pages/fe4521' },
  { text: '后端', link: '/pages/571de5' },
  { text: '资源', link: '/pages/87a36a' }
]

// 生成侧边栏
const sidebarOptions = { collapsed: true }
//'docs/articles'为md文件所在目录
const sidebar = genSidebar(navLinks, 'docs/articles', rewritesJson.rewrites, sidebarOptions)

export default defineConfig({
  vite: {
    plugins: [
      SidebarPermalinkPlugin({
        root: 'docs/articles',  // md文件所在目录
        navLinks,               //侧边栏
        collapsed: true,        
        rewritesPath: 'docs/rewrites.json'
      })
    ]
  },
  rewrites: rewritesJson.rewrites,
  themeConfig: {
    nav: navLinks,
    sidebar
  }
})

```

## 特性
- 侧边栏自动生成，支持数字前缀排序、collapsed 配置、permalink 匹配高亮、目录/文件名美化
- 保持与 VitePress 官方 sidebar 配置行为一致
- 可直接用于 VitePress config

## License
MIT
