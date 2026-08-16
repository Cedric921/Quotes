#!/usr/bin/env bash
#
# Copies the Focus database from Supabase to Neon: schema, data, and the
# TypeORM `migrations` table, so `npm run db:migrate --workspace web` carries
# on from where the NestJS API stopped.
#
#   SOURCE_DATABASE_URL  Supabase *session* pooler (port 5432) or direct URL.
#                        Not the transaction pooler (6543): pg_dump needs a
#                        real session.
#   TARGET_DATABASE_URL  Neon *direct* (unpooled) URL, the one without
#                        "-pooler" in the host.
#
#   ./scripts/db/migrate-to-neon.sh            dump + restore + verify
#   ./scripts/db/migrate-to-neon.sh --verify   compare row counts only
#
# Run it once against an empty Neon branch as a rehearsal, then again for the
# real switch, with the admin closed so nothing is written in between.
set -euo pipefail

: "${SOURCE_DATABASE_URL:?set SOURCE_DATABASE_URL (Supabase session pooler)}"
: "${TARGET_DATABASE_URL:?set TARGET_DATABASE_URL (Neon direct URL)}"

here="$(cd "$(dirname "$0")" && pwd)"
dump="${DUMP_FILE:-$(mktemp -d)/focus.dump}"

verify() {
  "$here/compare-counts.sh"
}

if [[ "${1:-}" == "--verify" ]]; then
  verify
  exit
fi

# pg_dump must be at least as new as the server it reads.
echo "pg_dump: $(pg_dump --version)"

target_tables=$(psql "$TARGET_DATABASE_URL" -Atc \
  "select count(*) from information_schema.tables where table_schema = 'public'")
if [[ "$target_tables" != "0" && "${FORCE:-}" != "1" ]]; then
  echo "The target already has $target_tables tables in public." >&2
  echo "Restore into an empty database or branch, or rerun with FORCE=1 to replace them." >&2
  exit 1
fi

echo "Dumping the public schema from Supabase into $dump"
# Only `public`: Supabase's own schemas (auth, storage, realtime...) have no
# meaning on Neon. No owners or grants: the roles differ between the two.
pg_dump "$SOURCE_DATABASE_URL" \
  --schema=public \
  --format=custom \
  --no-owner \
  --no-privileges \
  --no-publications \
  --no-subscriptions \
  --file="$dump"

echo "Restoring into Neon"
# The uuid default of the older tables is uuid_generate_v4().
psql "$TARGET_DATABASE_URL" -qc 'create extension if not exists "uuid-ossp";'
pg_restore "$dump" \
  --dbname="$TARGET_DATABASE_URL" \
  --schema=public \
  --no-owner \
  --no-privileges \
  ${FORCE:+--clean --if-exists} \
  --exit-on-error

verify
echo "Done. The dump is kept at $dump"
