import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { generateSessionToken } from "@/lib/crypto";
import { logger } from "@/lib/logger";

/**
 * OAuth / Magic Link callback handler.
 * Supabase Auth redirects here after Google, Microsoft, or magic link authentication.
 * Links or creates a member_profile, then sets a short-lived session cookie
 * for the client-side establish page to consume.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const returnTo = requestUrl.searchParams.get("return") || "/";

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
  }

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.exchangeCodeForSession(code);

    if (authError || !session?.user) {
      logger.error("[oauth] Exchange failed", { error: authError?.message });
      return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
    }

    const user = session.user;
    const email = user.email;
    if (!email) {
      return NextResponse.redirect(new URL("/login?error=no_email", requestUrl.origin));
    }

    // Detect provider from Supabase user metadata
    const provider = user.app_metadata?.provider || "email"; // google, azure, email
    const providerLabel = provider === "azure" ? "microsoft" : provider; // normalize for DB

    const oauthName =
      user.user_metadata?.full_name || user.user_metadata?.name || email.split("@")[0];
    const avatarUrl = user.user_metadata?.avatar_url || null;
    const isMagicLink = provider === "email";

    const admin = createAdminClient();

    // Check if email already linked to an existing member_profile
    const { data: existing } = await admin
      .from("member_profiles")
      .select("id, name, org, org_type, role, auth_provider")
      .eq("email", email.toLowerCase())
      .maybeSingle();

    let memberId: string;
    let memberName: string;
    let memberOrg: string;
    let memberOrgType: string;
    let memberRole: string;
    let isNewUser = false;

    if (existing) {
      // Link existing account to provider (if not already linked to this provider)
      memberId = existing.id;
      memberName = existing.name;
      memberOrg = existing.org;
      memberOrgType = existing.org_type ?? "";
      memberRole = existing.role ?? "member";

      // Update provider info (only for OAuth, not magic link on local accounts)
      if (!isMagicLink && existing.auth_provider !== providerLabel) {
        await admin
          .from("member_profiles")
          .update({
            auth_provider: providerLabel,
            auth_provider_id: user.id,
            avatar_url: avatarUrl || undefined,
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else if (isMagicLink) {
        // Magic link verifies email
        await admin
          .from("member_profiles")
          .update({
            email_verified: true,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      }
    } else {
      // Create new member_profile
      let finalName = oauthName;
      const { data: nameCheck } = await admin
        .from("member_profiles")
        .select("id")
        .eq("name", finalName)
        .eq("org", "")
        .maybeSingle();

      if (nameCheck) {
        finalName = `${oauthName}_${Math.random().toString(36).slice(2, 6)}`;
      }

      const passwordHash = isMagicLink ? "magiclink" : `oauth:${providerLabel}`;

      const { data: newMember, error: insertError } = await admin
        .from("member_profiles")
        .insert({
          name: finalName,
          org: "",
          email: email.toLowerCase(),
          auth_provider: isMagicLink ? "local" : providerLabel,
          auth_provider_id: isMagicLink ? null : user.id,
          avatar_url: avatarUrl,
          email_verified: true,
          password_hash: passwordHash,
        })
        .select("id, name, org, org_type, role")
        .single();

      if (insertError) {
        logger.error("[oauth] Insert failed", { error: insertError.message });
        return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
      }

      memberId = newMember.id;
      memberName = newMember.name;
      memberOrg = newMember.org;
      memberOrgType = newMember.org_type ?? "";
      memberRole = newMember.role ?? "member";
      isNewUser = true;
    }

    // Generate session token
    const token = await generateSessionToken(memberId);

    const sessionData = JSON.stringify({
      memberId,
      name: memberName,
      org: memberOrg,
      orgType: memberOrgType,
      role: memberRole,
      token,
      avatarUrl,
      authProvider: isMagicLink ? "local" : providerLabel,
      email,
    });

    const redirectUrl = isNewUser
      ? new URL("/auth/establish?return=/onboarding", requestUrl.origin)
      : new URL(`/auth/establish?return=${encodeURIComponent(returnTo)}`, requestUrl.origin);

    const response = NextResponse.redirect(redirectUrl);

    // Short-lived cookie (60 seconds, consumed immediately by establish page)
    response.cookies.set("__oauth_session", sessionData, {
      httpOnly: false, // Client JS needs to read it
      secure: true,
      sameSite: "lax",
      maxAge: 60,
      path: "/auth/establish",
    });

    return response;
  } catch (err) {
    logger.error("[oauth] Unexpected error", { error: String(err) });
    return NextResponse.redirect(new URL("/login?error=oauth_failed", requestUrl.origin));
  }
}
