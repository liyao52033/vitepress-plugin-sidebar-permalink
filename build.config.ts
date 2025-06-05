import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/index", "src/sidebar"],
    failOnWarn: false,
    clean: true,
    declaration: true,
    rollup: {
        emitCJS: true,
        output: {
            exports: "named", // 让 unbuild/rollup 自动处理 default 导出，保证类型声明一致
        },
        esbuild: {
            minify: true,
          },
    },
    externals: [
        // 保证依赖不被打包进产物
        'vite',
        'vitepress',
        'rollup',
        'esbuild',
        'gray-matter',
        'picocolors',
        '@types/node',
        'typescript'
    ]
});
