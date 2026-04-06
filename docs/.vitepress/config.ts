import { defineConfig } from "vitepress";

export default defineConfig({
  title: "mongoshift",
  description:
    "MongoDB migrations with receipts. Dry-run, stored logs, file-hash drift detection, TypeScript-native.",
  lang: "en-US",
  cleanUrls: true,

  head: [
    ["link", { rel: "icon", href: "data:image/png;base64,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", type: "image/png" }],
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
    logo: "/logo.png",
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
