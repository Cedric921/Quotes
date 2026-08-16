#!/usr/bin/env bash
#
# Row counts of every table in `public`, side by side on both databases.
# Exits non-zero when any table differs.
set -euo pipefail

: "${SOURCE_DATABASE_URL:?}"
: "${TARGET_DATABASE_URL:?}"

counts() {
  psql "$1" -At -F $'\t' <<'SQL'
select table_name,
       (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text
from information_schema.tables
where table_schema = 'public' and table_type = 'BASE TABLE'
order by table_name;
SQL
}

source_counts=$(counts "$SOURCE_DATABASE_URL")
target_counts=$(counts "$TARGET_DATABASE_URL")

status=0
printf '%-36s %10s %10s\n' table supabase neon
while IFS=$'\t' read -r table count; do
  other=$(awk -F '\t' -v t="$table" '$1 == t { print $2 }' <<<"$target_counts")
  mark=""
  if [[ "$count" != "$other" ]]; then mark="  <- differs"; status=1; fi
  printf '%-36s %10s %10s%s\n' "$table" "$count" "${other:-missing}" "$mark"
done <<<"$source_counts"

exit $status
