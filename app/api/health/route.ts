import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export function GET() {
  return NextResponse.json({ status: "ok", app: "sefardlab", phase: 2, supabase: isSupabaseConfigured() });
}
