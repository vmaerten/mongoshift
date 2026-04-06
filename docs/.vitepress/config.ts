import { defineConfig, type HeadConfig } from "vitepress";

const HOSTNAME = "https://mongoshift.dev";
const FULL_DESC =
  "MongoDB migrations with receipts. Dry-run, stored logs, file-hash drift detection, TypeScript-native.";

export default defineConfig({
  title: "mongoshift",
  titleTemplate: ":title | mongoshift",
  description: FULL_DESC,
  lang: "en-US",
  cleanUrls: true,

  sitemap: {
    hostname: HOSTNAME,
  },

  transformHead({ pageData }) {
    const url = `${HOSTNAME}/${pageData.relativePath}`
      .replace(/index\.md$/, "")
      .replace(/\.md$/, "");
    const title = pageData.frontmatter.title || pageData.title || "mongoshift";
    const desc = pageData.frontmatter.description || FULL_DESC;
    const isHome = pageData.relativePath === "index.md";

    const tags: HeadConfig[] = [
      ["link", { rel: "canonical", href: url }],
      ["meta", { property: "og:url", content: url }],
      ["meta", { property: "og:title", content: title }],
      ["meta", { property: "og:description", content: desc }],
      ["meta", { name: "twitter:title", content: title }],
      ["meta", { name: "twitter:description", content: desc }],
    ];

    // Build breadcrumb JSON-LD from path segments.
    const crumbs: Array<{ name: string; url: string }> = [{ name: "Home", url: HOSTNAME }];
    const parts = pageData.relativePath.replace(/\.md$/, "").split("/").filter(Boolean);
    if (parts.length > 0 && parts[0] !== "index") {
      if (parts[0] === "guide")
        crumbs.push({ name: "Guide", url: `${HOSTNAME}/guide/getting-started` });
      if (parts[0] === "reference")
        crumbs.push({ name: "Reference", url: `${HOSTNAME}/reference/config` });
      if (parts.length > 1) crumbs.push({ name: title, url });
    }

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: c.name,
        item: c.url,
      })),
    };

    tags.push(["script", { type: "application/ld+json" }, JSON.stringify(breadcrumbLd)]);

    // Homepage: add SoftwareApplication schema.
    if (isHome) {
      const appLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "mongoshift",
        description: FULL_DESC,
        url: HOSTNAME,
        applicationCategory: "DeveloperApplication",
        operatingSystem: "Linux, macOS, Windows",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      };
      tags.push(["script", { type: "application/ld+json" }, JSON.stringify(appLd)]);
    }

    return tags;
  },

  head: [
    ["link", { rel: "icon", type: "image/png", sizes: "96x96", href: "/favicon-96x96.png" }],
    ["link", { rel: "icon", type: "image/png", sizes: "48x48", href: "/favicon-48x48.png" }],
    ["link", { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" }],
    ["link", { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" }],
    ["meta", { name: "theme-color", content: "#8B5CF6" }],
    ["meta", { property: "og:type", content: "website" }],
    ["meta", { property: "og:image", content: `${HOSTNAME}/og-image.png` }],
    ["meta", { property: "og:image:width", content: "1200" }],
    ["meta", { property: "og:image:height", content: "630" }],
    ["meta", { name: "twitter:card", content: "summary_large_image" }],
    ["meta", { name: "twitter:image", content: `${HOSTNAME}/og-image.png` }],
    ["meta", { name: "twitter:creator", content: "@v_maerten" }],
    ["meta", { property: "og:site_name", content: "mongoshift" }],
    ["meta", { property: "og:locale", content: "en_US" }],
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
