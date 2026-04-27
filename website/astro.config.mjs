import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { buildSidebar } from "./src/lib/docs-tree.mjs";

const repository =
  process.env.GITHUB_REPOSITORY ?? "BootstrapLaboratory/rush-delivery";
const repositoryName = repository.split("/").at(-1) ?? "rush-delivery";
const isProjectPages = repositoryName !== "bootstraplaboratory.github.io";
const base =
  process.env.PAGES_BASE_PATH ??
  (isProjectPages ? `/${repositoryName}` : undefined);
const site =
  process.env.PAGES_SITE_URL ?? "https://bootstraplaboratory.github.io";

export default defineConfig({
  base,
  site,
  integrations: [
    starlight({
      title: "Rush Delivery",
      description: "Dagger-powered CI delivery framework for Rush monorepos.",
      editLink: {
        baseUrl:
          "https://github.com/BootstrapLaboratory/rush-delivery/edit/main/",
      },
      sidebar: buildSidebar(),
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/BootstrapLaboratory/rush-delivery",
        },
      ],
    }),
  ],
});
