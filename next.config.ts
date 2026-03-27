import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/booths", destination: "/", permanent: false },
      { source: "/booths/:path*", destination: "/", permanent: false },
      { source: "/festival", destination: "/", permanent: false },
      { source: "/favorites", destination: "/", permanent: false },
      { source: "/my", destination: "/", permanent: false },
      { source: "/my/:path*", destination: "/", permanent: false },
      { source: "/notices", destination: "/", permanent: false },
      { source: "/reviews", destination: "/", permanent: false },
      { source: "/guestbook", destination: "/", permanent: false },
      { source: "/moments", destination: "/", permanent: false },
      { source: "/tour", destination: "/", permanent: false },
      { source: "/stamp", destination: "/", permanent: false },
      { source: "/stamp/:path*", destination: "/", permanent: false },
      { source: "/timeline", destination: "/", permanent: false },
      { source: "/quiz", destination: "/", permanent: false },
      { source: "/card", destination: "/", permanent: false },
      { source: "/certificate", destination: "/", permanent: false },
      { source: "/photobooth", destination: "/", permanent: false },
      { source: "/share-card", destination: "/", permanent: false },
      { source: "/about", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
