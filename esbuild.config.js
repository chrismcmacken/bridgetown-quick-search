import * as path from "path";
import glob from "glob"
import esbuild from "esbuild"
import { readFileSync } from "fs";

const deps = Object.keys(JSON.parse(readFileSync("./package.json")).dependencies)

;(async function () {
  let entries = glob
    .sync("frontend/javascript/**/*.js")
    .map((file) => {
      return "." + path.sep + path.join(path.dirname(file), path.basename(file, path.extname(file)))
    });

  const defaultConfig = {
    entryPoints: ["./frontend/javascript/index.js"],
    sourcemap: true,
    platform: "browser",
    target: "es2018",
    watch: process.argv.includes("--watch"),
    color: true,
    bundle: true,
    external: []
  }

  const startTime = Number(new Date())

  await Promise.all[
    esbuild.build({
      ...defaultConfig,
      outfile: "frontend/dist/bundle/index.js",
      format: "esm",
      minify: true,
    }),

    esbuild.build({
      ...defaultConfig,
      entryPoints: entries,
      outdir: 'frontend/dist',
      format: 'esm',
      target: "es2020",
      splitting: true,
    	external: deps,
      chunkNames: 'chunks/[name]-[hash]',
    })
  ]

  const endTime = Number(new Date())
  const buildTime = endTime - startTime

  console.log(`Build complete in ${buildTime}ms! ✨`)
})()
