# Brevo + Supabase Auth setup

CarryGo uses Supabase Auth for email sign-in. The app requests and verifies a six-digit OTP through Supabase; it does not send OTP mail from a Brevo Marketing campaign. Use Brevo as Supabase Auth's custom SMTP provider, so OTPs, magic links, and password resets remain validated by Supabase.

## Current status

The repository has not configured the hosted SMTP settings or verified a real production OTP. These steps require the Brevo and Supabase dashboards. Do not claim the integration is complete until the checklist below passes.

## Setup

1. In Brevo, open **Senders, Domains & Dedicated IPs**, add a domain you control, and publish the SPF/DKIM records exactly as shown by Brevo. Create and verify a sender under that domain. An active sender using a public mailbox is not a replacement for domain authentication.
2. In Brevo's **SMTP & API → SMTP** section, copy or generate an SMTP key. The SMTP password is the SMTP key, not a Marketing Automation key or API key.
3. In Supabase, go to **Authentication → Emails → SMTP Settings**, enable custom SMTP, then set host `smtp-relay.brevo.com`, port `587` (STARTTLS), SMTP username and SMTP key as displayed in Brevo, and the verified sender address.
4. Keep credentials only in the provider dashboards. Never commit them to GitHub or expose them in `NEXT_PUBLIC_*` frontend variables.
5. In the relevant Supabase email template, include `{{ .Token }}` for the six-digit OTP. If the magic-link option is retained, include a working `{{ .ConfirmationURL }}` link in the template too. Do not construct auth links in frontend code.
6. Separately check Supabase's production Site URL and redirect allowlist; they must permit `https://carrygo-chi.vercel.app` and any exact callback paths the app uses.

## Verification checklist

- [ ] Fresh sign-up delivers a six-digit code, and the latest code verifies.
- [ ] Wrong and expired codes show recoverable errors; resend is rate-limited.
- [ ] Magic link returns to the production domain, not localhost.
- [ ] Password reset reaches the production update-password screen.
- [ ] Brevo transactional logs show expected delivery events and SPF/DKIM pass.

References:
- Brevo's Supabase SMTP guide: https://developers.brevo.com/docs/supabase-smtp-integration
- Brevo SMTP guide: https://developers.brevo.com/docs/smtp-integration
- Supabase Auth email templates: https://supabase.com/docs/guides/auth/auth-email-templates
