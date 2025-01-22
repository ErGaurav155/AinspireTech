const path = require("path");

const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add the package name to the externals array
    config.externals = [...config.externals, "chrome-aws-lambda"];

    return config;
  },
};

export default nextConfig;
