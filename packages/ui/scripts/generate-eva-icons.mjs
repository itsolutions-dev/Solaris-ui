// Writes src/components/icons/evaGlyphs.generated.ts from the `eva-icons` package
// (MIT, https://github.com/akveo/eva-icons), for the glyphs in iconMap.json only.
// An iconMap value is an Eva icon name: "close" is the outline drawing
// (outline/svg/close-outline.svg), "fill:star" the filled one (fill/svg/star.svg).
// Eva's SVGs are an invisible 24x24 <rect> plus filled <path>s (and <circle>s); anything else
// fails the run instead of being drawn wrong.
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const icons = path.join(here, "../src/components/icons");
const evaRoot = path.dirname(
  createRequire(import.meta.url).resolve("eva-icons/package.json"),
);

const map = JSON.parse(readFileSync(path.join(icons, "iconMap.json"), "utf8"));
const names = [...new Set(Object.values(map))].sort();

const glyphs = {};
for (const name of names) {
  const filled = name.startsWith("fill:");
  const stem = filled ? name.slice(5) : name;
  const file = filled
    ? path.join(evaRoot, "fill/svg", `${stem}.svg`)
    : path.join(evaRoot, "outline/svg", `${stem}-outline.svg`);
  let svg;
  try {
    svg = readFileSync(file, "utf8");
  } catch {
    throw new Error(`eva-icons has no "${name}" (${file})`);
  }
  const elements = [
    ...svg.matchAll(
      /<(path|rect|circle|ellipse|line|polygon|polyline)\b([^>]*)\/?>/g,
    ),
  ];
  const paths = [];
  for (const [, tag, attrs] of elements) {
    if (tag === "rect" && /opacity="0"/.test(attrs)) continue;
    const attr = (key) => new RegExp(`\\s${key}="([^"]+)"`).exec(attrs)?.[1];
    if (tag === "circle") {
      // A circle is two arcs: the same pixels as the <circle>.
      const [cx, cy, r] = ["cx", "cy", "r"].map((key) => Number(attr(key)));
      paths.push(
        `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0z`,
      );
      continue;
    }
    if (tag === "rect") {
      let [x, y, w, h] = ["x", "y", "width", "height"].map((key) =>
        Number(attr(key)),
      );
      const rx = Number(attr("rx") ?? 0);
      // Eva only rotates a bar about its own centre: 180 is a no-op and 90
      // swaps its sides. Any other transform would be drawn wrong, so fail.
      const turn = /^rotate\((-?[\d.]+) ([\d.]+) ([\d.]+)\)$/.exec(
        attr("transform") ?? "rotate(0 0 0)",
      );
      const [a, cx, cy] = turn ? turn.slice(1).map(Number) : [NaN, 0, 0];
      const about = a === 0 || (cx === x + w / 2 && cy === y + h / 2);
      if (!turn || !about || Math.abs(a) % 90 !== 0) {
        throw new Error(`"${name}": unsupported <rect> transform`);
      }
      if (Math.abs(a) % 180 === 90) {
        [x, y, w, h] = [x + w / 2 - h / 2, y + h / 2 - w / 2, h, w];
      }
      paths.push(
        `M${x + rx} ${y}H${x + w - rx}A${rx} ${rx} 0 0 1 ${x + w} ${y + rx}V${y + h - rx}A${rx} ${rx} 0 0 1 ${x + w - rx} ${y + h}H${x + rx}A${rx} ${rx} 0 0 1 ${x} ${y + h - rx}V${y + rx}A${rx} ${rx} 0 0 1 ${x + rx} ${y}z`,
      );
      continue;
    }
    if (tag !== "path" || !attr("d")) {
      throw new Error(
        `"${name}": unsupported <${tag}>, only <path>, <circle> and <rect> are drawn`,
      );
    }
    paths.push(attr("d"));
  }
  if (!paths.length) throw new Error(`"${name}" has no drawing`);
  glyphs[name] = paths;
}

// The package ships no LICENSE file (its README points at the repository), so
// the notice is the standard MIT text, credited to the author and licence in
// package.json. Check the copyright line against the upstream LICENSE.txt.
const pkg = JSON.parse(
  readFileSync(path.join(evaRoot, "package.json"), "utf8"),
);
if (pkg.license !== "MIT") {
  throw new Error(`eva-icons is ${pkg.license}, not MIT`);
}
const licence = [
  `Eva Icons (https://github.com/akveo/eva-icons), ${pkg.license} licence`,
  `Copyright (c) ${pkg.author}`,
  "",
  'Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:',
  "",
  "The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.",
  "",
  'THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.',
].join("\n");

const body = Object.entries(glyphs)
  .map(
    ([name, paths]) => `  ${JSON.stringify(name)}: ${JSON.stringify(paths)},`,
  )
  .join("\n");
writeFileSync(
  path.join(icons, "evaGlyphs.generated.ts"),
  `// Generated by scripts/generate-eva-icons.mjs from eva-icons (MIT). Do not edit.\n` +
    `/** Eva icon name -> the \`d\` of each filled path, on a 24x24 grid. */\n` +
    `export const EVA_GLYPHS: Record<string, string[]> = {\n${body}\n};\n\n` +
    `/** The licence of the drawings above; a copy of them must carry it. */\n` +
    `export const EVA_LICENSE = ${JSON.stringify(licence)};\n`,
);
console.log(`${names.length} Eva glyphs for ${Object.keys(map).length} names`);
