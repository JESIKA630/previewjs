const fs = require("fs");
const path = require("path");
const { build } = require("esbuild");

const { version } = JSON.parse(
  fs.readFileSync(path.join(__dirname, "package.json"), "utf8")
);
if (!version) {
  throw new Error("Unable to detect version from package.json");
}

build({
  entryPoints: ["./src/index.ts"],
  minify: false,
  bundle: true,
  outfile: "./dist/index.js",
  external: ["vscode"],
  platform: "node",
  define: {
    "process.env.PREVIEWJS_PACKAGE_NAME": JSON.stringify(
      process.env.PREVIEWJS_PACKAGE_NAME || "@previewjs/pro"
    ),
    ...(process.env.PREVIEWJS_DEV === "1" && {
      "process.env.PREVIEWJS_MODULES_DIR": JSON.stringify(
        path.join(__dirname, "dev")
      ),
    }),
  },
}).catch((err) => {
  process.stderr.write(err.stderr);
  process.exit(1);
});
