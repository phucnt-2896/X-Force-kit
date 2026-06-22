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

## Picking an Agent

Agent login is the app default (no override) and needs password `Aa@123456`.
Find an active agent whose enterprise is also active:

```bash
docker exec xs_php php artisan tinker --execute="echo \App\Models\Agent::query()->value('email');"
```

Adjust the query to match your test condition (e.g. a specific enterprise,
status, or role). Inspect columns first if unsure:

```bash
docker exec xs_mysql mysql -uroot xseed -e "DESCRIBE agents;"
```

## Picking a Candidate

Candidate login uses the override (email only after Step 1). Pick a candidate
that fits the screen/condition you are testing:

```bash
# example: newest candidate
docker exec xs_php php artisan tinker --execute="echo \App\Models\Candidate::latest('id')->value('email');"
```

```bash
# inspect columns to build a condition (profile completed, status, etc.)
docker exec xs_mysql mysql -uroot xseed -e "DESCRIBE candidates;"
```

Use the email you find in the browser login form (Step 3).

## Creating a fresh account (if none fits)

Factories set password `Aa@123456` for Admin/Agent:

```bash
docker exec xs_php php artisan tinker --execute="echo \App\Models\Admin::factory()->superAdmin()->create()->email;"
docker exec xs_php php artisan tinker --execute="echo \App\Models\Agent::factory()->create()->email;"
docker exec xs_php php artisan tinker --execute="echo \App\Models\Candidate::factory()->create()->email;"
```
