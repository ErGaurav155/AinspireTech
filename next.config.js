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
    domains: [
      "scontent.cdninstagram.com",
      "instagram.fdad1-1.fna.fbcdn.net",
      "instagram.fdad2-1.fna.fbcdn.net",
      // Add other Instagram CDN domains as needed
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "scontent.cdninstagram.com",
        pathname: "/**",
      },
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

  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core"],
};

module.exports = nextConfig;
