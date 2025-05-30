// vitepress-plugin-sidebar-permalink
// 统一插件入口，自动生成 rewrites
import { Plugin } from 'vitepress'
import { genRewrites, type RewritesJson } from './rewrites'
import path from 'path'

export interface SidebarPermalinkOptions {
    root?: string;
    rewritesPath?: string;
    ignoreDirs?: string[];
}

export function SidebarPermalinkPlugin(options: SidebarPermalinkOptions = {}): Plugin {
    // root 默认为 'docs'，rewritesPath 默认为 'docs/rewrites.json'
    const root = options.root ?? 'docs'
    const rewritesPath = options.rewritesPath ?? path.join('docs', 'rewrites.json')
    const ignoreDirs = options.ignoreDirs ?? ['.vitepress', 'node_modules', 'public', "@pages" , "dist"]
    let rewrites: RewritesJson = { rewrites: {} }
    return {
        name: 'vitepress-plugin-sidebar-permalink',
        config(_, { command }) {
            if (command === 'build' || command === 'serve') {
                rewrites = { rewrites: genRewrites({ docsRoot: root, output: rewritesPath, ignoreDirs }) }
            }
        }
    }
}