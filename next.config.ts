import type { NextConfig } from "next";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.module.rules.unshift({
        test: /\.(tsx|jsx)$/,
        exclude: /node_modules/,
        enforce: "pre" as const,
        use: [
          {
            loader: require.resolve("./component-tagger-loader.js"),
          },
        ],
      });
    }
    return config;
  },
};

export default nextConfig;
