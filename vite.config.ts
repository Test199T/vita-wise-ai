import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { execSync } from "child_process";

// Get git info
const getGitHash = () => {
  try {
    return execSync("git rev-parse --short HEAD").toString().trim();
  } catch (e) {
    return "unknown";
  }
};

const commitHash = getGitHash();
const buildDate = new Date().toLocaleDateString('en-GB', {
  day: 'numeric', month: 'short', year: 'numeric'
});

const banner = `
/*!
 * VITA WISE AI - AI-Powered Health & Wellness Platform
 * Version: ${process.env.npm_package_version || "1.0.0"} (${commitHash})
 * Built: ${buildDate}
 * 
 * (c) 2024 Vita Wise AI. All rights reserved.
 */
`;

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), "");

  return {
    base: "/", // Changed to absolute root as user URL suggests root domain hosting
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
      __COMMIT_HASH__: JSON.stringify(commitHash),
    },
    // Environment file loading
    envPrefix: "VITE_",
    envDir: "./",
    // Build configuration
    build: {
      outDir: "dist",
      sourcemap: false, // Absolutely no source maps
      minify: 'terser',
      terserOptions: {
        format: {
          comments: false, // Remove ALL comments
        },
        compress: {
          drop_console: true, // Remove console.logs
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          // No banner
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
