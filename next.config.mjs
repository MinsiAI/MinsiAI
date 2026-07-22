const devApiProxyEnabled = process.env.MINSI_ENABLE_DEV_API_PROXY === "true";
const devApiOrigin = process.env.MINSI_DEV_API_ORIGIN || "http://127.0.0.1:8080";

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.MINSI_NEXT_DIST_DIR || ".next",
  async rewrites() {
    const rewrites = [];

    if (devApiProxyEnabled) {
      rewrites.push({
        source: "/api/:path*",
        destination: `${devApiOrigin}/api/:path*`
      });
    }

    return rewrites;
  }
};

export default nextConfig;
