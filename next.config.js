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
        "@sparticuz/chromium-min": false,
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.module.exprContextCritical = false;

    return config;
  },

  experimental: {
    serverComponentsExternalPackages: [
      "puppeteer-core",
      "@sparticuz/chromium-min",
    ],
  },

  transpilePackages: [],

  // Increase timeout for API routes
  staticPageGenerationTimeout: 60,

  // Add output standalone for better serverless compatibility
  output: "standalone",
};

module.exports = nextConfig;
