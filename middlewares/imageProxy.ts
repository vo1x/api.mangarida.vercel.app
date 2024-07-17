import { createProxyMiddleware } from "http-proxy-middleware";

const baseUrl = "https://static.mangafire.to";

const imageProxy = createProxyMiddleware({
  target: baseUrl,
  changeOrigin: true,
});

export default imageProxy;
