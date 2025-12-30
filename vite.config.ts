import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/

export default defineConfig(({ command, mode }) => {
    if (command === "build") {
        const env = loadEnv(mode, process.cwd(), "");
        return {
            base: env.BASE_URL,
            plugins: [react()],
        };
    }
    return {
        plugins: [react()],
    };
});
