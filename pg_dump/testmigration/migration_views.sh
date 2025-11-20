#!/usr/bin/env bash
set -euo pipefail

PGHOST="sam-carbons-db.ct6oskiisvfb.eu-north-1.rds.amazonaws.com"
PGPORT="5432"
PGUSER="postgresadmin"
PGSSLMODE="require"              # or "prefer" / "" if not needed

SOURCE_DB="sam-carbons-db"            # source DB
TARGET_DB="ActCarbon"            # target DB

# List of views you want to copy
VIEWS=(
  "public.samcarbons_dashboard_stages_summary_view"
  "public.samcarbons_kiln_daily_summary"
  "public.samcarbons_rms_summary_view"
  "public.samcarbons_rms_summary_view_v2"
)

# export PGPASSWORD="your_password_here"
export PGPASSWORD="kondadam123#"

export PGHOST PGPORT PGUSER PGSSLMODE

echo ">>> Dropping views in target DB '$TARGET_DB' (if they exist)..."
for V in "${VIEWS[@]}"; do
  echo "    - $V"
  psql "$TARGET_DB" -c "DROP VIEW IF EXISTS $V CASCADE;"
done

echo ">>> Dumping selected views from '$SOURCE_DB' and restoring into '$TARGET_DB'..."

DUMP_ARGS=()
for V in "${VIEWS[@]}"; do
  DUMP_ARGS+=(--table="$V")
done

pg_dump \
  --schema-only \
  --no-owner \
  --no-privileges \
  "${DUMP_ARGS[@]}" \
  "$SOURCE_DB" \
  | psql "$TARGET_DB"

echo ">>> Done. Copied views:"
for V in "${VIEWS[@]}"; do
  echo "    - $V"
done
