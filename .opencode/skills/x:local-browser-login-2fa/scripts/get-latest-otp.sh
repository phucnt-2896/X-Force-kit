#!/usr/bin/env bash
# Get the latest valid OTP (one-time password) code straight from the database.
#
# The app stores every generated OTP in the `one_time_passwords` table:
#   columns: ownerable_type (App\Models\Admin|Agent|Candidate), ownerable_id,
#            code (4 digits), expires_at (unix ts), used (bool)
#
# This reads the newest UNUSED code via `php artisan tinker` inside the PHP
# container, so the value is fetched without touching email/log.
#
# Usage (run from project root):
#   ./get-latest-otp.sh                 # newest unused OTP, any portal
#   ./get-latest-otp.sh Admin           # newest unused OTP for an Admin
#   ./get-latest-otp.sh Candidate       # newest unused OTP for a Candidate
#   ./get-latest-otp.sh Agent           # newest unused OTP for an Agent
#
# Env overrides:
#   PHP_CONTAINER   PHP container name (default: xs_php)

set -euo pipefail

ROLE="${1:-}"                         # optional: Admin | Agent | Candidate
PHP_CONTAINER="${PHP_CONTAINER:-xs_php}"

# Build the query-builder filter. ownerable_type holds the full model class.
FILTER=""
if [[ -n "$ROLE" ]]; then
  # Double backslash so it survives bash -> docker -> tinker quoting.
  FILTER="->where('ownerable_type', 'App\\\\Models\\\\${ROLE}')"
fi

# `echo` prints the value with no tinker decoration; latest('id') = newest row.
PHP_SNIPPET="echo \\DB::table('one_time_passwords')->where('used', 0)${FILTER}->latest('id')->value('code');"

CODE="$(docker exec "$PHP_CONTAINER" php artisan tinker --execute="$PHP_SNIPPET" 2>/dev/null | tr -d '[:space:]')"

if [[ -z "$CODE" ]]; then
  echo "ERROR: no unused OTP found in DB${ROLE:+ for role $ROLE}." >&2
  echo "Hint: submit the login form first so an OTP row is created, then re-run." >&2
  exit 2
fi

echo "$CODE"
