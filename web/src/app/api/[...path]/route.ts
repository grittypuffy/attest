
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = "http://127.0.0.1:8000";

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathString = path.join("/");
  const url = `${BACKEND_URL}/${pathString}${req.nextUrl.search}`;

  // console.log(`[Proxy] ${req.method} ${req.nextUrl.pathname} -> ${url}`);
  // console.log(`[Proxy] Incoming Cookies: ${req.headers.get("cookie") || "NONE"}`);

  try {
    const headers = new Headers(req.headers);
    headers.delete("host");
    headers.delete("connection");

    const body = req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined;

    const res = await fetch(url, {
      method: req.method,
      headers: headers,
      body: body,
      // @ts-expect-error - duplex option is required for streaming bodies in recent Node/Bun versions
      duplex: "half",
    });

    // console.log(`[Proxy] Backend responded with ${res.status}`);
    // console.log(`[Proxy] Backend Set-Cookie: ${res.headers.get("set-cookie") || "NONE"}`);

    const resHeaders = new Headers(res.headers);
    
    // Ensure CORS headers are passed if the browser expects them (even for same-origin, sometimes needed if credentials are involved)
    // But mainly, we just forward what backend gave.

    return new NextResponse(res.body, {
      status: res.status,
      headers: resHeaders,
    });

  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json({ error: "Proxy connection failed", details: String(error) }, { status: 502 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
export const OPTIONS = handler;
