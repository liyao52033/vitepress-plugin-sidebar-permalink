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
    externals: ["vitepress"],
});
