CREATE TABLE testbed_authentication (
  userid TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  name TEXT,
  email TEXT,
  phone TEXT,
  access TEXT[], -- array of text values
  status BOOLEAN DEFAULT TRUE,
  accountid TEXT NOT NULL,
  activities JSONB DEFAULT '[]'::jsonb
);

drop table testbed_rawmaterial_rcvd;
drop SEQUENCE testbed_inward_number_seq;

CREATE SEQUENCE IF NOT EXISTS testbed_inward_number_seq
    START WITH 1000  
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;


CREATE TABLE testbed_rawmaterial_rcvd (
    write_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- when the record was written, system generated, it will be the date and time the security entered the data(material arrival) in the system

    material_arrivaltime TIMESTAMP, -- record entered by security stating the time and date of arrival of the rawmaterial
    supplier_name TEXT NOT NULL,  -- name of the supplier
    supplier_weight NUMERIC(10,2) NOT NULL, -- weigth declared by supplier
    supplier_value NUMERIC(10,2), -- value declared by supplier
    supplier_dc_number TEXT NOT NULL, -- DC number of the supplier

    inward_number TEXT PRIMARY KEY DEFAULT ('I-' || nextval('testbed_inward_number_seq')::text), -- inward number is system generated, it is unique number given this batch of rawmaterial

    our_weight NUMERIC(10,2) NOT NULL, -- weeight as per the security
    userid TEXT, -- userid of security 

    lab_result TIMESTAMP, -- lab result the time it was declared 
    lab_userid TEXT, -- lab user
    moisture NUMERIC(10,2),
    dust NUMERIC(10,2),
    ad_value NUMERIC(10,2),
    admit_load text,
    remarks text,

    material_inward_status TEXT, -- this shows whether this batch is loaded in the crusher aor not. It has status as complete or null if it is not complete
    material_inward_remarks TEXT, -- remarks
    material_inward_status_upddt TIMESTAMP, -- complete status time stamp
    material_inward_userid TEXT, -- user who recorded this data

    material_outward_status TEXT, -- this shows wheter the rawmaterial has passed through the crusher, it will say complete if completed or null if not complete. after this point it will granulated charcoal
    material_outward_remarks TEXT,
    material_outward_status_upddt TIMESTAMP, -- timestamp when it was complete
    material_outward_userid TEXT, 

    kiln_feed_status TEXT, -- this inward has been completely loaded in the kiln, it will show complete once complted if not null
    kiln_feed_status_upddt TIMESTAMP, -- date and time when the kiln feed is completed.
    kiln_feed_userid TEXT,

    deleted BOOLEAN DEFAULT FALSE,
    activities JSONB DEFAULT '[]'
);

CREATE TABLE testbed_suppliers (
  supplier_name TEXT PRIMARY KEY,
  street TEXT,
  city TEXT,
  pincode INTEGER,
  contact_person TEXT,
  contact_number BIGINT,
  create_userid TEXT NOT NULL,
  created_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activities JSONB DEFAULT '[]'
);

create table testbed_material_inward_bag (
    write_timestamp TIMESTAMP default CURRENT_TIMESTAMP,
    inward_number text not null,
    bag_no text PRIMARY key,
    weight numeric(12,2) not null,
    userid text not null
);

-- 1. Create the trigger function with tenant+table-specific name
CREATE OR REPLACE FUNCTION trg_set_bag_no_per_testbed_material_inward_bag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  last_counter INTEGER;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Prevent race condition for the same inward_number
  PERFORM pg_advisory_xact_lock(hashtext(NEW.inward_number));

  SELECT MAX(
    CAST(REGEXP_REPLACE(bag_no, '^' || NEW.inward_number || '-Inw-', '') AS INTEGER)
  )
  INTO last_counter
  FROM testbed_material_inward_bag
  WHERE inward_number = NEW.inward_number
    AND bag_no ~ ('^' || NEW.inward_number || '-Inw-[0-9]+$');

  IF last_counter IS NULL THEN
    last_counter := 0;
  END IF;

  last_counter := last_counter + 1;

  NEW.bag_no := NEW.inward_number || '-Inw-' || last_counter::TEXT;

  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the table with a unique trigger name
DROP TRIGGER IF EXISTS set_bag_no_before_insert_per_testbed_material_inward_bag
ON testbed_material_inward_bag;

CREATE TRIGGER set_bag_no_before_insert_per_testbed_material_inward_bag
BEFORE INSERT ON testbed_material_inward_bag
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_testbed_material_inward_bag();


