CREATE SEQUENCE testbed_crushing_lot_seq
  AS integer
  START WITH 1000
  INCREMENT BY 1
  MINVALUE 1000
  MAXVALUE 1999
  CYCLE
  CACHE 1;


create table testbed_crushing_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

create table testbed_destoning_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

create table testbed_screening_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

create table testbed_de_dusting_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

create table testbed_de_magnetizing_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

create table testbed_blending_in(
  lot_id TEXT PRIMARY KEY ,
  loaded_dttm timestamp default CURRENT_TIMESTAMP,
  loaded_bags jsonb,
  loaded_weight numeric,
  bags_loaded_userid text,
  total_out_weight numeric,
  bags_out_datetime timestamp,
  bags_out_userid text
);

ALTER TABLE testbed_crushing_in
ALTER COLUMN lot_id 
SET DEFAULT 'CRU_LOT_' || nextval('testbed_crushing_lot_seq'::regclass)::text;

ALTER TABLE testbed_blending_in
ALTER COLUMN lot_id 
SET DEFAULT 'BLD_LOT_' || nextval('testbed_blending_lot_seq'::regclass)::text;

ALTER TABLE testbed_de_dusting_in
ALTER COLUMN lot_id 
SET DEFAULT 'DDU_LOT_' || nextval('testbed_de_dusting_lot_seq'::regclass)::text;

ALTER TABLE testbed_de_magnetize_in
ALTER COLUMN lot_id 
SET DEFAULT 'DMZ_LOT_' || nextval('testbed_de_magnetize_lot_seq'::regclass)::text;

ALTER TABLE testbed_screening_in
ALTER COLUMN lot_id 
SET DEFAULT 'SCR_LOT_' || nextval('testbed_screening_lot_seq'::regclass)::text;



create table testbed_crushing_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  stock_change_dttime timestamp,
  bag_created_userid text,
  stock_change_userid text,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create table testbed_screening_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  bag_created_userid text,
  stock_change_userid text,
  stock_change_dttime timestamp,
  quality jsonb,
  quality_upd_dttime timestamp,
  remarks text,
  audit_trail jsonb
);

create table testbed_de_dusting_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  stock_change_dttime timestamp,
  bag_created_userid text,
  stock_change_userid text,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create table testbed_de_magnetizing_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  bag_created_userid text,
  stock_change_userid text,
  stock_change_dttime timestamp,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create table testbed_destoning_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  bag_created_userid text,
  stock_change_userid text,
  stock_change_dttime timestamp,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create table testbed_packaging(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  bag_created_userid text,
  stock_change_userid text,
  stock_change_dttime timestamp,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create table testbed_blending_out(
  lot_id TEXT,
  bag_no text,
  bag_weight numeric,
  grade text,
  bag_no_created_dttm  timestamp,
  stock_status text,
  stock_change_dttime timestamp,
  bag_created_userid text,
  stock_change_userid text,
  quality jsonb,
  remarks text,
  audit_trail jsonb
);

create view testbed_postactivation_process_view as 
 SELECT testbed_de_dusting_out.bag_no,
    testbed_de_dusting_out.bag_weight,
    testbed_de_dusting_out.grade,
    testbed_de_dusting_out.bag_no_created_dttm,
    testbed_de_dusting_out.stock_status
   FROM testbed_de_dusting_out
  WHERE testbed_de_dusting_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT testbed_de_magnetize_out.bag_no,
    testbed_de_magnetize_out.bag_weight,
    testbed_de_magnetize_out.grade,
    testbed_de_magnetize_out.bag_no_created_dttm,
    testbed_de_magnetize_out.stock_status
   FROM testbed_de_magnetize_out
  WHERE testbed_de_magnetize_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT testbed_crushing_out.bag_no,
    testbed_crushing_out.bag_weight,
    testbed_crushing_out.grade,
    testbed_crushing_out.bag_no_created_dttm,
    testbed_crushing_out.stock_status
   FROM testbed_crushing_out
  WHERE testbed_crushing_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT testbed_blending_out.bag_no,
    testbed_blending_out.bag_weight,
    testbed_blending_out.grade,
    testbed_blending_out.bag_no_created_dttm,
    testbed_blending_out.stock_status
   FROM testbed_blending_out
  WHERE testbed_blending_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT testbed_screening_out.bag_no,
    testbed_screening_out.bag_weight,
    testbed_screening_out.grade,
    testbed_screening_out.bag_no_created_dttm,
    testbed_screening_out.stock_status
   FROM testbed_screening_out
  WHERE testbed_screening_out.stock_status = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text])
UNION
 SELECT testbed_destoning.ds_bag_no as bag_no,
    testbed_destoning.weight_out as bag_weight,
    'exkiln' as grade,
    testbed_destoning.bag_generated_timestamp as bag_no_created_dttm,
    testbed_destoning.final_destination as stock_status
   FROM testbed_destoning
  WHERE testbed_destoning.final_destination = ANY (ARRAY['Screening'::text, 'De-Dusting'::text, 'De-Magnetize'::text, 'Crushing'::text, 'Blending'::text]);



  CREATE OR REPLACE FUNCTION trg_set_bag_no_generic_out()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $func$
