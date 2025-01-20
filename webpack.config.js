// const path = require("path");

// module.exports = {
//   entry: "./components/shared/widget.js",
//   output: {
//     path: path.resolve(__dirname, "public"),
//     filename: "widget.bundle.js",
//     library: "Widget",
//     libraryTarget: "umd",
//   },
//   resolve: {
//     extensions: [".ts", ".tsx", ".js"],
//   },
//   module: {
//     rules: [
//       {
//         test: /\.(ts|tsx)$/,
//         use: "swc-loader", // Use SWC instead of Babel
//         exclude: /node_modules/,
//       },
//     ],
//   },
// };
module.exports = {
  module: {
    rules: [
      // Handle TypeScript files
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      // Handle source maps
      {
        test: /\.map$/,
        use: "source-map-loader",
        enforce: "pre",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
module.exports = {
  devtool: false, // Disable source map generation
};
module.exports = {
  // Other webpack configuration...
  module: {
    rules: [
      {
        test: /\.map$/,
        use: "ignore-loader",
      },
      // Other loaders...
    ],
  },
};
