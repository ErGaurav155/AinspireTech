module.exports = {
  async headers() {
    return [
      {
        source: "/api/scrape-anu",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET" },
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
    ],
  },
};
