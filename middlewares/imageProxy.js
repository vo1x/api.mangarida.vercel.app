const { createProxyMiddleware } = require("http-proxy-middleware");

const baseUrl = "https://static.mangafire.to";

const imageProxy = createProxyMiddleware({
  target: baseUrl,
  changeOrigin: true,
});

module.exports = imageProxy;
