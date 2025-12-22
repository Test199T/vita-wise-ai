import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(
      Boolean,
    ),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Environment variables configuration
    define: {
      // Make environment variables available to the client
      __APP_VERSION__: JSON.stringify(
        process.env.npm_package_version || "1.0.0",
      ),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    },
    // Environment file loading
    envPrefix: "VITE_",
    envDir: "./",
    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: mode === "development",
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ["react", "react-dom"],
            ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          },
        },
      },
    },
    // Preview configuration
    preview: {
      port: 8080,
      host: "::",
    },
  };
});
