
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";


// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/");
          if (!normalizedId.includes("/node_modules/")) return;

          if (/\/node_modules\/(react|react-dom|scheduler)\//.test(normalizedId)) return "vendor-react";
          if (normalizedId.includes("/node_modules/@supabase/")) return "vendor-supabase";
          if (/\/node_modules\/(recharts|d3-[^/]+)\//.test(normalizedId)) return "vendor-charts";
          if (normalizedId.includes("/node_modules/@radix-ui/")) return "vendor-radix";
          if (normalizedId.includes("/node_modules/lucide-react/")) return "vendor-icons";
          if (/\/node_modules\/(date-fns|@tanstack|zod|react-hook-form|@hookform)\//.test(normalizedId)) return "vendor-data";

          return "vendor-misc";
        },
      },
    },
  },
}));
