# Accounts & Local Auth Override

Detail for Step 1–2 of SKILL.md.

## How the local auth override works

`php artisan local:set-up-authentication` (command:
`app/Console/Commands/SetUpLocalAuthentication.php`) rewrites the
`POST /login` route in `routes/admin/auth.php`, `routes/agent/auth.php`, and
`routes/candidate/auth.php` from the normal controller to:

```php
Route::post('/login', fn () => \Illuminate\Support\Facades\Auth::login(
    \App\Models\Admin::whereEmail(request()->email)->firstOrFail()
))->name('login.attempt');
```

So after running it, login finds the user **by email only** and logs them in —
the password field is ignored. This is why Admin/Candidate need only a valid
email on local. (The command refuses to run in the `production` environment.)

- Re-running is safe: it skips a portal whose route is already overridden.
- To restore the original controller-based login, `git checkout` the three
  `routes/*/auth.php` files.

## Admin accounts (ready to use)

| Role | Email |
|------|-------|
| Super admin | `stg.admin.superadmin@example.com` |
| Editor admin | `stg.admin.admin@example.com` |

## Golden rule when querying accounts

Top rows (smallest `id`) in `agents` / `candidates` are the **oldest** seed
data — often incomplete or broken, and they break UI/UX testing. Always:

- Filter by your test condition **AND** order by `id DESC` (newest first).
- NEVER use a query that returns the first/arbitrary row
  (`Agent::query()->value('email')` returns the oldest — do not use it).
- If 3 accounts in a row fail to log in or have no data for the target screen,
  **STOP and ask the user** (see SKILL.md "STOP after 3 failed accounts").

## Picking an Agent

Agent login is the app default (no override) and needs password `Aa@123456`.
Find the **newest** active agent (newest data = most complete):

```bash
# newest agent (id DESC) — preferred
docker exec xs_php php artisan tinker --execute="echo \App\Models\Agent::latest('id')->value('email');"
```

Adjust the query to match your test condition (specific enterprise, status, or
role), keeping `latest('id')` so you still get the newest match:

```bash
# example: newest agent matching a condition
docker exec xs_php php artisan tinker --execute="echo \App\Models\Agent::query()->where('status', 1)->latest('id')->value('email');"
```

Inspect columns first if unsure which to filter on:

```bash
docker exec xs_mysql mysql -uroot xseed -e "DESCRIBE agents;"
```

## Picking a Candidate

Candidate login uses the override (email only after Step 1). Pick the **newest**
candidate that fits the screen/condition you are testing:

```bash
# newest candidate (id DESC) — preferred
docker exec xs_php php artisan tinker --execute="echo \App\Models\Candidate::latest('id')->value('email');"
```

```bash
# example: newest candidate matching a condition
docker exec xs_php php artisan tinker --execute="echo \App\Models\Candidate::query()->where('status', 1)->latest('id')->value('email');"
```

```bash
# inspect columns to build a condition (profile completed, status, etc.)
docker exec xs_mysql mysql -uroot xseed -e "DESCRIBE candidates;"
```

Use the email you find in the browser login form (Step 3). If the candidate
you picked has no data for the target screen, try the next-newest — but stop
after 3 tries and ask the user.

## Creating a fresh account (if none fits)

Factories set password `Aa@123456` for Admin/Agent:

```bash
docker exec xs_php php artisan tinker --execute="echo \App\Models\Admin::factory()->superAdmin()->create()->email;"
docker exec xs_php php artisan tinker --execute="echo \App\Models\Agent::factory()->create()->email;"
docker exec xs_php php artisan tinker --execute="echo \App\Models\Candidate::factory()->create()->email;"
```
