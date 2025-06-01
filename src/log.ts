import { createLogger, type LogOptions } from "vite";
import picocolors from "picocolors";
import type { Colors } from "picocolors/types";
import { version } from "../package.json";

type ColorsKey = keyof Omit<Colors, "isColorSupported">;

export const logger = createLogger("info", {
    prefix: `[vitepress-plugin-sidebar-permalink v${version}]`,
});

export const info = (message: string, level: ColorsKey = "green", option: LogOptions = { timestamp: true }) => {
    logger.info(picocolors[level](message), option);
};

export const warn = (message: string, level: ColorsKey = "yellow", option: LogOptions = { timestamp: true }) => {
    logger.warn(picocolors[level](message), option);
};

export const warnOnce = (message: string, level: ColorsKey = "yellow", option: LogOptions = { timestamp: true }) => {
    logger.info(picocolors[level](message), option);
};

export const error = (message: string, level: ColorsKey = "red", option: LogOptions = { timestamp: true }) => {
    logger.error(picocolors[level](message), option);
};

export default {
    info,
    warn,
    warnOnce,
    error,
};