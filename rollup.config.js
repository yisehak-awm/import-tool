import typescript from "@rollup/plugin-typescript";
import pkg from './package.json' with { type: 'json' };
import dts from "rollup-plugin-dts";
import image from "@rollup/plugin-image";
import terser from "@rollup/plugin-terser";

export default [
  {
    input: "src/index.ts",
    output: [
      {
        file: "dist/index.js",
        sourcemap: false,
        exports: "named",
      },
    ],
    plugins: [
      typescript(),
      image(),
      terser(),
    ],
    external: Object.keys(pkg.dependencies),
  },
  {
    input: "src/index.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    external: [/\.(sc|sa|c)ss$/],
    plugins: [ dts() ],
    external: Object.keys(pkg.dependencies),
  },
];