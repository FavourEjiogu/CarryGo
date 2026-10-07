# CarryGo Supabase Auth configuration

CarryGo supports two passwordless email methods:
- Magic link: the user taps the secure link and returns to `/auth/callback`.
- Email OTP: the user enters the six-digit `{{ .Token }}` code directly in CarryGo.

Supabase uses the same `signInWithOtp` flow for both. The hosted project's email template determines whether the message contains a link, an OTP, or both. To support the CarryGo method selector, configure the passwordless email template to include both values.

## Hosted project settings

In Supabase Dashboard → Authentication → URL Configuration:

- Site URL: `https://carrygo-chi.vercel.app`
- Redirect URL: `https://carrygo-chi.vercel.app/auth/callback`
- Development redirect: `http://localhost:3000/**`

Use the exact production hostname used by CarryGo. Preview URLs should be added only when they are explicitly intended to be authenticated.

## Passwordless email template

In Supabase Dashboard → Authentication → Email Templates → Magic Link, use a message that includes both the confirmation link and the six-digit token.

Example:

```html
<h2>Sign in to CarryGo</h2>

<p>Choose the option that works best for you.</p>

<p><strong>Tap the secure button</strong> to sign in:</p>
<p>
  <a href="{{ .ConfirmationURL }}"
     style="display:inline-block;padding:12px 18px;background:#0b0d0c;color:#ffffff;text-decoration:none;border-radius:10px;">
    Continue to CarryGo
  </a>
</p>

<p>Or enter this six-digit code in CarryGo:</p>
<p style="font-size:28px;font-weight:700;letter-spacing:8px;">
  {{ .Token }}
</p>

<p>This message is one-time use. If you did not request it, you can ignore it.</p>
```

Do not hard-code the production hostname inside the template. `{{ .ConfirmationURL }}` carries the approved redirect destination.

## Important behavior

The CarryGo UI selector does not change the Supabase API method; it controls what the user does with the same passwordless message:
- Magic link → open `{{ .ConfirmationURL }}`.
- OTP → enter `{{ .Token }}` and call `verifyOtp({ email, token, type: 'email' })`.

Supabase's passwordless documentation confirms that Magic Links and email OTPs share the same `signInWithOtp` implementation and that the email template controls the content sent to the user. citeturn542799search0

## Security notes

Keep email OTP expiry at or below one day; shorter is better for an account-access code. Keep the Auth rate limits enabled. Do not put service-role keys into browser environment variables. CarryGo continues to use the publishable Supabase key in the client.