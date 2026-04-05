samcarbons_postactivation_loading_ready
SELECT samcarbons_destoning.ds_bag_no AS bag_no,
    samcarbons_destoning.weight_out AS weight,
    'exkiln'::text AS grade,
    samcarbons_destoning.final_destination AS status,
    samcarbons_destoning.bag_generated_timestamp AS create_date_time
   FROM samcarbons_destoning
  WHERE samcarbons_destoning.is_loaded = false
UNION ALL
 SELECT samcarbons_postactivation.bag_no,
    samcarbons_postactivation.bag_weight AS weight,
    samcarbons_postactivation.grade,
    samcarbons_postactivation.stock_status AS status,
    samcarbons_postactivation.bag_no_created_dttm AS create_date_time
   FROM samcarbons_postactivation
  WHERE samcarbons_postactivation.is_loaded = false;

  samcarbons_postactivation_loading_ready

   SELECT samcarbons_destoning.ds_bag_no AS bag_no,
    samcarbons_destoning.weight_out AS weight,
    'exkiln'::text AS grade,
    samcarbons_destoning.final_destination AS status,
    samcarbons_destoning.bag_generated_timestamp AS create_date_time
   FROM samcarbons_destoning
  WHERE samcarbons_destoning.is_loaded = false
UNION ALL
 SELECT samcarbons_postactivation.bag_no,
    samcarbons_postactivation.bag_weight AS weight,
    samcarbons_postactivation.grade,
    samcarbons_postactivation.stock_status AS status,
    samcarbons_postactivation.bag_no_created_dttm AS create_date_time
   FROM samcarbons_postactivation
  WHERE samcarbons_postactivation.is_loaded = false;

  samcarbons_postactivation_process_view
 SELECT samcarbons_de_dusting_out.bag_no,
    samcarbons_de_dusting_out.bag_weight,
    samcarbons_de_dusting_out.grade,
    samcarbons_de_dusting_out.bag_no_created_dttm,
    samcarbons_de_dusting_out.stock_status
   FROM samcarbons_de_dusting_out
  WHERE samcarbons_de_dusting_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT samcarbons_de_magnetize_out.bag_no,
    samcarbons_de_magnetize_out.bag_weight,
    samcarbons_de_magnetize_out.grade,
    samcarbons_de_magnetize_out.bag_no_created_dttm,
    samcarbons_de_magnetize_out.stock_status
   FROM samcarbons_de_magnetize_out
  WHERE samcarbons_de_magnetize_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT samcarbons_crushing_out.bag_no,
    samcarbons_crushing_out.bag_weight,
    samcarbons_crushing_out.grade,
    samcarbons_crushing_out.bag_no_created_dttm,
    samcarbons_crushing_out.stock_status
   FROM samcarbons_crushing_out
  WHERE samcarbons_crushing_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT samcarbons_blending_out.bag_no,
    samcarbons_blending_out.bag_weight,
    samcarbons_blending_out.grade,
    samcarbons_blending_out.bag_no_created_dttm,
    samcarbons_blending_out.stock_status
   FROM samcarbons_blending_out
  WHERE samcarbons_blending_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT samcarbons_screening_out.bag_no,
    samcarbons_screening_out.bag_weight,
    samcarbons_screening_out.grade,
    samcarbons_screening_out.bag_no_created_dttm,
    samcarbons_screening_out.stock_status
   FROM samcarbons_screening_out
  WHERE samcarbons_screening_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT samcarbons_destoning.ds_bag_no AS bag_no,
    samcarbons_destoning.weight_out AS bag_weight,
    'exkiln'::text AS grade,
    samcarbons_destoning.bag_generated_timestamp AS bag_no_created_dttm,
    samcarbons_destoning.final_destination AS stock_status
   FROM samcarbons_destoning
  WHERE samcarbons_destoning.final_destination = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text]);



samcarbons_postactivation_loaded

 SELECT samcarbons_destoning.ds_bag_no AS bag_no,
    'exkiln'::text AS grade,
    samcarbons_destoning.weight_out AS weight,
    samcarbons_destoning.screening_bag_weight AS reload_weight,
    samcarbons_destoning.screening_inward_time AS reload_time,
    samcarbons_destoning.final_destination AS status
   FROM samcarbons_destoning
  WHERE samcarbons_destoning.is_loaded = true
UNION ALL
 SELECT samcarbons_postactivation.bag_no,
    samcarbons_postactivation.grade,
    samcarbons_postactivation.bag_weight AS weight,
    samcarbons_postactivation.reload_weight,
    samcarbons_postactivation.reload_time,
    samcarbons_postactivation.stock_status AS status
   FROM samcarbons_postactivation
  WHERE samcarbons_postactivation.is_loaded = true;