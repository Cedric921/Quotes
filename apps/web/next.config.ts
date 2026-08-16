import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeORM and its driver load files at runtime; bundling them breaks both.
  serverExternalPackages: ["typeorm", "pg"],
  experimental: {
    // TypeORM identifies entities by their class names: minified server code
    // renames them, unrelated entities collide and every query fails.
    serverMinification: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
    ],
  },
  /**
   * The API answered every origin when it lived on Render (`origin: true`),
   * and the mobile app's web build and local tools still rely on it. Native
   * apps send no Origin and ignore these headers.
   */
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,PATCH,DELETE,OPTIONS" },
          { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
        ],
      },
    ];
  },
};

export default nextConfig;
