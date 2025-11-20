

  CREATE OR REPLACE VIEW samcarbons_postactivation_loading_ready AS
SELECT
  ds_bag_no::text                    AS bag_no,
  weight_out::numeric                AS weight,
  'exkiln'::text                     AS grade,
  final_destination::text            AS status,
  bag_generated_timestamp::timestamp AS create_date_time
FROM samcarbons_destoning
WHERE is_loaded = false

UNION ALL

SELECT
  bag_no::text                   AS bag_no,
  bag_weight::numeric            AS weight,
  grade::text                    AS grade,
  stock_status::text             AS status,
  bag_no_created_dttm::timestamp AS create_date_time
FROM samcarbons_postactivation
WHERE is_loaded = false;

CREATE OR REPLACE VIEW samcarbons_postactivation_loaded AS
SELECT
  ds_bag_no::text                    AS bag_no,
  'exkiln'::text                     AS grade,
  weight_out::numeric                AS weight,
  screening_bag_weight::numeric      AS reload_weight,
  screening_inward_time::timestamp   AS reload_time,
  final_destination::text            AS status
FROM samcarbons_destoning
WHERE is_loaded = true

UNION ALL

SELECT
  bag_no::text                       AS bag_no,
  grade::text                        AS grade,
  bag_weight::numeric                AS weight,
  reload_weight::numeric             AS reload_weight,
  reload_time::timestamp             AS reload_time,
  stock_status::text                 AS status
FROM samcarbons_postactivation
WHERE is_loaded = true;


samcarbons_dashboard_stages_summary_view

samcarbons_kiln_daily_summary

samcarbons_rms_summary_view

samcarbons_rms_summary_view_v2