// vitepress-plugin-sidebar-permalink
// 统一插件入口，自动生成 rewrites，sidebar解析等功能
import { Plugin } from 'vitepress'
import { genRewrites, type RewritesJson } from './rewrites'
import path from 'path'

export interface SidebarPermalinkOptions {
    root?: string;
    rewritesPath?: string;
    ignoreDirs?: string[];
}

function SidebarPermalinkPlugin(options: SidebarPermalinkOptions = {}): Plugin {
    // root 默认为 'docs'，rewritesPath 默认为 'docs/rewrites.json'
    const root = options.root ?? 'docs'
    const rewritesPath = options.rewritesPath ?? path.join('docs', 'rewrites.json')
    const defaultIgnoreDirs = ['.vitepress', 'node_modules', 'public', 'dist']
    const ignoreDirs = Array.from(new Set([...(options.ignoreDirs ?? []), ...defaultIgnoreDirs]))
    let rewrites: RewritesJson = { rewrites: {} }
    let isExecute = false;
    return {
        name: 'vitepress-plugin-sidebar-permalink',
        configureServer(server) {
            // 防止 vitepress build 时重复执行
            if (isExecute) return;
            isExecute = true;
            rewrites = { rewrites: genRewrites({ docsRoot: root, output: rewritesPath, ignoreDirs }) }
        }
    }
}

export default SidebarPermalinkPlugin;
export * from "./utils";
