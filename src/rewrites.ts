import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import picocolors from 'picocolors';


export interface RewritesJson {
    rewrites: Record<string, string>
}

export function getAllMdFiles(dir: string, baseDir = dir, ignoreDirs: string[] = []): string[] {
    const files = fs.readdirSync(dir)
    let result: string[] = []
    for (const file of files) {
        const full = path.join(dir, file)
        const rel = path.relative(baseDir, full)
        if (fs.statSync(full).isDirectory()) {
            // 忽略指定目录
            if (ignoreDirs.includes(file)) continue
            result = result.concat(getAllMdFiles(full, baseDir, ignoreDirs))
        } else if (file.endsWith('.md')) {
            result.push(rel.replace(/\\/g, '/'))
        }
    }
    return result
}

export function generateRewrites({ docsRoot, output, ignoreDirs = [] }: { docsRoot: string, output: string, ignoreDirs?: string[] }): Record<string, string> {
    const mdFiles = getAllMdFiles(docsRoot, docsRoot, ignoreDirs)
    const rewrites: Record<string, string> = {}
    for (const relPath of mdFiles) {
        const absPath = path.join(docsRoot, relPath)
        const src = fs.readFileSync(absPath, 'utf-8')
        const fm = matter(src).data
        let val = ''
        if (typeof fm.permalink === 'string' && fm.permalink.trim()) {
            val = fm.permalink.trim()
            if (val.startsWith('/')) val = val.slice(1)
            if (val.endsWith('/')) val = val.slice(0, -1)
            val = val + '.md'
        } else {
            val = relPath.replace(/\\/g, '/').replace(/\.md$/, '')
            val = val.replace(/^\/+/g, '').replace(/\/+$/g, '')
            val = val + '.md'
        }
        rewrites[relPath] = val
    }
    // 只在参数变化或内容变化时写入
    const outputDir = path.dirname(output)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }
    let needWrite = true
    let oldMeta = ''
    let oldContent = ''
    if (fs.existsSync(output)) {
        try {
            oldContent = fs.readFileSync(output, 'utf-8')
            // 读取上次参数元信息
            const match = oldContent.match(/^\/\*meta:(.*?)\*\//s)
            if (match) oldMeta = match[1].trim()
            // 去掉 meta 注释部分
            oldContent = oldContent.replace(/^\/\*meta:.*?\*\//s, '').trim()
            if (oldContent === JSON.stringify({ rewrites }, null, 4)) {
                // 比较参数
                const newMeta = JSON.stringify({ docsRoot, ignoreDirs })
                if (oldMeta === newMeta) {
                    needWrite = false
                }
            }
        } catch (e) { }
    }
    if (needWrite) {
        const meta = `/*meta:${JSON.stringify({ docsRoot, ignoreDirs })}*/\n`;
        fs.writeFileSync(output, meta + JSON.stringify({ rewrites }, null, 4), 'utf-8')
        console.log(picocolors.green(`[vitepress-plugin-sidebar-permalink]Rewrites generated at ${output}`))
    } 
    return rewrites
}

export const genRewrites = generateRewrites
