const path = require("path");

module.exports = {
  entry: "./components/shared/widget.ts", // Your widget component
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "widget.bundle.js", // Bundle the widget into this file
    library: "Widget",
    libraryTarget: "umd",
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
};
