import { defineConfig } from "tsdown";

export default defineConfig({
  format: ["esm"],
  dts: true,
  clean: true,
  target: "es2023",
  entry: ["./src/index.ts"],
});
