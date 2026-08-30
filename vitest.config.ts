import { defineConfig } from "vitest/config";

export default defineConfig({
    optimizeDeps: {
        exclude: [
            "@electric-sql/pglite",
        ],
    },

    test: {
        coverage: {
            provider: "v8",

            exclude: [
                "**/create-tables.sql",
                "**/coverage/**",
                "**/dist/**",
                "**/node_modules/**",
            ],
        },
    },
});