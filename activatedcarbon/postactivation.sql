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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
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
  quality_plus3 numeric,
  quality_3by4 numeric,
  quality_4by8 numeric,
  quality_8by12 numeric,
  quality_minus30 numeric,
  quality_12by30 numeric,
  quality_cbd numeric,
  quality_ctc numeric,
  quality_userid text,
  quality_upd_dttime timestamp,
  remarks jsonb,
  audit_trail jsonb
);