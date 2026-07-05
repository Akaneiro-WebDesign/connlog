import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_NEXT_PATH = "/set-password";

function getSafeNextPath(next: string | null) {
    if (!next || !next.startsWith("/") || next.startsWith("//")) {
        return DEFAULT_NEXT_PATH;
    }

    return next;
}

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url);

    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const next = getSafeNextPath(searchParams.get("next"));

    if (!tokenHash || type !== "invite") {
        return NextResponse.redirect(`${origin}/login`);
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type,
    });

    if (error) {
        return NextResponse.redirect(`${origin}/login`);
    }

    return NextResponse.redirect(`${origin}${next}`);
}