DECLARE
  date_str      TEXT;
  alias_code    TEXT;
  last_counter  INTEGER;
  settings_tbl  TEXT;
  machine       TEXT; -- screening|crushing|de_dusting|de_magnetize|blending
  code          TEXT; -- SCR|CRU|DDU|DMZ|BLD
  g             TEXT;
  patt          TEXT;
BEGIN
  IF NEW.bag_no IS NOT NULL THEN
    RETURN NEW;
  END IF;

  g := TRIM(COALESCE(NEW.grade, ''));
  date_str := TO_CHAR(now(), 'DDMMYY');

  -- <accountid>_<machine>_out[ward]  → extract machine
  machine := REGEXP_REPLACE(
    TG_TABLE_NAME,
    '^(.*)_(screening|crushing|de_dusting|de_magnetize|blending)_out(ward)?$',
    '\2'
  );

  IF machine IS NULL OR machine = '' THEN
    RAISE EXCEPTION 'Unsupported table name for generic out trigger: %', TG_TABLE_NAME;
  END IF;

  code := CASE machine
            WHEN 'screening'      THEN 'SCR'
            WHEN 'crushing'       THEN 'CRU'
            WHEN 'de_dusting'     THEN 'DDU'
            WHEN 'de_magnetize'   THEN 'DMZ'
            WHEN 'blending'       THEN 'BLD'
          END;

  settings_tbl := REGEXP_REPLACE(
    TG_TABLE_NAME,
    '_(screening|crushing|de_dusting|de_magnetize|blending)_out(ward)?$',
    '_settings'
  );

  -- Try to fetch alias from <accountid>_settings.settings->'Output_Grades'->grade->>'alias'
  BEGIN
    EXECUTE format(
      $sql$
      SELECT CASE
               WHEN jsonb_typeof(settings->'Output_Grades'->%L) = 'object'
                 THEN NULLIF(settings->'Output_Grades'->%L->>'alias','')
               ELSE NULL
             END
      FROM %I
      LIMIT 1
      $sql$,
      g, g, settings_tbl
    )
    INTO alias_code;
  EXCEPTION
    WHEN undefined_table THEN
      alias_code := NULL;
  END;

  -- sanitize alias; allow alphanumerics only
  IF alias_code IS NOT NULL THEN
    alias_code := REGEXP_REPLACE(alias_code, '[^A-Za-z0-9]+', '', 'g');
    IF alias_code = '' THEN alias_code := NULL; END IF;
  END IF;

  -- Prefix: CODE[_ALIAS]_DDMMYY_
  IF alias_code IS NOT NULL THEN
    NEW.bag_no := code || '_' || alias_code || '_' || date_str || '_';
  ELSE
    NEW.bag_no := code || '_' || date_str || '_';
  END IF;

  -- Concurrency guard per table
  PERFORM pg_advisory_xact_lock(hashtext(TG_TABLE_NAME || '_counter'));

  -- Find last 3-digit counter on THIS table
  patt := '^' || code || '(_[A-Za-z0-9]+)?_[0-9]{6}_[0-9]{3}$';
  EXECUTE format(
    $sql$
    SELECT MAX(CAST(SUBSTRING(bag_no FROM '[0-9]{3}$') AS INTEGER))
      FROM %I
     WHERE bag_no ~ %L
    $sql$,
    TG_TABLE_NAME, patt
  )
  INTO last_counter;

  IF last_counter IS NULL OR last_counter >= 999 THEN
    last_counter := 0;
  END IF;
  last_counter := last_counter + 1;

  NEW.bag_no := NEW.bag_no || LPAD(last_counter::TEXT, 3, '0');
  RETURN NEW;
END;
$func$;


-- Screening
DROP TRIGGER IF EXISTS trg_set_bag_no_on_screening_out ON testbed_screening_out;
CREATE TRIGGER trg_set_bag_no_on_screening_out
BEFORE INSERT ON testbed_screening_out
FOR EACH ROW EXECUTE FUNCTION trg_set_bag_no_generic_out();

-- Crushing
DROP TRIGGER IF EXISTS trg_set_bag_no_on_crushing_out ON testbed_crushing_out;
CREATE TRIGGER trg_set_bag_no_on_crushing_out
BEFORE INSERT ON testbed_crushing_out
FOR EACH ROW EXECUTE FUNCTION trg_set_bag_no_generic_out();

-- De-Dusting
DROP TRIGGER IF EXISTS trg_set_bag_no_on_de_dusting_out ON testbed_de_dusting_out;
CREATE TRIGGER trg_set_bag_no_on_de_dusting_out
BEFORE INSERT ON testbed_de_dusting_out
FOR EACH ROW EXECUTE FUNCTION trg_set_bag_no_generic_out();

-- De-Magnetize
DROP TRIGGER IF EXISTS trg_set_bag_no_on_de_magnetize_out ON testbed_de_magnetize_out;
CREATE TRIGGER trg_set_bag_no_on_de_magnetize_out
BEFORE INSERT ON testbed_de_magnetize_out
FOR EACH ROW EXECUTE FUNCTION trg_set_bag_no_generic_out();

-- Blending
DROP TRIGGER IF EXISTS trg_set_bag_no_on_blending_out ON testbed_blending_out;
CREATE TRIGGER trg_set_bag_no_on_blending_out
BEFORE INSERT ON testbed_blending_out
FOR EACH ROW EXECUTE FUNCTION trg_set_bag_no_generic_out();
