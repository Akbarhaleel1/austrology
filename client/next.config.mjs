// /** @type {import('next').NextConfig} */
// const nextConfig = {};

// export default nextConfig;

import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl;

  // If request is HTTP, redirect to HTTPS
  if (url.protocol === "http:") {
    url.protocol = "https:";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
