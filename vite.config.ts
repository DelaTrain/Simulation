import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/

const commonConfig = {
    plugins: [react(), tailwindcss()],
};

export default defineConfig(({ command, mode }) => {
    if (command === "build") {
        const env = loadEnv(mode, process.cwd(), "");
        return {
            base: env.BASE_URL,
            ...commonConfig,
        };
    }
    return { ...commonConfig };
});
