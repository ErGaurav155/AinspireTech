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

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        puppeteer: false,
        "puppeteer-core": false,
        "chrome-aws-lambda": false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.module.exprContextCritical = false;

    return config;
  },

  experimental: {
    serverComponentsExternalPackages: ["puppeteer-core", "chrome-aws-lambda"],
  },

  transpilePackages: [],

  // Increase timeout for API routes
  staticPageGenerationTimeout: 60,
};

module.exports = nextConfig;
