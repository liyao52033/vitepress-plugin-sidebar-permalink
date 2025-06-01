import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import logger from './log'

interface SidebarItem {
    text: string
    link?: string
    items?: SidebarItem[]
    collapsed?: boolean
    activeMatch?: string
}

export function itemsWithStyle(dir: string, root: string, rewrites: Record<string, string>, options: { collapsed: boolean } = { collapsed: true }, sidebarKey?: string): SidebarItem[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    let items: SidebarItem[] = []

    // 分离目录和文件
    const directories: fs.Dirent[] = []
    const files: fs.Dirent[] = []

    for (const entry of entries) {
        if (entry.isDirectory()) {
            directories.push(entry)
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
            files.push(entry)
        }
    }

    // 处理目录（按名称前的数字排序）
    directories.sort((a, b) => {
        // 提取数字前缀
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || '999999', 10)
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || '999999', 10)
        return numA - numB
    })

    for (const entry of directories) {
        let text = entry.name.replace(/^[\d]+\.?\s*/, '')
        const children = itemsWithStyle(path.join(dir, entry.name), root, rewrites, options, sidebarKey)
        if (children.length) {
            // collapsed: false 时不加 collapsed 字段，collapsed: true 时加 collapsed: true
            const item: SidebarItem = { text, items: children }
            if (options.collapsed) item.collapsed = true
            items.push(item)
        }
    }

    // 处理文件（按名称前的数字排序）
    files.sort((a, b) => {
        const numA = parseInt(a.name.match(/^\d+/)?.[0] || '999999', 10)
        const numB = parseInt(b.name.match(/^\d+/)?.[0] || '999999', 10)
        return numA - numB
    })

    for (const entry of files) {
        const filePath = path.join(dir, entry.name)
        const file = fs.readFileSync(filePath, 'utf-8')
        const { data } = matter(file)
        let text = data.title || entry.name.replace(/\.md$/, '')
        text = text.replace(/^\d+\.?\s*/, '')
        // rel 以 root 为基准
        const rel = path.relative(root, filePath).replace(/\\/g, '/').replace(/\.md$/, '')
        // 优先 frontmatter.permalink > rewrites > 文件路径
        let permalink = data.permalink
        if (typeof permalink === 'string' && permalink.trim()) {
            permalink = permalink.trim()
            if (!permalink.startsWith('/')) permalink = '/' + permalink
            permalink = permalink.replace(/\/$/, '')
            permalink = permalink.replace(/\.md$/, '')
        } else {
            // 只查找带 .md 的 key，保证和 rewrites.json 一致
            const rewriteKey = rel + '.md'
            permalink = rewrites[rewriteKey] || '/' + rel
            permalink = permalink.replace(/\.md$/, '')
            if (!permalink.startsWith('/')) permalink = '/' + permalink
        }
        items.push({ text, link: permalink, activeMatch: permalink } as SidebarItem)
    }
    return items
}

function isExternalLink(link?: string): boolean {
    if (!link) return true;
    // 绝对外链（http/https）
    if (/^https?:\/\//i.test(link)) return true;
    // mailto、tel等协议
    if (/^(mailto:|tel:)/i.test(link)) return true;
    // 不是以 /pages 或 / 开头的都视为外链
    if (!link.startsWith('/pages') && !link.startsWith('/')) return true;
    return false;
}

export function genSidebar(
    navLinks: { text: string, link?: string, items?: any[] }[],
    root: string,
    rewrites: Record<string, string>,
    options = { collapsed: true }
): Record<string, SidebarItem[]> {
    const sidebar: Record<string, SidebarItem[]> = {}
    for (const nav of navLinks) {
        // 忽略外链和无 link 的分组
        if (isExternalLink(nav.link)) continue;
        const navPermalink = nav.link!.replace(/^[\/]/, '').replace(/[\/]$/, '').replace(/\.md$/, '')
        const matchedKeys = Object.entries(rewrites)
            .filter(([, v]) => v.replace(/^[\/]/, '').replace(/\.md$/, '') === navPermalink)
            .map(([k]) => k)

        if (matchedKeys.length) {
            const mdPath = matchedKeys.reduce((a, b) => a.length > b.length ? a : b)
            const docsRoot = root.split(/[\\/]/)[1] // 获取docs下的第一级目录名，例如 articles
            let dirPath = path.dirname(mdPath).replace(new RegExp('^[/\\\\]?' + docsRoot + '[\\\\/]'), '');
            const firstLevel = dirPath.split(/[\\/]/)[0] // 通用方式提取第一级目录名
            const absDir = path.join(root, firstLevel)

            if (fs.existsSync(absDir) && fs.statSync(absDir).isDirectory()) {
                function addSidebarKeyForAllMd(dir: string) {
                    const entries = fs.readdirSync(dir, { withFileTypes: true })

                    for (const entry of entries) {
                        const fullPath = path.join(dir, entry.name)

                        if (entry.isDirectory()) {
                            addSidebarKeyForAllMd(fullPath)
                        } else if (entry.isFile() && entry.name.endsWith('.md')) {
                            const file = fs.readFileSync(fullPath, 'utf-8')
                            const { data } = matter(file)

                            // frontmatter.article === false 时跳过
                            if (data.article === false) continue;

                            let permalink = data.permalink || ''
                            if (typeof permalink === 'string' && permalink.trim()) {
                                permalink = permalink.trim()
                                permalink = permalink.replace(/^\/+|\/+$/g, '') // 去掉前后 /
                                const sidebarKey = `${permalink}.md`
                                const items = itemsWithStyle(absDir, root, rewrites, options)
                                sidebar[sidebarKey] = items
                            }
                        }
                    }
                }

                addSidebarKeyForAllMd(absDir)
            }
        }
    }
    logger.info("Injected Sidebar Data Successfully. 注入侧边栏数据成功!");
    return sidebar
}

