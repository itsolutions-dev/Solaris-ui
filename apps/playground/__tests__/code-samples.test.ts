/// <reference types="node" />
import fs from "fs";
import path from "path";
import * as Solaris from "@its/solaris-ui";

// The site's pages show copyable code (template literals). Every name such a sample imports
// from the library must still be exported, or a reader's first paste fails to compile; type
// imports (`type X`) are skipped because they leave no runtime trace to check.
const ROOTS = ["app", "site"].map((dir) => path.join(__dirname, "..", dir));

const sourceFiles = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) ? [full] : [];
  });

const sampleImports = (source: string) =>
  [...source.matchAll(/`([^`]*)`/g)].flatMap(([, sample]) =>
    [
      ...sample.matchAll(/import\s*\{([^}]*)\}\s*from\s*"@its\/solaris-ui"/g),
    ].flatMap(([, list]) =>
      list
        .split(",")
        .map((name) => name.trim())
        .filter((name) => name && !name.startsWith("type ")),
    ),
  );

describe("code samples on the site", () => {
  it("import only names the library exports", () => {
    const missing = ROOTS.flatMap(sourceFiles).flatMap((file) =>
      sampleImports(fs.readFileSync(file, "utf8"))
        .filter((name) => !(name in Solaris))
        .map((name) => `${path.basename(file)}: ${name}`),
    );
    expect(missing).toEqual([]);
  });
});
