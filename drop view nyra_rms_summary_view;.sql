drop view nyra_rms_summary_view;
CREATE OR REPLACE VIEW nyra_rms_summary_view AS
WITH inward_agg AS (
  SELECT
    inward_number,
    SUM(weight) AS inward_weight
  FROM nyra_material_inward_bag
  GROUP BY inward_number
),
outward_agg AS (
  SELECT
    inward_number,
    SUM(CASE WHEN grade ILIKE 'Grade%' THEN weight ELSE 0 END) AS gcharcoal_weight,
    SUM(CASE WHEN LOWER(grade) LIKE '%stone%' THEN weight ELSE 0 END) AS stones_weight,
    SUM(CASE WHEN LOWER(grade) LIKE '%unburnt%' THEN weight ELSE 0 END) AS unburnt_weight,
    SUM(CASE WHEN grade ILIKE '-20%' THEN weight ELSE 0 END) AS minus20_weight
  FROM nyra_material_outward_bag
  GROUP BY inward_number
)
SELECT
  r.material_arrivaltime,
  r.supplier_name,
  r.supplier_weight,
  r.inward_number,
  r.our_weight AS weight_at_security,

  COALESCE(i.inward_weight, 0) AS inward_weight,

  COALESCE(o.gcharcoal_weight, 0) AS gcharcoal_weight,
  COALESCE(o.stones_weight, 0) AS stones_weight,
  COALESCE(o.unburnt_weight, 0) AS unburnt_weight,
  COALESCE(o.minus20_weight, 0) AS minus20_weight,

  -- Computed fields
  (COALESCE(o.stones_weight, 0) + COALESCE(o.unburnt_weight, 0) + COALESCE(o.minus20_weight, 0)) AS physical_loss,
  (COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0)) AS total_weight_out,
  (COALESCE(i.inward_weight, 0) - r.our_weight) AS "inward-security_weight",
  (COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) AS "total_out-inward_weight",
   (COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) +
   (COALESCE(i.inward_weight, 0) - r.our_weight) as rms_inward_loss,
  (COALESCE(o.gcharcoal_weight, 0) - COALESCE(i.inward_weight, 0)) AS rms_processing_loss,
  ((COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) +
   (COALESCE(i.inward_weight, 0) - r.our_weight) + 
   (COALESCE(o.gcharcoal_weight, 0) - COALESCE(i.inward_weight, 0))) AS rms_total_loss,
   round((((COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) +
   (COALESCE(i.inward_weight, 0) - r.our_weight) + 
   (COALESCE(o.gcharcoal_weight, 0) - COALESCE(i.inward_weight, 0))) / r.our_weight) * 100,2) AS "rms_total_loss/our_weight",
   (COALESCE(i.inward_weight, 0) - r.supplier_weight) AS "inward-supplier_weight",
   ((COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) +
   (COALESCE(i.inward_weight, 0) - r.supplier_weight) + 
   (COALESCE(o.gcharcoal_weight, 0) - COALESCE(i.inward_weight, 0))) AS rms_total_loss_with_supplier_weight,
   round((((COALESCE(o.gcharcoal_weight, 0) + 
   COALESCE(o.stones_weight, 0) + 
   COALESCE(o.unburnt_weight, 0) + 
   COALESCE(o.minus20_weight, 0) -
   COALESCE(i.inward_weight, 0)) +
   (COALESCE(i.inward_weight, 0) - r.supplier_weight) + 
   (COALESCE(o.gcharcoal_weight, 0) - COALESCE(i.inward_weight, 0))) / r.supplier_weight) * 100,2) AS "rms_total_loss_with_supplier_wieght/our_weight"



FROM nyra_rawmaterial_rcvd r
LEFT JOIN inward_agg i ON r.inward_number = i.inward_number
LEFT JOIN outward_agg o ON r.inward_number = o.inward_number;













drop view samcarbons_dashboard_stages_summary_view;
CREATE OR REPLACE VIEW samcarbons_dashboard_stages_summary_view AS
SELECT
  -- 1. Raw Material Stock
  COALESCE(SUM(a.our_weight - COALESCE(b.total_inward_weight, 0)), 0) AS charcoal_stock,

  
  -- 3. RMS Outward Stock (outwarded, not yet loaded to kiln, and only valid grades)
  COALESCE((
    SELECT SUM(weight)
    FROM samcarbons_material_outward_bag
    WHERE kiln_feed_status IS NULL
      AND grade LIKE 'Grade%'
  ), 0) AS gcharcoal_stock,

  -- 4: kiln-out
  COALESCE((
  SELECT SUM(weight_with_stones)
  FROM samcarbons_kiln_output
  WHERE exkiln_stock = 'De-Stoning'
), 0) AS exkiln_with_stone_stock,

--- 5. De-Stoning
  COALESCE((
  SELECT SUM(weight_out)
  FROM samcarbons_destoning
  WHERE final_destination IN ('InStock', 'Screening')
), 0) AS exkiln_without_stone_stock,

--- grade_stock  
  COALESCE((
  SELECT SUM(weight)
  FROM samcarbons_screening_outward
  WHERE delivery_status = 'InStock'
), 0) AS final_grade_stock


FROM samcarbons_rawmaterial_rcvd a
LEFT JOIN (
  SELECT inward_number, SUM(weight) AS total_inward_weight
  FROM samcarbons_material_inward_bag
  GROUP BY inward_number
) b ON a.inward_number = b.inward_number
WHERE a.material_inward_status IS NULL;


const table = `samcarbons_rawmaterial_rcvd`
    const table1 = `samcarbons_material_inward_bag`

SELECT 
        a.inward_number,
        a.supplier_name,
        a.moisture,
        a.dust,
        a.ad_value,
        a.our_weight - COALESCE(b.total_weight, 0) AS weight
      FROM 
        samcarbons_rawmaterial_rcvd a
      LEFT JOIN (
        SELECT 
          inward_number, 
          SUM(weight) AS total_weight
        FROM 
          samcarbons_material_inward_bag
        GROUP BY 
          inward_number
      ) b ON a.inward_number = b.inward_number
      WHERE 
        a.material_inward_status IS NULL;


