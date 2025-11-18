const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { GenerateSW, InjectManifest } = require('workbox-webpack-plugin');

const isProd = process.env.NODE_ENV === 'production';

module.exports = {
  entry: {
    app: "./src/index.js",
  },
  
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "[name]-bundle.js",
    publicPath: "/", 
    clean: true,
  },

  mode: isProd ? "production" : "development",

  devServer: {
    static: path.resolve(__dirname, "dist"),
    port: 8080,
    open: true,
    hot: true,
    compress: true,
    historyApiFallback: true,
  },

  module: {
    rules: [
      { test: /\.css$/i, use: ["style-loader", "css-loader"] },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: { loader: "babel-loader", options: { presets: ["@babel/preset-env"] } },
      },
      { test: /\.(png|jpe?g|gif|svg)$/i, type: "asset/resource" },
    ],
  },

  plugins: [
    new HtmlWebpackPlugin({ template: "./src/index.html", filename: "index.html", inject: "body" }),
    ...(isProd
      ? [new GenerateSW({ swDest: 'sw.js', clientsClaim: true, skipWaiting: true })]
      : [new InjectManifest({ swSrc: './src/sw.js', swDest: 'sw.js' })]
    ),
  ],

  resolve: { extensions: [".js"] },
};