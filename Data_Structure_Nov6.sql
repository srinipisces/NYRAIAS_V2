// account generic tables

CREATE TABLE public.account_route_config (
  accountid     text PRIMARY KEY,
  route         text,
  logo          text,
  logo_text     text,
  menu_structure jsonb
);

create table public.active_tokens (
    token text primary key,
    userid test not null,
    accountid not null,
    issued_at timestamp,
    expires_at timestamp
)

// account specific tables

CREATE TABLE samcarbons_authentication (
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

create table samcarbons_boiler_performance (
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

CREATE TABLE samcarbons_crusher_performance (
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

CREATE TABLE samcarbons_destoning (
  loaded_timestamp timestamp default CURRENT_TIMESTAMP,
  loaded_weight NUMERIC,                       -- sum of loaded bags
  loaded_bags TEXT[],                          -- array of bag numbers
  userid text,
  bag_generated_timestamp TIMESTAMP,
  ds_bag_no TEXT unique,                  -- generated on submission
  weight_out numeric, 
  bag_generated_userid text,
  final_destination text, -- either 'Screening' or 'InStock'
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

-- Add UNIQUE constraint instead
ALTER TABLE samcarbons_destoning ADD CONSTRAINT unique_ds_bag_no UNIQUE (ds_bag_no);



