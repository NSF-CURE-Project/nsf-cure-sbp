import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_BODY = 64 * 1024;

export async function POST(request: Request) {
  try {
    const length = Number(request.headers.get("content-length") ?? "0");
    if (Number.isFinite(length) && length > MAX_BODY) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    const text = await request.text();
    if (text.length > MAX_BODY) {
      return NextResponse.json({ ok: false }, { status: 413 });
    }
    let payload: unknown = null;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text };
    }
    console.error(
      JSON.stringify({
        level: "client",
        ts: new Date().toISOString(),
        ua: request.headers.get("user-agent") ?? undefined,
        payload,
      })
    );
  } catch {
    // best-effort
  }
  return NextResponse.json({ ok: true }, { status: 202 });
}
