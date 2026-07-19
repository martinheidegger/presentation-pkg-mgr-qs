import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Vite config — https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === "production" ? "/presentation-pkg-mgr-qs" : "/",
    build: {
      sourcemap: true,
      minify: true,
    },
    plugins: [react(), tailwindcss()],
    preview: {
      host: "0.0.0.0",
      port: parseInt(process.env.PORT || "8443"),
    },
  };
});
