// @ts-check
import { defineConfig } from "astro/config"
import starlight from "@astrojs/starlight"
import cloudflare from "@astrojs/cloudflare"
import theme from "toolbeam-docs-theme"
import config from "./config.mjs"
import { rehypeHeadingIds } from "@astrojs/markdown-remark"
import rehypeAutolinkHeadings from "rehype-autolink-headings"

// https://astro.build/config
export default defineConfig({
  site: config.url,
  base: "/",
  output: "server",
  adapter: cloudflare({
    imageService: "passthrough",
  }),
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
      logo: {
        light: "./src/assets/sdk-wordmark-black.svg",
        dark: "./src/assets/sdk-wordmark-white.svg",
        replacesTitle: true,
      },
      sidebar: [
        "docs/quickstart",
        "docs/sdk",
        "docs/auth",
        "docs/mcp",
        "docs/examples",
        "docs/troubleshooting",
        {
          label: "Reference",
          items: ["docs/configuration", "docs/errors", "docs/faq"],
        },
        {
          label: "Project",
          items: ["docs/roadmap", "docs/contributing"],
        },
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
