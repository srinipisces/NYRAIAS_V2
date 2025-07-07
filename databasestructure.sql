CREATE TABLE samcarbon_authentication (
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

drop table samcarbon_rawmaterial_rcvd;
drop SEQUENCE samcarbon_inward_number_seq;

CREATE SEQUENCE IF NOT EXISTS samcarbon_inward_number_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;


CREATE TABLE samcarbon_rawmaterial_rcvd (
    write_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    material_arrivaltime TIMESTAMP,
    supplier_name TEXT NOT NULL,
    supplier_weight NUMERIC(10,2) NOT NULL,
    supplier_value NUMERIC(10,2),
    supplier_dc_number TEXT NOT NULL,

    inward_number TEXT PRIMARY KEY DEFAULT ('I-' || nextval('samcarbon_inward_number_seq')::text),

    our_weight NUMERIC(10,2) NOT NULL,
    userid TEXT,

    lab_result TIMESTAMP,
    lab_userid TEXT,
    moisture NUMERIC(10,2),
    dust NUMERIC(10,2),
    ad_value NUMERIC(10,2),

    material_inward_status TEXT,
    material_inward_remarks TEXT,
    material_inward_status_upddt TIMESTAMP,
    material_inward_userid TEXT,

    material_outward_status TEXT,
    material_outward_remarks TEXT,
    material_outward_status_upddt TIMESTAMP,
    material_outward_userid TEXT,

    kiln_feed_status TEXT,
    kiln_feed_status_upddt TIMESTAMP,
    kiln_feed_userid TEXT,

    deleted BOOLEAN DEFAULT FALSE,
    activities JSONB DEFAULT '[]'
);

CREATE TABLE samcarbon_suppliers (
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

create table samcarbon_material_inward_bag (
    write_timestamp TIMESTAMP default CURRENT_TIMESTAMP,
    inward_number text not null,
    bag_no text PRIMARY key,
    weight numeric(12,2) not null,
    userid text not null
);

-- 1. Create the trigger function with tenant+table-specific name
CREATE OR REPLACE FUNCTION trg_set_bag_no_per_samcarbon_material_inward_bag()
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
  FROM samcarbon_material_inward_bag
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
DROP TRIGGER IF EXISTS set_bag_no_before_insert_per_samcarbon_material_inward_bag
ON samcarbon_material_inward_bag;

CREATE TRIGGER set_bag_no_before_insert_per_samcarbon_material_inward_bag
BEFORE INSERT ON samcarbon_material_inward_bag
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_samcarbon_material_inward_bag();


CREATE TABLE samcarbon_crusher_performance (
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




create table samcarbon_material_outward_bag (
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
    remarks text     
);

CREATE OR REPLACE FUNCTION trg_set_bag_no_per_samcarbon_material_outward_bag()
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
  FROM samcarbon_material_outward_bag
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
DROP TRIGGER IF EXISTS set_bag_no_before_insert_per_samcarbon_material_outward_bag ON samcarbon_material_outward_bag;

CREATE TRIGGER set_bag_no_before_insert_per_samcarbon_material_outward_bag
BEFORE INSERT ON samcarbon_material_outward_bag
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_samcarbon_material_outward_bag();

drop table samcarbon_boiler_performance;
create table samcarbon_boiler_performance (
boiler_perf_entryDateTime timestamp,
boiler_number text,
boiler_pressure numeric(12,2),
boiler_inlet_temperature numeric(12,2),
boiler_outlet_temperature numeric(12,2),
feed_pump text,
blower_open numeric,
fan_damper_open numeric,
vfd_rpm numeric,
remarks text,
userid text,
datainserted timestamp default CURRENT_TIMESTAMP );


create table samcarbon_kiln_output (
write_timestamp        timestamp default CURRENT_TIMESTAMP,
kiln_output_dt         timestamp, 
from_the_kiln          text,
bag_no text primary key,
weight_with_stones     integer,
remarks                text,
userid_kilnoutput text,
screening_inward_time timestamp,
screening_inward_kiln text,
grade text,
ctc text,
output_required text,
machine text,
userid_screening_inward text,
exkiln_stock text default 'InStock',
stock_upd_user text,
stock_upd_dt timestamp);

CREATE OR REPLACE FUNCTION trg_set_bag_no_per_samcarbon_kiln_output()
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
  FROM samcarbon_kiln_output
  WHERE bag_no ~ ('^kiln_output_' || date_str || '-[0-9]+$');

  IF last_counter IS NULL THEN
    last_counter := 0;
  END IF;

  last_counter := last_counter + 1;

  NEW.bag_no := 'kiln_output_' || date_str || '-' || last_counter::TEXT;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_before_insert_samcarbon_kiln_output
BEFORE INSERT ON samcarbon_kiln_output
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_samcarbon_kiln_output();

create table samcarbon_screening_outward (
  
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
  reload_userid text
);

CREATE OR REPLACE FUNCTION trg_set_bag_no_per_samcarbon_screening_outward()
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
  FROM samcarbon_screening_outward
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

CREATE TRIGGER trg_generate_bag_no_samcarbon_screening_outward
BEFORE INSERT ON samcarbon_screening_outward
FOR EACH ROW
EXECUTE FUNCTION trg_set_bag_no_per_samcarbon_screening_outward();