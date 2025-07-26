alter table samcarbon_crusher_performance rename to samcarbons_crusher_performance;
alter table samcarbon_inward_number_seq rename to samcarbons_inward_number_seq;    
alter table samcarbon_kiln_output rename to samcarbons_kiln_output          ;
alter table samcarbon_material_inward_bag rename to samcarbons_material_inward_bag  ;
alter table samcarbon_material_outward_bag rename to samcarbons_material_outward_bag ;
alter table samcarbon_rawmaterial_rcvd rename to samcarbons_rawmaterial_rcvd   ;  
alter table samcarbon_screening_outward rename to samcarbons_screening_outward ;   
alter table samcarbon_suppliers rename to samcarbons_suppliers   ;         
alter table samscarbon_authentication rename to samscarbons_authentication ;   



SELECT
            a.inward_number,
            b.supplier_name,

            -- Component weights
            SUM(CASE WHEN a.grade NOT IN ('Stones', 'Unburnt') THEN a.weight ELSE 0 END) AS weight,
            SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
            SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,

            -- Total (all grades combined)
            SUM(a.weight) AS total_weight,

            -- Percentages relative to total weight
            ROUND(SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_stone,
            ROUND(SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_unburnt,
            ROUND(SUM(CASE WHEN a.grade NOT IN ('Stones', 'Unburnt') THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_gcharcoal

            FROM samcarbons_material_outward_bag a
            LEFT JOIN samcarbons_rawmaterial_rcvd b
            ON a.inward_number = b.inward_number
            WHERE a.kiln_feed_status IS NULL
            GROUP BY a.inward_number, b.supplier_name
            ORDER BY a.inward_number;



select inward_number,supplier_name,moisture,dust,ad_value,our_weight as weight from samcarbons_rawmaterial_rcvd a
where material_outward_status is null; 
select sum(weight) from samcarbons_material_inward_bag b , samcarbons_rawmaterial_rcvd a 
where a.inward_number = b.inward_number groupg by b.inward_number;


select inward_number from samcarbons_rawmaterial_rcvd 
where material_outward_status is null and inward_number in (select inward_number from samcarbons_material_inward_bag)



SELECT inward_number 
      FROM samcarbons_rawmaterial_rcvd
      WHERE material_inward_status IS NOT NULL 
        AND material_outward_status IS NULL

SELECT DISTINCT a.inward_number
        FROM samcarbons_material_outward_bag a
        JOIN samcarbons_rawmaterial_rcvd b
          ON a.inward_number = b.inward_number
        WHERE b.kiln_feed_status is null;



SELECT
            a.inward_number,
            b.supplier_name,

            -- Component weights
            SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS weight,
            SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
            SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,
            SUM(CASE WHEN a.grade like '-20%' THEN a.weight ELSE 0 END) AS total_minus20_weight,

            -- Total (all grades combined)
            SUM(a.weight) AS total_weight,

            -- Percentages relative to total weight
            ROUND(SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_stone,
            ROUND(SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_unburnt,
            ROUND(SUM(CASE WHEN a.grade like '-20%' THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_minus20,
            ROUND(SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) * 100.0 / NULLIF(SUM(a.weight), 0), 2) AS percent_gcharcoal

            FROM samcarbons_material_outward_bag a
            LEFT JOIN samcarbons_rawmaterial_rcvd b
            ON a.inward_number = b.inward_number
            WHERE a.kiln_feed_status IS NULL
            GROUP BY a.inward_number, b.supplier_name
            ORDER BY a.inward_number;



scp -i ./SamCarbon.pem -r backend-api/*.* ubuntu@ec2-16-171-240-125.eu-north-1.compute.amazonaws.com/home/ubuntu/NYRAIAS/backend-api/



alter table nyra_screening_outward add reload_kiln text,
add reload_bag_weight numeric(12,2),
add reload_grade text,
add reload_ctc text,
add reload_machine text,
add reload_output_required text;

SELECT DISTINCT a.inward_number
        FROM samcarbons_rawmaterial_rcvd b
        JOIN  samcarbons_material_outward_bag a
          ON a.inward_number = b.inward_number
        WHERE b.kiln_feed_status is null


select bag_no from samcarbons_kiln_output where screening_inward_time is null and exkiln_stock = 'InStock' and from_the_kiln='Kiln A';



UPDATE samcarbons_authentication
SET access = ARRAY(
  SELECT ARRAY_AGG(
    CASE
      WHEN val = 'Operations.Material Outward' THEN 'Operations.Raw-Material Outward'
      ELSE val
    END
  )
  FROM UNNEST(access) AS val
)
WHERE 'Operations.Material Outward' = ANY(access);


update samcarbons_authentication set access = '{Operations.Security,Operations.Lab,"Operations.Raw-Material Inward","Operations.Crusher Performance","Operations.Raw-Material Outward","Operations.Kiln Feed","Operations.Kiln Feed Quality","Operations.Boiler Performance","Operations.Kiln Output","Operations.Screening Inward","Operations.Screening Outward",Operations.Stock,Reports}'
where userid = 'Murugan'
update samcarbons_authentication set access = '{Dashboard,Reports,Settings,Operations.Security,Operations.Lab,"Operations.Raw-Material Inward","Operations.Crusher Performance","Operations.Raw-Material Outward","Operations.Kiln Feed","Operations.Kiln Feed Quality","Operations.Boiler Performance","Operations.Kiln Output","Operations.Screening Inward","Operations.Screening Outward",Operations.Stock}'
where userid = 'admin'


insert into testbed_grade_settings values ('Raw-Material Outward',{
{'grade':'-20 1st Stage - Rotary A','status':'true','forward_pass':'false'},
{'grade':'-20 1st Stage - Rotary B','status':'true','forward_pass':'false'},
{'grade':'Grade 1st Stage - Rotary A','status':'true','forward_pass':'false'},
{'grade':'Grade 1st Stage - Rotary B','status':'true','forward_pass':'false'},
{'grade':'Stones','status':'true','forward_pass':'false'},
{'grade':'Unburnt','status':'true','forward_pass':'false'},
});


INSERT INTO testbed_grade_settings
VALUES (
  'Raw-Material Outward',
  '[
    {"grade": "-20 1st Stage - Rotary A", "status": true, "forward_pass": false},
    {"grade": "-20 1st Stage - Rotary B", "status": true, "forward_pass": false},
    {"grade": "Grade 1st Stage - Rotary A", "status": true, "forward_pass": false},
    {"grade": "Grade 1st Stage - Rotary B", "status": true, "forward_pass": false},
    {"grade": "Stones", "status": true, "forward_pass": false},
    {"grade": "Unburnt", "status": true, "forward_pass": false}
  ]'::jsonb
);


INSERT INTO testbed_grade_settings
VALUES (
  'Kiln',
  '[
    {"1": "Kiln A", "status": true},
    {"2": "Kiln B", "status": true},
    {"3": "Kiln C", "status": true}

  ]'::jsonb
);

INSERT INTO testbed_grade_settings
VALUES (
  'Screening Outward - grade',
  '[{"1": "6x12", "status": true}, 
{"2": "4x8", "status": true}, 
{"3": "8x16", "status": true}, 
{"4": "8x30", "status": true}, 
{"5": "Ex Kiln", "status": true}, 
{"6": "20x50", "status": true}, 
{"7": "+4", "status": true}, 
{"8": "+6", "status": true}, 
{"9": "-30", "status": true}]'::jsonb
);

update testbed_dropdown set settings =
'[{"1": "6x12", "status": true}, 
{"2": "4x8", "status": true}, 
{"3": "8x16", "status": true}, 
{"4": "8x30", "status": true}, 
{"5": "Ex Kiln", "status": true}, 
{"6": "20x50", "status": true}, 
{"7": "+4", "status": true}, 
{"8": "+6", "status": true}, 
{"9": "-30", "status": true}]'::jsonb 
where tabname = 'Screening Inward - grade';

update testbed_dropdown set settings =
'[{"1": "6x12", "status": true}, 
{"2": "4x8", "status": true}, 
{"3": "8x16", "status": true}, 
{"4": "8x30", "status": true}, 
{"5": "12x20", "status": true}, 
{"6": "20x40", "status": true}, 
{"7": "30x60", "status": true}, 
{"8": "12x40", "status": true}]'::jsonb
where tabname = 'Screening Inward - Output Required';

update testbed_dropdown set settings =
'[{"1": "-20 1st Stage - Rotary A", "status": true, "forward_pass": false}, 
{"2": "-20 1st Stage - Rotary B", "status": true, "forward_pass": false}, 
{"3": "Grade 1st Stage - Rotary A", "status": true, "forward_pass": false}, 
{"4": "Grade 1st Stage - Rotary B", "status": true, "forward_pass": false}, 
{"5": "Stones", "status": true, "forward_pass": false}, 
{"6": "Unburnt", "status": true, "forward_pass": false}]'::jsonb
where tabname = 'Raw-Material Outward';


SELECT 
    inward_number,
    bag_no,
    grade,
    weight,
    kiln,
    kiln_loaded_weight,grade_plus2,grade_2by3,grade_3by6,grade_6by8,grade_8by10,grade_10by12,grade_12by14,
    grade_minus14,feed_moisture,dust,feed_volatile,remarks,kiln_load_time,kiln_quality_updt,kiln_feed_quality_sysentry
  FROM 
    testbed_material_outward_bag 
  WHERE 
    kiln_quality_updt is not null and grade in ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B')
    order by kiln_feed_quality_sysentry desc limit 10

    select bag_no from testbed_material_outward_bag where kiln_feed_status is null and inward_number = 'I-1002' and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') and kiln_quality_updt is not null


        select bag_no from testbed_material_outward_bag where kiln_feed_status is null and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') and kiln_quality_updt is null


        select inward_number,bag_no from testbed_material_outward_bag where kiln_quality_updt is null and kiln_feed_status is null and grade in('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') ;





truncate samcarbons_material_inward_bag;
truncate samcarbons_crusher_performance;
truncate samcarbons_material_outward_bag;
truncate samcarbons_screening_outward;
truncate samcarbons_kiln_temp;
truncate samcarbons_rawmaterial_rcvd;
truncate samcarbons_boiler_performance;
truncate samcarbons_kiln_output;



SELECT
          a.inward_number,
          c.material_outward_status,
          c.material_inward_status,
          c.kiln_feed_status,
          c.supplier_name,
          c.supplier_weight as supplier_weight,
          c.our_weight as weight_at_security,
          COALESCE(b.inward_weight, 0) AS RMS_inward_weight,
          (COALESCE(b.inward_weight, 0)-c.our_weight) as RMS_inward_loss,
          SUM(CASE WHEN a.grade IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS Grade_Weight,
          SUM(CASE WHEN a.grade = 'Grade 1st stage - Rotary A' THEN a.weight ELSE 0 END) AS Grade_A,
          SUM(CASE WHEN a.grade = 'Grade 2nd stage - Rotary B' THEN a.weight ELSE 0 END) AS Grade_B,
          SUM(CASE WHEN a.grade = 'Stones' THEN a.weight ELSE 0 END) AS total_stone_weight,
          SUM(CASE WHEN a.grade = 'Unburnt' THEN a.weight ELSE 0 END) AS total_unburnt_weight,
          SUM(CASE WHEN a.grade = '-20 2nd Stage - Rotary B' THEN a.weight ELSE 0 END) AS total_20B,
          SUM(CASE WHEN a.grade = '-20  1st Stage - Rotary A' THEN a.weight ELSE 0 END) AS total_20A,
          SUM(CASE WHEN a.grade NOT IN ('Grade 1st stage - Rotary A', 'Grade 2nd stage - Rotary B') THEN a.weight ELSE 0 END) AS Total_Physical_Loss,
          SUM(a.weight) AS RMS_outward_weight,
          SUM(a.weight)-COALESCE(b.inward_weight, 0)  as RMS_Processing_Loss,
          SUM(a.weight)-COALESCE(b.inward_weight, 0) + (COALESCE(b.inward_weight, 0)-c.our_weight) as RMS_Total_Loss,
          SUM(a.kiln_loaded_weight) as kiln_loaded_weight
      FROM ${materialOutwardTable} a
      LEFT JOIN (
          SELECT inward_number, SUM(weight) AS inward_weight
          FROM ${materialInwardTable}
          GROUP BY inward_number
      ) b ON a.inward_number = b.inward_number
      LEFT JOIN (
          SELECT inward_number, supplier_name,our_weight,supplier_weight,material_outward_status,
          material_inward_status,kiln_feed_status
          FROM ${rawMaterialTable}
      ) c ON a.inward_number = c.inward_number
      GROUP BY a.inward_number, c.supplier_name, b.inward_weight,c.supplier_weight,c.our_weight,c.material_outward_status,
          c.material_inward_status,c.kiln_feed_status
      ORDER BY a.inward_number



      WITH date_series AS (
          SELECT generate_series($1::date, $2::date, interval '1 day') AS day
        ),
        inward_data AS (
          SELECT
            inward_number,
            supplier_name,
            our_weight,
            material_arrivaltime::date AS arrival_day,
            COALESCE(material_inward_status_upddt::date, '2999-12-31') AS complete_day,
            material_inward_status_upddt::date AS actual_complete_day
          FROM ${table}
        ),
        bag_data AS (
          SELECT
            inward_number,
            DATE(write_timestamp) AS bag_day,
            SUM(weight) AS total_bag_weight
          FROM ${table1}
          GROUP BY inward_number, DATE(write_timestamp)
        ),
        expanded AS (
          SELECT
            d.day,
            i.inward_number,
            i.supplier_name,
            i.our_weight,
            i.arrival_day,
            i.complete_day,
            i.actual_complete_day
          FROM date_series d
          JOIN inward_data i
            ON d.day >= i.arrival_day AND d.day <= i.complete_day
        ),
        final AS (
          SELECT
            e.day,
            e.inward_number,
            e.supplier_name,
            e.our_weight AS weight_at_security,
            COALESCE(SUM(b.total_bag_weight), 0) AS inward_weight,
            e.our_weight - COALESCE(SUM(b.total_bag_weight), 0) AS stock,
            CASE
              WHEN e.day = e.actual_complete_day THEN
                COALESCE(SUM(b.total_bag_weight), 0) - e.our_weight
              ELSE NULL
            END AS loss_or_gain
          FROM expanded e
          LEFT JOIN bag_data b
            ON b.inward_number = e.inward_number AND b.bag_day <= e.day
          GROUP BY e.day, e.inward_number, e.supplier_name, e.our_weight, e.actual_complete_day
        )
        SELECT 
          TO_CHAR(day, 'DD-MM-YYYY') AS day,
          inward_number,
          supplier_name,
          weight_at_security,
          inward_weight,
          stock,
          loss_or_gain
        FROM final
        ORDER BY day, inward_number;