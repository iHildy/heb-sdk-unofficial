// @ts-check
// Docker-specific Astro config - uses static output instead of Cloudflare SSR
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import theme from "toolbeam-docs-theme"
import config from "./config.mjs"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import { passthroughImageService } from "astro/config"

// https://astro.build/config
export default defineConfig({
  site: config.url,
  base: "/",
  output: "static",
  image: {
    service: passthroughImageService(),
  },
  devToolbar: {
    enabled: false,
  },
  server: {
    host: "0.0.0.0",
  },
  markdown: {
    rehypePlugins: [rehypeHeadingIds, [rehypeAutolinkHeadings, { behavior: "wrap" }]],
  },
  build: {},
  integrations: [
    starlight({
      title: "HEB SDK (Unofficial) Docs",
      favicon: "/favicon.svg",
      head: [
        {
          tag: "link",
          attrs: {
            rel: "icon",
            href: "/favicon.svg",
          },
        },
      ],
      lastUpdated: true,
      expressiveCode: { themes: ["github-light", "github-dark"] },
      social: [
        { icon: "github", label: "GitHub", href: config.github },
      ],
      editLink: {
        baseUrl: `${config.github}/edit/main/packages/docs/`,
      },
      markdown: {
        headingLinks: false,
      },
      customCss: ["./src/styles/custom.css"],
      sidebar: [
        "docs/quickstart",
        "docs/sessions",
        "docs/sdk",
        "docs/examples",
        "docs/faq",
        {
          label: "SDK Reference",
          items: ["docs/api-reference", "docs/data-models", "docs/configuration", "docs/errors"],
        },
        {
          label: "MCP Server",
          items: [
            "docs/mcp",
            "docs/mcp/client-guide",
            "docs/mcp/examples",
            "docs/mcp/tools",
            "docs/mcp/architecture",
            "docs/mcp/hosting",
          ],
        },
        "docs/troubleshooting",
      ],
      components: {
        Hero: "./src/components/Hero.astro",
        Head: "./src/components/Head.astro",
        Header: "./src/components/Header.astro",
        SiteTitle: "./src/components/SiteTitle.astro",
        Footer: "./src/components/Footer.astro",
      },
      plugins: [
        theme({
          headerLinks: [],
        }),
      ],
    }),
  ],
})
