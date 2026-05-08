import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  let body: unknown = null;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  const p = body as Record<string, unknown> | null;
  if (!p || typeof p !== "object" || (p as { v?: number }).v !== 1) {
    return NextResponse.json({ ok: false, error: "invalid_payload" }, { status: 400 });
  }
  const id = `rq_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  console.log("[ring-quotes] received quote", { id, payload: p });
  return NextResponse.json({ ok: true, id });
}
