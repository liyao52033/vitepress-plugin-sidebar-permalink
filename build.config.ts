import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
    entries: ["src/index", "src/sidebar"],
    failOnWarn: false,
    clean: true,
    declaration: true,
    rollup: {
        emitCJS: true,
        output: {
            exports: "named",
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