CREATE TABLE testbed_crusher_performance (
  event_timestamp TIMESTAMP WITHOUT TIME ZONE default CURRENT_TIMESTAMP,
  inward_number TEXT,
  grade_plus2 NUMERIC(10,2),
  grade_2by3 NUMERIC(10,2),
  grade_3by4 NUMERIC(10,2),
  grade_4by6 NUMERIC(10,2),
  grade_6by10 NUMERIC(10,2),
  grade_10by12 NUMERIC(10,2),
  grade_12by14 NUMERIC(10,2),
  grade_minus14 NUMERIC(10,2),
  moisture NUMERIC(10,2),
  dust NUMERIC(10,2),
  sample_from TEXT,
  userid TEXT
);




create table testbed_material_outward_bag (
    write_timestamp TIMESTAMP default CURRENT_TIMESTAMP,
    inward_number text not null,
    bag_no text PRIMARY key,
    grade text NOT NULL,
    weight numeric(12,2) not null,
    userid text not null,
    kiln_feed_status text,
    kiln text,
    kiln_load_time TIMESTAMP,
    kiln_quality_updt timestamp,
    kiln_loaded_weight numeric(10,2),
    grade_plus2 numeric(10,2),
    grade_2by3 numeric(10,2),
    grade_3by6 numeric(10,2),
    grade_6by8 numeric(10,2),
    grade_8by10 numeric(10,2),
    grade_10by12 numeric(10,2),
    grade_12by14 numeric(10,2),
    grade_minus14 numeric(10,2),
    feed_moisture numeric(10,2),
    dust numeric(10,2),
    feed_volatile numeric(10,2),
    remarks text,
    kiln_quality_updt_user text ,
    kiln_feed_quality_sysentry timestamp   
);

CREATE OR REPLACE FUNCTION trg_set_bag_no_per_testbed_material_outward_bag()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  last_counter INTEGER;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Lock the table to prevent concurrent inserts from racing
  PERFORM pg_advisory_xact_lock(hashtext(NEW.inward_number));

  SELECT MAX(
    CAST(REGEXP_REPLACE(bag_no, '^' || NEW.inward_number || '-Out-', '') AS INTEGER)
  )
  INTO last_counter
  FROM testbed_material_outward_bag
  WHERE inward_number = NEW.inward_number
    AND bag_no ~ ('^' || NEW.inward_number || '-Out-[0-9]+$');

  IF last_counter IS NULL THEN
    last_counter := 0;
  END IF;

  last_counter := last_counter + 1;

  NEW.bag_no := NEW.inward_number || '-Out-' || last_counter::TEXT;

  RETURN NEW;
END;
$$;

-- 2. Attach the trigger to the table:
DROP TRIGGER IF EXISTS set_bag_no_before_insert_per_testbed_material_outward_bag ON testbed_material_outward_bag;

CREATE TRIGGER set_bag_no_before_insert_per_testbed_material_outward_bag
BEFORE INSERT ON testbed_material_outward_bag
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_testbed_material_outward_bag();

drop table testbed_boiler_performance;
create table testbed_boiler_performance (
boiler_perf_entryDateTime timestamp,
boiler_number text,
boiler_pressure numeric(12,2),
boiler_inlet_temperature numeric(12,2),
boiler_outlet_temperature numeric(12,2),
feed_pump text,
blower_open numeric,
fan_damper_open numeric,
id_fan_rpm numeric,
remarks text,
userid text,
datainserted timestamp default CURRENT_TIMESTAMP );

drop table testbed_kiln_output;
create table testbed_kiln_output (
write_timestamp        timestamp default CURRENT_TIMESTAMP,
kiln_output_dt         timestamp, 
from_the_kiln          text,
bag_no text primary key,
weight_with_stones     integer,
remarks                text,
userid_kilnoutput text,
quality_updt_time timestamp,
quality_plus_3 numeric,
quality_3by4 numeric,
quality_4by8 numeric,
quality_8by12 numeric,
quality_12by30 numeric,
quality_minus_30 numeric,
quality_cbd numeric,
quality_ctc numeric,
quality_remarks text,
quality_updt_user text,
screening_inward_time timestamp,
screening_inward_kiln text,
screening_bag_weight numeric(12,2),
screening_output_required text,
screening_machine text,
userid_screening_inward text,
exkiln_stock text default 'De-Stoning',
destoning_in_user text,
destoning_in_updt timestamp,
destoning_in_weight numeric(12,2),
destoning_out_user text,
destoning_out_updt timestamp,
destoning_out_weight numeric(12,2),
destoning_ctc numeric,
stock_upd_user text,
stock_upd_dt timestamp);


