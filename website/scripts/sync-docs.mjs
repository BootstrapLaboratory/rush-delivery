import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { flattenDocsTree, repoRoot, websiteRoot } from "../src/lib/docs-tree.mjs";

const generatedDocsDir = path.join(websiteRoot, "src/content/docs/docs");
const githubBlobBase =
  "https://github.com/BootstrapLaboratory/rush-delivery/blob/main";

function stripLeadingHeading(markdown) {
  return markdown.replace(/^# .+\r?\n+/, "");
}

function escapeFrontmatterValue(value) {
  return JSON.stringify(value);
}

function routeForSlug(slug) {
  return `/docs/${slug}/`;
}

function relativeRoute(fromSlug, toSlug) {
  const fromDir = routeForSlug(fromSlug);
  const toDir = routeForSlug(toSlug);
  let relative = path.posix.relative(fromDir, toDir);

  if (!relative.startsWith(".")) {
    relative = `./${relative}`;
  }

  return `${relative}/`.replace(/\/+/g, "/").replace(/^\.\//, "");
}

function rewriteMarkdownLinks(markdown, page, sourceToSlug) {
  const sourceDir = path.dirname(path.join(repoRoot, page.source));

  return markdown.replace(
    /\]\((?!https?:\/\/|mailto:|#|\/)([^)\s]+)(#[^)]+)?\)/g,
    (_match, rawLink, rawHash = "") => {
      const targetPath = path
        .relative(repoRoot, path.resolve(sourceDir, rawLink))
        .replaceAll(path.sep, "/");
      const targetSlug = sourceToSlug.get(targetPath);

      if (targetSlug !== undefined) {
        return `](${relativeRoute(page.slug, targetSlug)}${rawHash})`;
      }

      return `](${githubBlobBase}/${targetPath}${rawHash})`;
    },
  );
}

async function main() {
  const pages = flattenDocsTree();
  const sourceToSlug = new Map(pages.map((page) => [page.source, page.slug]));

  await rm(generatedDocsDir, { force: true, recursive: true });
  await mkdir(generatedDocsDir, { recursive: true });

  await writeFile(
    path.join(generatedDocsDir, "index.md"),
    [
      "---",
      'title: "Docs"',
      'description: "Documentation for Rush Delivery."',
      "---",
      "",
      "Choose a page from the sidebar, or start with the [Quick Start](quick-start/).",
      "",
    ].join("\n"),
  );

  for (const page of pages) {
    const sourcePath = path.join(repoRoot, page.source);
    const markdown = rewriteMarkdownLinks(
      stripLeadingHeading(await readFile(sourcePath, "utf8")),
      page,
      sourceToSlug,
    );
    const outputPath = path.join(generatedDocsDir, `${page.slug}.md`);
    const frontmatter = [
      "---",
      `title: ${escapeFrontmatterValue(page.title)}`,
      ...(page.description
        ? [`description: ${escapeFrontmatterValue(page.description)}`]
        : []),
      "---",
      "",
    ].join("\n");

    await writeFile(outputPath, `${frontmatter}${markdown.trim()}\n`);
  }
}

await main();
