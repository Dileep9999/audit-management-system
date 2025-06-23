import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/", // This is the base path for your app, adjust as needed
  // base: "/static/dist/"
  build: {
    outDir: '../static/dist', // or any path you want
  },

  resolve: {
    alias: {
      "@src": path.resolve(__dirname, "./src/"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@data": path.resolve(__dirname, "./src/data"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@views": path.resolve(__dirname, "./src/views"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@common": path.resolve(__dirname, "./src/components/CommonComponents"),
      "@constants": path.resolve(__dirname, "./src/components/Constants"),
      "@custom": path.resolve(__dirname, "./src/components/custom"),
      "@layoutComponent": path.resolve(
        __dirname,
        "./src/components/LayoutComponent",
      ),
      "@dtos": path.resolve(__dirname, "./src/dtos"),
      "@apidata": path.resolve(__dirname, "./src/apidata"),
      "@routing": path.resolve(__dirname, "./src/routes"),
      "@layout": path.resolve(__dirname, "./src/layout"),
      "@nonLayout": path.resolve(__dirname, "./src/layout"),
      "@api": path.resolve(__dirname, "./src/api"),
      // '@fullcalendar/resource-timeline': '/node_modules/@fullcalendar/resource-timeline',
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
      },
    },
  },
});