CREATE OR REPLACE FUNCTION trg_set_bag_no_per_nyra_kiln_output()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  date_str TEXT;
  kiln_suffix TEXT;
  prefix TEXT;
  prefix1 text;
  last_counter INTEGER;
  last_bag_no TEXT;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Validate format begins with "Kiln "
  IF NEW.from_the_kiln IS NULL OR POSITION('Kiln ' IN NEW.from_the_kiln) <> 1 THEN
    RAISE EXCEPTION 'Invalid from_the_kiln: must begin with "Kiln "';
  END IF;

  -- Extract everything after "Kiln "
  kiln_suffix := TRIM(SUBSTRING(NEW.from_the_kiln FROM 6));

  IF kiln_suffix = '' THEN
    RAISE EXCEPTION 'Invalid from_the_kiln: no text found after "Kiln "';
  END IF;

  -- Format date as DDMMYY
  date_str := TO_CHAR(NEW.kiln_output_dt, 'DDMMYY');

  -- Build prefix
  prefix1 := 'KO' || kiln_suffix ;

  -- Lock globally (not prefix-specific anymore)
  PERFORM pg_advisory_xact_lock(hashtext('global_kiln_output_bag'));

  -- Find last inserted bag_no (sorted descending)
  SELECT bag_no
  INTO last_bag_no
  FROM nyra_kiln_output
  WHERE bag_no like prefix1 || '_%'
  ORDER BY CAST(RIGHT(bag_no, 4) AS INTEGER) DESC
  LIMIT 1; 
 
  
  prefix := 'KO' || kiln_suffix || '_' || date_str || '_';

  IF last_bag_no IS NULL THEN
    last_counter := 1001;
  ELSE
    -- Extract last 4-digit number
    last_counter := CAST(RIGHT(last_bag_no, 4) AS INTEGER) + 1;
  END IF;

  IF last_counter > 9999 THEN
    RAISE EXCEPTION 'Exceeded global bag_no limit (9999)';
  END IF;

  NEW.bag_no := prefix || LPAD(last_counter::TEXT, 4, '0');

  RETURN NEW;
END;
$$;


/*  changed from day wise reset to running number in new trigger
CREATE OR REPLACE FUNCTION trg_set_bag_no_per_testbed_kiln_output()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  date_str TEXT;
  kiln_suffix TEXT;
  prefix TEXT;
  last_counter INTEGER;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Validate format begins with "Kiln "
  IF NEW.from_the_kiln IS NULL OR POSITION('Kiln ' IN NEW.from_the_kiln) <> 1 THEN
    RAISE EXCEPTION 'Invalid from_the_kiln: must begin with "Kiln "';
  END IF;

  -- Extract everything after "Kiln "
  kiln_suffix := TRIM(SUBSTRING(NEW.from_the_kiln FROM 6));

  IF kiln_suffix = '' THEN
    RAISE EXCEPTION 'Invalid from_the_kiln: no text found after "Kiln "';
  END IF;

  -- Format date as DDMMYY
  date_str := TO_CHAR(NEW.kiln_output_dt, 'DDMMYY');

  -- Prefix: KO<kiln_suffix>_<DDMMYY>_
  prefix := 'KO' || kiln_suffix || '_' || date_str || '_';

  -- Lock based on prefix for concurrency safety
  PERFORM pg_advisory_xact_lock(hashtext(prefix));

  -- Get max existing bag number for the prefix
  SELECT MAX(CAST(SUBSTRING(bag_no FROM LENGTH(prefix) + 1) AS INTEGER))
  INTO last_counter
  FROM testbed_kiln_output
  WHERE bag_no LIKE prefix || '%'
    AND bag_no ~ ('^' || prefix || '[0-9]{4}$');

  IF last_counter IS NULL THEN
    last_counter := 1000; -- so the first will be 1001
  END IF;

  last_counter := last_counter + 1;

  IF last_counter > 9999 THEN
    RAISE EXCEPTION 'Exceeded bag_no limit for % on %', kiln_suffix, date_str;
  END IF;

  NEW.bag_no := prefix || LPAD(last_counter::TEXT, 4, '0');

  RETURN NEW;
END;
$$; */

