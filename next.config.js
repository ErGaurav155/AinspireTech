const path = require("path");

module.exports = {
  output: "standalone",

  webpack(config, { isServer }) {
    // Add custom webpack configuration only for the server-side (because the error occurs on the server side)
    if (isServer) {
      config.module.rules.push({
        test: /\.node$/,
        use: "null-loader",
        include: [path.resolve(__dirname, "node_modules/chrome-aws-lambda")],
      });
    }

    return config;
  },
};
