// vitepress-plugin-sidebar-permalink
// 统一插件入口，自动生成 rewrites 并生成 sidebar，供 vitepress 使用
import { Plugin } from 'vitepress'
import { genRewrites, type RewritesJson } from './rewrites'
import { genSidebar } from './sidebar'

export interface SidebarPermalinkOptions {
    root: string;
    navLinks: { text: string, link: string }[];
    collapsed?: boolean;
    rewritesPath?: string;
}

export function SidebarPermalinkPlugin(options: SidebarPermalinkOptions): Plugin {
    let rewrites: RewritesJson = { rewrites: {} }
    return {
        name: 'vitepress-plugin-sidebar-permalink',
        config(userConfig: any, { command }) {
            if (command === 'build' || command === 'serve') {
                rewrites = { rewrites: genRewrites({ docsRoot: options.root, output: options.rewritesPath || 'rewrites.json' }) }
                const sidebar = genSidebar(
                    options.navLinks,
                    options.root,
                    rewrites.rewrites,
                    { collapsed: options.collapsed === undefined ? true : options.collapsed }
                )
                return {
                    ...userConfig,
                    themeConfig: {
                        ...(userConfig.themeConfig || {}),
                        sidebar
                    }
                }
            }
        }
    }
}

export * from './rewrites'
export { genSidebar } from './sidebar'