drop TRIGGER trg_before_insert_nyra_kiln_output on nyra_kiln_output;
CREATE or replace TRIGGER trg_before_insert_nyra_kiln_output
BEFORE INSERT ON nyra_kiln_output
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_nyra_kiln_output();


 /*  old function --- new one above has the new naming format..
CREATE OR REPLACE FUNCTION trg_set_bag_no_per_nyra_kiln_output()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  date_str TEXT;
  last_counter INTEGER;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Format date as dd-mm-yyyy
  date_str := TO_CHAR(NEW.kiln_output_dt, 'DD-MM-YYYY');

  -- Lock based on that date string (safe for concurrency)
  PERFORM pg_advisory_xact_lock(hashtext(date_str));

  -- Get the max incremental number for that date
  SELECT MAX(
    CAST(REGEXP_REPLACE(bag_no, '^kiln_output_' || date_str || '-', '') AS INTEGER)
  )
  INTO last_counter
  FROM nyra_kiln_output
  WHERE bag_no ~ ('^kiln_output_' || date_str || '-[0-9]+$');

  IF last_counter IS NULL THEN
    last_counter := 0;
  END IF;

  last_counter := last_counter + 1;

  NEW.bag_no := 'kiln_output_' || date_str || '-' || last_counter::TEXT;

  RETURN NEW;
END;
$$; */



create table testbed_screening_outward (
  
  screening_out_dt timestamp,
  bag_no text primary key,
  weight numeric(12,2),
  grade text,
  ctc text,
  machine text,
  write_dt timestamp default CURRENT_TIMESTAMP,
  userid text,
  delivery_status text default 'InStock',
  stock_change_userid text,
  stock_change_dt timestamp,
  reload text default 'InQue',
  reload_time timestamp,
  reload_kiln text,
  reload_bag_weight numeric(12,2),
  reload_grade text,
  reload_ctc text,
  reload_machine text,
  reload_output_required text,
  reload_userid text
);

CREATE OR REPLACE FUNCTION trg_set_bag_no_per_testbed_screening_outward()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  date_str TEXT;
  last_counter INTEGER;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  -- Format the screening_out_dt date as dd-mm-yyyy
  date_str := TO_CHAR(NEW.screening_out_dt, 'DD-MM-YYYY');

  -- Lock per date string to prevent race conditions
  PERFORM pg_advisory_xact_lock(hashtext(date_str));

  -- Get last counter used for that date
  SELECT MAX(
    CAST(REGEXP_REPLACE(bag_no, '^Screen_' || date_str || '-', '') AS INTEGER)
  )
  INTO last_counter
  FROM testbed_screening_outward
  WHERE bag_no ~ ('^Screen_' || date_str || '-[0-9]+$');

  IF last_counter IS NULL THEN
    last_counter := 0;
  END IF;

  last_counter := last_counter + 1;

  -- Construct new bag_no
  NEW.bag_no := 'Screen_' || date_str || '-' || last_counter::TEXT;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_generate_bag_no_testbed_screening_outward
BEFORE INSERT ON testbed_screening_outward
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_testbed_screening_outward();


create table testbed_kiln_temp (
  temp_dt timestamp,
  kiln text,
  t1 numeric(12,2),
  t2 numeric(12,2),
  t3 numeric(12,2),
  t4 numeric(12,2),
  chamber numeric(12,2),
  feed_rate numeric(12,2),
  kiln_rpm numeric(12,2),
  main_damper_open_per numeric(12,2),
  boiler_damper_open_per numeric(12,2),
  steam_pressure numeric(12,2),
  remarks text,
  userid text,
  entry_dt timestamp 
);

create table account_route_config (
  accountid text primary key,
  route text
);

create table testbed_dropdown (
  tabname text primary key,
  settings jsonb
);


create table testbed_rms_performance
          (inward_number text primary key,
          supplier_name text,
          inward_dt timestamp,
          material_inward_status text,
          material_inward_completed_dt timestamp,
          material_outward_status text,
          material_outward_completed_dt timestamp,
          kiln_feed_status text,
          kiln_feed_completed_dt timestamp,
          supplier_weight numeric,
          our_weight numeric,
          RMS_inward_weight numeric,
          RMS_inward_loss numeric,
          Grade_Weight_after_crusher numeric,
          Physical_Loss_in_crusher numeric,
          RMS_outward_weight numeric,
          kiln_loaded_weight numeric);


