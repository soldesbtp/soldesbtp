/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  async redirects() {
    const domainsVercel = [
      "soldesbtp.vercel.app",
      "soldesbtp-soldesbtp1.vercel.app",
      "soldesbtp-git-main-soldesbtp1.vercel.app",
    ];

    return domainsVercel.map((hostname) => ({
      source: "/:path*",
      has: [{ type: "host", value: hostname }],
      destination: "https://soldesbtp.ma/:path*",
      permanent: true,
    }));
  },
};

module.exports = nextConfig;
