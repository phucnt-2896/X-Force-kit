# OTP Retrieval & Figma Screenshot Compare

Detail for Step 4–5 of SKILL.md.

## How OTP works in this app

- 2FA is **mandatory** for all three portals (Admin/Agent/Candidate). Each
  model implements `TwoFactorAuthorization`.
- On login, `OTPService` generates a random 4-digit code
  (`random_int(0000, 9999)`), stores it in the `one_time_passwords` table, and
  emails it via `OTPMail`.
- The `2fa` middleware redirects unauthenticated-via-2FA users to
  `route('otp-form')` = `/otp`.
- Code expires in **1 minute** (`config('auth.two_factor.otp.expiry_minutes')`,
  default 1). Throttle: 5 attempts (`auth.throttle_max_attempts`).

### `one_time_passwords` columns

| Column | Meaning |
|--------|---------|
| `ownerable_type` | `App\Models\Admin` \| `Agent` \| `Candidate` |
| `ownerable_id` | the user id |
| `code` | 4-digit string |
| `expires_at` | unix timestamp |
| `used` | bool — set true after a successful verify |

## Method A — bundled script (primary)

```bash
./.claude/skills/local-browser-login-2fa/scripts/get-latest-otp.sh           # any portal
./.claude/skills/local-browser-login-2fa/scripts/get-latest-otp.sh Candidate # one portal
```

Returns the newest **unused** code. Exit 2 + hint if none found (log in first).

## Method B — raw DB query (tinker)

```bash
docker exec xs_php php artisan tinker --execute="echo \DB::table('one_time_passwords')->where('used',0)->latest('id')->value('code');"
```

Narrow to one user when several people are testing on the same DB:

```bash
docker exec xs_php php artisan tinker --execute="echo \DB::table('one_time_passwords')->where('ownerable_type','App\\\\Models\\\\Admin')->where('used',0)->latest('id')->value('code');"
```

## Method C — Mailpit (visual fallback)

The OTP email lands in Mailpit. Open the web UI and read the latest message:

- Web UI: `http://localhost:8025`
- API (latest message id, then its body):
  `http://localhost:8025/api/v1/messages`

Use this when you want to verify the email template itself, not just the code.

## Resending an expired OTP

If the code expired (1 min), click **resend** on the `/otp` screen (or
`POST /otp/resend`), then re-fetch with Method A. Do not reuse an old code —
`used`/expired codes fail verification.

## Figma screenshot compare (Step 5)

1. Browser screenshot of the implemented screen:
   `mcp__chrome-devtools__take_screenshot` (set full-page for tall layouts).
2. Figma design image of the matching node:
   `mcp__claude_ai_Figma__get_screenshot`. If the task gives a Figma URL/node,
   read the design context first
   (`mcp__claude_ai_Figma__get_design_context`) — follow the front-end HARD
   GATE: if the design is truncated, keep reading child nodes until the UI is
   fully clear; do not guess.
3. Compare: layout structure, spacing/padding/margins, colors, font
   size/weight, alignment, and exact text (i18n ja/en).
4. Write a concrete diff list, fix the code, re-screenshot, and repeat until
   major visual differences are gone.