create table nyra_rawmaterial_inward_history (
            day timestamp,
            inward_number text,
            supplier_name text,
            supplier_weight numeric,
            weight_at_security numeric,
            raw_material_inward_no_bags numeric,
            raw_material_inward_weight numeric,
            raw_material_inward_stock numeric,
            raw_material_inward_loss_or_gain numeric,
            raw_material_inward_status text,
            raw_material_outward_status text,
            raw_material_outward_no_bags numeric,
            Gcharcoal_Weight_after_crusher numeric,
            Physical_Loss_in_crusher numeric,
            Total_weight_from_crusher numeric,
            kiln_loaded_weight numeric,
            kiln_load_no_bags numeric,
            kiln_feed_status timestamp,
            Gcharcoal_stock numeric
        );



CREATE OR REPLACE FUNCTION activatedcarbon_get_stock_balances(
  accountid TEXT,
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  day DATE,
  opening_raw_material_stock_balance NUMERIC,
  closing_raw_material_stock_balance NUMERIC,
  gcharcoal_opening_balance NUMERIC,
  gcharcoal_closing_balance NUMERIC
)
AS $$
DECLARE
  dyn_sql TEXT;
BEGIN
  dyn_sql := format($f$
    WITH date_series AS (
      SELECT generate_series(DATE %L, DATE %L, interval '1 day')::date AS day
    ),
    daily_totals AS (
      SELECT
        DATE(day) AS day,
        COALESCE(SUM(raw_material_inward_stock), 0) AS raw_stock,
        COALESCE(SUM(Gcharcoal_stock), 0) AS gcharcoal_stock
      FROM %I_rawmaterial_inward_history
      GROUP BY DATE(day)
    ),
    cumulative AS (
      SELECT
        ds.day,
        COALESCE(SUM(dt.raw_stock) OVER (ORDER BY ds.day), 0) AS closing_raw_stock,
        COALESCE(SUM(dt.gcharcoal_stock) OVER (ORDER BY ds.day), 0) AS closing_gcharcoal
      FROM date_series ds
      LEFT JOIN daily_totals dt ON dt.day = ds.day
    )
    SELECT
      day,
      LAG(closing_raw_stock, 1, 0) OVER (ORDER BY day),
      closing_raw_stock,
      LAG(closing_gcharcoal, 1, 0) OVER (ORDER BY day),
      closing_gcharcoal
    FROM cumulative
    ORDER BY day
  $f$, start_date, end_date, accountid);

  RETURN QUERY EXECUTE dyn_sql;
END;
$$ LANGUAGE plpgsql;

drop table samcarbons_destoning;
CREATE TABLE samcarbons_destoning (
  loaded_timestamp timestamp default CURRENT_TIMESTAMP,
  bag_generated_timestamp TIMESTAMP,
  ds_bag_no TEXT unique,                  -- generated on submission
  loaded_weight NUMERIC,                       -- sum of loaded bags
  loaded_bags TEXT[],                          -- array of bag numbers
  final_destination , -- either 'Screening' or 'InStock'
  weight_out numeric, 
  userid text,
  quality_updt_time timestamp,
  quality_plus_3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_12by30 numeric,
  quality_minus_30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_remarks text,
  quality_updt_user text,
  stock_upd_user text, 
  stock_upd_dt timestamp  
);
-- Drop primary key constraint (if it exists)
ALTER TABLE nyra_destoning DROP CONSTRAINT nyra_destoning_pkey;

-- Add UNIQUE constraint instead
ALTER TABLE nyra_destoning ADD CONSTRAINT unique_ds_bag_no UNIQUE (ds_bag_no);



