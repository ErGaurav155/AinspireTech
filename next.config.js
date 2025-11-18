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
        // Allow all Instagram CDN subdomains
        hostname: "**.cdninstagram.com",
      },
      {
        protocol: "https",
        // Allow all other Instagram domains
        hostname: "**.instagram.com",
      },
      {
        protocol: "https",
        // Allow all other Instagram domains
        hostname: "instagram.fnag6-3.fna.fbcdn.net",
      },
    ],
  },

  webpack: (config, { isServer }) => {
    // Exclude puppeteer-core from Webpack processing on the client side
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

    // For server-side, exclude puppeteer from processing
    config.module.exprContextCritical = false;

    return config;
  },

  // Ensure API routes are server-only
  experimental: {
    serverComponentsExternalPackages: [
      "puppeteer-core",
      "@sparticuz/chromium-min",
    ],
  },

  // Exclude puppeteer from client-side bundles
  transpilePackages: [], // Remove any puppeteer packages from here

  // Increase timeout for API routes
  staticPageGenerationTimeout: 300,
};

module.exports = nextConfig;
