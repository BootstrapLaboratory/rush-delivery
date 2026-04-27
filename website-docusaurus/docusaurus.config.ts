import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";
import { themes as prismThemes } from "prism-react-renderer";

const repository =
  process.env.GITHUB_REPOSITORY ?? "BootstrapLaboratory/rush-delivery";
const repositoryName = repository.split("/").at(-1) ?? "rush-delivery";
const isProjectPages = repositoryName !== "bootstraplaboratory.github.io";
const baseUrl =
  process.env.PAGES_BASE_PATH ?? (isProjectPages ? `/${repositoryName}/` : "/");
const url =
  process.env.PAGES_SITE_URL ?? "https://bootstraplaboratory.github.io";

const config: Config = {
  title: "Rush Delivery",
  tagline: "Dagger-powered CI delivery for Rush monorepos.",
  favicon: "img/favicon.svg",

  url,
  baseUrl,
  organizationName: "BootstrapLaboratory",
  projectName: "rush-delivery",
  trailingSlash: true,

  future: {
    v4: true,
    faster: true,
  },

  onBrokenLinks: "throw",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          path: "docs",
          routeBasePath: "docs",
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/BootstrapLaboratory/rush-delivery/edit/main/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/rush-delivery-card.svg",
    navbar: {
      title: "Rush Delivery",
      logo: {
        alt: "Rush Delivery",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          type: "docSidebar",
          sidebarId: "quickStartSidebar",
          label: "Quick Start",
          position: "left",
        },
        {
          type: "docSidebar",
          sidebarId: "tutorialSidebar",
          label: "Tutorial",
          position: "left",
        },
        {
          href: "https://github.com/BootstrapLaboratory/rush-delivery",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "light",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Quick Start",
              to: "/docs/quick-start/github-actions",
            },
            {
              label: "GitHub Action",
              to: "/docs/github-action",
            },
            {
              label: "Metadata",
              to: "/docs/metadata",
            },
          ],
        },
        {
          title: "Project",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/BootstrapLaboratory/rush-delivery",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bootstrap Laboratory.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
