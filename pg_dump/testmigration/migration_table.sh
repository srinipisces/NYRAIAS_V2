#!/usr/bin/env bash
set -euo pipefail

########################################
# CONFIG – CHANGE THESE VALUES
########################################
PGHOST="sam-carbons-db.ct6oskiisvfb.eu-north-1.rds.amazonaws.com"
PGPORT="5432"
PGUSER="postgresadmin"
PGSSLMODE="require"              # or "prefer" / "" if not needed

SOURCE_DB="sam-carbons-db"            # source DB
TARGET_DB="ActCarbon"            # target DB

# List of tables you want to copy (schema-qualified)
TABLES=(
  "public.samcarbons_rawmaterial_rcvd"
  "public.samcarbons_rawmaterial_inward_history"  
  "public.samcarbons_material_inward_bag"
  "public.samcarbons_material_outward_bag"
  "public.samcarbons_kiln_output"
  "public.samcarbons_destoning"
  "public.samcarbns_screening_outward"
  "public.samcarbons_boiler_performance"
  "public.samcarbons_crusher_performance"
  "public.samcarbons_kiln_temp"
)

########################################
# OPTIONAL: password
########################################
export PGPASSWORD="kondadam123#"

export PGHOST PGPORT PGUSER PGSSLMODE

echo ">>> Dropping tables in target DB '$TARGET_DB' (if they exist)..."
for T in "${TABLES[@]}"; do
  echo "    - $T"
  psql "$TARGET_DB" -c "DROP TABLE IF EXISTS $T CASCADE;"
done

echo ">>> Dumping selected tables from '$SOURCE_DB' and restoring into '$TARGET_DB'..."

# Build the --table arguments
DUMP_ARGS=()
for T in "${TABLES[@]}"; do
  DUMP_ARGS+=(--table="$T")
done

# Dump only these tables from SOURCE_DB and pipe directly into TARGET_DB
pg_dump \
  --no-owner \
  --no-privileges \
  "${DUMP_ARGS[@]}" \
  "$SOURCE_DB" \
  | psql "$TARGET_DB"

echo ">>> Done. Copied tables:"
for T in "${TABLES[@]}"; do
  echo "    - $T"
done
