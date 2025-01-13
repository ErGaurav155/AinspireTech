const path = require("path");

module.exports = {
  entry: "./components/widget.ts",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "widget.bundle.js",
    library: "Widget",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: "swc-loader", // Use SWC instead of Babel
        exclude: /node_modules/,
      },
    ],
  },
};
