truncate table samcarbons_postactivation;

drop TRIGGER set_bag_no_on_postactivation ON samcarbons_postactivation; --BEFORE INSERT ON public.testbed_postactivation FOR EACH ROW EXECUTE FUNCTION public.trg_set_bag_no_postactivation();

INSERT INTO samcarbons_postactivation (
  operations,
  bag_no,
  bag_weight,
  grade,
  bag_no_created_dttm,
  bag_created_userid,
  stock_status,
  stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_weight,
  reload_userid,
  reload_machine,
  quality_userid,          -- fixed spelling
  quality_upd_dttime,
  machine,
  quality
)
SELECT
  'Screening'::text                 AS operations,
  bag_no,
  weight                            AS bag_weight,
  grade,
  screening_out_dt                  AS bag_no_created_dttm,
  userid                            AS bag_created_userid,
  delivery_status                   AS stock_status,
  stock_change_dt                   AS stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_bag_weight                 AS reload_weight,
  reload_userid,
  reload_machine,
  userid                        AS quality_userid,        -- or: userid
  screening_out_dt                  AS quality_upd_dttime,      -- or: NOW() or NULL
  machine,
  jsonb_build_object('CTC', ctc)    AS quality
FROM samcarbons_screening_outward
where delivery_status in ('InStock','Delivered');

INSERT INTO samcarbons_postactivation (
  operations,
  bag_no,
  bag_weight,
  grade,
  bag_no_created_dttm,
  bag_created_userid,
  stock_status,
  stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_weight,
  reload_userid,
  reload_machine,
  quality_userid,          -- fixed spelling
  quality_upd_dttime,
  machine,
  quality
)
SELECT
  'Screening'::text                 AS operations,
  bag_no,
  weight                            AS bag_weight,
  grade,
  screening_out_dt                  AS bag_no_created_dttm,
  userid                            AS bag_created_userid,
  delivery_status                   AS stock_status,
  stock_change_dt                   AS stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_bag_weight                 AS reload_weight,
  reload_userid,
  reload_machine,
  userid                        AS quality_userid,        -- or: userid
  screening_out_dt                  AS quality_upd_dttime,      -- or: NOW() or NULL
  machine,
  jsonb_build_object('CTC', ctc)    AS quality
FROM samcarbons_screening_outward
where delivery_status in ('Screening') and reload = 'InQue';

INSERT INTO samcarbons_postactivation (
  operations,
  bag_no,
  bag_weight,
  grade,
  bag_no_created_dttm,
  bag_created_userid,
  stock_status,
  stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_weight,
  reload_userid,
  reload_machine,
  quality_userid,          -- fixed spelling
  quality_upd_dttime,
  machine,
  quality
)
SELECT
  'Screening'::text                 AS operations,
  bag_no,
  weight                            AS bag_weight,
  grade,
  screening_out_dt                  AS bag_no_created_dttm,
  userid                            AS bag_created_userid,
  'Screening_Loaded'                   AS stock_status,
  stock_change_dt                   AS stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_bag_weight                 AS reload_weight,
  reload_userid,
  reload_machine,
  userid                        AS quality_userid,        -- or: userid
  screening_out_dt                  AS quality_upd_dttime,      -- or: NOW() or NULL
  machine,
  jsonb_build_object('CTC', ctc)    AS quality
FROM samcarbons_screening_outward
where delivery_status in ('Screening') and reload = 'loaded';

INSERT INTO samcarbons_postactivation (
  operations,
  bag_no,
  bag_weight,
  grade,
  bag_no_created_dttm,
  bag_created_userid,
  stock_status,
  stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_weight,
  reload_userid,
  reload_machine,
  quality_userid,          -- fixed spelling
  quality_upd_dttime,
  machine,
  quality
)
SELECT
  'Screening'::text                 AS operations,
  bag_no,
  weight                            AS bag_weight,
  grade,
  screening_out_dt                  AS bag_no_created_dttm,
  userid                            AS bag_created_userid,
  'Quality'                   AS stock_status,
  stock_change_dt                   AS stock_status_change_dttime,
  stock_change_userid,
  reload_time,
  reload_bag_weight                 AS reload_weight,
  reload_userid,
  reload_machine,
  userid                        AS quality_userid,        -- or: userid
  screening_out_dt                  AS quality_upd_dttime,      -- or: NOW() or NULL
  machine,
  jsonb_build_object('CTC', ctc)    AS quality
FROM samcarbons_screening_outward
where delivery_status in ('Re-Processing');

CREATE TRIGGER set_bag_no_on_postactivation BEFORE INSERT ON public.samcarbons_postactivation FOR EACH ROW EXECUTE FUNCTION public.trg_set_bag_no_postactivation();
