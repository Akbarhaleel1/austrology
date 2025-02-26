// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

/** @type {import('next').NextConfig} */
const nextConfig = {
    async redirects() {
      return [
        {
          source: "/:path*",
          has: [{ type: "protocol", value: "http" }],
          destination: "https://austrology.vercel.app/:path*",
          permanent: true,
        },
      ];
    },
  };
  
  export default nextConfig;
  