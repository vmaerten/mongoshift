import { defineConfig } from "vitepress";

export default defineConfig({
  title: "mongoshift",
  description:
    "MongoDB migrations with receipts. Dry-run, stored logs, file-hash drift detection, TypeScript-native.",
  lang: "en-US",
  cleanUrls: true,

  head: [
    ["link", { rel: "icon", href: "/logo.svg", type: "image/svg+xml" }],
    ["meta", { name: "theme-color", content: "#8B5CF6" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:title", content: "mongoshift" }],
    [
      "meta",
      {
        property: "og:description",
        content:
          "MongoDB migrations with receipts. Dry-run, stored logs, file-hash drift detection.",
      },
    ],
    ["meta", { property: "og:image", content: "/og-image.svg" }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:title", content: "mongoshift" }],
    [
      "meta",
      {
        name: "twitter:description",
        content:
          "MongoDB migrations with receipts. Dry-run, stored logs, file-hash drift detection.",
      },
    ],
    ["meta", { name: "twitter:image", content: "/og-image.svg" }],
  ],

  themeConfig: {
    logo: "/logo.svg",
    siteTitle: "mongoshift",

    nav: [
      { text: "Guide", link: "/guide/getting-started", activeMatch: "/guide/" },
      { text: "Reference", link: "/reference/config", activeMatch: "/reference/" },
      { text: "Team", link: "/team" },
      {
        text: "v0.1.0",
        items: [
          {
            text: "Changelog",
            link: "https://github.com/vmaerten/mongoshift/releases",
          },
          {
            text: "Contributing",
            link: "https://github.com/vmaerten/mongoshift/blob/main/README.md",
          },
        ],
      },
    ],

    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Why mongoshift", link: "/guide/why" },
            { text: "Installation", link: "/guide/getting-started" },
            { text: "Quick Start", link: "/guide/quick-start" },
          ],
        },
        {
          text: "Core Concepts",
          items: [
            { text: "Writing Migrations", link: "/guide/migrations" },
            { text: "Dry-Run Mode", link: "/guide/dry-run" },
            { text: "Stored Logs", link: "/guide/stored-logs" },
            { text: "File-Hash Drift", link: "/guide/file-hash" },
            { text: "Custom Templates", link: "/guide/templates" },
          ],
        },
        {
          text: "Upgrading",
          items: [{ text: "From migrate-mongo", link: "/guide/from-migrate-mongo" }],
        },
      ],
      "/reference/": [
        {
          text: "Reference",
          items: [
            { text: "Configuration", link: "/reference/config" },
            { text: "CLI Commands", link: "/reference/cli" },
            { text: "Programmatic API", link: "/reference/api" },
            { text: "Changelog Schema", link: "/reference/changelog-schema" },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/vmaerten/mongoshift" },
      { icon: "npm", link: "https://www.npmjs.com/package/mongoshift" },
    ],

    search: {
      provider: "local",
      options: {
        detailedView: true,
      },
    },

    editLink: {
      pattern: "https://github.com/vmaerten/mongoshift/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026 Valentin Maerten",
    },

    outline: {
      level: [2, 3],
      label: "On this page",
    },

    docFooter: {
      prev: "Previous",
      next: "Next",
    },
  },
});
