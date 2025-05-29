import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export interface RewritesJson {
    rewrites: Record<string, string>
}

export function getAllMdFiles(dir: string, baseDir = dir): string[] {
    const files = fs.readdirSync(dir)
    let result: string[] = []
    for (const file of files) {
        const full = path.join(dir, file)
        const rel = path.relative(baseDir, full)
        if (fs.statSync(full).isDirectory()) {
            result = result.concat(getAllMdFiles(full, baseDir))
        } else if (file.endsWith('.md')) {
            result.push(rel.replace(/\\/g, '/'))
        }
    }
    return result
}

export function generateRewrites({ docsRoot, output }: { docsRoot: string, output: string }): Record<string, string> {
    const mdFiles = getAllMdFiles(docsRoot)
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
            // 自动生成规范 permalink：去掉 .md，前后无 /，前面加 /，再加 .md
            val = relPath.replace(/\\/g, '/').replace(/\.md$/, '')
            val = val.replace(/^\/+|\/+$/g, '')
            val = val + '.md'
        }
        rewrites[relPath] = val
    }
    // 如果 output 路径不存在则递归创建
    const outputDir = path.dirname(output)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }
    fs.writeFileSync(output, JSON.stringify({ rewrites }, null, 4), 'utf-8')
    console.log(`[vitepress-plugin-sidebar-permalink]Rewrites generated at ${output}`)
    return rewrites
}

export const genRewrites = generateRewrites
