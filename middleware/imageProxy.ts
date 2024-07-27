import { createProxyMiddleware } from "http-proxy-middleware";

const baseUrl = "https://meo.comick.pictures";

const imageProxy = createProxyMiddleware({
  target: baseUrl,
  changeOrigin: true,
});

export default imageProxy;
