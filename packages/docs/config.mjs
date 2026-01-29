const stage = process.env.SST_STAGE || "dev"

const baseUrl = stage === "production" ? "https://heb-sdk-unofficial.hildy.io" : `https://${stage}.heb-sdk-unofficial.hildy.io`

export default {
  url: baseUrl,
  email: "hello@heb-sdk-unofficial.dev",
  socialCard: `${baseUrl}/social-share.svg`,
  github: "https://github.com/ihildy/heb-sdk-unofficial",
  community: "https://heb-sdk-unofficial.hildy.io",
  headerLinks: [],
}
