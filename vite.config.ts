import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig(({ command, mode }) => {
  if (command === "build") {
    const fileEnvironment = loadEnv(mode, process.cwd(), "VITE_");
    const apiBaseUrl =
      process.env.VITE_API_BASE_URL || fileEnvironment.VITE_API_BASE_URL;

    if (!apiBaseUrl) {
      throw new Error(
        "VITE_API_BASE_URL is required. Configure it in the hosting environment before building."
      );
    }

    let parsedApiUrl: URL;
    try {
      parsedApiUrl = new URL(apiBaseUrl);
    } catch {
      throw new Error("VITE_API_BASE_URL must be a valid absolute URL.");
    }

    if (parsedApiUrl.protocol !== "https:") {
      throw new Error("Production VITE_API_BASE_URL must use HTTPS.");
    }
  }

  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
  };
});
