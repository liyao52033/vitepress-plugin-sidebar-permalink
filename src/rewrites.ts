import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import logger from './log'

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
    // 删除 rewrites.json 中已被 ignoreDirs 忽略的条目
    const filteredRewrites: Record<string, string> = {}
    for (const key of Object.keys(rewrites)) {
        // 检查 key 路径中是否包含被忽略目录
        const ignore = ignoreDirs.some(dir => key.split('/').includes(dir))
        if (!ignore) {
            filteredRewrites[key] = rewrites[key]
        }
    }
    // 只在参数变化或内容变化时写入（不写注释）
    const outputDir = path.dirname(output)
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
    }

    let needWrite = true
    if (fs.existsSync(output)) {
        try {
            const oldContent = fs.readFileSync(output, 'utf-8')
            const oldObj = JSON.parse(oldContent)
            const oldRewrites = oldObj.rewrites || {}
            // 比较参数和内容
            const oldKeys = Object.keys(oldRewrites)
            const newKeys = Object.keys(filteredRewrites)
            if (
                JSON.stringify(oldKeys) === JSON.stringify(newKeys) &&
                JSON.stringify(oldRewrites) === JSON.stringify(filteredRewrites) &&
                JSON.stringify(oldObj._meta || { docsRoot: '', ignoreDirs: [] }) === JSON.stringify({ docsRoot, ignoreDirs })
            ) {
                needWrite = false
            }
        } catch (e) { }
    }
    if (needWrite) {
        fs.writeFileSync(output, JSON.stringify({ rewrites: filteredRewrites, _meta: { docsRoot, ignoreDirs } }, null, 4), 'utf-8')
        logger.info(`Rewrites generated at ${output}`)
    }
    return filteredRewrites
}

export const genRewrites = generateRewrites
