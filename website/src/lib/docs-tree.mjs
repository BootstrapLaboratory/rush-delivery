import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { parse as parseYaml } from "yaml";

export const websiteRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);
export const repoRoot = path.resolve(websiteRoot, "..");
export const docsTreePath = path.join(websiteRoot, "docs-tree.yaml");

export function loadDocsTree() {
  const tree = parseYaml(readFileSync(docsTreePath, "utf8"));

  if (
    typeof tree !== "object" ||
    tree === null ||
    !Array.isArray(tree.items) ||
    (tree.quickStartItems !== undefined && !Array.isArray(tree.quickStartItems))
  ) {
    throw new Error(
      "website/docs-tree.yaml must define items and optional quickStartItems arrays.",
    );
  }

  return tree;
}

function normalizeSource(source) {
  return path.relative(repoRoot, path.resolve(websiteRoot, source));
}

function allDocItems() {
  const tree = loadDocsTree();

  return [...tree.items, ...(tree.quickStartItems ?? [])];
}

export function flattenDocsTree(items = allDocItems()) {
  const pages = [];

  for (const item of items) {
    if (item.source !== undefined) {
      pages.push({
        description: item.description ?? "",
        slug: item.slug,
        source: normalizeSource(item.source),
        title: item.title,
      });
    }

    if (Array.isArray(item.children)) {
      pages.push(...flattenDocsTree(item.children));
    }
  }

  return pages;
}

function treeItemToSidebar(item) {
  if (Array.isArray(item.children)) {
    return {
      label: item.title,
      items: item.children.map(treeItemToSidebar),
    };
  }

  return {
    label: item.title,
    slug: `docs/${item.slug}`,
  };
}

export function buildSidebar() {
  const tree = loadDocsTree();

  return [
    {
      label: "Docs",
      items: tree.items.map(treeItemToSidebar),
    },
    {
      label: "Quick Start",
      items: (tree.quickStartItems ?? []).map(treeItemToSidebar),
    },
  ];
}
