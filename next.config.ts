import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns"],
  },
};

export default withNextIntl(withPWA(nextConfig));
