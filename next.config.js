/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/api/scrape-anu",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, POST, OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type" },
        ],
      },
    ];
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.pexels.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        hostname: "**.instagram.com",
      },
      {
        protocol: "https",
        hostname: "instagram.fnag6-3.fna.fbcdn.net",
      },
    ],
  },

  experimental: {
    serverComponentsExternalPackages: [
      "@sparticuz/chromium-min",
      "puppeteer-core",
    ],
  },
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
};

module.exports = nextConfig;
