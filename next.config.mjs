import { createRequire } from "module";
const require = createRequire(import.meta.url);

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.worldvectorlogo.com",
      },
    ],
  },
  webpack(config, { dev }) {
    if (dev) {
      config.module.rules.unshift({
        test: /\.(jsx|js)$/,
        exclude: /node_modules/,
        enforce: "pre",
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
