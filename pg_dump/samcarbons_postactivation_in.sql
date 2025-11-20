--
-- PostgreSQL database dump
--

\restrict GiooOPspdbt8bIkMRRkzAlfN0nLs0L7zg98hhoolkGlNS7Hl4pSbxjYaeHZYsif

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-16 23:56:38 CST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 383 (class 1259 OID 18549)
-- Name: samcarbons_postactivation_in; Type: TABLE; Schema: public; Owner: postgresadmin
--

CREATE TABLE public.samcarbons_postactivation_in (
    lot_id text NOT NULL,
    loaded_dttm timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    loaded_bags jsonb,
    loaded_weight numeric,
    bags_loaded_userid text,
    total_out_weight numeric,
    bags_out_datetime timestamp without time zone,
    bags_out_userid text,
    operations text
);


ALTER TABLE public.samcarbons_postactivation_in OWNER TO postgresadmin;

--
-- TOC entry 384 (class 1259 OID 18557)
-- Name: samcarbons_screening_lot_seq; Type: SEQUENCE; Schema: public; Owner: postgresadmin
--

CREATE SEQUENCE public.samcarbons_screening_lot_seq
    AS integer
    START WITH 1001
    INCREMENT BY 1
    MINVALUE 1001
    MAXVALUE 1999
    CACHE 1
    CYCLE;


ALTER SEQUENCE public.samcarbons_screening_lot_seq OWNER TO postgresadmin;

--
-- TOC entry 4830 (class 0 OID 0)
-- Dependencies: 384
-- Name: samcarbons_screening_lot_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgresadmin
--

ALTER SEQUENCE public.samcarbons_screening_lot_seq OWNED BY public.samcarbons_postactivation_in.lot_id;


--
-- TOC entry 4645 (class 2604 OID 18759)
-- Name: samcarbons_postactivation_in lot_id; Type: DEFAULT; Schema: public; Owner: postgresadmin
--

ALTER TABLE ONLY public.samcarbons_postactivation_in ALTER COLUMN lot_id SET DEFAULT ('SCR_LOT_'::text || (nextval('public.samcarbons_screening_lot_seq'::regclass))::text);


--
-- TOC entry 4823 (class 0 OID 18549)
-- Dependencies: 383
-- Data for Name: samcarbons_postactivation_in; Type: TABLE DATA; Schema: public; Owner: postgresadmin
--

COPY public.samcarbons_postactivation_in (lot_id, loaded_dttm, loaded_bags, loaded_weight, bags_loaded_userid, total_out_weight, bags_out_datetime, bags_out_userid, operations) FROM stdin;
SCR_LOT_1022	2025-10-07 10:07:18.77741	[{"grade": "exkiln", "bag_no": "DSO_20250828_025", "weight": 200}]	200	admin	200	2025-10-07 10:43:00.643465	admin	De-Dusting
SCR_LOT_1023	2025-10-08 14:52:00.381223	[{"grade": "exkiln", "bag_no": "DSO_20251008_036", "weight": 545}]	545	admin	1080	2025-10-08 14:57:13.770771	admin	De-Dusting
SCR_LOT_1024	2025-10-08 14:57:41.256662	[{"grade": "exkiln", "bag_no": "DSO_20251008_035", "weight": 555}, {"grade": "exkiln", "bag_no": "DSO_20251008_034", "weight": 535}]	1090	admin	1065	2025-10-14 01:02:27.519441	admin	Blending
SCR_LOT_1026	2025-10-14 01:51:52.964233	[{"grade": "exkiln", "bag_no": "DSO_20251008_033", "weight": 470}]	470	admin	300	2025-10-15 11:09:22.345559	admin	De-Magnetize
SCR_LOT_1025	2025-10-14 01:02:37.238734	[{"grade": "30X100", "bag_no": "SCR_071025_002", "weight": 200}, {"grade": "12x30", "bag_no": "SCR_071025_001", "weight": 200}]	400	admin	100	2025-10-15 12:08:35.696768	admin	De-Dusting
SCR_LOT_1027	2025-10-26 16:18:14.415608	[{"grade": "-30", "bag_no": "SCR_261025_608", "weight": 250}, {"grade": "8x16", "bag_no": "SCR_A_261025_607", "weight": 500}]	750	Ramesh	745	2025-10-26 16:30:14.248975	admin	Blending
SCR_LOT_1028	2025-10-28 17:21:03.59861	[{"grade": "6x12", "bag_no": "SCR_281025_611", "weight": 300}]	300	admin	590	2025-10-28 17:21:21.689445	admin	De-Magnetize
SCR_LOT_1029	2025-10-28 17:22:00.626174	[{"grade": "4X8", "bag_no": "SCR_281025_613", "weight": 122}, {"grade": "exkiln", "bag_no": "DSO_20251028_004", "weight": 590}]	712	Veeramani	700	2025-10-28 17:22:29.150024	Veeramani	Blending
SCR_LOT_1030	2025-10-31 17:50:15.467645	[{"grade": "exkiln", "bag_no": "DSO_20251031_010", "weight": 520}]	520	veeramani	\N	\N	\N	De-Dusting
SCR_LOT_1031	2025-10-31 17:57:22.671318	[{"grade": "12X40", "bag_no": "SCR_311025_615", "weight": 550}, {"grade": "6x12", "bag_no": "SCR_311025_614", "weight": 550}]	1100	admin	1080	2025-10-31 17:58:00.937927	admin	Blending
SCR_LOT_1032	2025-10-31 19:49:17.989033	[{"grade": "6x12", "bag_no": "SCR_311025_617", "weight": 455}, {"grade": "12X40", "bag_no": "SCR_311025_616", "weight": 450}]	905	admin	895	2025-10-31 19:50:14.486244	admin	Blending
SCR_LOT_1033	2025-11-05 12:19:05.383036	[{"grade": "6x12", "bag_no": "SCR_051125_618", "weight": 500}]	500	admin	490	2025-11-05 12:19:52.933012	admin	Blending
\.


--
-- TOC entry 4831 (class 0 OID 0)
-- Dependencies: 384
-- Name: samcarbons_screening_lot_seq; Type: SEQUENCE SET; Schema: public; Owner: postgresadmin
--

--SELECT pg_catalog.setval('public.samcarbons_screening_lot_seq', 1033, true);


--
-- TOC entry 4648 (class 2606 OID 18556)
-- Name: samcarbons_postactivation_in samcarbons_screening_in_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresadmin
--

ALTER TABLE ONLY public.samcarbons_postactivation_in
    ADD CONSTRAINT samcarbons_screening_in_pkey PRIMARY KEY (lot_id);


-- Completed on 2025-11-16 23:56:48 CST

--
-- PostgreSQL database dump complete
--
truncate table public.samcarbons_postactivation_in;

\unrestrict GiooOPspdbt8bIkMRRkzAlfN0nLs0L7zg98hhoolkGlNS7Hl4pSbxjYaeHZYsif