CREATE OR REPLACE VIEW nyra_kiln_daily_summary AS
SELECT
  date_str,

  MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_loaded_bags ELSE 0 END) AS kiln_a_loaded_bags,
  MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_loaded_bags ELSE 0 END) AS kiln_b_loaded_bags,
  MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_loaded_bags ELSE 0 END) AS kiln_c_loaded_bags,
  
  MAX(CASE WHEN kiln = 'Kiln A' THEN raw_material_out_weight ELSE 0 END) AS kiln_a_raw_out,
  MAX(CASE WHEN kiln = 'Kiln B' THEN raw_material_out_weight ELSE 0 END) AS kiln_b_raw_out,
  MAX(CASE WHEN kiln = 'Kiln C' THEN raw_material_out_weight ELSE 0 END) AS kiln_c_raw_out,

  MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_loaded_weight ELSE 0 END) AS kiln_a_loaded_weight,
  MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_loaded_weight ELSE 0 END) AS kiln_b_loaded_weight,
  MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_loaded_weight ELSE 0 END) AS kiln_c_loaded_weight,

  MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_output_bags ELSE 0 END) AS kiln_a_output_bags,
  MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_output_bags ELSE 0 END) AS kiln_b_output_bags,
  MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_output_bags ELSE 0 END) AS kiln_c_output_bags,

  MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_output_weight ELSE 0 END) AS kiln_a_output_weight,
  MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_output_weight ELSE 0 END) AS kiln_b_output_weight,
  MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_output_weight ELSE 0 END) AS kiln_c_output_weight,

    -- Summed totals across kilns
  (
    MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_loaded_bags ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_loaded_bags ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_loaded_bags ELSE 0 END)
  ) AS total_loaded_bags,

  (
    MAX(CASE WHEN kiln = 'Kiln A' THEN raw_material_out_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln B' THEN raw_material_out_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln C' THEN raw_material_out_weight ELSE 0 END)
  ) AS total_raw_material_out_weight,

  (
    MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_loaded_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_loaded_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_loaded_weight ELSE 0 END)
  ) AS total_kiln_loaded_weight,

  (
    MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_output_bags ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_output_bags ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_output_bags ELSE 0 END)
  ) AS total_kiln_output_bags,

  (
    MAX(CASE WHEN kiln = 'Kiln A' THEN kiln_output_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln B' THEN kiln_output_weight ELSE 0 END) +
    MAX(CASE WHEN kiln = 'Kiln C' THEN kiln_output_weight ELSE 0 END)
  ) AS total_kiln_output_weight
  


FROM (
  SELECT 
    COALESCE(a.date_str, b.date_str) AS date_str,
    COALESCE(a.kiln, b.kiln) AS kiln,
    COALESCE(a.num_bags, 0) AS kiln_loaded_bags,
    COALESCE(a.raw_material_out_weight, 0) AS raw_material_out_weight,
    COALESCE(a.kiln_loaded_weight, 0) AS kiln_loaded_weight,
    COALESCE(b.num_bags, 0) AS kiln_output_bags,
    COALESCE(b.total_weight, 0) AS kiln_output_weight
  FROM (
    SELECT 
      TO_CHAR(kiln_load_time, 'dd-mm-yyyy') AS date_str,
      kiln,
      COUNT(*) AS num_bags,
      SUM(weight) AS raw_material_out_weight,
      SUM(kiln_loaded_weight) AS kiln_loaded_weight
    FROM nyra_material_outward_bag
    WHERE kiln_load_time IS NOT NULL
    GROUP BY TO_CHAR(kiln_load_time, 'dd-mm-yyyy'), kiln
  ) a
  FULL OUTER JOIN (
    SELECT 
      TO_CHAR(kiln_output_dt, 'dd-mm-yyyy') AS date_str,
      from_the_kiln AS kiln,
      COUNT(*) AS num_bags,
      SUM(weight_with_stones) AS total_weight
    FROM nyra_kiln_output
    GROUP BY TO_CHAR(kiln_output_dt, 'dd-mm-yyyy'), from_the_kiln
  ) b
  ON a.date_str = b.date_str AND a.kiln = b.kiln
) pivoted
GROUP BY date_str;


--//////function for reporting

CREATE OR REPLACE FUNCTION get_destoning_summary(accountid TEXT, datecode TEXT)
RETURNS TABLE (
  bag_no TEXT,
  exkiln_stock TEXT,
  ds_bag_no TEXT,
  loaded_weight NUMERIC,
  weight_out NUMERIC,
  loaded_bags TEXT[],
  has_other_bags BOOLEAN
) AS $$
DECLARE
  table_kiln TEXT := accountid || '_kiln_output';
  table_destoning TEXT := accountid || '_destoning';
BEGIN
  RETURN QUERY EXECUTE format(
    $f$
    SELECT
      k.bag_no,
      k.exkiln_stock,
      d.ds_bag_no,
      d.loaded_weight,
      d.weight_out,
      d.loaded_bags,
      CASE
        WHEN d.loaded_bags IS NOT NULL THEN EXISTS (
          SELECT 1
          FROM unnest(d.loaded_bags) AS lb
          WHERE lb <> k.bag_no
            AND split_part(lb, '_', 2) <> %L
        )
        ELSE FALSE
      END AS has_other_bags
      
    FROM %I k
    LEFT JOIN %I d ON k.bag_no = ANY(d.loaded_bags)
    WHERE k.bag_no LIKE %L
    $f$,
    datecode,                            -- used for comparing full 6-digit date
    table_kiln,
    table_destoning,
    '%' || datecode || '%'              -- used in WHERE clause to match bag_no
  );
END;
$$ LANGUAGE plpgsql;
