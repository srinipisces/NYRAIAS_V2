--
-- PostgreSQL database dump
--

\restrict EsXQdJe6FrPGV3b5hxnnvEMfzHOgxBTf8pS81sZljHacphtHfakE4yOkgHozbOv

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-16 22:16:10 CST

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
-- TOC entry 318 (class 1259 OID 17307)
-- Name: samcarbons_screening_outward; Type: TABLE; Schema: public; Owner: postgresadmin
--

CREATE TABLE public.samcarbons_screening_outward (
    screening_out_dt timestamp without time zone,
    bag_no text NOT NULL,
    weight numeric(12,2),
    grade text,
    ctc numeric,
    machine text,
    write_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    userid text,
    delivery_status text DEFAULT 'InStock'::text,
    stock_change_userid text,
    stock_change_dt timestamp without time zone,
    reload text DEFAULT 'InQue'::text,
    reload_time timestamp without time zone,
    reload_userid text,
    reload_kiln text,
    reload_bag_weight numeric(12,2),
    reload_grade text,
    reload_ctc text,
    reload_machine text,
    reload_output_required text
);


ALTER TABLE public.samcarbons_screening_outward OWNER TO postgresadmin;

--
-- TOC entry 4825 (class 0 OID 17307)
-- Dependencies: 318
-- Data for Name: samcarbons_screening_outward; Type: TABLE DATA; Schema: public; Owner: postgresadmin
--

COPY public.samcarbons_screening_outward (screening_out_dt, bag_no, weight, grade, ctc, machine, write_dt, userid, delivery_status, stock_change_userid, stock_change_dt, reload, reload_time, reload_userid, reload_kiln, reload_bag_weight, reload_grade, reload_ctc, reload_machine, reload_output_required) FROM stdin;
2025-08-02 23:35:52	Screen_V_020825_002	519.00	-30	48.5	Shaker	2025-08-02 23:36:46.188808	Prasanth	Delivered	Parthiban	2025-08-26 12:09:39.232504	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 10:55:00	Screen_S_150825_245	537.00	8x30	62.0	Shaker	2025-08-15 10:55:12.844246	Ramesh	Delivered	Parthiban	2025-08-22 09:52:31.404284	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 15:47:49	Screen_31-07-2025-9	579.00	-30	45.6	Shaker	2025-07-31 15:48:30.609265	Ramesh	Delivered	Parthiban	2025-08-26 12:09:43.457731	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 09:30:33	Screen_30-07-2025-3	567.00	8x30	53.5	Shaker	2025-07-30 09:32:09.420908	Ramesh	Delivered	admin	2025-08-12 12:22:14.092288	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 07:05:59	Screen_02-08-2025-3	526.00	8x30	54.0	Shaker	2025-08-02 07:06:56.259024	Prasanth	Delivered	admin	2025-08-12 12:22:26.063164	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 17:02:25	Screen_01-08-2025-9	596.00	-30	45.6	Shaker	2025-08-01 17:02:44.748896	Ramesh	Delivered	Parthiban	2025-08-26 12:09:45.777447	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 17:15:10	Screen_01-08-2025-10	550.00	6x12	60.6	Shaker	2025-08-01 17:15:26.614712	Ramesh	Delivered	admin	2025-08-07 13:12:06.491911	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 17:34:13	Screen_01-08-2025-12	540.00	8x30	64.4	Shaker	2025-08-01 17:34:30.244876	Ramesh	Delivered	admin	2025-08-12 12:23:08.984511	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 15:01:20	Screen_02-08-2025-8	517.00	6x12	60.4	Shaker	2025-08-02 15:01:38.335711	Ramesh	Delivered	admin	2025-08-07 13:21:50.118396	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 07:05:59	Screen_02-08-2025-2	546.00	6x12	51.0	Shaker	2025-08-02 07:06:24.278554	Prasanth	Delivered	admin	2025-08-07 13:17:47.950428	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 00:07:39	Screen_02-08-2025-1	558.00	6x12	55.0	Shaker	2025-08-02 00:07:56.055759	Prasanth	Delivered	admin	2025-08-07 13:16:05.648182	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 17:26:15	Screen_01-08-2025-11	559.00	8x30	64.0	Shaker	2025-08-01 17:26:34.024656	Ramesh	Delivered	admin	2025-08-12 12:23:21.271284	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 14:48:42	Screen_30-07-2025-5	567.00	8x30	59.3	Shaker	2025-07-30 14:49:56.564818	Ramesh	Delivered	admin	2025-08-12 15:10:17.394614	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 18:49:37	Screen_01-08-2025-13	563.00	6x12	58.0	Shaker	2025-08-01 18:49:54.172805	Ramesh	Delivered	admin	2025-08-07 13:14:33.269755	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 23:06:16	Screen_31-07-2025-17	530.00	6x12	53.9	Shaker	2025-08-01 01:55:26.528611	Parthiban	Delivered	admin	2025-08-07 12:40:09.233134	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 14:27:07	Screen_01-08-2025-6	511.00	8x30	73.5	Shaker	2025-08-01 14:27:27.274891	Ramesh	Screening	admin	2025-08-13 15:34:05.431882	loaded	2025-08-13 15:34:06	admin	\N	540.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-01 12:53:04	Screen_01-08-2025-4	592.00	8x30	51.0	Shaker	2025-08-01 12:53:24.021849	Ramesh	Screening	admin	2025-08-13 15:34:45.613622	loaded	2025-08-13 15:34:46	admin	\N	592.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-01 15:26:32	Screen_01-08-2025-8	584.00	6x12	53.4	Shaker	2025-08-01 15:27:19.373758	Ramesh	Delivered	admin	2025-08-07 13:09:08.203967	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 15:20:33	Screen_31-07-2025-7	567.00	8x30	59.3	Shaker	2025-07-31 15:20:54.280234	Ramesh	Delivered	admin	2025-08-07 14:53:43.955758	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 14:10:34	Screen_31-07-2025-6	542.00	8x30	56.9	Shaker	2025-07-31 14:12:47.103286	Ramesh	Delivered	admin	2025-08-07 14:51:53.118625	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 23:06:16	Screen_31-07-2025-15	571.00	6x12	57.3	Shaker	2025-08-01 00:30:28.92335	Parthiban	Delivered	admin	2025-08-07 12:40:31.167701	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 23:06:16	Screen_31-07-2025-18	549.00	8x30	56.9	Shaker	2025-08-01 01:55:51.278551	Parthiban	Delivered	admin	2025-08-07 14:49:59.472737	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 19:02:07	Screen_31-07-2025-12	569.00	6x12	57.2	Shaker	2025-07-31 19:02:25.019176	Ramesh	Delivered	admin	2025-08-07 12:46:14.583954	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 06:54:57	Screen_01-08-2025-2	537.00	6x12	54.9	Shaker	2025-08-01 06:55:44.106138	Parthiban	Delivered	admin	2025-08-07 13:06:36.610618	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 06:54:57	Screen_01-08-2025-1	525.00	8x30	56.9	Shaker	2025-08-01 06:55:16.163895	Parthiban	Delivered	admin	2025-08-07 14:53:27.991323	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 01:49:44	Screen_31-07-2025-4	552.00	6x12	58.2	Shaker	2025-07-31 01:50:25.692742	Parthiban	Delivered	admin	2025-08-07 12:48:23.197916	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 07:45:46	Screen_02-08-2025-4	583.00	8x30	60.0	Shaker	2025-08-02 09:09:17.532748	Prasanth	Delivered	admin	2025-08-07 14:56:49.494662	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 22:29:03	Screen_30-07-2025-12	556.00	6x12	57.2	Shaker	2025-07-30 22:29:32.674981	Parthiban	Delivered	admin	2025-08-02 16:29:08.674344	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 17:15:16	Screen_31-07-2025-11	557.00	8x30	61.0	Shaker	2025-07-31 17:15:32.331033	Ramesh	Delivered	admin	2025-08-07 14:53:57.107481	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 23:35:52	Screen_S_020825_004	563.00	8x30	59.3	Shaker	2025-08-02 23:50:06.885285	Prasanth	Delivered	admin	2025-08-07 14:57:53.592501	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 15:00:32	Screen_30-07-2025-6	542.00	8x30	56.9	Shaker	2025-07-30 15:01:36.028359	Ramesh	Delivered	admin	2025-08-12 15:10:57.811644	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 21:35:01	Screen_02-08-2025-12	546.00	8x30	60.8	Shaker	2025-08-02 21:35:36.400489	Prasanth	Delivered	admin	2025-08-07 14:58:38.815557	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 23:34:19	Screen_R_020825_001	533.00	6x12	57.6	Shaker	2025-08-02 23:34:48.430057	Prasanth	Delivered	admin	2025-08-07 13:24:05.694368	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 01:31:52	Screen_31-07-2025-1	549.00	6x12	60.1	Shaker	2025-07-31 01:32:10.23739	Parthiban	Delivered	admin	2025-08-02 16:29:23.964337	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 23:35:52	Screen_R_020825_003	544.00	6x12	60.3	Shaker	2025-08-02 23:39:18.072361	Prasanth	Delivered	admin	2025-08-07 13:47:53.787195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 12:21:42	Screen_02-08-2025-6	519.00	6x12	63.1	Shaker	2025-08-02 12:22:03.485444	Ramesh	Delivered	admin	2025-08-07 12:36:02.438238	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 09:30:33	Screen_30-07-2025-2	582.00	6x12	52.0	Shaker	2025-07-30 09:31:31.577172	Ramesh	Delivered	admin	2025-08-02 16:30:29.417435	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 17:45:36	Screen_30-07-2025-9	565.00	8x30	57.0	Shaker	2025-07-30 17:45:58.167881	Ramesh	Delivered	admin	2025-08-12 15:11:45.055652	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 01:31:52	Screen_31-07-2025-2	564.00	8x30	60.2	Shaker	2025-07-31 01:32:32.843496	Parthiban	Delivered	admin	2025-08-12 15:12:15.579028	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 19:59:05	Screen_30-07-2025-11	539.00	8x30	56.5	Shaker	2025-07-30 21:12:24.640197	Parthiban	Delivered	admin	2025-08-02 16:35:43.292514	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 19:02:55	Screen_30-07-2025-10	563.00	6x12	56.5	Shaker	2025-07-30 19:03:33.926163	Ramesh	Delivered	admin	2025-08-02 16:29:36.441462	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 17:39:12	Screen_02-08-2025-10	494.00	8x30	66.7	Shaker	2025-08-02 17:40:48.99914	Parthiban	Screening	Thiruppathi	2025-08-13 02:05:34.330237	loaded	2025-08-13 02:05:36	Thiruppathi	\N	494.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-01 06:54:57	Screen_01-08-2025-3	562.00	8x30	53.9	Shaker	2025-08-01 07:41:20.751017	Parthiban	Delivered	admin	2025-08-12 12:22:01.275378	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 18:16:36	Screen_02-08-2025-11	552.00	6x12	60.0	Shaker	2025-08-02 18:17:00.203727	Ramesh	Delivered	admin	2025-08-07 12:37:01.389664	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 15:21:32	Screen_30-07-2025-7	565.00	6x12	55.5	Shaker	2025-07-30 15:23:28.979465	Parthiban	Delivered	admin	2025-08-02 16:29:51.17924	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 12:16:59	Screen_31-07-2025-5	549.00	6x12	58.2	Shaker	2025-07-31 12:17:36.318321	Ramesh	Delivered	admin	2025-08-02 16:01:18.819342	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 15:41:54	Screen_31-07-2025-8	558.00	6x12	58.9	Shaker	2025-07-31 15:42:18.475269	Ramesh	Delivered	admin	2025-08-02 16:02:39.92509	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 15:53:59	Screen_31-07-2025-10	530.00	6x12	55.0	Shaker	2025-07-31 15:54:25.493326	Ramesh	Delivered	admin	2025-08-02 16:06:01.401408	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 17:39:12	Screen_30-07-2025-8	554.00	6x12	57.5	Shaker	2025-07-30 17:39:38.999141	Ramesh	Delivered	admin	2025-08-02 16:28:52.674242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 11:17:21	Screen_30-07-2025-4	575.00	6x12	55.0	Shaker	2025-07-30 11:18:32.819173	Ramesh	Delivered	admin	2025-08-02 16:30:16.418711	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 23:06:16	Screen_31-07-2025-16	550.00	8x30	55.4	Shaker	2025-08-01 00:30:50.599593	Parthiban	Delivered	admin	2025-08-07 14:49:38.88047	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-01 15:26:32	Screen_01-08-2025-7	552.00	6x12	64.3	Shaker	2025-08-01 15:26:49.442914	Ramesh	Delivered	admin	2025-08-07 12:39:33.880052	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 14:39:43	Screen_02-08-2025-7	556.00	8x30	62.2	Shaker	2025-08-02 14:40:17.861301	Ramesh	Delivered	admin	2025-08-07 14:58:56.92574	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 10:45:10	Screen_R_030825_010	576.00	6x12	59.4	Shaker	2025-08-03 10:46:42.892899	Angura	Delivered	admin	2025-08-07 13:49:29.149365	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 10:40:12	Screen_S_030825_009	585.00	8x30	57.5	Shaker	2025-08-03 10:40:55.944041	Angura	Delivered	admin	2025-08-07 14:59:42.740266	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 14:37:54	Screen_S_030825_012	561.00	8x30	52.7	Shaker	2025-08-03 14:38:45.107279	Angura	Delivered	admin	2025-08-12 12:26:03.6106	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 11:50:24	Screen_R_030825_011	540.00	6x12	56.8	Shaker	2025-08-03 11:51:16.613859	Angura	Delivered	admin	2025-08-07 13:50:03.621608	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 14:47:45	Screen_R_030825_013	561.00	6x12	51.9	Shaker	2025-08-03 14:48:45.39999	Angura	Delivered	admin	2025-08-07 13:50:55.905956	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 18:36:42	Screen_S_030825_016	584.00	8x30	52.5	Shaker	2025-08-03 18:37:14.657639	Angura	Delivered	admin	2025-08-12 12:26:15.758374	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 21:10:40	Screen_R_030825_017	565.00	6x12	52.2	Shaker	2025-08-03 21:10:59.125456	Ramesh	Delivered	admin	2025-08-07 13:59:46.921085	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 14:37:26	Screen_V_050825_047	587.00	-30	49.7	Shaker	2025-08-05 14:38:11.55959	Angura	Delivered	Parthiban	2025-08-26 12:09:32.661351	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 09:33:59	Screen_R_150825_243	557.00	6x12	57.1	Shaker	2025-08-15 09:34:11.279347	Ramesh	Delivered	Thiruppathi	2025-08-17 09:16:01.50147	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 00:59:30	Screen_R_040825_018	571.00	6x12	50.0	Shaker	2025-08-04 00:59:47.732628	Ramesh	Delivered	admin	2025-08-12 12:05:40.718441	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 16:33:09	Screen_S_040825_032	552.00	8x30	52.9	Shaker	2025-08-04 16:33:40.749855	Angura	Delivered	admin	2025-08-12 12:27:58.888739	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 16:44:00	Screen_R_040825_033	72.00	6x12	55	Shaker	2025-08-04 16:44:37.220545	Angura	Delivered	admin	2025-08-26 12:57:14.382098	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 03:03:04	Screen_R_040825_022	561.00	6x12	51.6	Shaker	2025-08-04 03:03:17.738727	Ramesh	Delivered	admin	2025-08-07 14:02:35.598836	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 10:25:56	Screen_R_040825_025	564.00	6x12	48.9	Shaker	2025-08-04 10:26:22.106135	Angura	Delivered	admin	2025-08-12 12:05:56.495949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 01:05:58	Screen_S_040825_019	564.00	8x30	52.4	Shaker	2025-08-04 01:06:14.546746	Ramesh	Screening	Thiruppathi	2025-08-13 18:05:42.376862	loaded	2025-08-13 18:05:42	Thiruppathi	\N	564.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-07 07:51:36	Screen_S_070825_068	571.00	8x30	50.9	Shaker	2025-08-07 07:51:51.355493	Ramesh	Screening	Thiruppathi	2025-08-13 17:45:52.646371	loaded	2025-08-13 17:45:54	Thiruppathi	\N	571.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-04 02:42:09	Screen_R_040825_023	561.00	6x12	51.6	Shaker	2025-08-04 06:34:01.531506	Prasanth	Delivered	admin	2025-08-07 14:02:46.062328	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 16:47:10	Screen_R_040825_034	573.00	6x12	51.2	Shaker	2025-08-04 16:49:33.093577	Angura	Delivered	admin	2025-08-07 14:05:43.419174	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 01:29:08	Screen_S_040825_021	540.00	8x30	55	Shaker	2025-08-04 02:29:25.068338	Prasanth	Delivered	admin	2025-08-27 16:11:50.117811	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 12:00:53	Screen_R_040825_029	557.00	6x12	47.2	Shaker	2025-08-04 12:01:32.010045	Angura	Delivered	admin	2025-08-12 12:06:23.129256	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 14:22:01	Screen_S_040825_031	523.00	8x30	47.8	Shaker	2025-08-04 14:22:53.816766	Angura	Screening	Thiruppathi	2025-08-13 18:06:20.364365	loaded	2025-08-13 18:06:21	Thiruppathi	\N	523.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-04 11:44:20	Screen_S_040825_028	583.00	8x30	47.0	Shaker	2025-08-04 11:46:05.742163	Angura	Screening	Thiruppathi	2025-08-13 00:43:41.469494	loaded	2025-08-13 00:43:45	Thiruppathi	\N	583.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-04 12:39:57	Screen_R_040825_030	542.00	6x12	47.4	Shaker	2025-08-04 12:40:21.280364	Angura	Delivered	admin	2025-08-12 12:06:32.922204	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 18:00:06	Screen_R_050825_052	535.00	6x12	68.5	Shaker	2025-08-05 18:00:38.699935	Angura	Delivered	admin	2025-08-12 12:06:57.734607	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 18:36:33	Screen_S_060825_064	591.00	8x30	63.5	Shaker	2025-08-06 18:37:26.659511	Angura	Delivered	admin	2025-08-12 12:29:07.489726	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 21:50:42	Screen_R_040825_037	527.00	6x12	57.5	Shaker	2025-08-04 21:51:04.154739	Ramesh	Delivered	admin	2025-08-07 14:06:37.358194	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 01:00:09	Screen_R_050825_038	564.00	6x12	58.9	Shaker	2025-08-05 01:00:27.668115	Prasanth	Delivered	admin	2025-08-07 14:07:22.6118	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 01:45:11	Screen_R_050825_041	520.00	6x12	56.0	Shaker	2025-08-05 01:45:30.744208	Ramesh	Delivered	admin	2025-08-07 14:07:47.285278	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 19:09:02	Screen_S_040825_036	521.00	8x30	54.0	Shaker	2025-08-04 19:09:29.416376	Angura	Screening	Thiruppathi	2025-08-13 17:40:58.466124	loaded	2025-08-13 17:40:59	Thiruppathi	\N	521.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-03 07:50:50	Screen_S_030825_008	540.00	8x30	56.8	Shaker	2025-08-03 09:35:53.905085	Parthiban	Delivered	admin	2025-08-07 14:59:23.563281	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 06:57:41	Screen_R_050825_042	552.00	6x12	62	Shaker	2025-08-05 06:58:01.98847	Ramesh	Delivered	admin	2025-08-07 14:12:14.953044	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-30 07:51:30	Screen_30-07-2025-1	558.00	6x12	45	Shaker	2025-07-30 07:52:41.372031	admin	Screening	Parthiban	2025-08-02 15:13:43.83882	loaded	2025-08-05 14:36:30	Angura	\N	587.00	\N	\N	Shaker	{"30x60"}
2025-08-06 01:20:53	Screen_R_060825_054	540.00	6x12	63.7	Shaker	2025-08-06 01:21:09.075473	Ramesh	Delivered	admin	2025-08-12 12:07:11.542831	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 19:13:54	Screen_S_050825_053	545.00	8x30	66.2	Shaker	2025-08-05 19:14:24.40307	Angura	Screening	Thiruppathi	2025-08-12 23:54:36.96708	loaded	2025-08-12 23:54:39	Thiruppathi	\N	545.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-05 15:34:46	Screen_R_050825_050	516.00	6x12	66.42	Shaker	2025-08-05 15:35:08.302545	Angura	Delivered	admin	2025-08-07 14:18:56.952789	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 06:28:36	Screen_S_060825_058	518.00	8x30	67.1	Shaker	2025-08-06 06:28:52.237874	Ramesh	Delivered	admin	2025-08-12 15:16:09.199528	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 15:05:15	Screen_S_050825_049	577.00	8x30	63.4	Shaker	2025-08-05 15:05:42.99899	Angura	Delivered	admin	2025-08-12 12:31:25.587126	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 03:10:48	Screen_R_060825_056	559.00	6x12	65.3	Shaker	2025-08-06 03:11:00.866563	Ramesh	Delivered	admin	2025-08-12 12:07:31.500739	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 07:37:56	Screen_R_060825_059	537.00	6x12	65.8	Shaker	2025-08-06 07:38:12.900805	Ramesh	Delivered	admin	2025-08-12 12:07:44.10205	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 03:29:55	Screen_S_060825_057	579.00	8x30	65.5	Shaker	2025-08-06 03:30:10.901473	Ramesh	Screening	Thiruppathi	2025-08-12 23:57:13.427276	loaded	2025-08-12 23:57:18	Thiruppathi	\N	579.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-05 06:57:41	Screen_S_050825_043	548.00	8x30	55.5	Shaker	2025-08-05 06:58:29.928501	Ramesh	Delivered	admin	2025-08-12 15:17:08.146828	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 18:10:11	Screen_R_060825_062	560.00	6x12	62.4	Shaker	2025-08-06 18:10:33.284842	Angura	Delivered	admin	2025-08-12 12:08:05.263979	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 19:18:22	Screen_R_060825_065	552.00	6x12	64.5	Shaker	2025-08-06 19:18:52.192638	Angura	Delivered	admin	2025-08-12 12:08:14.337656	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 03:01:15	Screen_R_070825_067	565.00	6x12	60.5	Shaker	2025-08-07 03:01:57.847779	Ramesh	Delivered	admin	2025-08-12 12:08:28.851216	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 01:33:53	Screen_S_050825_040	588.00	8x30	53.2	Shaker	2025-08-05 01:34:07.602302	Ramesh	Delivered	admin	2025-08-12 12:24:54.978892	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 03:01:15	Screen_S_070825_066	625.00	8x30	57.8	Shaker	2025-08-07 03:01:32.225595	Ramesh	Delivered	admin	2025-08-12 12:30:43.046171	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 07:16:21	Screen_S_050825_044	536.00	8x30	59.7	Shaker	2025-08-05 07:16:41.541479	Ramesh	Delivered	admin	2025-08-12 12:30:59.406366	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 15:02:51	Screen_S_050825_048	537.00	8x30	63.1	Shaker	2025-08-05 15:03:22.265872	Angura	Delivered	admin	2025-08-12 12:31:17.83101	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 01:11:59	Screen_S_050825_039	563.00	8x30	55.3	Shaker	2025-08-05 01:12:13.334857	Ramesh	Delivered	admin	2025-08-07 15:01:24.745339	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 22:04:32	Screen_31-07-2025-14	534.00	6x12	54.6	Shaker	2025-07-31 22:04:56.741713	Parthiban	Delivered	admin	2025-08-07 13:03:24.706631	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 09:14:28	Screen_R_050825_045	521.00	6x12	65	Shaker	2025-08-05 09:15:09.646872	Angura	Delivered	admin	2025-08-07 14:13:27.127166	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 07:50:46	Screen_02-08-2025-5	519.00	6x12	63.7	Shaker	2025-08-02 09:09:49.249171	Prasanth	Delivered	admin	2025-08-07 13:19:00.856175	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 02:54:48	Screen_R_030825_006	520.00	6x12	60.7	Shaker	2025-08-03 02:58:33.950244	Prasanth	Delivered	admin	2025-08-07 13:48:41.831419	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 08:01:17	Screen_R_030825_007	533.00	6x12	56.9	Shaker	2025-08-03 08:01:31.367882	Prasanth	Delivered	admin	2025-08-07 13:49:06.174404	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 17:49:20	Screen_R_040825_035	556.00	6x12	51.4	Shaker	2025-08-04 17:49:47.690859	Angura	Delivered	admin	2025-08-07 14:06:16.970478	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-05 14:35:25	Screen_R_050825_046	523.00	6x12	61.71	Shaker	2025-08-05 14:35:45.214491	Angura	Delivered	admin	2025-08-07 14:14:38.569984	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 22:01:08	Screen_31-07-2025-13	572.00	8x30	56.6	Shaker	2025-07-31 22:01:29.720494	Parthiban	Delivered	admin	2025-08-07 14:50:13.136925	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 02:54:48	Screen_S_030825_005	548.00	8x30	56.5	Shaker	2025-08-03 02:55:29.036278	Prasanth	Delivered	admin	2025-08-07 14:58:23.159867	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 17:20:09	Screen_R_070825_071	554.00	6x12	52.9	Shaker	2025-08-07 17:20:36.690289	Angura	Delivered	admin	2025-08-12 12:09:00.142185	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 19:20:14	Screen_S_070825_074	521.00	8x30	55.6	Shaker	2025-08-07 19:20:30.647227	Angura	Delivered	admin	2025-08-12 12:32:11.490192	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 16:52:17	Screen_S_070825_070	539.00	8x30	50.2	Shaker	2025-08-07 16:52:55.382771	Angura	Screening	Thiruppathi	2025-08-13 07:34:51.32735	loaded	2025-08-13 07:34:55	Thiruppathi	\N	539.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-07 19:11:02	Screen_R_070825_073	564.00	6x12	52.3	Shaker	2025-08-07 19:11:29.167678	Angura	Delivered	admin	2025-08-12 12:12:28.886628	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 02:00:57	Screen_S_090825_103	545.00	8x30	59.8	Shaker	2025-08-09 02:01:14.225209	Ramesh	Delivered	admin	2025-08-12 12:31:54.182793	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 07:28:43	Screen_S_080825_083	510.00	8x30	57.3	Shaker	2025-08-08 07:29:00.777726	Ramesh	Delivered	admin	2025-08-12 12:33:19.781826	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 11:50:20	Screen_M_140925_884	497.00	30x60	57.5	gyro	2025-09-14 11:50:32.208454	Angura	Delivered	admin	2025-09-18 11:11:07.64942	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 21:51:26	Screen_R_070825_076	545.00	6x12	53.8	Shaker	2025-08-07 21:51:43.757086	Ramesh	Delivered	admin	2025-08-12 12:35:28.931091	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 02:38:27	Screen_R_080825_081	555.00	6x12	54.1	Shaker	2025-08-08 02:40:19.174866	Ramesh	Delivered	admin	2025-08-12 12:36:26.871796	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 07:43:32	Screen_V_100825_119	661.00	-30	50.0	Shaker	2025-08-10 07:44:37.583683	Parthiban	Delivered	Parthiban	2025-08-26 12:09:21.378562	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 00:48:47	Screen_R_080825_079	546.00	6x12	51.3	Shaker	2025-08-08 00:49:32.544591	Ramesh	Delivered	Thiruppathi	2025-08-17 11:07:28.411918	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 16:27:59	Screen_R_080825_091	552.00	6x12	51.8	Shaker	2025-08-08 16:28:24.042359	Angura	Delivered	Thiruppathi	2025-08-17 11:08:21.427683	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 18:46:22	Screen_R_080825_094	520.00	6x12	64.2	Shaker	2025-08-08 18:46:39.40823	Angura	Delivered	Thiruppathi	2025-08-17 11:18:46.251071	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 06:59:01	Screen_R_080825_082	540.00	6x12	53.1	Shaker	2025-08-08 06:59:16.514001	Ramesh	Delivered	admin	2025-08-12 12:36:51.980733	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 08:03:21	Screen_R_080825_084	531.00	6x12	55.0	Shaker	2025-08-08 08:03:38.539732	Ramesh	Delivered	admin	2025-08-12 12:37:04.475069	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 10:07:45	Screen_R_080825_086	554.00	6x12	52.4	Shaker	2025-08-08 10:08:24.854422	Angura	Delivered	admin	2025-08-12 12:33:57.54429	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 11:56:28	Screen_R_080825_088	527.00	6x12	55.1	Shaker	2025-08-08 11:56:50.31199	Angura	Delivered	admin	2025-08-12 12:37:25.464062	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 18:59:17	Screen_S_080825_095	546.00	8x30	52.8	Shaker	2025-08-08 18:59:32.119602	Angura	Delivered	admin	2025-08-12 12:34:20.205885	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 17:24:59	Screen_V_080825_092	611.00	-30	28.5	Shaker	2025-08-08 17:25:20.346956	Angura	Delivered	Parthiban	2025-08-26 12:09:24.967386	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 17:39:41	Screen_V_070825_072	592.00	-30	40.9	Shaker	2025-08-07 17:41:01.980886	Angura	Delivered	Parthiban	2025-08-26 12:09:28.517459	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 19:36:51	Screen_R_070825_075	522.00	6x12	55.3	Shaker	2025-08-07 19:37:10.734038	Angura	Delivered	admin	2025-08-12 12:35:21.160873	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 10:07:45	Screen_S_080825_087	528.00	8x30	56.0	Shaker	2025-08-08 10:55:50.180892	Angura	Screening	Thiruppathi	2025-08-13 18:07:34.909136	loaded	2025-08-13 18:07:35	Thiruppathi	\N	528.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-09 01:52:43	Screen_R_090825_102	532.00	6x12	57.1	Shaker	2025-08-09 01:52:58.213851	Ramesh	Delivered	admin	2025-08-12 12:39:41.819748	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 23:58:18	Screen_R_080825_101	547.00	6x12	55.6	Shaker	2025-08-08 23:58:59.926715	Ramesh	Delivered	admin	2025-08-12 12:39:53.658228	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 17:24:59	Screen_S_080825_093	577.00	8x30	54.3	Shaker	2025-08-08 17:25:37.161816	Angura	Screening	Thiruppathi	2025-08-13 21:40:10.478668	loaded	2025-08-13 21:40:10	Thiruppathi	\N	577.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-08 21:10:20	Screen_S_080825_096	562.00	8x30	55.7	Shaker	2025-08-08 21:11:09.838506	Ramesh	Delivered	admin	2025-08-12 13:02:28.266924	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 22:57:56	Screen_S_070825_077	536.00	8x30	54.5	Shaker	2025-08-07 22:58:18.04627	Ramesh	Screening	Thiruppathi	2025-08-13 23:07:43.211179	loaded	2025-08-13 23:07:43	Thiruppathi	\N	536.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-09 11:21:36	Screen_R_090825_106	542.00	6x12	52.6	Shaker	2025-08-09 11:22:20.122231	admin	Delivered	admin	2025-08-12 12:40:10.722505	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 23:58:18	Screen_S_080825_100	541.00	8x30	55.6	Shaker	2025-08-08 23:58:38.6317	Ramesh	Delivered	admin	2025-08-12 13:02:43.082107	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 21:14:54	Screen_R_080825_097	557.00	6x12	52.7	Shaker	2025-08-08 21:15:07.426331	Ramesh	Delivered	admin	2025-08-12 12:40:19.197717	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 22:39:55	Screen_R_080825_098	556.00	6x12	53	Shaker	2025-08-08 22:40:09.394811	Ramesh	Delivered	admin	2025-08-12 12:40:29.43497	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 12:18:57	Screen_S_090825_108	547.00	8x30	55.0	Shaker	2025-08-09 12:19:21.358958	Angura	Delivered	admin	2025-08-12 13:03:07.256244	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 08:01:50	Screen_R_090825_104	555.00	6x12	55.2	Shaker	2025-08-09 08:03:09.557407	Ramesh	Delivered	admin	2025-08-12 12:40:51.681494	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 12:18:57	Screen_R_090825_107	540.00	6x12	55.8	Shaker	2025-08-09 12:19:06.609724	Angura	Delivered	admin	2025-08-12 12:41:03.392825	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 22:47:49	Screen_S_080825_099	558.00	8x30	51.7	Shaker	2025-08-08 22:48:03.137303	Ramesh	Screening	Thiruppathi	2025-08-13 17:47:47.98698	loaded	2025-08-13 17:47:48	Thiruppathi	\N	558.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-09 17:33:19	Screen_R_090825_109	550.00	6x12	58.2	Shaker	2025-08-09 17:33:28.957159	Angura	Delivered	admin	2025-08-12 12:41:38.293262	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 19:16:14	Screen_S_090825_111	531.00	8x30	56.6	Shaker	2025-08-09 19:16:26.60564	Angura	Delivered	admin	2025-08-12 13:03:17.095198	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 19:20:17	Screen_S_090825_112	511.00	8x30	58.5	Shaker	2025-08-09 19:20:34.914259	Angura	Delivered	admin	2025-08-12 13:03:32.890531	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 23:10:37	Screen_S_090825_115	559.00	8x30	56.8	Shaker	2025-08-09 23:10:41.216669	Parthiban	Delivered	admin	2025-08-12 13:03:49.989715	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 19:22:56	Screen_R_090825_113	556.00	6x12	57.4	Shaker	2025-08-09 19:23:08.23747	Angura	Delivered	admin	2025-08-12 13:06:26.970057	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 03:09:55	Screen_R_100825_117	531.00	6x12	57.8	Shaker	2025-08-10 03:10:13.959555	Parthiban	Delivered	admin	2025-08-12 13:06:58.28821	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 23:05:37	Screen_R_090825_114	563.00	6x12	59.0	Shaker	2025-08-09 23:10:12.5621	Parthiban	Delivered	admin	2025-08-12 13:08:20.094987	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 06:35:32	Screen_R_100825_118	554.00	6x12	63.3	Shaker	2025-08-10 07:44:19.520188	Parthiban	Delivered	admin	2025-08-12 13:08:34.466649	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 10:50:48	Screen_R_100825_121	531.00	6x12	61.0	Shaker	2025-08-10 10:51:01.743513	Ramesh	Delivered	admin	2025-08-12 13:08:43.445695	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 08:57:03	Screen_S_100825_120	538.00	8x30	62.5	Shaker	2025-08-10 08:57:27.284473	Ramesh	Delivered	admin	2025-08-12 13:09:31.399565	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 16:24:25	Screen_R_070825_069	580.00	6x12	52.9	Shaker	2025-08-07 16:25:20.726914	Angura	Delivered	admin	2025-08-12 12:08:44.419097	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 00:19:53	Screen_R_110825_129	529.00	6x12	53.7	Shaker	2025-08-11 00:20:09.000662	Angura	Delivered	Thiruppathi	2025-08-17 11:19:06.322537	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 22:37:15	Screen_V_110825_142	529.00	-30	46.3	Shaker	2025-08-11 22:37:31.902984	Angura	Delivered	Parthiban	2025-08-26 12:09:17.867534	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 17:45:11	Screen_R_100825_127	546.00	6x12	56.9	Shaker	2025-08-10 17:45:27.85932	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:02.549848	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 03:26:52	Screen_R_110825_132	552.00	6x12	53.4	Shaker	2025-08-11 03:27:04.194199	Angura	Delivered	Thiruppathi	2025-08-17 11:19:10.322277	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_164	500.00	8x16	56.4	Shaker	2025-08-13 00:12:05.356287	Thiruppathi	Delivered	admin	2025-08-16 13:04:05.675735	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 15:35:47	Screen_L_120825_157	505.00	8x16	57.7	Shaker	2025-08-12 15:38:07.817482	Ramesh	Delivered	admin	2025-08-16 13:03:03.490473	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 07:48:10	Screen_R_110825_134	565.00	6x12	56.0	Shaker	2025-08-11 07:48:21.824132	Angura	Delivered	Thiruppathi	2025-08-17 11:19:15.092585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 19:20:54	Screen_R_110825_137	599.00	6x12	56.0	Shaker	2025-08-11 19:21:10.976832	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:18.712691	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 23:23:15	Screen_L_120825_158	500.00	8x16	55.8	Shaker	2025-08-12 23:23:30.74908	Thiruppathi	Delivered	admin	2025-08-16 13:03:10.545643	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 07:56:57	Screen_S_110825_135	529.00	8x30	56.1	Shaker	2025-08-11 07:57:11.125401	Angura	Screening	Thiruppathi	2025-08-13 21:41:39.271348	loaded	2025-08-13 21:41:39	Thiruppathi	\N	529.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 00:08:43	Screen_L_130825_161	500.00	8x16	62.2	Shaker	2025-08-13 00:11:24.807246	Thiruppathi	Delivered	admin	2025-08-16 13:03:42.531805	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_167	500.00	12x30	56	Shaker	2025-08-13 00:13:34.647341	Thiruppathi	Delivered	admin	2025-08-16 14:02:05.084347	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 19:20:54	Screen_R_110825_139	563.00	6x12	53.5	Shaker	2025-08-11 19:22:10.64077	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:22.422539	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 12:21:27	Screen_S_120825_155	570.00	8x30	57.8	Shaker	2025-08-12 12:21:39.045596	Ramesh	Screening	Thiruppathi	2025-08-14 07:00:03.235524	loaded	2025-08-14 07:00:04	Thiruppathi	\N	570.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-12 01:25:10	Screen_R_120825_146	566.00	6x12	54.7	Shaker	2025-08-12 01:25:30.633687	Angura	Delivered	Thiruppathi	2025-08-17 08:56:22.301759	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 19:40:35	Screen_R_110825_141	567.00	6x12	51.7	Shaker	2025-08-11 19:41:15.911521	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:25.962136	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 22:37:15	Screen_R_110825_143	530.00	6x12	52.8	Shaker	2025-08-11 22:37:46.592646	Angura	Delivered	Thiruppathi	2025-08-17 11:19:30.006371	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 01:44:36	Screen_R_120825_147	548.00	6x12	52.0	Shaker	2025-08-12 01:44:52.849317	Angura	Delivered	Thiruppathi	2025-08-17 11:19:33.502111	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 15:35:47	Screen_P_120825_156	533.00	12x30	55	Shaker	2025-08-12 15:37:19.229732	Ramesh	Delivered	Thiruppathi	2025-08-16 14:25:18.535655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 09:39:48	Screen_R_120825_153	547.00	6x12	54.7	Shaker	2025-08-12 09:40:12.16476	Ramesh	Delivered	Thiruppathi	2025-08-17 09:06:23.360223	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-03 18:05:19	Screen_R_030825_014	571.00	6x12	50.4	Shaker	2025-08-03 18:06:03.506043	Angura	Delivered	admin	2025-08-12 12:04:45.252982	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 14:40:52	Screen_R_060825_061	554.00	6x12	65.7	Shaker	2025-08-06 14:41:13.016741	Parthiban	Delivered	admin	2025-08-12 12:07:55.761273	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-06 18:22:43	Screen_S_060825_063	557.00	8x30	62.4	Shaker	2025-08-06 18:23:10.284804	Angura	Delivered	admin	2025-08-12 12:28:54.570383	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 09:07:32	Screen_S_080825_085	547.00	8x30	55.1	Shaker	2025-08-08 09:08:04.994008	Angura	Delivered	admin	2025-08-12 12:33:32.153465	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-08 14:46:39	Screen_R_080825_089	541.00	6x12	53.8	Shaker	2025-08-08 14:47:29.375409	Angura	Delivered	admin	2025-08-12 12:37:43.891837	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 17:48:22	Screen_R_090825_110	570.00	6x12	56.7	Shaker	2025-08-09 17:48:37.633848	Angura	Delivered	admin	2025-08-12 12:41:20.975128	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 23:35:08	Screen_S_090825_116	597.00	8x30	58.9	Shaker	2025-08-10 01:23:18.39867	Parthiban	Delivered	admin	2025-08-12 13:04:02.592231	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 10:50:48	Screen_S_100825_122	560.00	8x30	59.1	Shaker	2025-08-10 10:51:16.330268	Ramesh	Delivered	admin	2025-08-12 13:09:45.156551	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 17:06:31	Screen_S_100825_123	563.00	8x30	58.7	Shaker	2025-08-10 17:06:54.618362	Ramesh	Delivered	admin	2025-08-12 13:09:53.800143	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 17:06:31	Screen_S_100825_124	564.00	8x30	63.7	Shaker	2025-08-10 17:07:23.213158	Ramesh	Delivered	admin	2025-08-12 13:10:00.654698	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 17:25:56	Screen_S_100825_125	603.00	8x30	56.9	Shaker	2025-08-10 17:26:09.270998	Ramesh	Delivered	admin	2025-08-12 13:10:09.681436	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 17:35:38	Screen_R_100825_126	569.00	6x12	56.9	Shaker	2025-08-10 17:35:55.664968	Ramesh	Delivered	admin	2025-08-12 13:10:57.872239	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 01:45:30	Screen_R_110825_130	577.00	6x12	54.6	Shaker	2025-08-11 01:45:46.138955	Angura	Delivered	admin	2025-08-12 13:11:17.375721	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-07-31 01:49:44	Screen_31-07-2025-3	557.00	8x30	59.2	Shaker	2025-07-31 01:49:58.579164	Parthiban	Delivered	admin	2025-08-12 15:09:00.551028	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 03:26:52	Screen_S_110825_133	524.00	8x30	56.6	Shaker	2025-08-11 03:27:33.990899	Angura	Delivered	admin	2025-08-12 15:18:14.100793	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 12:01:24	Screen_R_110825_136	599.00	6x12	55.8	Shaker	2025-08-11 12:04:46.92946	Prasanth	Delivered	admin	2025-08-12 15:18:39.82581	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 19:40:35	Screen_S_110825_140	563.00	8x30	54.7	Shaker	2025-08-11 19:40:55.722004	Ramesh	Delivered	admin	2025-08-12 15:19:38.732946	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 07:10:09	Screen_R_120825_150	558.00	6x12	50.5	Shaker	2025-08-12 07:10:23.105201	Angura	Delivered	Thiruppathi	2025-08-17 11:05:54.1567	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 09:47:41	Screen_R_150825_244	521.00	6x12	59.5	Shaker	2025-08-15 09:48:06.594284	Ramesh	Delivered	Thiruppathi	2025-08-17 11:12:34.397347	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 02:51:36	Screen_R_120825_149	554.00	6x12	50.4	Shaker	2025-08-12 02:51:50.298573	Angura	Delivered	Thiruppathi	2025-08-17 11:19:37.802347	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 11:07:36	Screen_R_120825_154	567.00	6x12	56.3	Shaker	2025-08-12 11:07:57.320088	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:41.812328	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 01:02:57	Screen_S_120825_145	521.00	8x30	55.2	Shaker	2025-08-12 01:03:11.263773	Angura	Delivered	Parthiban	2025-08-22 09:51:15.102242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-10 18:16:31	Screen_V_100825_128	418.00	-30	66.5	Shaker	2025-08-10 18:17:34.408749	Parthiban	Delivered	Parthiban	2025-08-26 12:09:14.082731	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 02:30:12	Screen_S_120825_148	548.00	8x30	54.6	Shaker	2025-08-12 02:30:41.030516	Angura	Screening	Thiruppathi	2025-08-13 21:42:57.131533	loaded	2025-08-13 21:43:01	Thiruppathi	\N	548.01	\N	\N	Shaker	{"8x16","12x40"}
2025-08-12 07:25:46	Screen_S_120825_151	580.00	8x30	52.6	Shaker	2025-08-12 07:26:06.279267	Angura	Screening	Thiruppathi	2025-08-13 18:08:25.669404	loaded	2025-08-13 18:08:26	Thiruppathi	\N	508.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-06 07:55:44	Screen_S_060825_060	560.00	8x30	64.9	Shaker	2025-08-06 07:55:59.342339	Ramesh	Screening	Thiruppathi	2025-08-12 23:27:49.786308	loaded	2025-08-12 23:27:58	Thiruppathi	\N	550.00	\N	\N	Shaker	{"8x16","20x40"}
2025-08-01 14:23:26	Screen_01-08-2025-5	511.00	8x30	74.5	Shaker	2025-08-01 14:23:41.522335	Parthiban	Screening	Thiruppathi	2025-08-12 23:51:10.799406	loaded	2025-08-12 23:51:14	Thiruppathi	\N	548.00	\N	\N	Shaker	{"8x16","20x40"}
2025-08-05 16:28:20	Screen_S_050825_051	520.00	8x30	66.9	Shaker	2025-08-05 16:29:09.705737	Angura	Screening	Thiruppathi	2025-08-12 23:55:49.621571	loaded	2025-08-12 23:56:17	Thiruppathi	\N	520.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-11 23:12:24	Screen_S_110825_144	553.00	8x30	55.5	Shaker	2025-08-11 23:12:36.984264	Angura	Screening	Thiruppathi	2025-08-13 00:06:03.395397	loaded	2025-08-13 00:06:05	Thiruppathi	\N	553.01	\N	\N	Shaker	{"8x16","12x40"}
2025-08-03 18:23:43	Screen_S_030825_015	583.00	8x30	50.1	Shaker	2025-08-03 18:24:22.726989	Angura	Screening	Thiruppathi	2025-08-13 00:07:33.284962	loaded	2025-08-13 00:07:37	Thiruppathi	\N	583.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 02:05:54	Screen_L_130825_179	500.00	8x16	55.5	Shaker	2025-08-13 02:06:04.85521	Thiruppathi	Delivered	admin	2025-08-16 13:02:54.650955	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_169	500.00	12x30	53.5	Shaker	2025-08-13 00:14:03.368028	Thiruppathi	Delivered	admin	2025-08-16 14:02:30.300577	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_170	500.00	12x30	51.8	Shaker	2025-08-13 00:14:17.348883	Thiruppathi	Delivered	admin	2025-08-16 14:02:38.646852	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_171	500.00	12x30	60.9	Shaker	2025-08-13 00:14:38.690707	Thiruppathi	Delivered	admin	2025-08-16 14:02:45.866053	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_172	500.00	12x30	54.3	Shaker	2025-08-13 00:15:04.552926	Thiruppathi	Delivered	admin	2025-08-16 14:02:52.238845	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_173	500.00	12x30	62.4	Shaker	2025-08-13 00:33:36.271041	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:15:27.773697	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_174	500.00	12x30	55	Shaker	2025-08-13 00:33:49.588074	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:15:29.026881	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 01:30:05	Screen_P_130825_178	500.00	12x30	55.3	Shaker	2025-08-13 01:33:35.567315	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:15:46.131799	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_159	500.00	8x16	56.9	Shaker	2025-08-13 00:10:52.426446	Thiruppathi	Delivered	admin	2025-08-16 13:03:18.425309	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 02:05:54	Screen_L_130825_180	500.00	8x16	57.6	Shaker	2025-08-13 03:27:45.033456	Thiruppathi	Delivered	admin	2025-08-16 13:04:54.513963	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-02 16:40:21	Screen_02-08-2025-9	596.00	8x30	64.8	Shaker	2025-08-02 16:40:41.371074	Ramesh	Screening	Thiruppathi	2025-08-13 07:32:41.200031	loaded	2025-08-13 07:32:44	Thiruppathi	\N	596.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 00:08:43	Screen_L_130825_175	500.00	8x16	59.0	Shaker	2025-08-13 00:34:07.566013	Thiruppathi	Delivered	admin	2025-08-16 13:04:33.150092	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 02:05:54	Screen_P_130825_181	550.00	12x30	60.1	Shaker	2025-08-13 03:28:06.626062	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:15:56.022495	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_176	500.00	8x16	56.4	Shaker	2025-08-13 00:34:22.871641	Thiruppathi	Delivered	admin	2025-08-16 13:04:40.281496	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 02:05:54	Screen_L_130825_182	500.00	8x16	53.1	Shaker	2025-08-13 03:28:24.72831	Thiruppathi	Delivered	admin	2025-08-16 13:05:06.454533	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 02:05:54	Screen_P_130825_184	500.00	12x30	52.0	Shaker	2025-08-13 07:15:37.880383	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:16:02.317612	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 02:05:54	Screen_L_130825_183	500.00	8x16	56.8	Shaker	2025-08-13 07:15:20.32641	Thiruppathi	Delivered	admin	2025-08-16 13:05:19.322049	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 09:24:15	Screen_L_130825_187	500.00	8x16	55.2	Shaker	2025-08-13 09:25:09.206002	Ramesh	Delivered	admin	2025-08-16 13:05:34.952985	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 07:37:24	Screen_P_130825_185	500.00	12x30	54.8	Shaker	2025-08-13 07:37:33.098064	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:16:06.647538	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 09:37:55	Screen_P_130825_188	500.00	12x30	58.0	Shaker	2025-08-13 09:38:15.758407	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:11.627628	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 14:42:58	Screen_L_130825_193	588.00	8x16	51.0	Shaker	2025-08-13 14:44:34.558202	Ramesh	Delivered	admin	2025-08-16 13:07:41.007824	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_P_130825_168	500.00	12x30	51.6	Shaker	2025-08-13 00:13:50.139085	Thiruppathi	Delivered	admin	2025-08-16 14:02:12.902497	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 11:17:42	Screen_P_130825_190	500.00	12x30	52.6	Shaker	2025-08-13 11:18:59.125543	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:16.997717	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-12 09:28:44	Screen_S_120825_152	522.00	8x30	53.4	Shaker	2025-08-12 09:28:59.078069	Ramesh	Screening	Thiruppathi	2025-08-13 17:39:43.059389	loaded	2025-08-13 17:39:43	Thiruppathi	\N	522.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-04 02:27:52	Screen_S_040825_020	543.00	8x30	50.4	Shaker	2025-08-04 02:28:09.511479	Ramesh	Screening	Thiruppathi	2025-08-13 17:42:16.936746	loaded	2025-08-13 17:42:18	Thiruppathi	\N	543.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-08 15:39:34	Screen_S_080825_090	599.00	8x30	54.0	Shaker	2025-08-08 15:40:00.045912	Angura	Screening	Thiruppathi	2025-08-13 17:43:41.921005	loaded	2025-08-13 17:43:43	Thiruppathi	\N	599.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-04 10:47:37	Screen_S_040825_026	528.00	8x30	51.0	Shaker	2025-08-04 10:48:21.532561	Angura	Screening	Thiruppathi	2025-08-13 17:46:50.43456	loaded	2025-08-13 17:46:50	Thiruppathi	\N	528.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-08 01:47:19	Screen_S_080825_080	582.00	8x30	54.5	Shaker	2025-08-08 01:48:04.730682	Ramesh	Screening	Thiruppathi	2025-08-13 18:02:37.100963	loaded	2025-08-13 18:02:37	Thiruppathi	\N	582.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-01 19:33:07	Screen_01-08-2025-14	574.00	8x30	81.2	Shaker	2025-08-01 19:33:22.955319	Ramesh	Screening	Thiruppathi	2025-08-13 18:04:17.289037	loaded	2025-08-13 18:04:17	Thiruppathi	\N	574.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-06 01:27:05	Screen_S_060825_055	540.00	8x30	67.1	Shaker	2025-08-06 01:27:19.208557	Ramesh	Screening	Thiruppathi	2025-08-13 18:06:59.845286	loaded	2025-08-13 18:07:00	Thiruppathi	\N	540.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 11:31:21	Screen_P_130825_191	500.00	12x30	55.6	Shaker	2025-08-13 11:31:33.60486	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:23.109994	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 15:04:22	Screen_P_130825_194	556.00	12x30	51.0	Shaker	2025-08-13 15:04:37.987316	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:28.500025	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 15:21:12	Screen_P_130825_195	476.00	12x30	50.9	Shaker	2025-08-13 15:21:29.835138	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:33.690043	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 22:23:28	Screen_V_130825_210	503.00	-30	55.0	Shaker	2025-08-13 22:25:18.110127	Angura	Delivered	Parthiban	2025-08-26 12:08:58.797252	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 15:33:07	Screen_P_130825_196	514.00	12x30	47.1	Shaker	2025-08-13 15:33:21.109854	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:38.200296	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 16:22:52	Screen_P_130825_197	520.00	12x30	49.5	Shaker	2025-08-13 16:23:12.348745	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:42.96025	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 17:26:21	Screen_P_130825_198	538.00	12x30	54.6	Shaker	2025-08-13 17:26:41.437277	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:46.720212	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 17:39:38	Screen_P_130825_199	475.00	12x30	56.2	Shaker	2025-08-13 17:39:52.198603	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:51.250067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 18:09:35	Screen_P_130825_202	525.00	12x30	55.3	Shaker	2025-08-13 18:10:11.200303	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:58.680376	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 18:32:18	Screen_P_130825_203	528.00	12x30	53.7	Shaker	2025-08-13 18:32:52.116318	Ramesh	Delivered	Thiruppathi	2025-08-16 14:17:02.220742	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-09 08:01:50	Screen_S_090825_105	574.00	8x30	54.6	Shaker	2025-08-09 08:03:37.732145	Ramesh	Screening	Thiruppathi	2025-08-13 21:40:46.336549	loaded	2025-08-13 21:40:46	Thiruppathi	\N	574.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-11 19:20:54	Screen_S_110825_138	569.00	8x30	55.4	Shaker	2025-08-11 19:21:52.534301	Ramesh	Screening	Thiruppathi	2025-08-13 21:42:17.807392	loaded	2025-08-13 21:42:17	Thiruppathi	\N	569.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 19:41:24	Screen_P_130825_206	557.00	12x30	52.8	Shaker	2025-08-13 19:41:45.168807	Ramesh	Delivered	Thiruppathi	2025-08-16 14:17:10.600185	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 21:45:45	Screen_P_130825_207	508.00	12x30	52.3	Shaker	2025-08-13 21:46:18.435413	Angura	Delivered	Thiruppathi	2025-08-16 14:17:14.640139	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 21:53:56	Screen_P_130825_208	535.00	12x30	55.1	Shaker	2025-08-13 21:54:21.319625	Angura	Delivered	Thiruppathi	2025-08-16 14:17:18.980199	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 23:00:26	Screen_P_130825_211	533.00	12x30	54.2	Shaker	2025-08-13 23:00:53.474672	Angura	Delivered	Thiruppathi	2025-08-16 14:17:27.150072	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 17:44:47	Screen_V_130825_200	545.00	-30	50.3	Shaker	2025-08-13 17:45:07.626539	Ramesh	Delivered	Parthiban	2025-08-26 12:09:10.403466	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 14:42:58	Screen_P_130825_192	502.00	12x30	52.3	Shaker	2025-08-13 14:43:27.80148	Ramesh	Delivered	Thiruppathi	2025-08-16 14:20:17.894587	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 18:32:18	Screen_V_130825_204	544.00	-30	45.1	Shaker	2025-08-13 18:33:14.880552	Ramesh	Delivered	Parthiban	2025-08-26 12:09:04.237447	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-11 01:55:26	Screen_S_110825_131	584.00	8x30	54.5	Shaker	2025-08-11 01:55:42.468141	Angura	Screening	Thiruppathi	2025-08-13 23:06:36.306463	loaded	2025-08-13 23:06:38	Thiruppathi	\N	584.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-14 00:38:16	Screen_P_140825_213	505.00	12x30	57.2	Shaker	2025-08-14 00:38:32.992924	Angura	Delivered	Thiruppathi	2025-08-16 14:17:36.39003	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 01:17:44	Screen_P_140825_214	529.00	12x30	53.5	Shaker	2025-08-14 01:18:56.719005	Angura	Delivered	Thiruppathi	2025-08-16 14:17:42.18387	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 17:24:29	Screen_R_140825_228	527.00	6x12	55.0	Shaker	2025-08-14 17:24:40.187206	Ramesh	Delivered	Thiruppathi	2025-08-17 08:57:30.251971	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 21:05:18	Screen_S_150825_260	533.00	8x30	54.4	Shaker	2025-08-15 21:05:35.542772	Angura	Delivered	Parthiban	2025-08-22 09:32:03.171159	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 15:50:35	Screen_R_140825_224	559.00	6x12	55.4	Shaker	2025-08-14 15:50:50.572506	Ramesh	Delivered	Thiruppathi	2025-08-17 08:57:57.158753	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 23:53:38	Screen_S_150825_264	567.00	8x30	57.2	Shaker	2025-08-15 23:53:58.519657	Angura	Delivered	Parthiban	2025-08-22 09:38:52.701891	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 07:26:50	Screen_S_150825_241	594.00	8x30	58.4	Shaker	2025-08-15 07:27:03.90694	Angura	Delivered	Parthiban	2025-08-22 09:51:55.056736	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 03:43:42	Screen_R_150825_240	589.00	6x12	58.4	Shaker	2025-08-15 03:44:05.301759	Angura	Delivered	Thiruppathi	2025-08-17 11:14:34.675452	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 01:52:08	Screen_P_140825_216	497.00	12x30	52.6	Shaker	2025-08-14 01:53:17.166406	Angura	Delivered	Thiruppathi	2025-08-16 14:17:50.221252	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 07:37:16	Screen_P_140825_217	503.00	12x30	54.9	Shaker	2025-08-14 07:37:42.316285	Angura	Delivered	Thiruppathi	2025-08-16 14:20:27.768586	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 10:56:28	Screen_P_140825_219	502.00	12x30	51.4	Shaker	2025-08-14 10:57:39.337792	Thiruppathi	Delivered	Thiruppathi	2025-08-16 14:20:36.607262	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 01:10:08	Screen_R_150825_236	502.00	6x12	58.7	Shaker	2025-08-15 01:10:25.272476	Angura	Delivered	Thiruppathi	2025-08-17 08:54:21.408425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 00:02:48	Screen_R_150825_235	545.00	6x12	56.7	Shaker	2025-08-15 00:03:15.296344	Angura	Delivered	Thiruppathi	2025-08-17 08:54:45.327513	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 16:07:01	Screen_S_140825_227	551.00	8x30	53.3	Shaker	2025-08-14 16:07:25.879117	Ramesh	Delivered	Parthiban	2025-08-22 09:31:58.026478	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:36:29	Screen_S_140825_230	550.00	8x30	57	Shaker	2025-08-14 19:37:59.192591	Ramesh	Delivered	Parthiban	2025-08-22 09:51:37.485524	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 00:24:47	Screen_R_160825_265	578.00	6x12	56.7	Shaker	2025-08-16 00:25:11.402702	Angura	Delivered	Thiruppathi	2025-08-17 09:16:20.458632	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 02:20:37	Screen_R_150825_239	539.00	6x12	55.8	Shaker	2025-08-15 02:20:49.460669	Angura	Delivered	Thiruppathi	2025-08-17 08:58:26.44337	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 22:42:55	Screen_S_150825_263	553.00	8x30	57.2	Shaker	2025-08-15 22:43:08.379372	Angura	Delivered	Parthiban	2025-08-22 09:54:47.704518	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 14:24:56	Screen_R_150825_248	554.00	6x12	58.2	Shaker	2025-08-15 14:25:11.566084	Ramesh	Delivered	Thiruppathi	2025-08-17 11:08:40.272694	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:36:29	Screen_S_140825_229	550.00	8x30	57	Shaker	2025-08-14 19:37:34.989706	Ramesh	Delivered	Parthiban	2025-08-22 09:38:42.217591	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 19:05:18	Screen_S_150825_257	572.00	8x30	53.6	Shaker	2025-08-15 19:05:33.289074	Ramesh	Screening	admin	2025-08-26 11:15:26.049764	loaded	2025-08-26 14:30:38	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-15 19:41:38	Screen_R_150825_258	577.00	6x12	56	Shaker	2025-08-15 19:41:53.327724	Ramesh	Delivered	Thiruppathi	2025-08-17 08:59:04.649862	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 12:15:27	Screen_S_140825_223	598.00	8x30	59.7	Shaker	2025-08-14 14:47:44.785035	Thiruppathi	Delivered	Parthiban	2025-08-22 09:48:31.336529	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 01:56:46	Screen_S_150825_238	522.00	8x30	58.8	Shaker	2025-08-15 01:56:58.171338	Angura	Delivered	Parthiban	2025-08-22 09:33:23.42293	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 15:50:35	Screen_S_140825_225	536.00	8x30	54.1	Shaker	2025-08-14 15:51:19.207867	Ramesh	Delivered	Parthiban	2025-08-22 09:52:49.063661	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 08:48:22	Screen_S_150825_242	510.00	8x30	59.2	Shaker	2025-08-15 08:48:38.536542	Ramesh	Delivered	Parthiban	2025-08-22 09:35:17.798346	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:46:15	Screen_S_140825_233	534.00	8x30	56.8	Shaker	2025-08-14 19:47:38.893382	Ramesh	Delivered	Parthiban	2025-08-22 09:38:30.516846	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 21:37:04	Screen_R_150825_261	522.00	6x12	57.3	Shaker	2025-08-15 21:37:21.115602	Angura	Delivered	Thiruppathi	2025-08-17 11:10:08.057274	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 11:26:07	Screen_R_150825_247	581.00	6x12	57.4	Shaker	2025-08-15 11:26:17.348914	Ramesh	Delivered	Thiruppathi	2025-08-17 11:09:48.787429	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 10:56:28	Screen_P_140825_218	502.00	12x30	53.7	Shaker	2025-08-14 10:57:10.74994	Thiruppathi	Delivered	Veeramani	2025-09-12 17:29:48.853973	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 07:37:24	Screen_L_130825_186	500.00	8x16	58.0	Shaker	2025-08-13 07:37:45.423931	Thiruppathi	Delivered	admin	2025-08-16 13:05:26.358568	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_163	500.00	8x16	58.4	Shaker	2025-08-13 00:11:52.017576	Thiruppathi	Delivered	admin	2025-08-16 13:03:56.271586	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 17:45:15	Screen_S_150825_255	542.00	8x30	59.0	Shaker	2025-08-15 17:45:26.572052	Ramesh	Delivered	Parthiban	2025-08-22 09:40:17.229151	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 12:50:13	Screen_R_140825_222	548.00	6x12	57.0	Shaker	2025-08-14 12:50:26.416932	Ramesh	Delivered	Thiruppathi	2025-08-17 09:15:23.209464	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 00:59:32	Screen_R_160825_266	545.00	6x12	57.2	Shaker	2025-08-16 00:59:44.051472	Angura	Delivered	Thiruppathi	2025-08-17 11:11:11.707927	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 12:34:25	Screen_S_140825_221	598.00	8x30	59.7	Shaker	2025-08-14 12:34:38.922808	Ramesh	Delivered	Parthiban	2025-08-22 09:41:40.622675	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 15:31:31	Screen_R_150825_251	558.00	6x12	55.5	Shaker	2025-08-15 15:31:42.392156	Ramesh	Delivered	Thiruppathi	2025-08-17 09:00:25.935175	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:46:15	Screen_R_140825_232	565.00	6x12	53.8	Shaker	2025-08-14 19:46:43.864052	Ramesh	Delivered	Thiruppathi	2025-08-17 09:16:38.660527	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:48:50	Screen_V_140825_234	591.00	-30	41.9	Shaker	2025-08-14 19:49:05.51743	Ramesh	Delivered	Parthiban	2025-08-26 12:08:55.022448	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 11:20:23	Screen_S_150825_246	548.00	8x30	56.4	Shaker	2025-08-15 11:20:38.218735	Ramesh	Delivered	Parthiban	2025-08-22 09:35:40.371783	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 14:33:24	Screen_S_150825_249	567.00	8x30	61.5	Shaker	2025-08-15 14:33:42.211614	Ramesh	Delivered	admin	2025-08-27 16:12:35.282194	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 18:31:40	Screen_R_150825_256	566.00	6x12	55.1	Shaker	2025-08-15 18:32:00.4557	Ramesh	Delivered	Thiruppathi	2025-08-17 08:59:28.218004	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 19:46:15	Screen_R_140825_231	578.00	6x12	57.2	Shaker	2025-08-14 19:46:28.772379	Ramesh	Delivered	Thiruppathi	2025-08-17 11:12:08.285955	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_162	500.00	8x16	52.9	Shaker	2025-08-13 00:11:36.916645	Thiruppathi	Delivered	admin	2025-08-16 13:03:48.863207	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_165	500.00	8x16	51.4	Shaker	2025-08-13 00:12:17.164148	Thiruppathi	Delivered	admin	2025-08-16 13:04:12.410243	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_166	500.00	8x16	60.1	Shaker	2025-08-13 00:12:32.997653	Thiruppathi	Delivered	admin	2025-08-16 13:04:25.649433	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 01:30:05	Screen_L_130825_177	500.00	8x16	52.6	Shaker	2025-08-13 01:33:21.740562	Thiruppathi	Delivered	admin	2025-08-16 13:04:46.80758	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 11:17:42	Screen_L_130825_189	500.00	8x16	51.7	Shaker	2025-08-13 11:18:39.205592	Ramesh	Delivered	admin	2025-08-16 13:07:31.554058	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 19:03:40	Screen_P_130825_205	521.00	12x30	54.7	Shaker	2025-08-13 19:03:54.199294	Ramesh	Delivered	Thiruppathi	2025-08-16 14:17:06.260338	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 00:27:55	Screen_P_140825_212	526.00	12x30	55.2	Shaker	2025-08-14 00:28:08.195701	Angura	Delivered	Thiruppathi	2025-08-16 14:17:32.53026	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 16:59:48	Screen_S_090925_770	550.00	8x30	60.9	Shaker	2025-09-09 17:00:02.080903	Ramesh	Delivered	Parthiban	2025-09-18 11:32:13.12335	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 16:34:46	Screen_R_150825_252	549.00	6x12	58	Shaker	2025-08-15 16:34:59.300777	Ramesh	Delivered	Thiruppathi	2025-08-17 11:09:17.536393	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 12:34:43	Screen_S_170825_311	555.00	8x30	58.8	Shaker	2025-08-17 12:34:56.793053	Angura	Delivered	Parthiban	2025-08-22 09:34:13.838301	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 17:51:57	Screen_S_160825_292	558.00	8x30	53.3	Shaker	2025-08-16 17:52:13.413791	Ramesh	Screening	Parthiban	2025-08-28 12:16:21.350873	loaded	2025-08-28 12:17:52	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-16 11:42:15	Screen_L_160825_276	500.00	8x16	53	Shaker	2025-08-16 11:42:46.999451	admin	Delivered	Parthiban	2025-09-06 14:37:32.182039	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 00:08:43	Screen_L_130825_160	500.00	8x16	54.7	Shaker	2025-08-13 00:11:11.163649	Thiruppathi	Delivered	admin	2025-08-16 13:03:31.174382	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_285	500.00	8x16	47.7	Shaker	2025-08-16 13:48:33.925435	admin	Delivered	Parthiban	2025-09-06 14:44:23.489425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 11:42:15	Screen_L_160825_278	500.00	8x16	52.5	Shaker	2025-08-16 11:46:13.342622	admin	Delivered	admin	2025-08-27 15:57:22.994499	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 01:50:21	Screen_S_160825_267	530.00	8x30	53.8	Shaker	2025-08-16 01:50:35.463638	Angura	Screening	Parthiban	2025-08-28 14:53:52.80502	loaded	2025-08-28 14:54:02	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-13 18:00:13	Screen_P_130825_201	537.00	12x30	56.1	Shaker	2025-08-13 18:00:26.753765	Ramesh	Delivered	Thiruppathi	2025-08-16 14:16:54.710001	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-13 22:23:28	Screen_P_130825_209	489.00	12x30	52.5	Shaker	2025-08-13 22:23:52.044223	Angura	Delivered	Thiruppathi	2025-08-16 14:17:23.010104	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 01:29:34	Screen_P_140825_215	431.00	12x30	54.2	Shaker	2025-08-14 01:29:54.920995	Angura	Delivered	Thiruppathi	2025-08-16 14:17:46.581311	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 12:14:03	Screen_R_160825_279	558.00	6x12	59	Shaker	2025-08-16 12:14:20.680782	Ramesh	Delivered	Thiruppathi	2025-08-17 11:14:20.855562	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 15:27:49	Screen_S_170825_312	558.00	8x30	56.3	Shaker	2025-08-17 15:28:42.446859	Angura	Delivered	Parthiban	2025-08-22 09:27:11.921762	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 02:59:00	Screen_S_160825_269	545.00	8x30	57.5	Shaker	2025-08-16 02:59:24.080029	Angura	Delivered	Parthiban	2025-08-22 09:33:53.25845	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_284	500.00	8x16	48.1	Shaker	2025-08-16 13:47:59.335374	admin	Delivered	Parthiban	2025-09-06 14:44:29.440912	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 02:21:17	Screen_R_170825_303	547.00	6x12	59.5	Shaker	2025-08-17 02:21:39.267202	Angura	Delivered	Parthiban	2025-08-22 09:16:22.112106	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 11:42:15	Screen_L_160825_277	500.00	8x16	51.5	Shaker	2025-08-16 11:44:15.569467	admin	Delivered	admin	2025-08-27 15:57:07.274056	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 18:02:03	Screen_R_160825_293	566.00	6x12	54.2	Shaker	2025-08-16 18:02:14.937112	Ramesh	Delivered	Parthiban	2025-08-22 09:16:16.65184	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 02:21:17	Screen_S_170825_304	527.00	8x30	57.6	Shaker	2025-08-17 02:22:35.13638	Angura	Delivered	Parthiban	2025-08-22 09:32:48.131	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 01:03:05	Screen_R_170825_301	555.00	6x12	58.8	Shaker	2025-08-17 01:03:24.092814	Angura	Delivered	Parthiban	2025-08-22 09:17:03.78371	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 10:27:11	Screen_S_170825_306	544.00	8x30	55.3	Shaker	2025-08-17 10:27:33.815314	Angura	Delivered	Parthiban	2025-08-22 09:35:23.527162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 22:35:29	Screen_S_160825_299	599.00	8x30	56.4	Shaker	2025-08-16 22:35:43.606419	Angura	Delivered	Parthiban	2025-08-22 09:30:34.4859	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 11:11:17	Screen_S_170825_307	584.00	8x30	56.5	Shaker	2025-08-17 11:11:33.658019	Angura	Delivered	Parthiban	2025-08-22 09:30:44.60716	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 17:34:01	Screen_R_170825_315	566.00	6x12	53.5	Shaker	2025-08-17 17:34:22.305298	Angura	Delivered	Parthiban	2025-08-22 09:22:04.485717	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_281	500.00	8x16	51.2	Shaker	2025-08-16 13:45:19.281655	admin	Delivered	Veeramani	2025-09-09 12:05:18.996683	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 21:39:20	Screen_R_160825_298	538.00	6x12	54.1	Shaker	2025-08-16 21:40:03.581227	Angura	Delivered	Parthiban	2025-08-22 09:25:48.017097	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 12:42:27	Screen_S_160825_280	577.00	8x30	59.5	Shaker	2025-08-16 12:42:40.735749	Ramesh	Delivered	Parthiban	2025-08-22 09:34:41.338539	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 16:07:01	Screen_R_140825_226	561.00	6x12	55.0	Shaker	2025-08-14 16:07:14.583544	Ramesh	Delivered	Thiruppathi	2025-08-17 08:56:59.845102	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 17:18:45	Screen_R_150825_254	551.00	6x12	56.0	Shaker	2025-08-15 17:19:00.342024	Ramesh	Delivered	Thiruppathi	2025-08-17 08:59:52.49712	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 01:55:27	Screen_R_160825_268	525.00	6x12	54.2	Shaker	2025-08-16 01:55:48.088515	Angura	Delivered	Thiruppathi	2025-08-17 09:01:05.866799	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 07:39:41	Screen_R_160825_271	533.00	6x12	55.8	Shaker	2025-08-16 07:39:55.735755	Angura	Delivered	Thiruppathi	2025-08-17 09:02:09.466242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 03:20:46	Screen_R_160825_270	548.00	6x12	56	Shaker	2025-08-16 03:21:05.846512	Angura	Delivered	Thiruppathi	2025-08-17 09:06:59.98828	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 22:28:39	Screen_R_150825_262	549.00	6x12	56.9	Shaker	2025-08-15 22:29:00.906748	Angura	Delivered	Thiruppathi	2025-08-17 09:08:43.78408	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 10:14:21	Screen_R_160825_274	511.00	6x12	58.4	Shaker	2025-08-16 10:14:34.010619	Ramesh	Delivered	Thiruppathi	2025-08-17 09:11:05.043297	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 10:54:59	Screen_R_160825_275	551.00	6x12	58.7	Shaker	2025-08-16 10:55:11.036023	Ramesh	Delivered	Thiruppathi	2025-08-17 09:11:38.126476	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-14 12:00:11	Screen_R_140825_220	562.00	6x12	58.8	Shaker	2025-08-14 12:00:26.371142	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:49.031592	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 17:26:05	Screen_R_160825_291	546.00	6x12	53.2	Shaker	2025-08-16 17:26:23.39764	Ramesh	Delivered	Thiruppathi	2025-08-17 11:19:54.141576	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 11:39:00	Screen_R_170825_308	576.00	6x12	57.6	Shaker	2025-08-17 11:39:31.249828	Angura	Delivered	Parthiban	2025-08-22 09:15:06.237251	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 18:05:20	Screen_V_160825_294	536.00	-30	52.6	Shaker	2025-08-16 18:05:38.817411	Ramesh	Delivered	Parthiban	2025-08-26 12:08:52.297488	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 19:29:09	Screen_S_160825_296	588.00	8x30	56.6	Shaker	2025-08-16 19:29:25.418124	Ramesh	Delivered	Parthiban	2025-08-22 09:31:06.040507	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 16:12:08	Screen_R_170825_314	547.00	6x12	57.8	Shaker	2025-08-17 16:12:22.098489	Angura	Delivered	Parthiban	2025-08-22 09:15:17.971029	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 10:09:12	Screen_R_170825_305	557.00	6x12	55.0	Shaker	2025-08-17 10:09:25.293436	Angura	Delivered	Parthiban	2025-08-22 09:12:35.546441	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 18:57:57	Screen_R_170825_318	549.00	6x12	58.5	Shaker	2025-08-17 18:58:16.057124	Angura	Delivered	Parthiban	2025-08-22 09:15:33.23142	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 18:39:41	Screen_S_170825_317	539.00	8x30	59.9	Shaker	2025-08-17 18:40:20.095329	Angura	Delivered	Parthiban	2025-08-22 09:34:54.823456	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 01:21:39	Screen_S_170825_302	565.00	8x30	54.5	Shaker	2025-08-17 01:21:55.969433	Angura	Delivered	Parthiban	2025-08-22 09:35:02.497874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 21:57:51	Screen_R_170825_319	571.00	6x12	58.5	Shaker	2025-08-17 21:58:17.517082	Parthiban	Delivered	Parthiban	2025-08-22 09:15:40.531044	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 15:12:35	Screen_R_160825_289	577.00	6x12	56.0	Shaker	2025-08-16 15:12:48.699501	Ramesh	Delivered	Parthiban	2025-08-22 09:50:31.9971	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_283	500.00	8x16	51.2	Shaker	2025-08-16 13:46:33.313848	admin	Delivered	Veeramani	2025-09-09 12:05:32.851261	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 19:12:23	Screen_R_160825_295	536.00	6x12	54.0	Shaker	2025-08-16 19:12:36.952795	Ramesh	Delivered	Parthiban	2025-08-22 09:15:59.200494	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_286	500.00	8x16	52.8	Shaker	2025-08-16 13:49:10.088022	admin	Delivered	Veeramani	2025-09-09 12:05:39.122646	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_287	500.00	8x16	49.7	Shaker	2025-08-16 13:49:41.217191	admin	Delivered	Veeramani	2025-09-09 12:05:49.112818	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 11:39:00	Screen_R_170825_309	518.00	6x12	53.7	Shaker	2025-08-17 11:44:19.714501	Angura	Re-Processing	Parthiban	2025-08-20 07:49:11.555701	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 10:57:47	Screen_S_190825_342	527.00	8x30	55.9	Shaker	2025-08-19 10:58:02.253603	Angura	Delivered	Parthiban	2025-08-22 09:35:32.702212	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 07:23:06	Screen_R_210825_372	556.00	6x12	52.8	Shaker	2025-08-21 07:23:21.919046	Ramesh	Delivered	Parthiban	2025-08-22 09:22:31.913179	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 02:38:41	Screen_R_180825_321	544.00	6x12	60.4	Shaker	2025-08-18 02:39:24.550808	Prasanth	Delivered	Parthiban	2025-08-22 09:22:11.241995	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 06:51:05	Screen_S_180825_322	537.00	8x30	65.8	Shaker	2025-08-18 06:56:31.757574	Prasanth	Screening	Parthiban	2025-08-28 22:58:08.58264	loaded	2025-08-28 22:58:22	Parthiban	\N	550.00	\N	\N	Shaker	{"12x20","8x16"}
2025-08-19 20:11:21	Screen_V_190825_351	535.00	-30	53.2	Shaker	2025-08-19 20:11:39.607145	Ramesh	Delivered	Parthiban	2025-08-26 12:08:42.343193	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 21:37:06	Screen_R_210825_375	597.00	6x12	56.0	Shaker	2025-08-21 21:37:17.271463	Ramesh	Delivered	Parthiban	2025-08-31 17:23:28.272862	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 06:51:05	Screen_R_180825_323	547.00	6x12	61.6	Shaker	2025-08-18 06:56:58.034555	Prasanth	Delivered	Parthiban	2025-08-22 09:21:52.579031	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 10:22:53	Screen_S_180825_327	527.00	8x30	62.7	Shaker	2025-08-18 10:24:10.128537	Angura	Screening	Parthiban	2025-08-28 19:41:23.023587	loaded	2025-08-28 19:41:40	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40","6x12"}
2025-08-18 09:46:32	Screen_R_180825_326	525.00	6x12	65.1	Shaker	2025-08-18 09:46:44.861755	Angura	Delivered	Parthiban	2025-08-22 09:21:06.817457	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 18:36:13	Screen_S_200825_363	584.00	8x30	58.2	Shaker	2025-08-20 18:36:27.721482	Angura	Screening	admin	2025-08-26 11:16:55.475058	loaded	2025-08-26 15:08:13	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-18 23:13:33	Screen_S_180825_333	591.00	8x30	56.5	Shaker	2025-08-18 23:13:47.516441	Ramesh	Delivered	Parthiban	2025-08-22 09:30:54.292008	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 02:09:51	Screen_S_200825_354	569.00	8x30	58.1	Shaker	2025-08-20 02:10:33.746691	Ramesh	Delivered	Parthiban	2025-08-22 09:33:15.778471	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 18:53:33	Screen_R_190825_350	558.00	6x12	54.1	Shaker	2025-08-19 19:08:48.705373	Angura	Delivered	Parthiban	2025-08-22 09:16:09.497645	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 02:43:38	Screen_S_190825_337	581.00	8x30	56.8	Shaker	2025-08-19 02:43:52.543191	Ramesh	Delivered	Parthiban	2025-08-22 09:31:44.648058	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 09:50:23	Screen_R_200825_357	541.00	6x12	54.5	Shaker	2025-08-20 09:50:37.688225	Angura	Delivered	Parthiban	2025-08-22 09:16:30.081225	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 02:09:04	Screen_R_210825_369	563.00	6x12	55.3	Shaker	2025-08-21 02:09:14.789197	Ramesh	Delivered	Parthiban	2025-08-22 09:12:54.86174	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 23:25:04	Screen_R_190825_352	570.00	6x12	55.4	Shaker	2025-08-19 23:25:17.442748	Ramesh	Delivered	Parthiban	2025-08-22 09:13:13.601141	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 10:01:17	Screen_S_190825_341	575.00	8x30	57.4	Shaker	2025-08-19 10:01:30.50563	Angura	Delivered	Parthiban	2025-08-22 09:32:40.052993	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 21:57:51	Screen_S_170825_320	573.00	8x30	61.8	Shaker	2025-08-17 21:58:48.296206	Parthiban	Delivered	Parthiban	2025-08-22 09:35:28.502162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 01:16:29	Screen_R_210825_368	561.00	6x12	57.2	Shaker	2025-08-21 01:16:40.536247	Ramesh	Delivered	Parthiban	2025-08-22 09:14:58.342941	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 02:09:51	Screen_R_200825_353	544.00	6x12	56.8	Shaker	2025-08-20 02:10:04.697651	Ramesh	Delivered	Parthiban	2025-08-22 09:14:48.638023	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 14:05:56	Screen_S_200825_359	546.00	8x30	57.9	Shaker	2025-08-20 14:06:08.798661	Angura	Delivered	Parthiban	2025-08-22 09:33:06.326281	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 16:40:28	Screen_S_190825_348	549.00	8x30	56.1	Shaker	2025-08-19 16:45:09.205079	Angura	Delivered	Parthiban	2025-08-22 09:35:44.682004	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 12:10:46	Screen_R_190825_344	555.00	6x12	56.3	Shaker	2025-08-19 12:11:01.674637	Angura	Delivered	Parthiban	2025-08-22 09:14:17.816983	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 17:18:42	Screen_R_200825_361	573.00	6x12	56.5	Shaker	2025-08-20 17:18:57.986938	Angura	Delivered	Parthiban	2025-08-22 09:14:27.121892	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 20:41:07	Screen_S_180825_332	544.00	8x30	58.0	Shaker	2025-08-18 20:41:33.585531	Ramesh	Delivered	Parthiban	2025-08-22 09:33:09.957748	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 16:31:41	Screen_R_190825_347	578.00	6x12	56.1	Shaker	2025-08-19 16:32:08.634245	Angura	Delivered	Parthiban	2025-08-22 09:14:08.702103	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 11:19:13	Screen_R_190825_343	548.00	6x12	56.3	Shaker	2025-08-19 11:19:27.912737	Angura	Delivered	Parthiban	2025-08-22 09:14:13.44696	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 17:44:05	Screen_S_170825_316	552.00	8x30	56.2	Shaker	2025-08-17 17:44:19.579207	Angura	Delivered	Parthiban	2025-08-22 09:36:00.345638	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 09:50:23	Screen_S_200825_358	547.00	8x30	54.3	Shaker	2025-08-20 09:55:06.619871	Angura	Screening	Parthiban	2025-08-28 14:53:08.5387	loaded	2025-08-28 14:54:02	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-20 14:05:56	Screen_R_200825_360	508.00	6x12	58.9	Shaker	2025-08-20 14:24:35.120989	Angura	Delivered	Parthiban	2025-08-22 09:16:53.668151	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 02:48:40	Screen_S_210825_371	548.00	8x30	59.2	Shaker	2025-08-21 02:48:57.776073	Ramesh	Screening	admin	2025-08-26 11:17:12.59047	loaded	2025-08-26 12:14:34	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-19 15:01:56	Screen_R_190825_346	536.00	6x12	56.0	Shaker	2025-08-19 15:02:05.897945	Angura	Delivered	Parthiban	2025-08-22 09:14:03.28497	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 07:14:33	Screen_R_190825_339	529.00	6x12	57.0	Shaker	2025-08-19 07:14:46.536844	Ramesh	Delivered	Parthiban	2025-08-22 09:14:53.347949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 07:07:31	Screen_S_190825_338	479.00	8x30	59.2	Shaker	2025-08-19 07:07:46.228566	Ramesh	Delivered	Parthiban	2025-08-22 09:34:36.148569	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 20:40:58	Screen_S_200825_365	565.00	8x30	55.0	Shaker	2025-08-20 20:41:11.783901	Ramesh	Screening	admin	2025-08-26 11:16:26.450424	loaded	2025-08-26 14:30:38	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-20 07:26:40	Screen_R_200825_356	553.00	6x12	52.3	Shaker	2025-08-20 07:26:53.237568	Ramesh	Screening	Parthiban	2025-08-31 16:35:48.811235	loaded	2025-08-31 16:35:34	Angura	\N	550.00	\N	\N	Shaker	{"6x12","8x16","20x40"}
2025-08-17 15:40:50	Screen_R_170825_313	564.00	6x12	54.8	Shaker	2025-08-17 15:41:06.126192	Angura	Delivered	Parthiban	2025-08-22 09:17:00.549592	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 19:16:27	Screen_R_210825_374	578.00	6x12	52.7	Shaker	2025-08-21 19:16:39.884722	Angura	Delivered	Veeramani	2025-09-09 11:57:39.543364	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 17:18:42	Screen_S_200825_362	530.00	8x30	58.8	Shaker	2025-08-20 17:39:28.366445	Angura	Screening	admin	2025-08-26 11:17:03.045121	loaded	2025-08-26 15:35:01	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-18 18:48:17	Screen_R_180825_330	590.00	6x12	60.0	Shaker	2025-08-18 18:48:39.893033	Angura	Delivered	Parthiban	2025-08-22 09:19:12.938015	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 09:28:04	Screen_R_190825_340	544.00	6x12	56.8	Shaker	2025-08-19 09:28:20.55813	Angura	Delivered	Parthiban	2025-08-22 09:14:40.687739	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 01:04:50	Screen_V_220825_378	598.00	-30	50.3	Shaker	2025-08-22 01:05:59.639956	Ramesh	Delivered	Parthiban	2025-08-26 12:08:32.110242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 00:59:01	Screen_R_220825_377	590.00	6x12	51.8	Shaker	2025-08-22 01:00:29.866052	Ramesh	Delivered	admin	2025-08-27 15:54:50.875766	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 20:40:17	Screen_R_180825_331	543.00	6x12	57.6	Shaker	2025-08-18 20:40:35.484799	Ramesh	Delivered	Parthiban	2025-08-22 09:15:12.961626	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 02:43:38	Screen_S_220825_380	550.00	8x30	54.0	Shaker	2025-08-22 02:43:54.472907	Ramesh	Screening	Parthiban	2025-08-28 12:17:12.307614	loaded	2025-08-28 12:33:34	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-18 06:51:05	Screen_V_180825_324	579.00	-30	53.4	Shaker	2025-08-18 07:38:48.585185	Prasanth	Delivered	Parthiban	2025-08-26 12:08:35.756585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 02:33:12	Screen_R_190825_336	582.00	6x12	55.4	Shaker	2025-08-19 02:33:26.650328	Ramesh	Delivered	Parthiban	2025-08-22 09:13:03.937743	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 01:06:40	Screen_R_190825_335	516.00	6x12	55.3	Shaker	2025-08-19 01:06:53.291108	Ramesh	Delivered	Parthiban	2025-08-22 09:12:46.596923	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 22:39:09	Screen_R_200825_367	566.00	6x12	55.5	Shaker	2025-08-20 22:39:19.270582	Ramesh	Delivered	Parthiban	2025-08-22 09:13:18.710833	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-17 12:18:23	Screen_R_170825_310	541.00	6x12	55.9	Shaker	2025-08-17 12:19:17.670034	Angura	Delivered	Parthiban	2025-08-22 09:13:28.170274	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 19:04:19	Screen_R_200825_364	547.00	6x12	56.6	Shaker	2025-08-20 19:04:30.435419	Angura	Delivered	Parthiban	2025-08-22 09:14:31.992622	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 23:38:01	Screen_R_180825_334	580.00	6x12	57.8	Shaker	2025-08-18 23:38:14.816947	Ramesh	Delivered	Parthiban	2025-08-22 09:15:26.012625	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 22:50:08	Screen_R_160825_300	555.00	6x12	54.8	Shaker	2025-08-16 22:50:25.650322	Angura	Delivered	Parthiban	2025-08-22 09:16:02.659675	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 17:36:08	Screen_R_180825_328	539.00	6x12	68.1	Shaker	2025-08-18 17:36:22.600148	Angura	Delivered	Parthiban	2025-08-22 09:19:28.82031	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-07 23:04:21	Screen_R_070825_078	559.00	6x12	50.3	Shaker	2025-08-07 23:04:37.582062	Ramesh	Delivered	Parthiban	2025-08-22 09:20:59.850777	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 15:01:50	Screen_S_160825_288	541.00	8x30	56.3	Shaker	2025-08-16 15:02:05.336724	Ramesh	Delivered	Parthiban	2025-08-22 09:27:02.754983	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-19 14:25:03	Screen_S_190825_345	546.00	8x30	56.7	Shaker	2025-08-19 14:25:26.955993	Angura	Delivered	Parthiban	2025-08-22 09:31:13.85093	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 15:27:43	Screen_S_160825_290	550.00	8x30	58.5	Shaker	2025-08-16 15:28:54.215007	Ramesh	Delivered	Parthiban	2025-08-22 09:33:38.442983	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-20 06:54:38	Screen_S_200825_355	563.00	8x30	58.6	Shaker	2025-08-20 06:54:54.493713	Ramesh	Delivered	Parthiban	2025-08-22 09:33:44.777377	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 19:29:09	Screen_S_160825_297	541.00	8x30	55.1	Shaker	2025-08-16 19:29:42.235354	Ramesh	Delivered	Parthiban	2025-08-22 09:35:13.645553	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 15:30:07	Screen_S_150825_250	555.00	8x30	60.7	Shaker	2025-08-15 15:30:25.270974	Ramesh	Delivered	Parthiban	2025-08-22 09:35:49.113179	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 17:59:04	Screen_S_180825_329	541.00	8x30	66.9	Shaker	2025-08-18 17:59:17.987681	Angura	Delivered	Parthiban	2025-08-22 09:36:03.847456	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-15 01:40:18	Screen_S_150825_237	522.00	8x30	62.3	Shaker	2025-08-15 01:40:38.588865	Angura	Delivered	Parthiban	2025-08-22 09:41:58.478573	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 07:35:35	Screen_R_220825_383	566.00	6x12	55.0	Shaker	2025-08-22 07:35:47.615941	Ramesh	Delivered	Parthiban	2025-08-31 17:22:05.052295	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 12:29:32	Screen_R_220825_387	563.00	6x12	52.9	Shaker	2025-08-22 12:29:46.763283	Angura	Delivered	Parthiban	2025-08-31 17:24:23.291643	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 20:39:36	Screen_R_230825_410	531.00	6x12	59.0	Shaker	2025-08-23 20:39:47.707163	Ramesh	Delivered	Parthiban	2025-09-04 18:24:54.768887	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 02:30:43	Screen_R_240825_417	567.00	6x12	56.4	Shaker	2025-08-24 02:31:02.188881	Ramesh	Delivered	admin	2025-08-27 15:42:13.896832	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 07:28:42	Screen_R_220825_382	540.00	6x12	53.4	Shaker	2025-08-22 07:28:53.670681	Ramesh	Delivered	Parthiban	2025-08-31 17:21:54.104172	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 08:56:54	Screen_R_220825_384	583.00	6x12	50.2	Shaker	2025-08-22 08:57:06.664014	Angura	Delivered	Parthiban	2025-09-04 17:56:08.081048	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 15:55:05	Screen_P_220825_389	500.00	12x30	55	Shaker	2025-08-22 15:55:28.839202	Angura	Delivered	admin	2025-09-22 15:46:32.958314	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 07:04:16	Screen_M_230825_398	538.00	30x60	54.1	Shaker	2025-08-23 07:04:35.007855	Ramesh	Delivered	Parthiban	2025-08-26 09:33:44.303298	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 23:16:13	Screen_220825_395	516.00	-60	48.4	Shaker	2025-08-22 23:16:43.169408	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 23:32:04	Screen_M_220825_396	501.00	30x60	60.5	Shaker	2025-08-22 23:32:23.077397	Ramesh	Delivered	Parthiban	2025-08-26 09:33:37.233677	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 15:22:24	Screen_S_220825_388	515.00	8x30	53.3	Shaker	2025-08-22 15:22:36.03662	Angura	Screening	Parthiban	2025-08-28 14:53:21.115495	loaded	2025-08-28 14:54:02	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-22 19:03:33	Screen_M_220825_394	515.00	30x60	64.4	Shaker	2025-08-22 19:04:15.230661	Angura	Delivered	Parthiban	2025-08-26 09:33:32.9636	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 18:28:30	Screen_220825_393	503.00	-60	60.1	Shaker	2025-08-22 18:30:10.639897	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 11:04:49	Screen_M_230825_399	492.00	30x60	57.6	Shaker	2025-08-23 11:06:04.495545	Angura	Delivered	Parthiban	2025-08-26 09:33:48.923449	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 11:52:00	Screen_M_230825_400	462.00	30x60	57.4	Shaker	2025-08-23 11:52:14.630579	Angura	Delivered	Parthiban	2025-08-26 09:33:52.558514	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 12:26:57	Screen_M_230825_401	501.00	30x60	55.3	Shaker	2025-08-23 12:27:10.158873	Angura	Delivered	Parthiban	2025-08-26 09:33:56.803602	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 14:32:38	Screen_M_230825_403	523.00	30x60	53.1	Shaker	2025-08-23 14:33:10.316299	Angura	Delivered	Parthiban	2025-08-26 09:34:00.324221	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 16:30:26	Screen_M_230825_405	528.00	30x60	68.0	Shaker	2025-08-23 16:30:41.068373	Angura	Delivered	Parthiban	2025-08-26 09:34:10.792607	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 14:15:07	Screen_230825_402	441.00	-60	47.9	Shaker	2025-08-23 14:15:46.043465	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 18:02:36	Screen_M_230825_406	499.00	30x60	56.6	Shaker	2025-08-23 18:02:52.705348	Angura	Delivered	Parthiban	2025-08-26 09:34:13.99242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 18:02:36	Screen_M_230825_407	421.00	30x60	52.3	Shaker	2025-08-23 18:03:10.316726	Angura	Delivered	Parthiban	2025-08-26 09:34:17.48249	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 18:40:10	Screen_M_230825_408	525.00	30x60	57.4	gyro	2025-08-23 18:40:26.163311	Angura	Delivered	Parthiban	2025-08-26 09:34:20.772468	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 20:25:12	Screen_M_230825_409	521.00	30x60	52.7	Shaker	2025-08-23 20:25:51.234947	Ramesh	Delivered	Parthiban	2025-08-26 09:34:24.312425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 16:50:29	Screen_P_220825_392	542.00	12x30	50	Shaker	2025-08-22 16:55:38.72881	Angura	Delivered	admin	2025-09-22 15:46:04.600768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 23:20:59	Screen_M_230825_412	490.00	30x60	67.0	Shaker	2025-08-23 23:21:13.428451	Ramesh	Delivered	Parthiban	2025-08-26 09:34:42.476972	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 01:15:00	Screen_M_240825_414	498.00	30x60	60.0	Shaker	2025-08-24 01:16:38.394015	Ramesh	Delivered	Parthiban	2025-08-26 09:34:49.924166	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 01:28:07	Screen_M_240825_416	496.00	30x60	61.7	Shaker	2025-08-24 01:28:35.699675	Ramesh	Delivered	Parthiban	2025-08-26 09:34:53.62398	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 23:40:33	Screen_R_230825_413	558.00	6x12	59.2	Shaker	2025-08-23 23:40:46.457882	Ramesh	Delivered	Parthiban	2025-09-04 18:25:12.963211	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 08:35:36	Screen_M_240825_419	506.00	30x60	51.9	Shaker	2025-08-24 08:35:55.740792	Ramesh	Delivered	Parthiban	2025-08-26 09:34:58.873918	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 09:12:13	Screen_M_240825_420	492.00	30x60	68.3	Shaker	2025-08-24 09:12:57.712054	Ramesh	Delivered	Parthiban	2025-08-26 09:35:02.704127	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 00:41:09	Screen_R_220825_376	550.00	6x12	52.7	Shaker	2025-08-22 00:41:22.836248	Ramesh	Delivered	Veeramani	2025-09-09 11:57:28.224204	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 11:17:03	Screen_R_240825_423	558.00	6x12	57.4	Shaker	2025-08-24 11:17:21.814116	Ramesh	Delivered	admin	2025-08-27 15:43:59.69554	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 11:54:54	Screen_L_240825_426	470.00	8x16	54.0	Shaker	2025-08-24 11:55:17.776231	Ramesh	Delivered	admin	2025-08-27 15:50:56.605964	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 08:30:03	Screen_R_240825_418	536.00	6x12	71.1	Shaker	2025-08-24 08:30:53.695791	Ramesh	Delivered	admin	2025-08-27 16:32:17.925035	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 11:47:27	Screen_R_240825_425	533.00	6x12	57.5	Shaker	2025-08-24 11:48:48.375092	Ramesh	Delivered	Parthiban	2025-08-31 17:13:20.114039	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 11:09:03	Screen_R_220825_386	541.00	6x12	49.2	Shaker	2025-08-22 11:09:17.666388	Angura	Delivered	Parthiban	2025-08-31 17:21:42.665879	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 10:21:45	Screen_240825_422	465.00	-60	41.8	Shaker	2025-08-24 10:22:08.945353	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 16:50:29	Screen_M_220825_391	468.00	30x60	55.6	Shaker	2025-08-22 16:52:31.737847	Angura	Delivered	Parthiban	2025-08-26 09:33:28.180877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 14:18:59	Screen_R_240825_429	552.00	6x12	58.8	Shaker	2025-08-24 14:19:09.89533	Ramesh	Delivered	Parthiban	2025-08-31 17:23:06.743046	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 18:43:24	Screen_M_240825_440	483.00	30x60	57.8	Shaker	2025-08-24 18:43:38.946593	Ramesh	Delivered	Parthiban	2025-08-26 09:35:20.99394	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:50:40	Screen_M_250825_467	520.00	30x60	54.7	Shaker	2025-08-25 17:50:55.61751	Ramesh	Delivered	Parthiban	2025-08-26 09:35:24.39386	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 18:11:55	Screen_240825_438	483.00	-60	57.5	Shaker	2025-08-24 18:13:07.176079	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 17:07:31	Screen_R_240825_436	560.00	6x12	57.9	Shaker	2025-08-24 17:13:35.324134	Ramesh	Delivered	Parthiban	2025-08-31 17:13:55.532964	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 21:57:30	Screen_R_240825_446	490.00	6x12	55.1	Shaker	2025-08-24 21:57:49.78011	Angura	Delivered	admin	2025-08-27 15:42:54.929313	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 21:47:44	Screen_L_240825_445	511.00	8x16	57.0	Shaker	2025-08-24 21:48:10.505758	Angura	Delivered	admin	2025-08-27 15:52:40.157144	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:29:58	Screen_M_250825_464	470.00	30x60	10	Shaker	2025-08-25 17:31:07.425536	Ramesh	Delivered	admin	2025-09-22 15:31:11.311877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 18:20:19	Screen_R_240825_439	533.00	6x12	57.4	Shaker	2025-08-24 18:20:33.864754	Ramesh	Delivered	Parthiban	2025-08-31 17:13:06.405744	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 02:38:22	Screen_R_260825_482	532.00	6x12	55.6	Shaker	2025-08-26 02:38:46.780431	Angura	Delivered	Parthiban	2025-09-04 17:57:32.109614	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 23:40:06	Screen_L_240825_449	503.00	8x16	55.7	Shaker	2025-08-25 00:01:40.101786	Angura	Delivered	admin	2025-08-27 15:52:47.256784	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 15:46:57	Screen_R_240825_432	552.00	6x12	56.6	Shaker	2025-08-24 15:47:06.769827	Ramesh	Delivered	admin	2025-08-27 15:43:11.928309	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:29:58	Screen_M_250825_465	473.00	30x60	20	Shaker	2025-08-25 17:31:24.020848	Ramesh	Delivered	admin	2025-09-22 15:31:18.092546	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 12:20:19	Screen_R_250825_462	550.00	6x12	58.3	Shaker	2025-08-25 12:20:29.606916	Ramesh	Delivered	admin	2025-08-27 15:55:19.702887	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 07:52:44	Screen_R_250825_458	572.00	6x12	55.2	Shaker	2025-08-25 07:53:11.117347	Angura	Delivered	admin	2025-08-27 15:44:35.961282	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 03:46:49	Screen_R_260825_483	583.00	6x12	62.8	Shaker	2025-08-26 03:47:07.086706	Angura	Screening	Parthiban	2025-08-31 16:35:18.467815	loaded	2025-08-31 16:35:34	Angura	\N	550.00	\N	\N	Shaker	{"6x12","8x16","20x40"}
2025-08-25 02:31:40	Screen_L_250825_452	516.00	8x16	52.8	Shaker	2025-08-25 02:32:00.515978	Angura	Delivered	admin	2025-08-27 15:53:08.222702	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:35:26	Screen_M_250825_466	411.00	30x60	55.2	Shaker	2025-08-25 17:35:42.080514	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:29:58	Screen_M_250825_463	464.00	30x60	10	Shaker	2025-08-25 17:30:50.779161	Ramesh	Delivered	admin	2025-09-22 15:31:04.806203	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 07:42:40	Screen_L_260825_485	512.00	8x16	55.5	Shaker	2025-08-26 07:43:07.391026	Angura	Delivered	Parthiban	2025-10-27 10:26:17.152395	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 06:37:36	Screen_P_250825_454	513.00	12x30	52.8	Shaker	2025-08-25 06:38:03.7072	Angura	Delivered	admin	2025-08-27 15:59:34.988276	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 17:32:22	Screen_M_240825_437	486.00	30x60	55.0	Shaker	2025-08-24 17:32:39.090464	Ramesh	Delivered	Parthiban	2025-08-26 09:35:17.734736	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 14:59:24	Screen_R_240825_430	539.00	6x12	58.0	Shaker	2025-08-24 14:59:35.295479	Ramesh	Delivered	Parthiban	2025-08-31 17:24:37.325458	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 21:08:05	Screen_R_240825_444	541.00	6x12	58.8	Shaker	2025-08-24 21:08:35.975996	Angura	Delivered	Parthiban	2025-09-04 17:56:02.007434	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 17:07:31	Screen_L_240825_435	467.00	8x16	52.8	Shaker	2025-08-24 17:07:45.754905	Ramesh	Delivered	admin	2025-08-27 15:51:17.810877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 09:35:45	Screen_R_240825_421	575.00	6x12	55.9	Shaker	2025-08-24 09:36:02.429776	Ramesh	Delivered	admin	2025-08-27 15:43:20.009591	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 18:14:29	Screen_M_250825_469	439.00	30x60	57.5	Shaker	2025-08-25 18:14:47.549924	Ramesh	Delivered	Parthiban	2025-08-26 09:35:27.533861	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 11:58:32	Screen_P_250825_459	527.00	12x30	56.8	Shaker	2025-08-25 11:59:05.996708	Ramesh	Delivered	Veeramani	2025-09-12 17:30:14.181179	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 19:25:20	Screen_L_240825_441	447.00	8x16	52.8	Shaker	2025-08-24 19:25:30.315131	Ramesh	Delivered	admin	2025-08-27 15:51:38.90184	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 02:59:15	Screen_R_250825_453	574.00	6x12	56.9	Shaker	2025-08-25 02:59:39.067351	Angura	Delivered	admin	2025-08-27 15:44:13.421836	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 19:21:33	Screen_L_250825_474	513.00	8x16	54.5	Shaker	2025-08-25 19:23:10.351992	Ramesh	Delivered	admin	2025-08-27 15:53:37.179468	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 00:47:55	Screen_R_250825_450	535.00	6x12	55.7	Shaker	2025-08-25 00:48:15.01568	Angura	Delivered	admin	2025-08-27 15:44:21.689791	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 23:15:18	Screen_P_250825_479	540.00	12x30	55.8	Shaker	2025-08-25 23:16:04.036462	Angura	Delivered	admin	2025-08-27 15:59:54.017413	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 22:32:10	Screen_L_250825_477	531.00	8x16	53	Shaker	2025-08-25 22:33:15.896492	Angura	Delivered	Parthiban	2025-09-07 12:20:41.433628	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 23:40:06	Screen_R_240825_447	545.00	6x12	59.3	Shaker	2025-08-24 23:40:16.865028	Angura	Delivered	admin	2025-08-27 15:55:08.890794	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 12:10:25	Screen_R_250825_460	551.00	6x12	56.6	Shaker	2025-08-25 12:10:42.85676	Ramesh	Delivered	admin	2025-08-27 15:44:45.83214	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 06:58:51	Screen_250825_456	582.00	-60	50.0	Shaker	2025-08-25 06:59:09.155234	Angura	Delivered	Parthiban	2025-08-25 15:17:16.940918	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 19:15:10	Screen_250825_473	541.00	-60	53.4	Shaker	2025-08-25 19:15:27.44472	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 20:23:31	Screen_R_250825_476	555.00	6x12	55.3	Shaker	2025-08-25 20:23:44.699253	Angura	Delivered	admin	2025-08-27 15:45:23.278009	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 18:49:37	Screen_M_250825_471	500.00	30x60	53.6	Shaker	2025-08-25 18:49:56.789809	Ramesh	Delivered	Parthiban	2025-08-26 09:35:32.373899	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 19:30:29	Screen_R_250825_475	553.00	6x12	55.1	Shaker	2025-08-25 19:30:44.183567	Ramesh	Delivered	admin	2025-08-27 15:45:15.819402	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 07:42:40	Screen_R_260825_486	538.00	6x12	57.0	Shaker	2025-08-26 07:49:44.220724	Angura	Delivered	admin	2025-08-27 15:45:47.976756	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 16:32:38	Screen_P_240825_434	486.00	12x30	52.1	Shaker	2025-08-24 16:33:16.692056	Ramesh	Delivered	Veeramani	2025-09-12 17:29:57.750799	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 07:07:44	Screen_P_260825_484	534.00	12x30	51.4	Shaker	2025-08-26 07:08:02.023613	Angura	Delivered	Veeramani	2025-09-12 17:30:30.311757	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 19:12:44	Screen_250825_472	556.00	-60	53.4	Shaker	2025-08-25 19:13:16.709059	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 22:40:55	Screen_R_250825_478	541.00	6x12	54.2	Shaker	2025-08-25 22:41:15.108877	Angura	Delivered	admin	2025-08-27 15:45:58.425239	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 15:04:50	Screen_L_240825_431	500.00	8x16	53.0	Shaker	2025-08-24 15:05:03.188709	Ramesh	Delivered	admin	2025-08-27 15:51:07.036395	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 20:37:11	Screen_P_240825_443	516.00	12x30	53.2	Shaker	2025-08-24 20:37:47.613822	Angura	Delivered	admin	2025-08-27 15:59:59.477015	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 17:53:37	Screen_R_250825_468	556.00	6x12	55.8	Shaker	2025-08-25 17:53:48.043328	Ramesh	Delivered	admin	2025-08-27 15:45:04.645426	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 12:11:47	Screen_P_240825_427	545.00	12x30	55.2	Shaker	2025-08-24 12:11:59.950613	Ramesh	Delivered	admin	2025-08-27 15:59:23.534022	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 02:29:03	Screen_M_230825_397	535.00	30x60	53.2	Shaker	2025-08-23 02:29:35.641123	Ramesh	Delivered	Parthiban	2025-08-26 09:33:40.968445	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 15:11:50	Screen_M_230825_404	489.00	30x60	52.8	Shaker	2025-08-23 15:12:02.007937	Angura	Delivered	Parthiban	2025-08-26 09:34:06.992511	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 14:13:30	Screen_M_240825_428	574.00	30x60	53.6	Shaker	2025-08-24 14:13:44.162051	Ramesh	Delivered	Parthiban	2025-08-26 09:35:10.006798	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 19:32:23	Screen_R_240825_442	554.00	6x12	55.0	Shaker	2025-08-24 19:32:32.701106	Ramesh	Delivered	admin	2025-08-27 15:42:47.037768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-23 21:39:27	Screen_M_230825_411	519.00	30x60	59.0	Shaker	2025-08-23 21:39:41.562169	Ramesh	Delivered	Parthiban	2025-08-26 09:34:35.337524	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 11:28:55	Screen_M_240825_424	492.00	30x60	59.3	Shaker	2025-08-24 11:29:20.616595	Ramesh	Delivered	Parthiban	2025-08-26 09:35:06.35407	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 16:28:43	Screen_M_240825_433	518.00	30x60	57.4	Shaker	2025-08-24 16:28:57.591981	Ramesh	Delivered	Parthiban	2025-08-26 09:35:13.564444	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 18:28:12	Screen_M_250825_470	500.00	30x60	54.3	Shaker	2025-08-25 18:28:24.326903	Ramesh	Delivered	Parthiban	2025-08-26 09:35:36.224136	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 02:35:44	Screen_S_210825_370	540.00	8x30	60.2	Shaker	2025-08-21 02:35:59.054647	Ramesh	Screening	admin	2025-08-26 11:17:30.314905	loaded	2025-08-26 11:44:14	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-15 19:41:38	Screen_V_150825_259	606.00	-30	52.3	Shaker	2025-08-15 19:42:13.022161	Ramesh	Delivered	Parthiban	2025-08-26 12:08:46.458294	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-04 09:22:05	Screen_V_040825_024	569.00	-30	45.1	Shaker	2025-08-04 09:22:36.445324	Parthiban	Delivered	Parthiban	2025-08-26 12:09:36.347447	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-21 07:50:20	Screen_S_210825_373	554.00	8x30	55.8	Shaker	2025-08-21 07:50:38.205323	Ramesh	Screening	admin	2025-08-26 11:16:47.362159	loaded	2025-08-26 12:26:04	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-22 09:14:16	Screen_S_220825_385	583.00	8x30	54.9	Shaker	2025-08-22 09:14:56.073396	Angura	Screening	admin	2025-08-26 11:16:17.516281	loaded	2025-08-26 16:10:01	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-20 22:23:34	Screen_S_200825_366	542.00	8x30	60.0	Shaker	2025-08-20 22:23:46.769112	Ramesh	Screening	admin	2025-08-26 11:17:20.532036	loaded	2025-08-26 16:10:01	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-27 21:59:34	Screen_L_270825_529	497.00	8x16	56.4	Shaker	2025-08-27 21:59:56.698032	Angura	Delivered	Parthiban	2025-09-06 14:31:33.426072	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 00:11:48	Screen_L_270825_508	482.00	8x16	54.5	Shaker	2025-08-27 00:12:03.981112	Angura	Delivered	Parthiban	2025-09-07 12:20:17.433852	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 03:06:30	Screen_R_270825_513	561.00	6x12	62.2	Shaker	2025-08-27 03:07:07.776565	Angura	Delivered	Parthiban	2025-08-31 17:25:52.094119	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 14:55:30	Screen_P_260825_493	528.00	12x30	55.5	Shaker	2025-08-26 14:55:43.865306	Ramesh	Delivered	Veeramani	2025-09-12 17:30:41.572001	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:32:39	Screen_P_260825_503	517.00	12x30	56.5	Shaker	2025-08-26 21:32:51.886766	Angura	Delivered	admin	2025-09-09 07:29:43.069577	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 02:00:22	Screen_L_270825_512	495.00	8x16	54.3	Shaker	2025-08-27 02:00:36.224529	Angura	Delivered	Parthiban	2025-11-01 11:41:55.549012	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 20:04:03	Screen_P_260825_498	530.00	12x30	52	Shaker	2025-08-26 20:05:33.667892	Angura	Delivered	Veeramani	2025-09-12 17:30:50.03539	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 15:17:50	Screen_L_270825_521	524.00	8x16	54.9	Shaker	2025-08-27 15:18:04.172625	Ramesh	Delivered	Parthiban	2025-09-07 12:20:35.414885	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 11:04:32	Screen_L_270825_519	509.00	8x16	57.2	Shaker	2025-08-27 11:05:13.398046	Ramesh	Delivered	Parthiban	2025-10-28 12:25:59.035633	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 11:15:32	Screen_L_260825_488	512.00	8x16	58.4	Shaker	2025-08-26 11:15:58.250431	Ramesh	Delivered	Parthiban	2025-09-06 14:33:50.018276	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 18:09:42	Screen_L_270825_525	542.00	8x16	55.5	Shaker	2025-08-27 18:10:05.507707	Ramesh	Delivered	Parthiban	2025-10-28 12:26:14.27759	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 20:14:04	Screen_P_260825_499	507.00	12x30	55.0	Shaker	2025-08-26 20:14:38.290452	Angura	Delivered	Veeramani	2025-09-12 17:30:55.906081	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:15:25	Screen_P_260825_501	503.00	12x30	54.4	Shaker	2025-08-26 21:15:39.745112	Angura	Delivered	Veeramani	2025-09-12 17:31:08.649535	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:52:53	Screen_P_260825_505	532.00	12x30	54.2	Shaker	2025-08-26 21:53:09.638572	Angura	Delivered	Veeramani	2025-09-12 17:31:17.983232	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 22:28:05	Screen_P_260825_506	490.00	12x30	58.8	Shaker	2025-08-26 22:28:47.778927	Angura	Delivered	Veeramani	2025-09-12 17:31:24.935903	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 15:56:43	Screen_R_270825_523	542.00	6x12	61.4	Shaker	2025-08-27 15:58:22.45085	Ramesh	Delivered	Parthiban	2025-08-31 17:28:18.332352	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 10:05:36	Screen_P_270825_516	511.00	12x30	58.0	Shaker	2025-08-27 10:05:55.273333	Ramesh	Delivered	Veeramani	2025-09-09 12:24:15.978928	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 18:14:14	Screen_L_260825_496	486.00	8x16	52.7	Shaker	2025-08-26 18:15:53.935149	Ramesh	Delivered	Parthiban	2025-09-06 14:33:44.598377	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 15:13:38	Screen_L_260825_494	474.00	8x16	52.7	Shaker	2025-08-26 15:14:14.961459	Ramesh	Delivered	Parthiban	2025-09-07 12:20:30.839757	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 01:36:29	Screen_P_270825_511	505.00	12x30	59.1	Shaker	2025-08-27 01:36:43.425224	Angura	Delivered	Veeramani	2025-09-12 17:31:33.34568	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 01:30:41	Screen_P_280825_533	490.00	12x30	56.6	Shaker	2025-08-28 01:30:56.32879	Angura	Delivered	Veeramani	2025-09-12 17:31:39.768299	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 11:18:56	Screen_R_260825_489	548.00	6x12	60.8	Shaker	2025-08-26 11:19:10.004559	Ramesh	Delivered	Parthiban	2025-08-31 17:25:09.991679	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 12:47:26	Screen_P_260825_491	526.00	12x30	50.0	Shaker	2025-08-26 12:47:42.077096	Ramesh	Delivered	admin	2025-09-09 07:29:30.535209	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 01:25:26	Screen_R_270825_510	563.00	6x12	60.8	Shaker	2025-08-27 01:26:04.406362	Angura	Delivered	Parthiban	2025-08-31 17:29:04.256328	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 08:46:24	Screen_L_270825_514	491.00	8x16	56.4	Shaker	2025-08-27 08:47:07.576375	Ramesh	Delivered	Parthiban	2025-10-28 12:35:07.033164	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 01:29:11	Screen_R_250825_451	537.00	6x12	56.9	Shaker	2025-08-25 01:29:27.653052	Angura	Delivered	admin	2025-08-27 15:43:50.335698	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 01:23:37	Screen_R_260825_480	565.00	6x12	53.2	Shaker	2025-08-26 01:24:27.248837	Angura	Delivered	admin	2025-08-27 15:45:38.253147	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 10:42:17	Screen_R_270825_518	557.00	6x12	60.3	Shaker	2025-08-27 10:42:38.164761	Ramesh	Delivered	Parthiban	2025-08-31 17:30:19.316218	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 14:25:11	Screen_L_260825_492	545.00	8x16	50.4	Shaker	2025-08-26 14:26:35.05723	Ramesh	Delivered	Parthiban	2025-11-01 11:41:28.60356	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:23:21	Screen_R_260825_502	548.00	6x12	61.7	Shaker	2025-08-26 21:24:49.827165	Angura	Delivered	Parthiban	2025-08-31 17:26:25.661545	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 00:29:14	Screen_R_270825_509	541.00	6x12	61.4	Shaker	2025-08-27 00:29:31.121652	Angura	Delivered	Parthiban	2025-08-31 17:28:53.977115	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 19:36:33	Screen_P_270825_527	522.00	12x30	57	Shaker	2025-08-27 19:37:02.937705	Ramesh	Delivered	Veeramani	2025-09-09 12:24:34.809618	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 22:28:05	Screen_R_260825_507	529.00	6x12	62.8	Shaker	2025-08-26 22:37:27.608872	Angura	Delivered	Parthiban	2025-08-31 17:24:54.055655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 01:09:45	Screen_L_280825_531	466.00	8x16	54.0	Shaker	2025-08-28 01:10:31.173959	Angura	Delivered	Parthiban	2025-09-06 14:31:40.931985	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 07:29:29	Screen_L_250825_457	528.00	8x16	56.2	Shaker	2025-08-25 07:29:52.262476	Angura	Delivered	admin	2025-08-27 15:53:20.412858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 23:40:06	Screen_P_240825_448	571.00	12x30	53.9	Shaker	2025-08-24 23:52:59.639607	Angura	Delivered	admin	2025-08-27 16:00:09.711443	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 21:56:48	Screen_R_270825_528	553.00	6x12	60.2	Shaker	2025-08-27 21:57:24.876199	Angura	Delivered	Parthiban	2025-08-31 17:14:58.936701	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 11:52:14	Screen_P_260825_490	522.00	12x30	58.5	Shaker	2025-08-26 11:54:22.700886	Ramesh	Delivered	Veeramani	2025-09-12 17:30:36.222386	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:40:08	Screen_L_260825_504	456.00	8x16	52.6	Shaker	2025-08-26 21:41:17.317634	Angura	Delivered	Parthiban	2025-09-06 14:32:47.691532	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 10:27:41	Screen_R_270825_517	566.00	6x12	56.1	Shaker	2025-08-27 10:27:53.529871	Ramesh	Delivered	Parthiban	2025-08-31 17:15:38.385894	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 15:12:16	Screen_R_270825_520	561.00	6x12	57.1	Shaker	2025-08-27 15:12:33.363164	Ramesh	Delivered	Parthiban	2025-08-31 17:12:43.186354	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 01:24:32	Screen_R_280825_532	531.00	6x12	56.8	Shaker	2025-08-28 01:24:44.702293	Angura	Delivered	Parthiban	2025-08-31 17:12:20.946771	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 18:51:40	Screen_L_290825_570	470.00	8x16	58.4	Shaker	2025-08-29 18:51:51.930167	Ramesh	Delivered	Parthiban	2025-10-28 12:32:46.680721	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 07:56:22	Screen_S_160825_272	569.00	8x30	57.7	Shaker	2025-08-16 07:56:42.283403	Angura	Screening	Parthiban	2025-08-28 12:17:32.834423	loaded	2025-08-28 12:17:52	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-22 02:55:37	Screen_S_220825_381	543.00	8x30	54.2	Shaker	2025-08-22 02:55:49.229893	Ramesh	Screening	Parthiban	2025-08-28 12:16:51.035019	loaded	2025-08-28 12:33:34	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-15 16:48:58	Screen_S_150825_253	550.00	8x30	61.2	Shaker	2025-08-15 16:49:14.152331	Ramesh	Screening	Parthiban	2025-08-28 12:15:59.142189	loaded	2025-08-28 12:33:34	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-16 09:50:39	Screen_S_160825_273	522.00	8x30	58.9	Shaker	2025-08-16 09:51:04.614101	Ramesh	Screening	Parthiban	2025-08-28 12:14:54.862505	loaded	2025-08-28 14:15:20	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-19 18:53:33	Screen_S_190825_349	586.00	8x30	54.5	Shaker	2025-08-19 18:54:52.05224	Angura	Screening	Parthiban	2025-08-28 14:54:08.957148	loaded	2025-08-28 14:54:02	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40"}
2025-08-28 22:41:17	Screen_R_280825_550	543.00	6x12	57.8	Shaker	2025-08-28 22:41:43.4211	Angura	Delivered	Parthiban	2025-08-31 17:13:47.351739	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 02:48:42	Screen_L_290825_555	514.00	8x16	56.3	Shaker	2025-08-29 02:48:57.201722	Angura	Delivered	Parthiban	2025-09-06 14:31:12.916099	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 12:12:17	Screen_P_280825_537	488.00	12x30	53.4	Shaker	2025-08-28 12:12:32.756833	Ramesh	Delivered	Veeramani	2025-09-12 17:31:45.748744	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 14:12:24	Screen_P_280825_538	493.00	12x30	53.1	Shaker	2025-08-28 14:13:45.179638	Ramesh	Delivered	Veeramani	2025-09-12 17:31:52.341181	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 15:22:43	Screen_P_280825_540	526.00	12x30	54.4	Shaker	2025-08-28 15:23:01.016559	Ramesh	Delivered	Veeramani	2025-09-12 17:31:57.715728	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 01:40:40	Screen_L_300825_576	458.00	8x16	52.8	Shaker	2025-08-30 01:40:54.635779	Angura	Delivered	Parthiban	2025-09-01 12:47:47.38695	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 15:38:12	Screen_P_280825_541	498.00	12x30	56.6	Shaker	2025-08-28 15:38:25.282028	Ramesh	Delivered	Veeramani	2025-09-12 17:32:02.114836	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 16:57:09	Screen_P_280825_544	502.00	12x30	53.6	Shaker	2025-08-28 16:57:23.242443	Ramesh	Delivered	Veeramani	2025-09-12 17:32:22.811549	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 23:27:02	Screen_P_280825_551	542.00	12x30	57.3	Shaker	2025-08-28 23:27:25.98836	Angura	Delivered	Veeramani	2025-09-12 17:32:33.699091	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 07:36:28	Screen_P_290825_557	476.00	12x30	60.5	Shaker	2025-08-29 07:36:51.084623	Angura	Delivered	Veeramani	2025-09-12 17:33:05.293674	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-18 07:57:03	Screen_S_180825_325	549.00	8x30	64.5	Shaker	2025-08-18 07:58:57.447466	Prasanth	Screening	Parthiban	2025-08-28 22:58:17.156526	loaded	2025-08-28 22:58:22	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-08-29 16:23:35	Screen_R_290825_566	559.00	6x12	60.2	Shaker	2025-08-29 16:24:32.228304	Ramesh	Delivered	Parthiban	2025-08-31 17:14:51.748864	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 16:18:54	Screen_L_290825_565	490.00	8x16	59.5	Shaker	2025-08-29 16:19:51.142748	Ramesh	Delivered	Parthiban	2025-09-06 14:43:09.893148	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 23:30:55	Screen_L_280825_552	490.00	8x16	57.6	Shaker	2025-08-28 23:37:11.276573	Angura	Delivered	Parthiban	2025-09-06 14:32:56.307827	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 12:31:54	Screen_R_290825_564	592.00	6x12	58.3	Shaker	2025-08-29 12:32:29.544912	Ramesh	Delivered	Parthiban	2025-08-31 17:14:10.952309	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 16:45:56	Screen_P_290825_567	502.00	12x30	58.1	Shaker	2025-08-29 16:46:10.343195	Ramesh	Delivered	Veeramani	2025-09-12 17:33:19.884193	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 20:14:32	Screen_L_280825_548	515.00	8x16	57.9	Shaker	2025-08-28 20:14:47.562598	Angura	Delivered	Parthiban	2025-09-06 14:33:01.113896	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 09:48:38	Screen_R_290825_560	567.00	6x12	59.1	Shaker	2025-08-29 09:48:55.588608	Ramesh	Delivered	Parthiban	2025-08-31 17:15:45.078929	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 11:27:29	Screen_R_290825_561	524.00	6x12	57.5	Shaker	2025-08-29 11:27:47.582774	Ramesh	Delivered	Parthiban	2025-08-31 17:13:31.743719	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 11:51:28	Screen_L_290825_563	494.00	8x16	57.3	Shaker	2025-08-29 11:51:43.705349	Ramesh	Delivered	Parthiban	2025-09-06 14:32:14.7162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 10:29:29	Screen_R_300825_582	601.00	6x12	54.3	Shaker	2025-08-30 10:29:47.758742	Ramesh	Delivered	Parthiban	2025-09-04 18:29:36.376001	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 11:42:29	Screen_P_290825_562	484.00	12x30	59.0	Shaker	2025-08-29 11:42:53.111905	Ramesh	Delivered	Veeramani	2025-09-12 17:33:27.419559	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 16:51:47	Screen_R_290825_568	525.00	6x12	56.8	Shaker	2025-08-29 16:51:59.228623	Ramesh	Delivered	Parthiban	2025-08-31 17:12:29.186652	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 09:23:23	Screen_L_300825_581	493.00	8x16	54.6	Shaker	2025-08-30 09:23:37.622495	Ramesh	Delivered	Parthiban	2025-09-07 12:20:24.895067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 23:37:00	Screen_R_270825_530	556.00	6x12	58.7	Shaker	2025-08-27 23:37:24.665461	Angura	Delivered	Parthiban	2025-08-31 17:15:54.312907	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 19:38:53	Screen_R_280825_547	574.00	6x12	58.6	Shaker	2025-08-28 19:39:09.087326	Ramesh	Delivered	Parthiban	2025-08-31 17:14:31.21077	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 18:38:20	Screen_V_280825_546	558.00	-30	48.6	Shaker	2025-08-28 18:38:40.187192	Ramesh	Delivered	Parthiban	2025-09-16 11:49:32.709326	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 22:05:25	Screen_L_280825_549	491.00	8x16	57.4	Shaker	2025-08-28 22:05:41.981557	Angura	Delivered	Parthiban	2025-09-06 14:32:33.350798	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 23:52:09	Screen_R_280825_553	552.00	6x12	56.2	Shaker	2025-08-28 23:52:28.041739	Angura	Delivered	Parthiban	2025-08-31 17:15:18.452482	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 17:46:32	Screen_R_270825_524	545.00	6x12	60.5	Shaker	2025-08-27 17:46:52.176749	Ramesh	Delivered	Parthiban	2025-08-31 17:29:43.831899	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 18:10:46	Screen_R_290825_569	551.00	6x12	56.9	Shaker	2025-08-29 18:11:02.198869	Ramesh	Delivered	Parthiban	2025-08-31 17:12:35.486763	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 01:55:57	Screen_R_290825_554	554.00	6x12	57.1	Shaker	2025-08-29 01:56:10.901091	Angura	Delivered	Parthiban	2025-08-31 17:12:51.746793	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 01:05:37	Screen_R_300825_575	583.00	6x12	55.6	Shaker	2025-08-30 01:05:56.695943	Angura	Delivered	Veeramani	2025-09-09 11:58:15.929642	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 15:01:50	Screen_L_280825_539	490.00	8x16	53.5	Shaker	2025-08-28 15:02:09.839131	Ramesh	Delivered	Parthiban	2025-09-01 12:47:27.775845	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 07:48:08	Screen_R_290825_558	530.00	6x12	56.5	Shaker	2025-08-29 07:48:21.937875	Angura	Delivered	Parthiban	2025-08-31 17:12:13.920113	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 11:40:30	Screen_P_280825_536	518.00	12x30	53.4	Shaker	2025-08-28 11:43:30.184008	Ramesh	Delivered	Veeramani	2025-09-09 12:24:42.811063	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 11:56:47	Screen_R_300825_583	551.00	6x12	54.3	Shaker	2025-08-30 11:57:03.428659	Ramesh	Delivered	Parthiban	2025-09-04 18:02:50.111546	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 03:15:53	Screen_R_290825_556	528.00	6x12	55.6	Shaker	2025-08-29 03:16:05.960997	Angura	Delivered	Parthiban	2025-09-04 18:25:29.386148	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 14:20:10	Screen_R_300825_584	571.00	6x12	57.6	Shaker	2025-08-30 14:20:33.199436	Ramesh	Delivered	Parthiban	2025-09-04 18:32:32.810065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 02:21:26	Screen_R_220825_379	574.00	6x12	51.4	Shaker	2025-08-22 02:21:42.987616	Ramesh	Screening	Parthiban	2025-08-30 15:06:46.646242	loaded	2025-08-30 15:10:43	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","12x40","6x12"}
2025-08-30 09:02:55	Screen_P_300825_580	474.00	12x30	55.0	Shaker	2025-08-30 09:03:09.888808	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 20:53:11	Screen_R_290825_571	548.00	6x12	52.5	Shaker	2025-08-29 20:53:29.184238	Angura	Delivered	Veeramani	2025-09-09 11:58:10.429425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 11:40:30	Screen_L_280825_535	489.00	8x16	54.5	Shaker	2025-08-28 11:42:48.393485	Ramesh	Delivered	Parthiban	2025-09-06 14:30:25.769337	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 22:55:10	Screen_R_290825_574	545.00	6x12	56.4	Shaker	2025-08-29 22:55:27.711191	Angura	Delivered	Parthiban	2025-08-31 17:11:53.412458	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 18:18:32	Screen_L_010925_630	494.00	8x16	61.1	Shaker	2025-09-01 18:21:19.542756	Angura	Delivered	Parthiban	2025-09-06 14:35:09.243832	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 15:44:18	Screen_P_310825_601	474.00	12x30	58.6	Shaker	2025-08-31 15:44:31.311253	Angura	Delivered	Veeramani	2025-09-12 17:42:26.727749	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 01:21:29	Screen_R_010925_613	546.00	6x12	53.5	Shaker	2025-09-01 01:21:42.54327	Ramesh	Delivered	Parthiban	2025-09-04 18:21:20.954008	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 18:48:47	Screen_R_300825_589	543.00	6x12	54.5	Shaker	2025-08-30 18:49:35.445393	Ramesh	Delivered	Veeramani	2025-09-09 11:58:28.781297	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 00:49:00	Screen_R_310825_596	483.00	6x12	57.9	Shaker	2025-08-31 00:49:24.557391	Angura	Delivered	Veeramani	2025-09-09 11:58:44.746575	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 22:22:30	Screen_300825_592	505.00	-60	46.7	Shaker	2025-08-30 22:22:59.56697	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 18:40:37	Screen_R_010925_631	567.00	6x12	63.0	Shaker	2025-09-01 18:40:47.88785	Angura	Delivered	Parthiban	2025-09-04 18:00:23.525328	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 06:58:43	Screen_R_310825_598	587.00	6x12	55.6	Shaker	2025-08-31 06:58:55.43487	Angura	Delivered	Veeramani	2025-09-09 11:59:07.022927	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 02:41:43	Screen_P_010925_614	539.00	12x30	54.2	Shaker	2025-09-01 02:41:55.877122	Ramesh	Delivered	Veeramani	2025-09-12 17:24:48.233047	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 12:15:37	Screen_V_010925_622	537.00	-30	52.8	Shaker	2025-09-01 12:16:06.767802	Angura	Delivered	Prasanth	2025-09-08 17:19:25.062507	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 15:51:02	Screen_R_310825_602	557.00	6x12	55.3	Shaker	2025-08-31 15:51:12.354911	Angura	Delivered	Veeramani	2025-09-09 11:59:12.839659	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 00:54:06	Screen_R_020925_636	522.00	6x12	58.5	Shaker	2025-09-02 00:54:28.826229	Ramesh	Delivered	Parthiban	2025-09-04 18:03:35.504858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 17:59:25	Screen_R_310825_605	550.00	6x12	56.6	Shaker	2025-08-31 17:59:50.245594	Angura	Delivered	Veeramani	2025-09-09 11:59:20.843842	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 15:11:25	Screen_L_300825_585	503.00	8x16	58.0	Shaker	2025-08-30 15:11:40.407198	Ramesh	Delivered	Parthiban	2025-09-06 14:33:07.591295	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 02:23:39	Screen_R_300825_577	538.00	6x12	56.4	Shaker	2025-08-30 02:23:52.035811	Angura	Delivered	Parthiban	2025-08-31 17:11:59.616449	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 19:10:51	Screen_R_270825_526	575.00	6x12	57.2	Shaker	2025-08-27 19:11:07.508877	Ramesh	Delivered	Parthiban	2025-08-31 17:12:58.872738	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 07:28:16	Screen_R_280825_534	557.00	6x12	57.8	Shaker	2025-08-28 07:35:21.97383	Angura	Delivered	Parthiban	2025-08-31 17:13:39.512273	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 21:38:58	Screen_R_290825_572	552.00	6x12	60.0	Shaker	2025-08-29 21:39:11.402169	Angura	Delivered	Parthiban	2025-08-31 17:15:30.502252	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 06:52:36	Screen_R_250825_455	532.00	6x12	59.3	Shaker	2025-08-25 06:52:52.997241	Angura	Delivered	Parthiban	2025-08-31 17:22:00.25285	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-24 01:15:00	Screen_R_240825_415	529.00	6x12	58.6	Shaker	2025-08-24 01:16:52.071315	Ramesh	Delivered	Parthiban	2025-08-31 17:23:21.256976	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 09:05:15	Screen_R_270825_515	535.00	6x12	61.8	Shaker	2025-08-27 09:05:39.907088	Ramesh	Delivered	Parthiban	2025-08-31 17:26:06.262277	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 19:22:20	Screen_R_010925_633	508.00	6x12	58.0	Shaker	2025-09-01 19:27:09.171516	Angura	Delivered	Parthiban	2025-09-04 18:04:03.190494	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 21:01:29	Screen_R_310825_608	523.00	6x12	54.5	Shaker	2025-08-31 21:01:42.119107	Ramesh	Delivered	Veeramani	2025-09-09 11:59:26.804743	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 10:13:03	Screen_P_010925_618	537.00	12x30	55.0	Shaker	2025-09-01 10:13:18.305414	Angura	Delivered	admin	2025-09-09 07:29:02.592523	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 09:27:16	Screen_L_310825_599	493.00	8x16	57.4	Shaker	2025-08-31 09:27:35.757046	Angura	Delivered	Parthiban	2025-09-06 14:32:41.236296	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 23:31:46	Screen_P_300825_594	547.00	12x30	52.7	Shaker	2025-08-30 23:31:56.365333	Angura	Delivered	Veeramani	2025-09-09 12:25:33.331518	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 17:38:04	Screen_R_010925_629	529.00	6x12	59.9	Shaker	2025-09-01 17:38:29.626696	Angura	Delivered	Parthiban	2025-09-04 18:01:43.231449	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 20:50:27	Screen_P_310825_607	474.00	12x30	58.0	Shaker	2025-08-31 20:51:13.619885	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 10:58:32	Screen_P_010925_619	569.00	12x30	53.8	Shaker	2025-09-01 10:58:44.364517	Angura	Delivered	Veeramani	2025-09-12 17:24:55.053979	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 00:37:56	Screen_L_310825_595	505.00	8x16	55.5	Shaker	2025-08-31 00:39:08.048566	Angura	Delivered	Parthiban	2025-09-06 14:42:10.757522	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 22:27:02	Screen_R_010925_635	535.00	6x12	61.6	Shaker	2025-09-01 22:27:16.724884	Ramesh	Delivered	Parthiban	2025-09-04 18:00:50.786112	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 11:19:26	Screen_P_010925_620	525.00	12x30	53.8	Shaker	2025-09-01 11:19:42.006409	Angura	Delivered	Veeramani	2025-09-12 17:25:01.361568	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 21:14:24	Screen_L_310825_609	520.00	8x16	55.7	Shaker	2025-08-31 21:14:36.863215	Ramesh	Delivered	Parthiban	2025-09-06 14:41:45.620958	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 15:22:37	Screen_L_010925_626	516.00	8x16	56.2	Shaker	2025-09-01 15:23:22.325633	Angura	Delivered	Parthiban	2025-09-06 14:31:03.439232	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 11:41:18	Screen_P_010925_621	542.00	12x30	53.5	Shaker	2025-09-01 11:41:30.440665	Angura	Delivered	Veeramani	2025-09-12 17:25:12.521199	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 15:08:21	Screen_R_310825_600	565.00	6x12	55.3	Shaker	2025-08-31 15:08:37.955524	Angura	Delivered	Parthiban	2025-09-04 18:03:54.429747	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 15:16:10	Screen_R_010925_625	562.00	6x12	59.6	Shaker	2025-09-01 15:16:25.667425	Angura	Delivered	Parthiban	2025-09-04 18:01:55.989018	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 22:13:16	Screen_L_010925_634	506.00	8x16	59.4	Shaker	2025-09-01 22:13:27.286343	Ramesh	Delivered	Parthiban	2025-09-06 14:35:20.006259	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 17:58:10	Screen_R_300825_588	594.00	6x12	54.5	Shaker	2025-08-30 17:58:33.103433	Ramesh	Delivered	Veeramani	2025-09-09 11:58:23.457655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 01:36:20	Screen_P_020925_637	523.00	12x30	57.1	Shaker	2025-09-02 01:36:36.462225	Ramesh	Delivered	Veeramani	2025-09-12 17:25:40.041213	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 08:37:33	Screen_P_300825_579	505.00	12x30	56.5	Shaker	2025-08-30 08:37:45.044264	Ramesh	Delivered	Veeramani	2025-09-12 17:33:13.546369	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 16:20:49	Screen_P_300825_586	470.00	12x30	56.5	Shaker	2025-08-30 16:21:12.957984	Ramesh	Delivered	Veeramani	2025-09-12 17:33:50.186708	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 17:13:08	Screen_R_310825_603	531.00	6x12	55.9	Shaker	2025-08-31 17:13:37.920809	Angura	Delivered	admin	2025-09-09 07:26:56.129858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 02:11:37	Screen_L_020925_638	526.00	8x16	57.2	Shaker	2025-09-02 02:11:50.24433	Ramesh	Delivered	Parthiban	2025-09-06 14:31:58.077153	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 17:13:41	Screen_L_310825_604	498.00	8x16	57.3	Shaker	2025-08-31 17:13:57.45823	Angura	Delivered	Parthiban	2025-09-06 14:32:25.618276	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 02:22:05	Screen_R_020925_639	568.00	6x12	58.9	Shaker	2025-09-02 02:22:14.211554	Ramesh	Delivered	Parthiban	2025-09-04 18:02:01.796931	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 07:34:53	Screen_R_010925_616	564.00	6x12	54.0	Shaker	2025-09-01 07:35:09.104461	Ramesh	Delivered	Parthiban	2025-09-04 18:01:51.67877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 23:39:00	Screen_L_310825_612	519.00	8x16	55.4	Shaker	2025-08-31 23:39:15.447012	Ramesh	Delivered	Parthiban	2025-09-06 14:41:26.690514	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 22:20:08	Screen_R_310825_610	580.00	6x12	53.5	Shaker	2025-08-31 22:20:20.414429	Ramesh	Delivered	Parthiban	2025-09-04 18:00:38.44669	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 18:48:06	Screen_P_010925_632	565.00	12x30	57.1	Shaker	2025-09-01 18:48:18.145238	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 16:20:49	Screen_R_300825_587	553.00	6x12	58.1	Shaker	2025-08-30 16:21:38.633321	Ramesh	Delivered	Parthiban	2025-09-04 18:04:12.610372	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 01:35:54	Screen_R_310825_597	559.00	6x12	58.6	Shaker	2025-08-31 01:36:07.397027	Angura	Delivered	Parthiban	2025-09-04 18:02:43.981813	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 21:14:26	Screen_R_300825_591	555.00	6x12	53.0	Shaker	2025-08-30 21:14:39.451053	Angura	Delivered	Parthiban	2025-09-04 18:00:05.390669	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 01:51:40	Screen_L_050925_684	487.00	8x16	64.2	Shaker	2025-09-05 01:51:54.171939	Ramesh	Delivered	Parthiban	2025-10-28 12:23:48.319189	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 18:29:48	Screen_P_020925_650	483.00	12x30	56.3	Shaker	2025-09-02 18:30:06.7646	Angura	Delivered	Veeramani	2025-09-09 12:26:09.143362	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 01:56:38	Screen_R_030925_654	547.00	6x12	58.6	Shaker	2025-09-03 01:57:06.361707	Ramesh	Delivered	Parthiban	2025-09-04 18:22:08.046621	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 07:16:58	Screen_R_030925_656	564.00	6x12	61.3	Shaker	2025-09-03 07:17:15.374101	Ramesh	Delivered	Parthiban	2025-09-04 18:22:17.15454	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 07:07:23	Screen_P_030925_655	567.00	12x30	56.9	Shaker	2025-09-03 07:07:37.974174	Parthiban	Delivered	Veeramani	2025-09-12 17:26:32.5593	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 09:06:58	Screen_R_030925_659	571.00	6x12	62.7	Shaker	2025-09-03 09:07:19.795944	Angura	Delivered	Parthiban	2025-09-04 18:22:39.575686	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 08:11:52	Screen_L_030925_658	558.00	8x16	61.7	Shaker	2025-09-03 08:12:10.18887	Angura	Delivered	Parthiban	2025-09-06 14:35:57.241065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 02:28:04	Screen_R_040925_671	561.00	6x12	63.1	Shaker	2025-09-04 02:29:23.006122	Ramesh	Delivered	Parthiban	2025-09-04 18:24:06.221138	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 11:00:20	Screen_R_030925_660	526.00	6x12	61.2	Shaker	2025-09-03 11:00:46.696872	Angura	Delivered	Parthiban	2025-09-04 18:22:59.125928	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 17:47:58	Screen_L_030925_666	456.00	8x16	58.8	Shaker	2025-09-03 17:48:18.241554	Angura	Delivered	Parthiban	2025-09-06 14:33:59.955625	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 16:19:05	Screen_R_030925_662	509.00	6x12	57.6	Shaker	2025-09-03 16:19:20.298451	Angura	Delivered	Parthiban	2025-09-04 18:23:10.662021	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 07:34:48	Screen_P_040925_675	510.00	12x30	61.6	Shaker	2025-09-04 07:36:28.351815	Ramesh	Delivered	Veeramani	2025-09-09 12:26:20.292565	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 17:20:44	Screen_R_030925_665	529.00	6x12	60.2	Shaker	2025-09-03 17:20:55.889859	Angura	Delivered	Parthiban	2025-09-04 18:23:18.360456	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 19:09:39	Screen_R_030925_667	564.00	6x12	61.9	Shaker	2025-09-03 19:09:51.273342	Angura	Delivered	Parthiban	2025-09-04 18:23:27.930651	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 01:15:57	Screen_L_040925_669	515.00	8x16	59.8	Shaker	2025-09-04 01:16:09.282972	Ramesh	Delivered	Parthiban	2025-09-06 14:36:09.587983	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 07:20:38	Screen_R_040925_673	575.00	6x12	64.0	Shaker	2025-09-04 07:20:52.106186	Ramesh	Delivered	Veeramani	2025-09-09 11:59:54.121049	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 17:08:05	Screen_P_030925_663	498.00	12x30	58.0	Shaker	2025-09-03 17:08:18.674158	Angura	Delivered	Veeramani	2025-09-12 17:26:38.663768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 11:05:39	Screen_L_040925_677	496.00	8x16	62.7	Shaker	2025-09-04 11:06:22.918783	Angura	Delivered	Parthiban	2025-09-06 14:36:22.932969	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 06:51:43	Screen_L_040925_672	501.00	8x16	62.9	Shaker	2025-09-04 06:51:58.042846	Ramesh	Delivered	Parthiban	2025-09-06 14:34:14.820623	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 01:24:49	Screen_P_040925_670	503.00	12x30	57.3	Shaker	2025-09-04 01:26:07.901615	Ramesh	Delivered	Veeramani	2025-09-12 17:26:48.786104	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 12:27:28	Screen_L_030925_661	524.00	8x16	59.7	Shaker	2025-09-03 12:27:48.608162	Angura	Delivered	Parthiban	2025-09-06 14:34:08.350533	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 07:11:16	Screen_L_050925_690	499.00	8x16	61.0	Shaker	2025-09-05 07:11:36.142186	Ramesh	Delivered	Parthiban	2025-09-06 14:36:45.58266	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 17:14:46	Screen_V_030925_664	552.00	-30	52.3	Shaker	2025-09-03 17:15:00.556693	Angura	Delivered	Parthiban	2025-09-16 11:49:19.395034	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 14:23:43	Screen_L_020925_646	500.00	8x16	57.1	Shaker	2025-09-02 14:24:16.755087	Angura	Delivered	Parthiban	2025-09-06 14:35:33.833023	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 07:27:30	Screen_R_040925_674	527.00	6x12	63.4	Shaker	2025-09-04 07:28:42.226648	Ramesh	Delivered	Veeramani	2025-09-09 11:59:59.959768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 10:16:46	Screen_R_040925_676	543.00	6x12	64.0	Shaker	2025-09-04 10:16:56.746526	Angura	Delivered	Veeramani	2025-09-09 12:00:07.704585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 02:28:32	Screen_P_050925_687	528.00	12x30	63.6	Shaker	2025-09-05 02:28:42.706875	Ramesh	Delivered	Veeramani	2025-09-09 12:26:49.278427	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 18:48:06	Screen_R_040925_681	538.00	6x12	66.7	Shaker	2025-09-04 18:48:28.629142	Angura	Delivered	Veeramani	2025-09-09 12:00:22.828815	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 11:15:01	Screen_L_050925_693	512.00	8x16	57.4	Shaker	2025-09-05 11:15:22.51212	Angura	Delivered	Parthiban	2025-09-07 12:20:51.537426	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 09:36:53	Screen_R_260825_487	550.00	6x12	62.5	Shaker	2025-08-26 09:37:24.179701	Ramesh	Delivered	Parthiban	2025-09-04 17:57:48.745993	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 07:04:44	Screen_R_300825_578	579.00	6x12	55.0	Shaker	2025-08-30 07:04:55.088861	Angura	Delivered	Parthiban	2025-09-04 17:58:16.575355	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 07:32:40	Screen_R_020925_640	569.00	6x12	61.4	Shaker	2025-09-02 07:32:52.054041	Ramesh	Delivered	Parthiban	2025-09-04 18:01:17.729501	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 10:37:56	Screen_R_020925_642	549.00	6x12	61.0	Shaker	2025-09-02 10:38:12.76475	Angura	Delivered	Parthiban	2025-09-04 18:01:22.65061	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 19:18:39	Screen_R_310825_606	565.00	6x12	53.7	Shaker	2025-08-31 19:19:01.809178	Angura	Delivered	Parthiban	2025-09-04 18:01:35.165667	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 23:39:00	Screen_R_020925_652	521.00	6x12	59.3	Shaker	2025-09-02 23:39:10.371158	Ramesh	Delivered	Parthiban	2025-09-04 18:03:11.742552	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 22:42:30	Screen_R_020925_651	580.00	6x12	59.3	Shaker	2025-09-02 22:42:53.774872	Ramesh	Delivered	Parthiban	2025-09-04 18:03:18.634728	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 06:45:23	Screen_R_010925_615	584.00	6x12	55.2	Shaker	2025-09-01 06:45:38.159993	Ramesh	Delivered	Parthiban	2025-09-04 18:03:27.860169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 11:38:58	Screen_R_020925_643	533.00	6x12	55.2	Shaker	2025-09-02 11:39:33.453226	Angura	Delivered	Parthiban	2025-09-04 18:03:39.904891	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 16:13:53	Screen_R_010925_627	561.00	6x12	58.3	Shaker	2025-09-01 16:14:29.32454	Angura	Delivered	Parthiban	2025-09-04 18:03:44.389734	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 12:46:59	Screen_R_020925_645	537.00	6x12	57.4	Shaker	2025-09-02 12:47:11.048597	Angura	Delivered	Parthiban	2025-09-04 18:21:30.794187	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 15:43:43	Screen_R_020925_647	551.00	6x12	55.6	Shaker	2025-09-02 15:44:01.313204	Angura	Delivered	Parthiban	2025-09-04 18:21:43.043299	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 18:06:21	Screen_R_020925_649	518.00	6x12	55.8	Shaker	2025-09-02 18:10:57.187387	Angura	Delivered	Parthiban	2025-09-04 18:21:51.467146	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 23:09:13	Screen_R_030925_668	547.00	6x12	63.0	Shaker	2025-09-03 23:09:23.77153	Ramesh	Delivered	Parthiban	2025-09-04 18:23:41.577226	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 07:04:58	Screen_P_050925_689	484.00	12x30	62.0	Shaker	2025-09-05 07:05:33.739058	Ramesh	Delivered	Veeramani	2025-09-09 12:26:56.197738	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 14:54:50	Screen_P_010925_623	462.00	12x30	52.8	Shaker	2025-09-01 14:55:36.677802	Angura	Delivered	Veeramani	2025-09-09 12:25:52.377589	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 10:20:48	Screen_P_020925_641	502.00	12x30	59.8	Shaker	2025-09-02 10:21:39.337807	Angura	Delivered	Veeramani	2025-09-09 12:25:57.692216	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 02:15:51	Screen_R_050925_685	578.00	6x12	61.3	Shaker	2025-09-05 02:16:01.29186	Ramesh	Delivered	Veeramani	2025-09-12 11:13:51.591229	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 02:22:11	Screen_R_050925_686	438.00	6x12	64.8	Shaker	2025-09-05 02:22:23.697623	Ramesh	Delivered	Veeramani	2025-09-12 11:13:54.751204	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 18:51:30	Screen_R_040925_682	518.00	6x12	69.5	Shaker	2025-09-04 18:51:49.499882	Angura	Delivered	Veeramani	2025-09-12 11:12:46.642825	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-03 07:25:46	Screen_R_030925_657	565.00	6x12	52.8	Shaker	2025-09-03 07:26:00.692121	Parthiban	Delivered	Veeramani	2025-09-09 11:59:47.636506	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 08:55:57	Screen_R_050925_691	585.00	6x12	58.5	Shaker	2025-09-05 08:56:11.207681	Angura	Delivered	admin	2025-09-09 07:26:36.23665	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 10:24:02	Screen_R_050925_692	582.00	6x12	55.2	Shaker	2025-09-05 10:24:27.187247	Angura	Delivered	admin	2025-09-09 07:26:28.372097	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 17:59:51	Screen_P_050925_700	507.00	12x30	57.4	Shaker	2025-09-05 18:00:15.78866	Angura	Delivered	Veeramani	2025-09-12 17:27:18.803818	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 23:43:50	Screen_R_050925_703	557.00	6x12	62.9	Shaker	2025-09-05 23:44:07.413504	Ramesh	Delivered	Veeramani	2025-09-12 11:14:09.946228	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 11:49:01	Screen_P_050925_695	505.00	12x30	57.0	Shaker	2025-09-05 11:49:14.164066	Angura	Delivered	Veeramani	2025-09-12 17:27:03.026799	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_P_070925_727	490.00	12x30	60.1	Shaker	2025-09-07 16:20:08.189956	Parthiban	Delivered	Veeramani	2025-09-12 17:29:03.509006	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 06:57:34	Screen_R_060925_707	575.00	6x12	56.2	Shaker	2025-09-06 06:57:45.72088	Ramesh	Delivered	admin	2025-09-09 07:25:44.710903	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 07:36:18	Screen_S_100925_789	554.00	8x30	61.0	Shaker	2025-09-10 07:41:43.435992	Angura	Delivered	Parthiban	2025-09-18 11:32:41.251959	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 01:08:35	Screen_R_060925_704	556.00	6x12	59.0	Shaker	2025-09-06 01:08:46.526728	Ramesh	Delivered	Veeramani	2025-09-12 11:14:13.521187	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 11:47:05	Screen_R_060925_710	547.00	6x12	64.0	Shaker	2025-09-06 11:47:16.530421	Angura	Delivered	Veeramani	2025-09-12 11:14:20.931386	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 11:33:07	Screen_L_060925_709	538.00	8x16	62.1	Shaker	2025-09-06 11:33:19.52414	Angura	Delivered	Parthiban	2025-10-28 12:24:05.597382	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 12:38:14	Screen_R_080925_740	548.00	6x12	66.3	Shaker	2025-09-08 12:38:26.693668	Ramesh	Delivered	Parthiban	2025-09-18 11:39:14.49059	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 10:36:38	Screen_M_080925_738	515.00	30x60	58.9	Shaker	2025-09-08 10:37:31.112216	Ramesh	Delivered	Parthiban	2025-09-15 11:26:49.262844	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 00:42:54	Screen_R_050925_683	556.00	6x12	58.3	Shaker	2025-09-05 00:43:04.375387	Ramesh	Delivered	Veeramani	2025-09-12 11:13:47.83165	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 16:37:38	Screen_L_010925_628	522.00	8x16	56.0	Shaker	2025-09-01 16:38:12.359765	Angura	Delivered	Parthiban	2025-09-06 14:30:37.358194	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 22:23:03	Screen_L_290825_573	522.00	8x16	56.9	Shaker	2025-08-29 22:23:25.516745	Angura	Delivered	Parthiban	2025-09-06 14:30:49.52798	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 18:06:21	Screen_L_020925_648	490.00	8x16	57.0	Shaker	2025-09-02 18:06:53.205091	Angura	Delivered	Parthiban	2025-09-06 14:31:53.477721	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-29 09:27:37	Screen_L_290825_559	474.00	8x16	58.1	Shaker	2025-08-29 09:28:07.496445	Ramesh	Delivered	Parthiban	2025-09-06 14:33:24.887808	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 07:47:09	Screen_L_010925_617	533.00	8x16	55.7	Shaker	2025-09-01 07:47:21.065446	Ramesh	Delivered	Parthiban	2025-09-06 14:34:51.07127	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 23:52:05	Screen_L_020925_653	512.00	8x16	58.7	Shaker	2025-09-02 23:52:21.057711	Ramesh	Delivered	Parthiban	2025-09-06 14:35:45.131975	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 21:20:50	Screen_L_050925_702	520.00	8x16	59.2	Shaker	2025-09-05 21:21:25.164265	Ramesh	Delivered	Parthiban	2025-09-06 14:37:18.626293	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 19:22:44	Screen_L_300825_590	545.00	8x16	54.3	Shaker	2025-08-30 19:23:35.565414	Ramesh	Delivered	Parthiban	2025-09-06 14:42:50.702732	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 19:24:31	Screen_L_260825_497	473.00	8x16	53.4	Shaker	2025-08-26 19:24:45.51516	Ramesh	Delivered	Parthiban	2025-09-06 14:43:30.92513	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 15:43:32	Screen_L_050925_697	412.00	8x16	56.0	Shaker	2025-09-05 15:44:16.369282	Angura	Delivered	Parthiban	2025-09-06 14:45:32.16351	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 14:24:16	Screen_R_060925_712	501.00	6x12	64.9	Shaker	2025-09-06 14:24:28.081706	Angura	Delivered	Veeramani	2025-09-12 11:14:24.711246	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 17:07:41	Screen_R_060925_714	526.00	6x12	65.9	Shaker	2025-09-06 17:08:00.123997	Angura	Delivered	Veeramani	2025-09-12 11:14:28.431017	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 12:28:51	Screen_P_060925_711	488.00	12x30	62.6	Shaker	2025-09-06 12:29:09.494037	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 21:03:56	Screen_R_060925_717	562.00	6x12	62.6	Shaker	2025-09-06 21:04:56.612915	Ramesh	Delivered	Veeramani	2025-09-12 11:14:31.951282	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 17:13:53	Screen_L_040925_678	477.00	8x16	66.0	Shaker	2025-09-04 17:14:06.350061	Angura	Delivered	Parthiban	2025-10-28 12:23:41.339616	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 18:42:35	Screen_P_060925_716	491.00	12x30	63.9	Shaker	2025-09-06 18:43:01.458447	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 23:39:54	Screen_R_060925_718	556.00	6x12	63.0	Shaker	2025-09-07 00:14:08.010958	Prasanth	Delivered	Veeramani	2025-09-12 11:14:35.321506	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 07:52:43	Screen_R_070925_722	556.00	6x12	61.6	Shaker	2025-09-07 09:03:25.972594	Prasanth	Delivered	Veeramani	2025-09-12 11:14:43.261122	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 02:09:29	Screen_L_070925_720	502.00	8x16	60.4	Shaker	2025-09-07 02:10:22.149307	Prasanth	Delivered	Parthiban	2025-10-27 10:15:15.044438	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_R_070925_724	563.00	6x12	61.3	Shaker	2025-09-07 16:19:08.370275	Parthiban	Delivered	Veeramani	2025-09-12 11:14:46.560969	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_R_070925_725	546.00	6x12	59.2	Shaker	2025-09-07 16:19:28.869538	Parthiban	Delivered	Veeramani	2025-09-12 11:14:50.171195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_L_070925_726	511.00	8x16	58.4	Shaker	2025-09-07 16:19:46.150352	Parthiban	Delivered	Parthiban	2025-10-27 10:15:20.336378	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 02:09:29	Screen_P_070925_721	487.00	12x30	62.0	Shaker	2025-09-07 02:34:08.382313	Prasanth	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 15:07:12	Screen_V_050925_696	536.00	-30	50.6	Shaker	2025-09-05 15:07:27.484357	Angura	Delivered	Parthiban	2025-09-16 11:49:24.834161	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_L_070925_723	482.00	8x16	61.9	Shaker	2025-09-07 16:18:41.358399	Parthiban	Delivered	Parthiban	2025-10-27 10:15:26.436649	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 16:17:59	Screen_R_070925_728	542.00	6x12	60.2	Shaker	2025-09-07 17:04:16.148542	Parthiban	Delivered	Veeramani	2025-09-12 11:14:53.941142	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 18:19:58	Screen_L_070925_729	486.00	8x16	63.3	Shaker	2025-09-07 18:20:13.911016	Prasanth	Delivered	Parthiban	2025-10-27 10:15:31.101861	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 23:11:02	Screen_R_070925_730	552.00	6x12	62.8	Shaker	2025-09-07 23:11:27.864777	Angura	Delivered	Veeramani	2025-09-12 11:15:03.07624	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 10:32:27	Screen_R_080925_737	549.00	6x12	61.1	Shaker	2025-09-08 10:33:38.514956	Ramesh	Delivered	Veeramani	2025-09-12 11:15:17.72864	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 14:26:43	Screen_R_080925_744	577.00	6x12	65.8	Shaker	2025-09-08 14:26:56.325402	Ramesh	Delivered	Veeramani	2025-09-12 11:15:27.471148	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 01:19:17	Screen_L_080925_733	490.00	8x16	63.4	Shaker	2025-09-08 01:20:15.240426	Angura	Delivered	Parthiban	2025-10-27 10:15:35.391749	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 23:23:27	Screen_P_070925_731	508.00	12x30	63.9	Shaker	2025-09-07 23:26:41.849017	Prasanth	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 14:35:11	Screen_L_080925_745	478.00	8x16	62.8	Shaker	2025-09-08 14:35:30.825642	Ramesh	Delivered	Parthiban	2025-10-27 10:15:45.0655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 18:17:37	Screen_L_060925_715	511.00	8x16	64.2	Shaker	2025-09-06 18:18:23.25849	Angura	Delivered	Parthiban	2025-10-27 10:23:14.85753	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 16:30:28	Screen_R_080925_746	561.00	6x12	59.6	Shaker	2025-09-08 16:30:42.604026	Ramesh	Delivered	Veeramani	2025-09-12 11:15:36.693865	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 02:47:06	Screen_L_060925_705	512.00	8x16	59.1	Shaker	2025-09-06 02:47:21.629649	Ramesh	Delivered	Parthiban	2025-10-28 12:23:57.763206	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 07:06:13	Screen_P_080925_734	488.00	12x30	64.3	Shaker	2025-09-08 07:06:28.678831	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 12:43:17	Screen_080925_741	518.00	-60	58.9	Shaker	2025-09-08 12:45:10.2755	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 14:22:14	Screen_P_080925_743	504.00	12x30	65.2	Shaker	2025-09-08 14:22:49.424999	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 18:29:23	Screen_R_050925_701	533.00	6x12	59.9	Shaker	2025-09-05 18:29:42.347762	Angura	Delivered	admin	2025-09-09 07:25:37.518738	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 15:49:16	Screen_R_050925_698	528.00	6x12	56.0	Shaker	2025-09-05 15:49:27.333366	Angura	Delivered	Veeramani	2025-09-12 11:14:00.033632	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 16:46:30	Screen_R_050925_699	577.00	6x12	56.8	Shaker	2025-09-05 16:46:46.958945	Angura	Delivered	admin	2025-09-09 07:26:03.070874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-05 11:42:49	Screen_R_050925_694	543.00	6x12	60.0	Shaker	2025-09-05 11:43:05.040885	Angura	Delivered	admin	2025-09-09 07:26:12.067095	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 18:48:42	Screen_R_080925_751	541.00	6x12	67.2	Shaker	2025-09-08 18:48:54.019431	Ramesh	Delivered	Veeramani	2025-09-12 11:15:46.674175	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 20:23:11	Screen_L_080925_752	493.00	8x16	59.1	Shaker	2025-09-08 20:23:25.183431	Angura	Delivered	Parthiban	2025-10-27 10:15:53.680126	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 18:13:27	Screen_P_080925_749	480.00	12x30	65	Shaker	2025-09-08 18:13:59.102636	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 02:09:16	Screen_M_090925_761	502.00	30x60	56.8	gyro	2025-09-09 02:09:57.634579	Angura	Delivered	admin	2025-09-18 11:10:24.055422	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 21:42:56	Screen_R_090925_778	505.00	6x12	61.8	Shaker	2025-09-09 21:43:34.471085	Angura	Delivered	Veeramani	2025-09-12 11:17:15.738882	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 23:49:54	Screen_L_080925_758	505.00	8x16	49.4	Shaker	2025-09-08 23:50:11.584893	Angura	Delivered	Parthiban	2025-10-27 10:15:58.790026	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 22:38:24	Screen_R_080925_756	564.00	6x12	60.2	Shaker	2025-09-08 22:38:45.799008	Angura	Delivered	Veeramani	2025-09-12 11:28:00.160938	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 18:01:58	Screen_M_090925_773	498.00	30x60	56.1	Shaker	2025-09-09 18:02:16.846014	Ramesh	Delivered	admin	2025-09-18 11:10:34.573213	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 22:33:30	Screen_P_080925_755	509.00	12x30	55.2	Shaker	2025-09-08 22:33:41.703569	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 02:04:32	Screen_R_090925_760	541.00	6x12	57.1	Shaker	2025-09-09 02:04:51.314542	Angura	Delivered	Veeramani	2025-09-12 11:28:06.531237	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 06:37:00	Screen_L_090925_762	497.00	8x16	54.6	Shaker	2025-09-09 06:37:17.031961	Angura	Delivered	Parthiban	2025-10-27 10:16:02.740315	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 17:11:49	Screen_S_090925_771	583.00	8x30	66.4	Shaker	2025-09-09 17:12:00.350095	Ramesh	Delivered	Parthiban	2025-09-18 11:32:23.271856	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 23:38:15	Screen_080925_757	604.00	-60	33.0	gyro	2025-09-08 23:39:11.722801	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 00:53:04	Screen_M_090925_759	541.00	30x60	54.5	Shaker	2025-09-09 00:53:28.813138	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 06:54:51	Screen_R_090925_763	552.00	6x12	58.0	Shaker	2025-09-09 06:55:02.619337	Angura	Delivered	Veeramani	2025-09-12 11:28:12.601971	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 18:29:33	Screen_S_090925_774	543.00	8x30	57.9	Shaker	2025-09-09 18:29:47.475678	Ramesh	Delivered	Parthiban	2025-09-18 11:32:26.647462	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 20:08:22	Screen_090925_776	476.00	-60	50.2	Shaker	2025-09-09 20:09:15.762631	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 15:39:11	Screen_R_090925_768	570.00	6x12	66.6	Shaker	2025-09-09 15:39:31.563636	Ramesh	Delivered	Veeramani	2025-09-12 11:32:23.69452	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 16:50:34	Screen_R_090925_769	554.00	6x12	57.7	Shaker	2025-09-09 16:51:02.670658	Ramesh	Delivered	Veeramani	2025-09-12 11:32:28.400924	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 08:15:25	Screen_P_090925_765	514.00	12x30	58.5	Shaker	2025-09-09 08:15:37.787456	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-30 22:31:06	Screen_R_300825_593	582.00	6x12	52.9	Shaker	2025-08-30 22:31:21.464264	Angura	Delivered	Veeramani	2025-09-09 11:58:35.248901	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-31 23:28:18	Screen_R_310825_611	554.00	6x12	54.3	Shaker	2025-08-31 23:28:35.037982	Ramesh	Delivered	Veeramani	2025-09-09 11:59:36.023322	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 17:27:39	Screen_R_040925_680	560.00	6x12	60.0	Shaker	2025-09-04 17:28:15.043173	Angura	Delivered	Veeramani	2025-09-09 12:00:16.342831	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-16 13:44:56	Screen_L_160825_282	500.00	8x16	53.1	Shaker	2025-08-16 13:45:57.737353	admin	Delivered	Veeramani	2025-09-09 12:05:26.549699	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 02:03:32	Screen_L_260825_481	538.00	8x16	50.6	Shaker	2025-08-26 02:04:08.559445	Angura	Delivered	Veeramani	2025-09-09 12:06:21.028929	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-27 15:52:24	Screen_P_270825_522	505.00	12x30	58.6	Shaker	2025-08-27 15:53:27.654567	Ramesh	Delivered	Veeramani	2025-09-09 12:24:28.340754	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 16:26:39	Screen_P_280825_542	491.00	12x30	54.4	Shaker	2025-08-28 16:27:11.331888	Ramesh	Delivered	Veeramani	2025-09-09 12:24:57.753633	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-04 17:20:15	Screen_P_040925_679	502.00	12x30	63.7	Shaker	2025-09-04 17:20:45.631573	Angura	Delivered	Veeramani	2025-09-09 12:26:42.302759	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 11:00:37	Screen_090925_766	555.00	-60	46.8	Shaker	2025-09-09 11:00:50.3398	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 07:43:26	Screen_M_100925_790	515.00	30x60	54.5	Shaker	2025-09-10 07:46:09.196488	Angura	Delivered	Parthiban	2025-09-15 11:27:29.545059	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 17:54:28	Screen_R_090925_772	567.00	6x12	57.9	Shaker	2025-09-09 17:54:46.265863	Ramesh	Delivered	Veeramani	2025-09-12 11:32:36.846802	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 00:25:52	Screen_R_100925_781	553.00	6x12	57.0	Shaker	2025-09-10 00:26:35.246188	Angura	Delivered	Veeramani	2025-09-12 11:32:44.622041	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 23:05:13	Screen_S_090925_779	531.00	8x30	65.8	Shaker	2025-09-09 23:05:28.075581	Angura	Delivered	Parthiban	2025-09-18 11:32:30.15191	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 02:02:16	Screen_S_100925_783	548.00	8x30	64.0	Shaker	2025-09-10 02:02:37.190475	Angura	Delivered	Parthiban	2025-09-18 11:32:33.532103	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 06:54:01	Screen_S_100925_786	526.00	8x30	62.7	Shaker	2025-09-10 06:54:12.912949	Angura	Delivered	Parthiban	2025-09-18 11:32:36.727109	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 07:36:18	Screen_R_100925_788	532.00	6x12	58.8	Shaker	2025-09-10 07:36:28.520125	Angura	Delivered	Veeramani	2025-09-12 11:33:30.289695	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 14:03:50	Screen_S_100925_792	514.00	8x30	67.0	Shaker	2025-09-10 14:04:11.444541	Ramesh	Delivered	Parthiban	2025-09-18 11:32:45.587107	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 00:33:09	Screen_S_110925_802	540.00	8x30	66.8	Shaker	2025-09-11 00:33:22.602629	Angura	Delivered	Parthiban	2025-09-18 11:32:55.168207	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 14:34:08	Screen_R_100925_794	535.00	6x12	69.2	Shaker	2025-09-10 14:34:57.942332	Ramesh	Delivered	Parthiban	2025-09-18 11:39:20.167721	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 20:58:51	Screen_M_090925_777	507.00	30x60	54.2	Shaker	2025-09-09 20:59:27.25742	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 18:52:25	Screen_R_090925_775	548.00	6x12	58.8	Shaker	2025-09-09 18:52:36.922054	Ramesh	Delivered	Veeramani	2025-09-12 11:17:25.216055	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 18:53:34	Screen_M_100925_798	487.00	30x60	62.8	Shaker	2025-09-10 18:53:47.701303	Ramesh	Delivered	Parthiban	2025-09-18 11:47:11.192197	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 17:07:39	Screen_S_100925_796	570.00	8x30	67.6	Shaker	2025-09-10 17:08:20.709132	Ramesh	Delivered	Parthiban	2025-09-21 18:25:14.126608	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 17:20:23	Screen_L_080925_748	501.00	8x16	65.7	Shaker	2025-09-08 17:20:35.110799	Ramesh	Delivered	Parthiban	2025-10-27 10:15:49.22019	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 23:14:24	Screen_090925_780	556.00	-60	48.9	Shaker	2025-09-09 23:14:48.088763	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 06:43:03	Screen_100925_785	631.00	-60	33.5	Shaker	2025-09-10 06:43:17.3529	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 17:16:31	Screen_R_080925_747	534.00	6x12	64.8	Shaker	2025-09-08 17:16:49.798993	Ramesh	Delivered	Veeramani	2025-09-12 11:15:41.868848	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 11:20:01	Screen_M_090925_767	502.00	30x60	58.7	Shaker	2025-09-09 11:20:17.661034	Ramesh	Delivered	Parthiban	2025-09-15 11:27:15.852158	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 06:27:08	Screen_M_100925_784	500.00	30x60	53.9	Shaker	2025-09-10 06:28:13.539858	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 07:16:37	Screen_M_100925_787	522.00	30x60	49.1	gyro	2025-09-10 07:16:55.130541	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 08:48:15	Screen_M_100925_791	456.00	30x60	51.6	Shaker	2025-09-10 08:48:39.190706	Ramesh	Delivered	Parthiban	2025-09-15 11:27:36.208613	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 21:34:42	Screen_M_080925_754	464.00	30x60	55.5	gyro	2025-09-08 21:35:14.295501	Angura	Delivered	Parthiban	2025-09-16 19:27:16.108783	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 20:55:46	Screen_R_080925_753	544.00	6x12	63.9	Shaker	2025-09-08 20:56:00.057447	Angura	Delivered	Veeramani	2025-09-12 11:27:26.613348	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 19:38:54	Screen_100925_799	603.00	-60	45.1	Shaker	2025-09-10 19:40:45.176657	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 08:16:14	Screen_M_110925_806	513.00	30x60	41.9	Shaker	2025-09-11 08:16:37.420354	Ramesh	Delivered	Parthiban	2025-09-15 11:27:52.924333	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 14:20:13	Screen_S_110925_810	557.00	8x30	60.7	Shaker	2025-09-11 14:20:25.223375	Ramesh	Delivered	Parthiban	2025-09-18 11:33:23.348685	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 12:01:30	Screen_110925_807	543.00	-60	40.7	Shaker	2025-09-11 12:02:08.060511	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 22:39:42	Screen_S_110925_815	562.00	8x30	55.7	Shaker	2025-09-11 22:39:56.395748	Angura	Delivered	Parthiban	2025-09-18 11:33:27.25966	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 08:23:34	Screen_M_120925_824	563.00	30x60	52.7	Shaker	2025-09-12 08:24:48.095217	Ramesh	Delivered	Parthiban	2025-09-15 11:28:08.157002	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 23:01:16	Screen_S_110925_816	591.00	8x30	58.5	Shaker	2025-09-11 23:01:31.898342	Angura	Delivered	Parthiban	2025-09-18 11:33:32.02019	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 00:50:47	Screen_S_120925_817	530.00	8x30	54.8	Shaker	2025-09-12 00:50:58.920823	Angura	Delivered	Parthiban	2025-09-18 11:33:41.704792	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 08:48:47	Screen_R_060925_708	570.00	6x12	63.6	Shaker	2025-09-06 08:49:07.873359	Angura	Delivered	Veeramani	2025-09-12 11:14:17.441083	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 02:09:29	Screen_R_070925_719	548.00	6x12	61.4	Shaker	2025-09-07 02:09:45.588764	Prasanth	Delivered	Veeramani	2025-09-12 11:14:38.761143	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 07:13:21	Screen_R_080925_735	538.00	6x12	63.1	Shaker	2025-09-08 07:13:41.833758	Angura	Delivered	Veeramani	2025-09-12 11:15:13.99425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 07:22:27	Screen_R_110925_805	550.00	6x12	70.5	Shaker	2025-09-11 07:33:37.19189	Angura	Delivered	Parthiban	2025-09-18 11:39:28.987465	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 01:20:41	Screen_R_120925_818	536.00	6x12	54.9	Shaker	2025-09-12 01:20:54.601182	Angura	Delivered	Parthiban	2025-09-18 11:39:32.732518	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 20:40:50	Screen_M_110925_814	511.00	30x60	56.2	gyro	2025-09-11 20:41:12.86285	Angura	Delivered	Parthiban	2025-09-15 11:28:03.8621	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 00:36:25	Screen_S_110925_803	552.00	8x30	67.7	Shaker	2025-09-11 00:36:45.003674	Angura	Delivered	Parthiban	2025-10-22 18:20:10.403701	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 08:31:40	Screen_M_120925_825	549.00	30x60	47.6	Shaker	2025-09-12 08:32:03.121262	Ramesh	Delivered	Parthiban	2025-09-15 11:28:12.89827	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 03:19:02	Screen_S_120925_821	527.00	8x30	59.5	Shaker	2025-09-12 03:19:14.31205	Angura	Delivered	Parthiban	2025-09-18 11:33:45.439585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 10:47:37	Screen_S_120925_829	579.00	8x30	60.6	Shaker	2025-09-12 10:47:50.478438	Ramesh	Delivered	Parthiban	2025-09-18 11:33:53.079589	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 03:07:42	Screen_R_120925_820	521.00	6x12	51.4	Shaker	2025-09-12 03:08:02.458617	Angura	Delivered	Parthiban	2025-09-18 11:39:39.582075	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 14:31:52	Screen_R_120925_833	567.00	6x12	55.9	Shaker	2025-09-12 14:32:12.295593	Ramesh	Delivered	Parthiban	2025-09-28 16:33:30.698139	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 09:42:19	Screen_R_120925_827	570.00	6x12	57.3	Shaker	2025-09-12 09:42:37.476095	Ramesh	Delivered	Parthiban	2025-09-18 11:39:47.119949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 14:03:50	Screen_R_100925_793	531.00	6x12	62.4	Shaker	2025-09-10 14:04:24.017225	Ramesh	Delivered	Veeramani	2025-09-12 11:27:13.58727	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-09 08:05:17	Screen_R_090925_764	548.00	6x12	59.0	Shaker	2025-09-09 08:06:34.77128	Ramesh	Delivered	Veeramani	2025-09-12 11:28:25.197188	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 01:39:52	Screen_R_100925_782	544.00	6x12	65.5	Shaker	2025-09-10 01:40:02.018793	Angura	Delivered	Veeramani	2025-09-12 11:32:51.094396	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 17:01:39	Screen_R_100925_795	552.00	6x12	62.7	Shaker	2025-09-10 17:02:01.368803	Ramesh	Delivered	Veeramani	2025-09-12 11:33:37.252038	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 15:48:13	Screen_R_110925_811	562.00	6x12	59.3	Shaker	2025-09-11 15:48:28.214617	Ramesh	Delivered	Veeramani	2025-09-12 11:33:58.241467	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 17:59:37	Screen_R_110925_812	549.00	6x12	56.8	Shaker	2025-09-11 17:59:51.037885	Ramesh	Delivered	Veeramani	2025-09-12 11:36:08.704966	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 19:10:30	Screen_R_110925_813	569.00	6x12	61.9	Shaker	2025-09-11 19:11:43.024444	Ramesh	Delivered	Veeramani	2025-09-12 11:37:59.148317	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 22:21:28	Screen_R_100925_801	545.00	6x12	67.2	Shaker	2025-09-10 22:21:39.057707	Angura	Delivered	Veeramani	2025-09-12 11:38:31.425667	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 14:46:36	Screen_S_120925_834	604.00	8x30	55.2	Shaker	2025-09-12 14:47:09.427302	Ramesh	Delivered	Parthiban	2025-09-18 11:33:56.500121	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 07:45:45	Screen_120925_822	536.00	-60	47.5	gyro	2025-09-12 07:46:04.179988	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 15:16:37	Screen_S_120925_835	574.00	8x30	61.2	Shaker	2025-09-12 15:17:47.762724	Ramesh	Delivered	Parthiban	2025-09-18 11:34:00.360684	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 12:09:07	Screen_M_120925_831	486.00	30x60	59.6	gyro	2025-09-12 12:09:24.170403	Ramesh	Delivered	Parthiban	2025-09-15 11:28:17.817208	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 15:49:09	Screen_M_120925_837	473.00	30x60	53.6	gyro	2025-09-12 15:50:02.600535	Ramesh	Delivered	Parthiban	2025-09-15 11:28:25.302361	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 09:05:38	Screen_R_120925_826	542.00	6x12	53.5	Shaker	2025-09-12 09:05:50.280743	Ramesh	Screening	Parthiban	2025-09-23 16:34:20.025968	loaded	2025-09-23 16:34:30	Ramesh	\N	550.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-12 11:33:31	Screen_R_120925_830	605.00	6x12	56.0	Shaker	2025-09-12 11:33:45.831837	Ramesh	Delivered	Parthiban	2025-09-18 11:39:51.230411	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 09:47:31	Screen_120925_828	590.00	-60	38.1	gyro	2025-09-12 09:48:09.744463	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 17:45:07	Screen_S_120925_842	511.00	8x30	53.5	Shaker	2025-09-12 17:45:19.593569	Ramesh	Delivered	Parthiban	2025-09-18 11:34:04.124814	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 17:25:13	Screen_R_120925_841	579.00	6x12	52.1	Shaker	2025-09-12 17:25:25.610568	Ramesh	Delivered	Parthiban	2025-09-18 11:40:05.885052	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-01 15:00:37	Screen_P_010925_624	502.00	12x30	57.1	Shaker	2025-09-01 15:01:54.120662	Angura	Delivered	Veeramani	2025-09-12 17:25:18.042612	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-02 12:06:28	Screen_P_020925_644	522.00	12x30	57.2	Shaker	2025-09-02 12:06:50.612017	Angura	Delivered	Veeramani	2025-09-12 17:26:26.210743	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 03:01:03	Screen_P_060925_706	552.00	12x30	61.4	Shaker	2025-09-06 03:01:14.063859	Ramesh	Delivered	Veeramani	2025-09-12 17:27:28.050545	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 21:03:50	Screen_P_260825_500	466.00	12x30	53.4	Shaker	2025-08-26 21:04:12.23901	Angura	Delivered	Veeramani	2025-09-12 17:31:03.302459	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 17:21:19	Screen_P_280825_545	490.00	12x30	56.5	Shaker	2025-08-28 17:21:37.615783	Ramesh	Delivered	Veeramani	2025-09-12 17:32:27.235498	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 00:17:21	Screen_S_130925_848	538.00	8x30	58.8	Shaker	2025-09-13 00:18:05.990534	Angura	Delivered	Parthiban	2025-09-18 11:34:11.874818	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 19:42:47	Screen_R_120925_844	556.00	6x12	51.7	Shaker	2025-09-12 19:42:59.182749	Ramesh	Delivered	Parthiban	2025-09-18 11:40:10.550228	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 12:16:39	Screen_S_110925_808	545.00	8x30	62.9	Shaker	2025-09-11 12:16:51.792054	Ramesh	Delivered	Parthiban	2025-10-09 09:50:50.745293	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 22:19:01	Screen_R_120925_847	540.00	6x12	52.7	Shaker	2025-09-12 22:19:13.830303	Angura	Delivered	Parthiban	2025-09-18 11:40:13.640162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 17:17:18	Screen_M_120925_840	487.00	30x60	52.6	gyro	2025-09-12 17:17:36.154107	Ramesh	Delivered	Parthiban	2025-09-18 11:49:53.276131	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 15:16:37	Screen_R_120925_836	542.00	6x12	54.7	Shaker	2025-09-12 15:18:09.358922	Ramesh	Screening	Parthiban	2025-09-21 10:26:09.113527	loaded	2025-09-21 10:26:26	Ramesh	\N	552.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-12 21:31:16	Screen_120925_846	567.00	-60	45.0	gyro	2025-09-12 21:32:04.039547	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 17:12:42	Screen_M_120925_839	528.00	30x60	54.4	gyro	2025-09-12 17:13:01.559875	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 20:29:19	Screen_M_100925_800	482.00	30x60	68.4	Shaker	2025-09-10 20:29:35.810473	Angura	Delivered	Parthiban	2025-09-15 11:27:46.570004	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 07:47:48	Screen_S_130925_854	571.00	8x30	55.3	Shaker	2025-09-13 07:48:02.239946	Angura	Delivered	Parthiban	2025-09-18 11:34:19.489921	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 11:50:12	Screen_S_130925_858	555.00	8x30	59.6	Shaker	2025-09-13 11:50:23.078769	Ramesh	Delivered	Parthiban	2025-09-18 11:34:23.429681	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 10:49:58	Screen_M_130925_856	587.00	30x60	44.4	gyro	2025-09-13 10:50:23.481316	Ramesh	Delivered	Parthiban	2025-09-15 11:28:53.711597	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 02:46:24	Screen_R_130925_852	536.00	6x12	58.6	Shaker	2025-09-13 02:46:37.865616	Angura	Delivered	Parthiban	2025-09-18 11:40:20.061774	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 09:45:44	Screen_R_130925_855	555.00	6x12	58.2	Shaker	2025-09-13 09:46:03.774882	Ramesh	Delivered	Parthiban	2025-09-18 11:40:27.125282	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 11:22:27	Screen_R_130925_857	535.00	6x12	59.4	Shaker	2025-09-13 11:23:36.428885	Ramesh	Delivered	Parthiban	2025-09-18 11:40:32.165726	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 15:12:53	Screen_R_130925_861	532.00	6x12	58.4	Shaker	2025-09-13 15:13:08.300581	Ramesh	Delivered	Parthiban	2025-09-18 11:40:35.006229	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 14:48:21	Screen_M_130925_859	506.00	30x60	53.3	gyro	2025-09-13 14:48:48.331776	Ramesh	Delivered	Parthiban	2025-09-15 11:28:58.746688	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 18:34:10	Screen_R_130925_865	551.00	6x12	57.6	Shaker	2025-09-13 18:34:24.051921	Ramesh	Delivered	Parthiban	2025-09-18 11:40:38.340017	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 15:49:21	Screen_S_130925_862	533.00	8x30	58.4	Shaker	2025-09-13 15:49:33.402526	Ramesh	Delivered	Parthiban	2025-09-18 11:34:26.484934	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 22:35:51	Screen_M_130925_868	540.00	30x60	50.8	gyro	2025-09-13 22:36:05.529146	Angura	Delivered	Parthiban	2025-09-15 11:29:08.78316	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 15:04:08	Screen_M_130925_860	518.00	30x60	54.1	gyro	2025-09-13 15:04:41.791974	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 22:08:27	Screen_R_130925_867	536.00	6x12	58.3	Shaker	2025-09-13 22:08:37.949266	Angura	Delivered	Parthiban	2025-09-18 11:40:41.325124	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 22:40:25	Screen_S_130925_869	549.00	8x30	59.3	Shaker	2025-09-13 22:40:36.840287	Angura	Delivered	Parthiban	2025-09-18 11:34:33.21993	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 18:06:12	Screen_M_130925_863	485.00	30x60	45.4	gyro	2025-09-13 18:06:29.468471	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 01:56:39	Screen_S_140925_875	564.00	8x30	59.1	Shaker	2025-09-14 01:56:57.496597	Angura	Delivered	Parthiban	2025-09-18 11:34:36.9098	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 01:02:13	Screen_R_140925_874	557.00	6x12	53.9	Shaker	2025-09-14 01:39:12.896075	Angura	Delivered	Parthiban	2025-09-18 11:40:47.400055	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 09:12:20	Screen_R_140925_878	558.00	6x12	56.8	Shaker	2025-09-14 09:12:35.226058	Angura	Delivered	Parthiban	2025-09-18 11:40:50.910055	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 22:56:48	Screen_M_130925_870	445.00	30x60	55.4	gyro	2025-09-13 22:57:25.30895	Angura	Delivered	Parthiban	2025-09-15 11:29:15.359567	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 10:48:30	Screen_S_140925_881	539.00	8x30	60.0	Shaker	2025-09-14 10:48:50.481635	Angura	Delivered	Parthiban	2025-09-18 11:34:40.559697	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 00:20:03	Screen_M_140925_871	534.00	30x60	57.5	gyro	2025-09-14 00:20:19.392572	Angura	Delivered	Parthiban	2025-09-15 11:29:21.677991	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 11:26:39	Screen_R_140925_883	568.00	6x12	58.3	Shaker	2025-09-14 11:27:13.15777	Angura	Delivered	Parthiban	2025-09-18 11:40:54.100419	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 11:22:28	Screen_M_140925_882	541.00	30x60	55.6	gyro	2025-09-14 11:22:39.249246	Angura	Delivered	admin	2025-09-18 11:10:58.475945	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 12:12:25	Screen_R_140925_886	527.00	6x12	57.0	Shaker	2025-09-14 12:12:35.399578	Angura	Delivered	Parthiban	2025-09-18 11:40:57.740101	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 12:17:01	Screen_S_140925_887	539.00	8x30	58.9	Shaker	2025-09-14 12:17:12.983951	Angura	Delivered	Parthiban	2025-09-18 11:34:44.824725	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 08:41:06	Screen_M_140925_876	531.00	30x60	52.5	gyro	2025-09-14 08:41:16.819128	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 09:06:47	Screen_M_140925_877	522.00	30x60	54.4	gyro	2025-09-14 09:06:59.067297	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 14:46:22	Screen_R_140925_889	570.00	6x12	56.6	Shaker	2025-09-14 14:46:38.229619	Angura	Delivered	Parthiban	2025-09-18 11:41:01.32031	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 09:39:15	Screen_140925_880	580.00	-60	46.0	gyro	2025-09-14 09:39:29.149448	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 16:21:08	Screen_S_140925_892	584.00	8x30	57.8	Shaker	2025-09-14 16:21:27.112989	Angura	Delivered	Parthiban	2025-09-18 11:34:49.504953	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 19:28:31	Screen_S_120925_843	545.00	8x30	53.2	Shaker	2025-09-12 19:28:45.417534	Ramesh	Delivered	Parthiban	2025-09-18 11:34:08.039874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 18:43:17	Screen_R_140925_893	560.00	6x12	52.0	Shaker	2025-09-14 18:43:35.399336	Angura	Delivered	Parthiban	2025-09-18 11:41:09.044952	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 02:22:20	Screen_S_130925_851	555.00	8x30	62.1	Shaker	2025-09-13 02:22:32.677613	Angura	Delivered	Parthiban	2025-09-18 11:34:15.940078	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 21:15:03	Screen_R_140925_895	581.00	6x12	53.0	Shaker	2025-09-14 21:15:36.020423	Ramesh	Delivered	Parthiban	2025-09-18 11:41:12.524988	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 01:21:31	Screen_S_150925_898	536.00	8x30	55.0	Shaker	2025-09-15 01:21:42.062145	Ramesh	Delivered	Parthiban	2025-09-18 11:34:56.704655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 14:06:36	Screen_M_140925_888	511.00	30x60	54.4	gyro	2025-09-14 14:07:05.69782	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 23:20:17	Screen_R_140925_896	548.00	6x12	55.3	Shaker	2025-09-14 23:20:28.404124	Ramesh	Delivered	Parthiban	2025-09-18 11:41:15.845114	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 15:03:13	Screen_M_140925_890	500.00	30x60	55.0	gyro	2025-09-14 15:03:30.216787	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 01:09:11	Screen_R_150925_897	571.00	6x12	52.1	Shaker	2025-09-15 01:09:38.341461	Ramesh	Delivered	Parthiban	2025-09-18 11:41:19.280067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 02:08:10	Screen_S_150925_899	576.00	8x30	53.6	Shaker	2025-09-15 02:08:21.15142	Ramesh	Delivered	Parthiban	2025-09-18 11:35:00.589939	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 08:56:52	Screen_R_150925_901	578.00	6x12	53.5	Shaker	2025-09-15 08:57:20.715847	Angura	Delivered	Parthiban	2025-09-18 11:41:27.826898	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 12:34:54	Screen_S_150925_905	526.00	8x30	55.5	Shaker	2025-09-15 12:35:05.802426	Angura	Delivered	Parthiban	2025-09-18 11:35:06.885087	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 12:06:31	Screen_M_140925_885	496.00	30x60	56.2	gyro	2025-09-14 12:06:43.878891	Angura	Delivered	Parthiban	2025-09-18 11:48:40.898391	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 10:54:47	Screen_R_150925_903	527.00	6x12	52.0	Shaker	2025-09-15 10:54:57.867144	Angura	Delivered	Parthiban	2025-09-21 18:19:27.418687	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 00:53:21	Screen_R_130925_850	534.00	6x12	58.4	Shaker	2025-09-13 00:53:36.557117	Angura	Delivered	Parthiban	2025-09-18 11:40:16.940332	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 01:02:13	Screen_M_140925_873	531.00	30x60	56.9	gyro	2025-09-14 01:02:30.693855	Angura	Delivered	admin	2025-09-18 11:10:50.832127	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 10:46:48	Screen_S_150925_902	579.00	8x30	54.0	Shaker	2025-09-15 10:47:00.677076	Angura	Delivered	Parthiban	2025-09-21 18:25:55.437479	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 10:59:40	Screen_M_080925_739	506.00	30x60	56.0	Shaker	2025-09-08 10:59:59.397096	Ramesh	Delivered	Parthiban	2025-09-15 11:26:58.767962	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 14:12:38	Screen_M_110925_809	550.00	30x60	45.7	Shaker	2025-09-11 14:12:52.903783	Ramesh	Delivered	Parthiban	2025-09-15 11:27:57.409579	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 16:26:00	Screen_M_120925_838	497.00	30x60	49.2	gyro	2025-09-12 16:26:31.896901	Ramesh	Delivered	Parthiban	2025-09-15 11:28:32.52905	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 21:08:04	Screen_M_120925_845	544.00	30x60	59.9	gyro	2025-09-12 21:08:20.387161	Angura	Delivered	Parthiban	2025-09-15 11:28:44.142888	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 00:27:59	Screen_M_130925_849	502.00	30x60	58.4	gyro	2025-09-13 00:28:33.153967	Angura	Delivered	Parthiban	2025-09-15 11:28:49.248549	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 09:32:18	Screen_M_140925_879	393.00	30x60	57.5	Shaker	2025-09-14 09:32:34.118998	Angura	Delivered	admin	2025-09-22 15:23:15.833415	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 20:25:39	Screen_V_130925_866	548.00	-30	53.5	Shaker	2025-09-13 20:25:56.814596	Angura	Delivered	admin	2025-09-22 15:15:46.551468	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 19:04:20	Screen_R_160925_926	543.00	6x12	54.0	Shaker	2025-09-16 19:04:34.332562	Angura	Delivered	Parthiban	2025-09-18 11:44:39.729608	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 17:45:12	Screen_R_150925_908	577.00	6x12	55.5	Shaker	2025-09-15 17:45:21.794682	Angura	Delivered	Parthiban	2025-09-21 18:19:43.538967	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 01:35:32	Screen_R_160925_912	562.00	6x12	59.9	Shaker	2025-09-16 01:35:48.981824	Ramesh	Delivered	Parthiban	2025-09-21 18:19:48.138315	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 02:23:25	Screen_R_170925_932	520.00	6x12	53.4	Shaker	2025-09-17 02:23:37.908271	Ramesh	Delivered	Parthiban	2025-09-18 11:45:03.100364	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 22:33:05	Screen_R_160925_927	558.00	6x12	55.7	Shaker	2025-09-16 22:33:34.836358	Ramesh	Delivered	Parthiban	2025-09-18 11:45:31.26986	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 18:11:41	Screen_M_150925_909	473.00	30x60	57.7	gyro	2025-09-15 18:12:16.852953	Angura	Delivered	Parthiban	2025-09-18 11:49:21.556844	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 08:44:42	Screen_R_180925_935	562.00	6x12	53.8	Shaker	2025-09-18 08:44:54.590727	Angura	Delivered	Parthiban	2025-09-21 18:20:06.790766	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-26 18:12:50	Screen_V_260825_495	528.00	-30	52.8	Shaker	2025-08-26 18:13:27.095604	Ramesh	Delivered	Parthiban	2025-09-16 11:49:28.67457	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 17:46:53	Screen_S_160925_925	543.00	8x30	56.5	Shaker	2025-09-16 17:47:25.178462	Angura	Delivered	Parthiban	2025-09-21 18:26:10.749171	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 14:35:45	Screen_M_160925_921	523.00	30x60	53.6	gyro	2025-09-16 14:36:04.861872	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 15:36:02	Screen_S_180925_950	577.00	8x30	60.2	Shaker	2025-09-18 15:36:14.890321	Angura	Delivered	Parthiban	2025-09-21 18:26:27.1205	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 14:07:39	Screen_M_080925_742	496.00	30x60	56.1	Shaker	2025-09-08 14:07:59.469867	Ramesh	Delivered	admin	2025-09-18 11:10:04.916655	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 18:25:07	Screen_M_080925_750	521.00	30x60	53.9	Shaker	2025-09-08 18:25:19.808341	Ramesh	Delivered	admin	2025-09-18 11:10:13.326003	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 07:50:20	Screen_S_120925_823	517.00	8x30	58.2	Shaker	2025-09-12 07:50:38.15008	Angura	Delivered	Parthiban	2025-09-18 11:33:48.839559	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 18:28:03	Screen_S_130925_864	557.00	8x30	59.8	Shaker	2025-09-13 18:28:16.771973	Ramesh	Delivered	Parthiban	2025-09-18 11:34:30.119757	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 19:17:28	Screen_S_140925_894	561.00	8x30	54.3	Shaker	2025-09-14 19:17:42.432491	Angura	Delivered	Parthiban	2025-09-18 11:34:53.1797	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 16:26:15	Screen_S_150925_906	531.00	8x30	58.5	Shaker	2025-09-15 16:26:30.47684	Angura	Delivered	Parthiban	2025-09-18 11:35:10.505096	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 01:03:25	Screen_S_160925_910	571.00	8x30	59.1	Shaker	2025-09-16 01:03:44.171577	Ramesh	Delivered	Parthiban	2025-09-18 11:35:19.282678	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 01:17:31	Screen_S_160925_911	572.00	8x30	59.2	Shaker	2025-09-16 01:17:42.178481	Ramesh	Delivered	Parthiban	2025-09-18 11:35:25.619837	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 03:27:49	Screen_S_160925_915	539.00	8x30	64.0	Shaker	2025-09-16 03:27:59.71393	Ramesh	Delivered	Parthiban	2025-09-18 11:35:30.799784	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 07:38:42	Screen_S_160925_917	563.00	8x30	61.5	Shaker	2025-09-16 07:38:53.193046	Ramesh	Delivered	Parthiban	2025-09-18 11:35:41.845162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 00:44:52	Screen_S_170925_928	542.00	8x30	54.8	Shaker	2025-09-17 00:45:04.442627	Ramesh	Delivered	Parthiban	2025-09-18 11:36:10.17137	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 01:52:25	Screen_S_170925_930	524.00	8x30	57.9	Shaker	2025-09-17 01:52:39.955829	Ramesh	Delivered	Parthiban	2025-09-18 11:36:25.768608	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 16:11:51	Screen_S_160925_922	535.00	8x30	59.3	Shaker	2025-09-16 16:12:09.317037	Angura	Delivered	Parthiban	2025-09-18 11:36:44.83268	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-10 18:44:42	Screen_S_100925_797	539.00	8x30	66	Shaker	2025-09-10 18:44:56.415202	Ramesh	Delivered	Parthiban	2025-09-18 11:37:06.686373	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-07 23:23:27	Screen_R_070925_732	536.00	6x12	68.5	Shaker	2025-09-07 23:27:45.745336	Prasanth	Delivered	Parthiban	2025-09-18 11:39:11.206084	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-11 07:22:27	Screen_R_110925_804	552.00	6x12	61.5	Shaker	2025-09-11 07:22:57.161588	Angura	Delivered	Parthiban	2025-09-18 11:39:25.382672	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 12:42:15	Screen_R_120925_832	544.00	6x12	57.9	Shaker	2025-09-12 12:42:28.423062	Ramesh	Delivered	Parthiban	2025-09-18 11:39:57.468113	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-13 07:39:30	Screen_R_130925_853	556.00	6x12	53.4	Shaker	2025-09-13 07:39:42.089001	Angura	Delivered	Parthiban	2025-09-18 11:40:23.401273	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 00:26:31	Screen_R_140925_872	548.00	6x12	53.4	Shaker	2025-09-14 00:26:43.818113	Angura	Delivered	Parthiban	2025-09-18 11:40:44.480107	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-14 16:14:48	Screen_R_140925_891	563.00	6x12	55.6	Shaker	2025-09-14 16:15:28.813827	Angura	Delivered	Parthiban	2025-09-18 11:41:05.240121	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 12:24:17	Screen_R_150925_904	531.00	6x12	50.6	Shaker	2025-09-15 12:24:30.302385	Angura	Delivered	Parthiban	2025-09-18 11:41:34.16436	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 01:42:43	Screen_R_160925_913	543.00	6x12	59.5	Shaker	2025-09-16 01:42:54.667212	Ramesh	Delivered	Parthiban	2025-09-18 11:43:52.834813	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 02:12:50	Screen_R_160925_914	555.00	6x12	60.3	Shaker	2025-09-16 02:13:07.229799	Ramesh	Delivered	Parthiban	2025-09-18 11:43:55.93647	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 04:02:00	Screen_R_160925_916	552.00	6x12	61.5	Shaker	2025-09-16 04:02:10.969148	Ramesh	Delivered	Parthiban	2025-09-18 11:43:59.026388	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 09:15:58	Screen_R_160925_918	536.00	6x12	57.2	Shaker	2025-09-16 09:16:08.985652	Angura	Delivered	Parthiban	2025-09-18 11:44:03.206483	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 11:39:29	Screen_R_160925_919	559.00	6x12	59.3	Shaker	2025-09-16 11:39:39.513531	Angura	Delivered	Parthiban	2025-09-18 11:44:09.570309	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 16:11:51	Screen_R_160925_923	537.00	6x12	59.8	Shaker	2025-09-16 16:12:32.5502	Angura	Delivered	Parthiban	2025-09-18 11:44:15.690367	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 17:14:22	Screen_R_160925_924	549.00	6x12	56.6	Shaker	2025-09-16 17:14:35.125833	Angura	Delivered	Parthiban	2025-09-18 11:44:29.597884	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 18:01:30	Screen_S_180925_954	500.00	8x30	66.7	Shaker	2025-09-18 18:02:07.684581	Angura	Delivered	Parthiban	2025-09-21 18:26:34.429495	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 19:20:09	Screen_R_180925_956	481.00	6x12	68.8	Shaker	2025-09-18 19:20:27.223008	Angura	Delivered	Parthiban	2025-09-21 18:20:29.148257	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 00:39:07	Screen_S_190925_963	597.00	8x30	62.3	Shaker	2025-09-19 00:39:19.807418	Ramesh	Delivered	Parthiban	2025-09-21 18:26:40.992241	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 00:17:46	Screen_R_190925_962	531.00	6x12	57.1	Shaker	2025-09-19 00:17:57.14044	Ramesh	Delivered	Parthiban	2025-09-21 18:21:51.559764	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 22:18:31	Screen_R_180925_961	559.00	6x12	59.1	Shaker	2025-09-18 22:18:42.130948	Ramesh	Delivered	Parthiban	2025-09-21 18:20:35.469877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 16:24:42	Screen_R_180925_951	538.00	6x12	60.3	Shaker	2025-09-18 16:25:02.563553	Angura	Delivered	Parthiban	2025-09-24 18:57:42.237566	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 19:24:18	Screen_S_180925_957	160.00	8x30	20	Shaker	2025-09-18 19:24:30.972909	Angura	Delivered	admin	2025-09-22 14:26:09.865112	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-15 07:08:46	Screen_R_150925_900	564.00	6x12	51.7	Shaker	2025-09-15 07:09:00.966173	Ramesh	Delivered	Parthiban	2025-09-21 18:18:52.33744	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 19:24:18	Screen_180925_958	410.00	4x8	10	Shaker	2025-09-18 19:25:10.923635	Angura	Screening	Thiruppathi	2025-09-19 14:01:40.756101	loaded	2025-09-19 14:01:50	Thiruppathi	\N	410.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-15 16:26:33	Screen_R_150925_907	507.00	6x12	59.9	Shaker	2025-09-15 16:26:59.239239	Angura	Delivered	Parthiban	2025-09-21 18:19:36.701284	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 12:37:25	Screen_R_180925_944	573.00	6x12	62.6	Shaker	2025-09-18 12:39:33.014646	Angura	Delivered	Parthiban	2025-09-21 18:20:15.380748	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 15:23:21	Screen_R_180925_947	567.00	6x12	57.6	Shaker	2025-09-18 15:23:48.383524	Angura	Delivered	Parthiban	2025-09-21 18:20:19.450634	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 18:01:30	Screen_180925_953	465.00	4x8	55	Shaker	2025-09-18 18:01:45.268521	Angura	Delivered	admin	2025-09-22 15:35:48.547492	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 19:15:08	Screen_V_180925_955	493.00	-30	47.7	Shaker	2025-09-18 19:15:52.073014	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 08:18:17	Screen_S_190925_969	567.00	8x30	63.1	Shaker	2025-09-19 08:18:34.968307	Angura	Delivered	Parthiban	2025-09-21 18:26:57.989056	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 11:02:04	Screen_R_190925_971	532.00	6x12	58.8	Shaker	2025-09-19 11:02:16.49319	Angura	Delivered	Parthiban	2025-09-21 18:22:51.573415	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 11:27:52	Screen_R_190925_972	553.00	6x12	61.6	Shaker	2025-09-19 11:28:05.171315	Angura	Delivered	Parthiban	2025-09-24 18:57:52.10254	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 10:36:11	Screen_S_190925_970	526.00	8x30	59.4	Shaker	2025-09-19 10:36:24.044801	Angura	Delivered	Parthiban	2025-09-21 18:27:01.999247	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 18:02:35	Screen_S_190925_981	566.00	8x30	60.8	Shaker	2025-09-19 18:02:51.255803	Angura	Delivered	Parthiban	2025-09-21 18:27:10.849585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 11:28:34	Screen_180925_940	559.00	4x8	10	Shaker	2025-09-18 11:29:01.650675	Angura	Screening	Thiruppathi	2025-09-19 14:03:17.545513	loaded	2025-09-19 14:03:26	Thiruppathi	\N	465.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 15:23:21	Screen_180925_949	485.00	4x8	10	Shaker	2025-09-18 15:28:51.122183	Angura	Screening	Thiruppathi	2025-09-19 14:04:28.094898	loaded	2025-09-19 14:04:31	Thiruppathi	\N	486.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 16:24:42	Screen_180925_952	481.00	4x8	10	Shaker	2025-09-18 16:26:29.808739	Angura	Screening	Thiruppathi	2025-09-19 14:05:19.691539	loaded	2025-09-19 14:05:23	Thiruppathi	\N	481.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 15:23:21	Screen_180925_948	474.00	4x8	10	Shaker	2025-09-18 15:27:20.073285	Angura	Screening	Thiruppathi	2025-09-19 14:05:56.832315	loaded	2025-09-19 14:06:01	Thiruppathi	\N	474.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 12:37:25	Screen_180925_943	483.00	4x8	10	Shaker	2025-09-18 12:37:36.021732	Angura	Screening	Thiruppathi	2025-09-19 14:06:33.42426	loaded	2025-09-19 14:06:37	Thiruppathi	\N	483.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 11:59:09	Screen_180925_941	533.00	4x8	10	Shaker	2025-09-18 11:59:21.403671	Angura	Screening	Thiruppathi	2025-09-19 14:07:04.331447	loaded	2025-09-19 14:07:08	Thiruppathi	\N	533.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 14:19:32	Screen_180925_945	515.00	4x8	10	Shaker	2025-09-18 14:19:45.652391	Angura	Screening	Thiruppathi	2025-09-19 14:07:40.273394	loaded	2025-09-19 14:07:43	Thiruppathi	\N	515.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 10:50:34	Screen_180925_937	544.00	4x8	10	Shaker	2025-09-18 10:50:46.734774	Angura	Screening	Thiruppathi	2025-09-19 14:08:30.022146	loaded	2025-09-19 14:08:32	Thiruppathi	\N	544.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 09:43:58	Screen_180925_936	531.00	4x8	10	Shaker	2025-09-18 09:44:40.332759	Angura	Screening	Thiruppathi	2025-09-19 14:09:01.884582	loaded	2025-09-19 14:09:04	Thiruppathi	\N	559.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 11:08:11	Screen_180925_939	426.00	+4	10	Shaker	2025-09-18 11:10:23.693865	Angura	Screening	Thiruppathi	2025-09-19 16:34:34.430086	loaded	2025-09-19 16:34:39	Thiruppathi	\N	426.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 19:24:18	Screen_180925_959	558.00	+4	10	Shaker	2025-09-18 19:25:32.260449	Angura	Screening	Thiruppathi	2025-09-19 16:35:13.726075	loaded	2025-09-19 16:35:27	Thiruppathi	\N	558.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-18 14:19:32	Screen_180925_946	497.00	+4	10	Shaker	2025-09-18 14:20:25.138493	Angura	Screening	Thiruppathi	2025-09-19 16:35:20.530428	loaded	2025-09-19 16:35:27	Thiruppathi	\N	497.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-19 12:31:11	Screen_R_190925_973	548.00	6x12	59.2	Shaker	2025-09-19 12:31:24.105904	Angura	Delivered	Parthiban	2025-09-21 18:23:00.726335	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 15:04:31	Screen_S_190925_975	539.00	8x30	60.2	Shaker	2025-09-19 15:04:42.393565	Angura	Delivered	Parthiban	2025-09-21 18:27:05.918904	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 19:20:59	Screen_S_190925_987	552.00	8x30	53.2	Shaker	2025-09-19 19:21:16.466187	Angura	Delivered	Parthiban	2025-09-21 18:27:15.179065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 14:50:38	Screen_R_190925_974	566.00	6x12	59.2	Shaker	2025-09-19 14:50:58.582569	Angura	Delivered	Parthiban	2025-09-21 18:23:07.653965	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 00:48:20	Screen_S_190925_964	512.00	8x30	66.3	Shaker	2025-09-19 00:48:34.780937	Ramesh	Delivered	Parthiban	2025-09-21 18:26:49.799069	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 16:50:20	Screen_R_190925_977	544.00	6x12	56.5	Shaker	2025-09-19 16:50:39.352316	Angura	Delivered	admin	2025-09-22 13:51:52.765867	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 18:45:04	Screen_R_190925_982	510.00	6x12	54.2	Shaker	2025-09-19 18:45:21.640067	Angura	Delivered	Parthiban	2025-09-24 18:58:02.22271	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 15:35:51	Screen_R_190925_976	571.00	6x12	53.0	Shaker	2025-09-19 15:36:11.479503	Angura	Delivered	Parthiban	2025-09-24 18:57:57.418584	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 23:34:29	Screen_R_190925_989	576.00	6x12	58.8	Shaker	2025-09-19 23:34:41.097476	Ramesh	Delivered	admin	2025-09-22 13:52:23.579744	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 07:53:33	Screen_R_200925_998	565.00	6x12	56.6	Shaker	2025-09-20 07:53:45.565737	Ramesh	Delivered	admin	2025-09-22 13:52:47.43597	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 10:05:26	Screen_R_200925_001	560.00	6x12	58.0	Shaker	2025-09-20 10:05:37.483619	Angura	Delivered	Parthiban	2025-09-24 18:59:05.598372	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 03:24:09	Screen_R_200925_995	539.00	6x12	57.2	Shaker	2025-09-20 03:24:21.147957	Ramesh	Delivered	admin	2025-09-22 14:03:50.452694	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 17:40:04	Screen_R_190925_978	225.00	6x12	55	Shaker	2025-09-19 17:40:54.917948	Angura	Delivered	admin	2025-09-22 14:02:12.280031	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 02:35:50	Screen_S_200925_994	520.00	8x30	57.4	Shaker	2025-09-20 02:36:04.369123	Ramesh	Delivered	admin	2025-09-22 14:26:34.089955	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 01:51:01	Screen_R_200925_992	577.00	6x12	55.6	Shaker	2025-09-20 01:51:12.944019	Ramesh	Delivered	admin	2025-09-20 10:53:38.241082	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 08:52:04	Screen_S_200925_999	543.00	8x30	60.4	Shaker	2025-09-20 08:52:16.018027	Angura	Delivered	Parthiban	2025-10-02 11:10:12.847165	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 06:24:35	Screen_R_190925_966	578.00	6x12	61.4	Shaker	2025-09-19 06:24:47.439362	Ramesh	Delivered	Parthiban	2025-09-24 18:57:47.497437	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 19:01:47	Screen_S_190925_983	415.00	8x30	55	Shaker	2025-09-19 19:02:08.662642	Angura	Delivered	admin	2025-09-22 14:26:20.288463	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 23:42:46	Screen_R_190925_990	569.00	6x12	55.4	Shaker	2025-09-19 23:42:59.48048	Ramesh	Delivered	admin	2025-09-20 10:53:20.65663	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 11:51:08	Screen_S_200925_004	579.00	8x30	59.2	Shaker	2025-09-20 11:54:19.343676	Angura	Delivered	Parthiban	2025-10-02 11:09:17.550169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 14:55:32	Screen_R_200925_006	528.00	6x12	60.1	Shaker	2025-09-20 14:55:47.086634	Angura	Delivered	Parthiban	2025-09-24 18:59:17.112767	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 19:01:47	Screen_V_190925_984	65.00	-30	10	Shaker	2025-09-19 19:02:28.994233	Angura	Delivered	admin	2025-09-22 15:18:20.626056	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 14:30:31	Screen_S_200925_005	542.00	8x30	63.3	Shaker	2025-09-20 14:30:56.708589	Angura	Delivered	Parthiban	2025-10-16 12:21:07.630578	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 15:00:26	Screen_R_200925_007	560.00	6x12	59.9	Shaker	2025-09-20 15:00:37.321614	Angura	Delivered	Parthiban	2025-09-24 18:59:23.490573	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 16:47:10	Screen_R_200925_008	516.00	6x12	56.2	Shaker	2025-09-20 16:47:23.079053	Angura	Delivered	Parthiban	2025-09-24 18:59:28.150488	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 02:11:05	Screen_S_200925_993	564.00	8x30	56.7	Shaker	2025-09-20 02:11:23.798634	Ramesh	Delivered	Parthiban	2025-10-02 11:10:04.467948	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 07:25:30	Screen_R_200925_996	565.00	6x12	62.5	Shaker	2025-09-20 07:25:40.96305	Ramesh	Delivered	Parthiban	2025-09-24 18:59:48.141274	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 02:58:11	Screen_R_190925_965	560.00	6x12	64.0	Shaker	2025-09-19 02:58:22.046676	Ramesh	Delivered	Parthiban	2025-09-21 18:22:00.252033	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 17:40:04	Screen_V_190925_979	194.00	-30	10	Shaker	2025-09-19 17:41:23.560161	Angura	Delivered	admin	2025-09-22 15:18:10.620339	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 19:01:47	Screen_190925_986	30.00	+4	50	Shaker	2025-09-19 19:03:08.05894	Angura	Delivered	admin	2025-09-22 15:34:27.390474	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 19:01:47	Screen_190925_985	230.00	4x8	55	Shaker	2025-09-19 19:02:53.62101	Angura	Delivered	admin	2025-09-22 15:35:59.738663	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 17:40:04	Screen_190925_980	160.00	4x8	55	Shaker	2025-09-19 17:41:39.694573	Angura	Delivered	admin	2025-09-22 15:35:54.12248	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 21:48:34	Screen_R_200925_012	551.00	6x12	57.5	Shaker	2025-09-20 21:48:45.590476	Ramesh	Delivered	Parthiban	2025-09-24 18:59:36.935462	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 02:59:03	Screen_S_210925_016	550.00	8x30	59.7	Shaker	2025-09-21 02:59:18.621866	Ramesh	Delivered	Parthiban	2025-10-02 11:11:10.539824	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 00:47:15	Screen_R_210925_014	575.00	6x12	53.2	Shaker	2025-09-21 00:47:27.634342	Ramesh	Delivered	Parthiban	2025-09-24 18:59:53.81052	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 02:44:56	Screen_R_210925_015	553.00	6x12	58.1	Shaker	2025-09-21 02:45:06.502157	Ramesh	Delivered	Parthiban	2025-09-24 18:59:59.655267	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 08:32:35	Screen_R_210925_018	548.00	6x12	57.7	Shaker	2025-09-21 08:32:47.970376	Ramesh	Delivered	Parthiban	2025-09-24 19:00:03.810714	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 01:56:13	Screen_R_170925_931	564.00	6x12	52.9	Shaker	2025-09-17 01:56:25.750851	Ramesh	Delivered	Parthiban	2025-09-21 18:19:56.187899	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 04:03:26	Screen_R_170925_933	581.00	6x12	52.7	Shaker	2025-09-17 04:03:40.143162	Ramesh	Delivered	Parthiban	2025-09-21 18:19:59.687454	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 11:08:11	Screen_R_180925_938	530.00	6x12	62.6	Shaker	2025-09-18 11:08:22.417038	Angura	Delivered	Parthiban	2025-09-21 18:20:10.88872	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 08:00:10	Screen_R_190925_968	544.00	6x12	64.8	Shaker	2025-09-19 08:00:24.286954	Ramesh	Delivered	Parthiban	2025-09-21 18:22:36.564042	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-16 12:30:02	Screen_S_160925_920	569.00	8x30	62.0	Shaker	2025-09-16 12:30:12.8344	Angura	Delivered	Parthiban	2025-09-21 18:26:02.460874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 01:41:48	Screen_S_170925_929	572.00	8x30	52.8	Shaker	2025-09-17 01:42:06.265951	Ramesh	Delivered	Parthiban	2025-09-21 18:26:15.49925	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-17 07:53:15	Screen_S_170925_934	571.00	8x30	54.0	Shaker	2025-09-17 07:53:30.932215	Ramesh	Delivered	Parthiban	2025-09-21 18:26:19.954438	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 07:39:20	Screen_S_190925_967	537.00	8x30	61.6	Shaker	2025-09-19 07:39:32.17954	Ramesh	Delivered	Parthiban	2025-09-21 18:26:53.899145	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-19 23:17:49	Screen_S_190925_988	555.00	8x30	62.0	Shaker	2025-09-19 23:18:09.961993	Ramesh	Delivered	Parthiban	2025-09-21 18:27:21.271134	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 08:28:35	Screen_S_210925_017	529.00	8x30	57.1	Shaker	2025-09-21 08:28:47.378774	Ramesh	Delivered	Parthiban	2025-10-02 11:11:18.57716	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 10:23:33	Screen_S_210925_020	553.00	8x30	56.6	Shaker	2025-09-21 10:23:51.639064	Ramesh	Delivered	Parthiban	2025-10-02 11:11:34.345569	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 09:33:25	Screen_R_210925_019	557.00	6x12	56.3	Shaker	2025-09-21 09:33:35.790957	Ramesh	Delivered	Parthiban	2025-09-24 19:00:08.3505	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 12:02:09	Screen_R_210925_021	525.00	6x12	59.1	Shaker	2025-09-21 12:02:24.450521	Ramesh	Delivered	Parthiban	2025-09-24 19:00:12.730434	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 17:32:38	Screen_S_210925_025	570.00	8x30	59.2	Shaker	2025-09-21 17:32:58.296588	Ramesh	Delivered	Parthiban	2025-10-02 11:11:40.477485	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 15:29:36	Screen_R_210925_023	557.00	6x12	60.3	Shaker	2025-09-21 15:29:51.018172	Ramesh	Delivered	Parthiban	2025-09-24 19:00:24.44574	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 17:20:38	Screen_R_210925_024	537.00	6x12	58.1	Shaker	2025-09-21 17:20:50.027809	Ramesh	Delivered	Parthiban	2025-09-24 19:00:29.1305	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 19:34:39	Screen_R_210925_028	560.00	6x12	56.4	Shaker	2025-09-21 19:34:51.04714	Ramesh	Delivered	Parthiban	2025-09-24 19:00:32.535197	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 21:58:34	Screen_R_210925_029	592.00	6x12	56	Shaker	2025-09-21 21:58:46.303386	Angura	Delivered	Parthiban	2025-09-24 19:00:36.765518	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 19:25:45	Screen_S_210925_027	566.00	8x30	57.6	Shaker	2025-09-21 19:25:58.479192	Ramesh	Delivered	Parthiban	2025-10-02 11:11:53.289215	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 22:34:13	Screen_S_210925_030	558.00	8x30	57.6	Shaker	2025-09-21 22:34:26.95128	Angura	Delivered	Parthiban	2025-10-02 11:11:58.369717	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 00:44:30	Screen_S_220925_032	540.00	8x30	59.3	Shaker	2025-09-22 00:44:42.936583	Angura	Delivered	Parthiban	2025-10-02 11:12:04.936426	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 00:23:22	Screen_R_220925_031	521.00	6x12	57.6	Shaker	2025-09-22 00:23:34.065997	Angura	Delivered	Parthiban	2025-09-24 19:00:40.431065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 02:46:04	Screen_R_220925_034	523.00	6x12	61.3	Shaker	2025-09-22 02:46:18.780543	Angura	Delivered	Parthiban	2025-09-24 19:00:47.735377	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 03:10:55	Screen_S_220925_035	554.00	8x30	58.8	Shaker	2025-09-22 03:11:07.171776	Angura	Delivered	Parthiban	2025-10-02 11:12:11.584022	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-12 01:36:27	Screen_R_120925_819	552.00	6x12	51.4	Shaker	2025-09-12 01:36:45.310299	Angura	Screening	Thiruppathi	2025-09-22 08:08:14.731078	loaded	2025-09-22 08:08:21	Thiruppathi	\N	552.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-20 07:37:20	Screen_S_200925_997	574.00	8x30	58.8	Shaker	2025-09-20 07:37:42.025127	Ramesh	Delivered	admin	2025-09-22 14:26:43.635682	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 07:41:27	Screen_R_220925_036	510.00	6x12	59.8	Shaker	2025-09-22 07:41:48.194078	Angura	Delivered	Parthiban	2025-09-24 19:00:51.340427	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 11:47:46	Screen_S_220925_038	569.00	8x30	61.2	Shaker	2025-09-22 11:47:56.489787	Ramesh	Delivered	Parthiban	2025-10-02 11:12:20.59727	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 11:23:17	Screen_R_220925_037	556.00	6x12	62.3	Shaker	2025-09-22 11:23:40.165599	Ramesh	Delivered	Parthiban	2025-09-24 19:00:55.34544	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 18:12:12	Screen_S_220925_042	567.00	8x30	62.1	Shaker	2025-09-22 18:12:24.972228	Ramesh	Delivered	Parthiban	2025-10-02 11:12:33.184451	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 12:31:09	Screen_R_220925_040	530.00	6x12	59.7	Shaker	2025-09-22 12:31:19.299205	Ramesh	Delivered	Parthiban	2025-09-24 19:00:59.810479	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 17:52:23	Screen_R_220925_041	552.00	6x12	62.6	Shaker	2025-09-22 17:52:57.788304	Ramesh	Delivered	Parthiban	2025-09-24 19:01:03.435455	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 23:35:54	Screen_V_200925_013	541.00	-30	51.3	Shaker	2025-09-20 23:36:10.510941	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 19:24:18	Screen_V_180925_960	104.00	-30	10	Shaker	2025-09-18 19:25:55.406407	Angura	Delivered	admin	2025-09-22 15:17:59.788675	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-28 16:50:59	Screen_V_280825_543	585.00	-30	52.0	Shaker	2025-08-28 16:51:15.180625	Ramesh	Delivered	admin	2025-09-22 15:18:34.144195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-22 16:32:55	Screen_P_220825_390	549.00	12x30	55	Shaker	2025-08-22 16:33:45.657888	Angura	Delivered	admin	2025-09-22 15:46:25.857714	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-08-25 12:12:41	Screen_L_250825_461	521.00	8x16	55	Shaker	2025-08-25 12:12:52.964224	Ramesh	Delivered	admin	2025-09-22 16:06:11.60899	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 21:45:28	Screen_R_220925_045	535.00	6x12	64.5	Shaker	2025-09-22 21:45:42.436909	Angura	Delivered	Parthiban	2025-09-24 19:01:11.970478	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 22:16:58	Screen_S_220925_046	580.00	8x30	62.3	Shaker	2025-09-22 22:17:13.805978	Angura	Delivered	Parthiban	2025-10-02 11:12:39.304143	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 01:03:50	Screen_R_230925_048	546.00	6x12	66.3	Shaker	2025-09-23 01:04:00.026341	Angura	Delivered	Parthiban	2025-10-04 19:47:57.230204	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 01:03:50	Screen_R_230925_049	545.00	6x12	60.8	Shaker	2025-09-23 01:12:30.314366	Angura	Delivered	Parthiban	2025-09-24 19:01:19.570712	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 02:14:11	Screen_R_230925_050	567.00	6x12	60.4	Shaker	2025-09-23 02:14:20.099079	Angura	Delivered	Parthiban	2025-09-24 19:01:23.805721	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 07:24:47	Screen_S_230925_052	515.00	8x30	67.5	Shaker	2025-09-23 07:27:19.965038	Angura	Delivered	Parthiban	2025-10-22 18:21:39.621752	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 07:24:47	Screen_R_230925_053	545.00	6x12	61.0	Shaker	2025-09-23 07:40:25.301611	Angura	Delivered	Parthiban	2025-09-24 19:01:27.330902	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 08:22:16	Screen_R_230925_054	506.00	6x12	63.5	Shaker	2025-09-23 08:23:04.865762	Ramesh	Delivered	Parthiban	2025-09-24 19:01:31.180808	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 20:30:18	Screen_S_200925_011	552.00	8x30	59.8	Shaker	2025-09-20 20:30:38.563218	Ramesh	Delivered	Parthiban	2025-10-02 11:09:27.241678	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 18:22:26	Screen_R_200925_010	574.00	6x12	54.7	Shaker	2025-09-20 18:22:37.511476	Angura	Delivered	Parthiban	2025-09-24 18:59:32.450461	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 11:51:08	Screen_R_200925_003	562.00	6x12	50.6	Shaker	2025-09-20 11:51:22.619222	Angura	Screening	Parthiban	2025-09-23 17:43:34.334966	loaded	2025-09-23 17:43:38	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12","8x30"}
2025-09-24 07:17:26	Screen_R_240925_070	514.00	6x12	61.4	Shaker	2025-09-24 07:17:43.168692	Angura	Delivered	Parthiban	2025-09-24 19:02:24.977558	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 06:15:23	Screen_S_250925_086	541.00	8x30	58.3	Shaker	2025-09-25 06:15:36.229027	Angura	Delivered	Parthiban	2025-10-09 09:51:33.486039	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 12:44:07	Screen_S_240925_073	581.00	8x30	64.0	Shaker	2025-09-24 12:44:24.547202	Ramesh	Delivered	Parthiban	2025-10-22 18:21:48.491836	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 22:25:02	Screen_S_230925_065	549.00	8x30	62.4	Shaker	2025-09-23 22:25:14.193486	Angura	Delivered	Parthiban	2025-10-02 11:13:14.058509	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 02:36:48	Screen_S_240925_069	550.00	8x30	62.2	Shaker	2025-09-24 02:37:16.386355	Angura	Delivered	Parthiban	2025-10-02 11:13:18.682727	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 00:40:02	Screen_S_240925_067	534.00	8x30	66.2	Shaker	2025-09-24 00:40:15.812838	Angura	Delivered	Parthiban	2025-10-02 11:13:27.257684	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 17:45:55	Screen_S_240925_075	510.00	8x30	64.3	Shaker	2025-09-24 17:46:05.826436	Ramesh	Delivered	Parthiban	2025-10-02 11:13:40.780545	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 22:20:40	Screen_S_240925_082	541.00	8x30	61.5	Shaker	2025-09-24 22:20:53.968765	Angura	Delivered	Parthiban	2025-10-02 11:14:07.814462	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 20:42:39	Screen_R_240925_080	554.00	6x12	61	Shaker	2025-09-24 20:42:54.15241	Angura	Delivered	Parthiban	2025-10-09 10:24:11.978738	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 17:41:30	Screen_S_250925_093	594.00	8x30	63.6	Shaker	2025-09-25 17:41:41.272743	Ramesh	Delivered	Parthiban	2025-10-22 18:21:56.906571	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 15:08:56	Screen_R_250925_091	565.00	6x12	55.1	Shaker	2025-09-25 15:09:06.193355	Ramesh	Delivered	Parthiban	2025-09-28 16:36:48.943453	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 11:32:31	Screen_R_200925_002	562.00	6x12	59.1	Shaker	2025-09-20 11:32:45.739505	admin	Delivered	Parthiban	2025-09-24 18:59:11.937442	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 00:46:23	Screen_R_200925_991	553.00	6x12	51.7	Shaker	2025-09-20 00:46:34.726776	Ramesh	Delivered	Parthiban	2025-09-24 18:59:43.640952	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 14:56:16	Screen_R_210925_022	554.00	6x12	59.1	Shaker	2025-09-21 14:56:30.736446	Ramesh	Delivered	Parthiban	2025-09-24 19:00:17.670528	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 01:29:07	Screen_R_220925_033	561.00	6x12	57.9	Shaker	2025-09-22 01:29:27.143375	Angura	Delivered	Parthiban	2025-09-24 19:00:44.175347	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 19:12:41	Screen_R_220925_043	557.00	6x12	63.1	Shaker	2025-09-22 19:13:02.862124	Ramesh	Delivered	Parthiban	2025-09-24 19:01:08.130393	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 12:38:41	Screen_R_230925_056	537.00	6x12	61.7	Shaker	2025-09-23 12:38:56.685225	Ramesh	Delivered	Parthiban	2025-09-24 19:01:36.796103	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 15:13:19	Screen_R_230925_059	544.00	6x12	60.0	Shaker	2025-09-23 15:13:31.125543	Ramesh	Delivered	Parthiban	2025-09-24 19:01:45.825739	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 16:24:05	Screen_R_230925_060	535.00	6x12	59.8	Shaker	2025-09-23 16:24:14.618852	Ramesh	Delivered	Parthiban	2025-09-24 19:01:52.077614	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 17:26:04	Screen_R_230925_062	565.00	6x12	62.5	Shaker	2025-09-23 17:26:14.498546	Ramesh	Delivered	Parthiban	2025-09-24 19:02:02.032746	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 21:08:54	Screen_R_230925_064	531.00	6x12	62.6	Shaker	2025-09-23 21:09:35.830302	Angura	Delivered	Parthiban	2025-09-24 19:02:07.010627	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 23:46:20	Screen_R_230925_066	563.00	6x12	60.7	Shaker	2025-09-23 23:46:36.199842	Angura	Delivered	Parthiban	2025-09-24 19:02:12.135135	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 01:30:43	Screen_R_240925_068	533.00	6x12	60.8	Shaker	2025-09-24 01:30:53.963497	Angura	Delivered	Parthiban	2025-09-24 19:02:18.27744	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 00:20:38	Screen_S_250925_083	531.00	8x30	63	Shaker	2025-09-25 00:20:56.985748	Angura	Delivered	Parthiban	2025-10-02 11:14:13.709859	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 17:58:42	Screen_R_240925_077	537.00	6x12	66.4	Shaker	2025-09-24 17:58:55.742072	Ramesh	Delivered	Parthiban	2025-10-04 19:49:15.966592	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 02:54:53	Screen_R_250925_085	556.00	6x12	60.1	Shaker	2025-09-25 02:55:12.996879	Angura	Delivered	Parthiban	2025-10-04 19:49:28.973057	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 18:07:00	Screen_V_240925_078	534.00	-30	65.7	Shaker	2025-09-24 18:07:18.255605	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 11:25:48	Screen_S_250925_089	541.00	8x30	63.4	Shaker	2025-09-25 11:25:59.95561	Ramesh	Delivered	Parthiban	2025-10-02 11:14:19.849208	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 11:05:51	Screen_S_240925_072	560.00	8x30	63.5	Shaker	2025-09-24 11:06:05.619144	Ramesh	Delivered	Parthiban	2025-10-16 12:21:11.683849	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 07:47:47	Screen_R_250925_087	555.00	6x12	55.4	Shaker	2025-09-25 07:48:12.652448	Angura	Delivered	Parthiban	2025-10-04 19:49:35.277011	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 14:42:45	Screen_S_250925_090	584.00	8x30	61.8	Shaker	2025-09-25 14:42:56.044809	Ramesh	Delivered	Parthiban	2025-10-02 11:14:24.559531	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 17:42:09	Screen_S_250925_094	492.00	8x30	61.6	Shaker	2025-09-25 17:42:22.196103	Ramesh	Delivered	Parthiban	2025-10-02 11:14:32.451927	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 10:50:52	Screen_R_240925_071	575.00	6x12	59.8	Shaker	2025-09-24 10:51:05.751314	Ramesh	Delivered	Parthiban	2025-10-09 10:24:00.944461	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 22:12:43	Screen_R_250925_097	566.00	6x12	59.0	Shaker	2025-09-25 22:13:01.155244	Angura	Delivered	Parthiban	2025-10-04 19:49:39.652235	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 10:56:03	Screen_R_250925_088	509.00	6x12	55.7	Shaker	2025-09-25 10:56:15.01469	Ramesh	Delivered	Parthiban	2025-10-09 10:21:57.175998	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 14:23:24	Screen_S_230925_057	580.00	8x30	66.4	Shaker	2025-09-23 14:23:34.39704	Ramesh	Delivered	Parthiban	2025-10-09 09:51:21.466566	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 00:20:38	Screen_R_250925_084	532.00	6x12	60.8	Shaker	2025-09-25 00:23:14.494838	Angura	Delivered	Parthiban	2025-10-09 10:22:17.679489	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 00:46:46	Screen_S_260925_099	575.00	8x30	60.4	Shaker	2025-09-26 00:47:03.886674	Angura	Delivered	Parthiban	2025-10-02 11:15:08.5374	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 07:24:24	Screen_S_260925_103	527.00	8x30	56.6	Shaker	2025-09-26 07:24:50.778445	Angura	Delivered	Parthiban	2025-10-02 11:15:21.832277	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 16:39:53	Screen_R_250925_092	533.00	6x12	56.7	Shaker	2025-09-25 16:40:04.472308	Ramesh	Delivered	Parthiban	2025-09-28 16:36:54.348642	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 18:20:15	Screen_R_250925_095	561.00	6x12	57.4	Shaker	2025-09-25 18:20:25.207226	Ramesh	Delivered	Parthiban	2025-09-28 16:37:01.736898	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 07:05:32	Screen_V_260925_102	535.00	-30	58.8	Shaker	2025-09-26 07:05:53.883842	Angura	Screening	Parthiban	2025-11-11 10:25:38.273755	loaded	2025-11-11 10:26:33	Parthiban	\N	534.00	\N	\N	gyro	{"30x60"}
2025-09-26 12:10:02	Screen_S_260925_106	538.00	8x30	55.4	Shaker	2025-09-26 12:10:13.65128	Ramesh	Delivered	Parthiban	2025-10-02 11:15:28.014355	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 02:24:51	Screen_R_260925_101	535.00	6x12	56.4	Shaker	2025-09-26 02:25:06.117161	Angura	Delivered	Parthiban	2025-09-28 16:37:15.85244	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 17:51:49	Screen_R_240925_076	542.00	6x12	67	Shaker	2025-09-24 17:52:07.023423	Ramesh	Delivered	Parthiban	2025-10-04 19:48:03.511907	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 07:35:35	Screen_R_260925_104	559.00	6x12	51.6	Shaker	2025-09-26 07:36:59.352963	Angura	Delivered	Parthiban	2025-09-28 16:37:24.676474	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 15:04:50	Screen_R_260925_108	559.00	6x12	51.2	Shaker	2025-09-26 15:05:37.727609	Ramesh	Delivered	Parthiban	2025-09-28 16:37:35.783684	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 16:51:22	Screen_R_260925_109	562.00	6x12	52.2	Shaker	2025-09-26 16:51:36.600652	Ramesh	Delivered	Parthiban	2025-09-28 16:37:41.736789	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 00:28:59	Screen_S_230925_047	527.00	8x30	64.1	Shaker	2025-09-23 00:29:12.03025	Angura	Delivered	Parthiban	2025-10-02 11:12:46.061972	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 06:07:48	Screen_S_230925_051	563.00	8x30	57.7	Shaker	2025-09-23 06:08:13.96018	Angura	Delivered	Parthiban	2025-10-02 11:12:50.912264	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 16:48:21	Screen_S_230925_061	578.00	8x30	60.8	Shaker	2025-09-23 16:48:32.027779	Ramesh	Delivered	Parthiban	2025-10-02 11:12:58.852484	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 19:26:03	Screen_S_280925_143	563.00	8x30	59.8	Shaker	2025-09-28 19:26:20.894706	Angura	Delivered	Parthiban	2025-10-09 09:51:57.201432	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 01:08:05	Screen_S_270925_114	585.00	8x30	55.3	Shaker	2025-09-27 01:08:18.170465	Angura	Delivered	Parthiban	2025-10-02 11:15:54.767216	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 10:45:05	Screen_S_270925_120	552.00	8x30	60.2	Shaker	2025-09-27 10:45:16.322038	Ramesh	Delivered	Parthiban	2025-10-02 11:15:59.639076	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 19:29:01	Screen_R_280925_144	548.00	6x12	58.5	Shaker	2025-09-28 19:32:00.58837	Angura	Delivered	Parthiban	2025-10-04 19:49:50.820822	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 15:00:53	Screen_S_270925_124	515.00	8x30	64.5	Shaker	2025-09-27 15:01:04.473467	Ramesh	Delivered	Parthiban	2025-10-09 09:52:04.582146	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 06:41:53	Screen_S_270925_117	536.00	8x30	52.0	Shaker	2025-09-27 06:42:07.937201	Angura	Screening	Parthiban	2025-10-24 11:48:11.120129	loaded	2025-10-24 11:48:47	Ramesh	\N	550.00	\N	\N	Shaker	{"6x12","8x16","12x20"}
2025-09-27 19:00:33	Screen_R_270925_127	563.00	6x12	59.2	Shaker	2025-09-27 19:00:43.248525	Ramesh	Delivered	Parthiban	2025-10-04 19:50:10.927185	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 01:11:32	Screen_R_280925_131	552.00	6x12	63.5	Shaker	2025-09-28 01:11:45.172425	Angura	Delivered	Parthiban	2025-10-04 19:50:14.896773	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 12:13:52	Screen_S_270925_121	543.00	8x30	56.0	Shaker	2025-09-27 12:14:02.594176	Ramesh	Delivered	Parthiban	2025-10-02 11:16:05.762009	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 23:25:12	Screen_S_270925_129	538.00	8x30	59.5	Shaker	2025-09-27 23:25:22.282195	Angura	Delivered	Parthiban	2025-10-02 11:18:17.062703	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 02:04:00	Screen_S_280925_132	521.00	8x30	64.0	Shaker	2025-09-28 02:04:15.669914	Angura	Delivered	Parthiban	2025-10-09 09:52:11.239829	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 07:19:48	Screen_S_280925_134	561.00	8x30	58.2	Shaker	2025-09-28 07:20:15.434062	Angura	Delivered	Parthiban	2025-10-02 11:18:24.692301	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 14:34:54	Screen_R_280925_139	558.00	6x12	59.5	Shaker	2025-09-28 14:35:32.118654	Angura	Delivered	Parthiban	2025-10-04 19:50:19.866857	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 23:14:58	Screen_S_280925_146	553.00	8x30	57.9	Shaker	2025-09-28 23:15:08.762767	Ramesh	Delivered	Parthiban	2025-10-02 11:18:36.677397	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 14:56:42	Screen_R_280925_140	527.00	6x12	57.9	Shaker	2025-09-28 14:56:53.548909	Angura	Delivered	Parthiban	2025-10-04 19:50:25.545815	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 03:26:02	Screen_S_290925_149	567.00	8x30	61.2	Shaker	2025-09-29 03:26:13.962326	Ramesh	Delivered	Parthiban	2025-10-09 09:52:19.447908	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 16:38:55	Screen_S_280925_141	549.00	8x30	59.1	Shaker	2025-09-28 16:39:17.743499	Angura	Delivered	Parthiban	2025-10-09 09:51:51.295908	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 10:49:45	Screen_R_230925_055	524.00	6x12	66.3	Shaker	2025-09-23 10:50:00.397044	Ramesh	Delivered	Parthiban	2025-09-28 16:33:46.142775	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 17:45:59	Screen_R_280925_142	574.00	6x12	61.4	Shaker	2025-09-28 17:46:33.470762	Angura	Delivered	Parthiban	2025-10-04 19:49:46.150849	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 01:39:03	Screen_R_290925_148	545.00	6x12	59.6	Shaker	2025-09-29 01:39:16.134127	Ramesh	Delivered	Parthiban	2025-10-04 19:50:30.425843	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 15:33:33	Screen_S_290925_156	581.00	8x30	65.3	Shaker	2025-09-29 15:33:49.694984	Angura	Delivered	Parthiban	2025-10-09 09:52:33.659089	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 22:31:57	Screen_S_290925_162	559.00	8x30	63.0	Shaker	2025-09-29 22:32:09.25511	Ramesh	Delivered	Parthiban	2025-10-16 12:41:26.06231	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 18:04:42	Screen_S_290925_158	522.00	8x30	60.6	Shaker	2025-09-29 18:04:55.51859	Angura	Delivered	Parthiban	2025-10-09 09:52:40.260174	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 09:06:56	Screen_R_290925_153	554.00	6x12	64.1	Shaker	2025-09-29 09:07:05.884166	Angura	Delivered	Parthiban	2025-10-04 19:50:39.115671	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 12:49:49	Screen_R_240925_074	558.00	6x12	61.8	Shaker	2025-09-24 12:50:11.322161	Ramesh	Delivered	Parthiban	2025-09-28 16:35:56.116871	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 00:33:54	Screen_R_260925_098	510.00	6x12	60.7	Shaker	2025-09-26 00:34:05.76406	Angura	Delivered	Parthiban	2025-09-28 16:37:08.321618	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 12:00:23	Screen_R_260925_105	552.00	6x12	52.1	Shaker	2025-09-26 12:01:03.404478	Ramesh	Delivered	Parthiban	2025-09-28 16:37:30.993917	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 18:57:57	Screen_R_260925_111	559.00	6x12	51.4	Shaker	2025-09-26 18:58:17.251028	Ramesh	Delivered	Parthiban	2025-09-28 16:37:46.392075	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 23:07:04	Screen_R_260925_112	569.00	6x12	53.5	Shaker	2025-09-26 23:07:18.11994	Angura	Delivered	Parthiban	2025-09-28 16:37:52.177861	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 01:17:52	Screen_R_270925_115	563.00	6x12	54.7	Shaker	2025-09-27 01:18:04.26838	Angura	Delivered	Parthiban	2025-09-28 16:37:56.817793	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 02:35:44	Screen_R_270925_116	534.00	6x12	56.2	Shaker	2025-09-27 02:36:05.147919	Angura	Delivered	Parthiban	2025-09-28 16:38:15.203228	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 07:41:44	Screen_R_270925_118	570.00	6x12	56.5	Shaker	2025-09-27 07:41:55.085311	Angura	Delivered	Parthiban	2025-09-28 16:38:21.295286	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 12:13:52	Screen_R_270925_122	537.00	6x12	58.5	Shaker	2025-09-27 12:14:20.719512	Ramesh	Delivered	Parthiban	2025-09-28 16:38:31.621641	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 14:42:19	Screen_R_270925_123	544.00	6x12	55.1	Shaker	2025-09-27 14:42:28.658427	Ramesh	Delivered	Parthiban	2025-09-28 16:38:35.481556	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 16:39:36	Screen_R_270925_125	554.00	6x12	57.0	Shaker	2025-09-27 16:39:51.002318	Ramesh	Delivered	Parthiban	2025-09-28 16:38:40.351654	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 22:28:48	Screen_R_270925_128	517.00	6x12	56.5	Shaker	2025-09-27 22:28:59.426808	Angura	Delivered	Parthiban	2025-09-28 16:38:47.433554	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 02:24:20	Screen_R_280925_133	548.00	6x12	57.0	Shaker	2025-09-28 02:24:42.668913	Angura	Delivered	Parthiban	2025-09-28 16:38:54.912596	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 11:53:06	Screen_R_280925_136	584.00	6x12	60.5	Shaker	2025-09-28 11:53:37.075775	Angura	Delivered	Parthiban	2025-09-28 16:40:11.198731	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 07:24:16	Screen_R_280925_135	565.00	6x12	56.9	Shaker	2025-09-28 07:24:36.706545	Angura	Delivered	Parthiban	2025-09-28 16:40:36.125968	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 12:06:28	Screen_R_290925_155	561.00	6x12	60.8	Shaker	2025-09-29 12:07:17.220302	Angura	Delivered	Parthiban	2025-10-04 19:50:45.291958	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 18:32:19	Screen_R_290925_159	561.00	6x12	61.2	Shaker	2025-09-29 18:32:56.726571	Angura	Delivered	Parthiban	2025-10-04 19:50:50.436479	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 10:37:28	Screen_S_290925_154	539.00	8x30	60.3	Shaker	2025-09-29 10:37:41.874407	Angura	Delivered	Parthiban	2025-10-22 18:22:19.366258	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 18:32:19	Screen_R_290925_160	552.00	6x12	63.4	Shaker	2025-09-29 18:40:45.099703	Angura	Delivered	Parthiban	2025-10-04 19:50:56.330584	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 11:53:06	Screen_S_280925_137	563.00	8x30	62.3	Shaker	2025-09-28 11:54:00.619723	Angura	Delivered	Parthiban	2025-10-16 12:22:00.970193	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 08:09:28	Screen_V_290925_152	532.00	-30	56	Shaker	2025-09-29 08:09:40.757159	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 02:26:22	Screen_R_300925_165	537.00	6x12	56.8	Shaker	2025-09-30 02:26:46.868593	Ramesh	Delivered	Parthiban	2025-10-04 19:51:01.390828	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 16:38:05	Screen_S_290925_157	561.00	8x30	63.8	Shaker	2025-09-29 16:38:18.2452	Angura	Delivered	Parthiban	2025-10-22 18:23:49.952861	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 01:56:44	Screen_S_300925_164	570.00	8x30	59.4	Shaker	2025-09-30 01:56:55.279976	Ramesh	Delivered	Parthiban	2025-10-09 09:52:49.221255	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 07:44:52	Screen_S_290925_151	571.00	8x30	64.9	Shaker	2025-09-29 07:45:23.158368	Ramesh	Delivered	Parthiban	2025-10-16 12:21:29.810522	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 01:18:31	Screen_S_290925_147	522.00	8x30	63.6	Shaker	2025-09-29 01:18:46.904911	Ramesh	Delivered	Parthiban	2025-10-22 18:22:12.36453	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 23:34:51	Screen_S_260925_113	545.00	8x30	58.3	Shaker	2025-09-26 23:35:03.756984	Angura	Delivered	Parthiban	2025-10-02 11:15:41.342899	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 11:04:55	Screen_R_300925_169	586.00	6x12	61.7	Shaker	2025-09-30 11:05:19.023948	Angura	Delivered	Parthiban	2025-10-04 19:51:19.870337	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 10:10:08	Screen_S_300925_168	549.00	8x30	64.1	Shaker	2025-09-30 10:10:27.110882	Angura	Delivered	Parthiban	2025-10-09 09:53:04.998802	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 12:28:13	Screen_S_300925_171	544.00	8x30	62.9	Shaker	2025-09-30 12:28:41.235353	Angura	Delivered	Parthiban	2025-10-09 09:53:11.475747	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 12:18:20	Screen_R_300925_170	528.00	6x12	63.7	Shaker	2025-09-30 12:18:30.180819	Angura	Delivered	Parthiban	2025-10-04 19:51:23.680579	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 17:58:42	Screen_R_300925_173	554.00	6x12	63.4	Shaker	2025-09-30 17:58:52.236727	Angura	Delivered	Parthiban	2025-10-04 19:51:28.880498	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 19:13:53	Screen_R_021025_208	550.00	6x12	52.2	Shaker	2025-10-02 19:14:08.217675	Angura	Delivered	Parthiban	2025-10-09 10:00:07.357886	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 07:29:24	Screen_011025_184	488.00	4x8	53.9	Shaker	2025-10-01 07:29:35.091976	Ramesh	Screening	Parthiban	2025-10-28 12:09:22.677881	loaded	2025-10-28 12:09:29	Parthiban	\N	488.00	\N	\N	Shaker	{"8x16","12x20"}
2025-09-30 22:19:21	Screen_R_300925_177	552.00	6x12	63.1	Shaker	2025-09-30 22:19:29.871048	Ramesh	Delivered	Parthiban	2025-10-04 19:51:39.606139	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 14:04:37	Screen_S_011025_187	551.00	8x30	67.0	Shaker	2025-10-01 14:05:03.028707	Angura	Delivered	Parthiban	2025-10-22 18:18:13.58178	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 14:13:00	Screen_R_031025_217	568.00	6x12	54.2	Shaker	2025-10-03 14:13:12.715442	Angura	Delivered	Parthiban	2025-10-09 10:00:20.2101	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 07:31:24	Screen_R_300925_166	546.00	6x12	59.4	Shaker	2025-09-30 07:31:34.111382	Ramesh	Delivered	Parthiban	2025-10-04 19:51:15.330457	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 19:08:31	Screen_S_011025_191	570.00	8x30	57.4	Shaker	2025-10-01 19:08:49.58942	Angura	Delivered	Parthiban	2025-10-09 09:46:56.253068	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 15:01:35	Screen_R_021025_203	546.00	6x12	52.3	Shaker	2025-10-02 15:01:46.57641	Angura	Delivered	Parthiban	2025-11-01 09:03:50.601529	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 01:50:46	Screen_S_011025_179	537.00	8x30	52.8	Shaker	2025-10-01 01:51:01.45447	Ramesh	Screening	Parthiban	2025-10-24 11:48:01.942008	loaded	2025-10-24 11:48:47	Ramesh	\N	550.00	\N	\N	Shaker	{"8x16","6x12","12x20"}
2025-10-01 07:10:12	Screen_R_011025_182	552.00	6x12	61.2	Shaker	2025-10-01 07:10:22.123003	Ramesh	Delivered	Parthiban	2025-10-04 19:45:54.352184	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 02:28:39	Screen_011025_181	545.00	4x8	55.7	Shaker	2025-10-01 02:28:52.259687	Ramesh	Screening	Parthiban	2025-10-28 12:09:17.838086	loaded	2025-10-28 12:09:29	Parthiban	\N	545.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-01 17:17:25	Screen_R_011025_188	565.00	6x12	58.4	Shaker	2025-10-01 17:17:50.02091	Angura	Delivered	Parthiban	2025-10-04 19:46:04.611137	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 18:07:59	Screen_S_300925_175	570.00	8x30	62.4	Shaker	2025-09-30 18:08:10.344253	Angura	Delivered	Parthiban	2025-10-16 12:22:30.807752	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 09:34:12	Screen_S_011025_185	552.00	8x30	69.2	Shaker	2025-10-01 09:34:26.983445	Angura	Screening	Thiruppathi	2025-10-26 11:00:11.850105	loaded	2025-10-26 11:00:13	Thiruppathi	\N	550.00	\N	\N	Shaker	{"6x12","8x16","12x20"}
2025-10-01 17:55:30	Screen_R_011025_190	557.00	6x12	52.1	Shaker	2025-10-01 17:56:10.333186	Angura	Delivered	Parthiban	2025-10-04 19:46:08.121076	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 23:46:49	Screen_S_300925_178	570.00	8x30	63.5	Shaker	2025-09-30 23:46:57.184301	Ramesh	Delivered	Parthiban	2025-10-22 18:22:56.067929	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 23:43:18	Screen_R_011025_193	566.00	6x12	52.0	Shaker	2025-10-01 23:43:30.557582	Ramesh	Delivered	Parthiban	2025-10-04 19:46:19.26367	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 01:21:13	Screen_S_021025_195	571.00	8x30	55.8	Shaker	2025-10-02 01:21:29.641991	Ramesh	Delivered	Parthiban	2025-10-09 09:47:03.668467	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 01:12:49	Screen_R_021025_194	551.00	6x12	51.8	Shaker	2025-10-02 01:13:02.981527	Ramesh	Delivered	Parthiban	2025-10-04 19:46:23.247086	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 02:36:55	Screen_S_021025_196	549.00	8x30	54.3	Shaker	2025-10-02 02:37:14.131103	Ramesh	Delivered	Parthiban	2025-10-09 09:47:10.952317	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 02:54:29	Screen_R_021025_197	531.00	6x12	51.7	Shaker	2025-10-02 02:54:40.253129	Ramesh	Delivered	Parthiban	2025-10-04 19:46:26.781408	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 22:47:46	Screen_R_021025_209	519.00	6x12	57.1	Shaker	2025-10-02 22:48:00.200612	Ramesh	Delivered	Parthiban	2025-10-04 19:47:06.506172	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 17:25:49	Screen_S_021025_206	555.00	8x30	58.3	Shaker	2025-10-02 17:26:48.076153	Angura	Delivered	Parthiban	2025-10-09 09:47:18.640519	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-20 16:53:10	Screen_S_200925_009	551.00	8x30	59.3	Shaker	2025-09-20 16:53:24.716895	Angura	Delivered	Parthiban	2025-10-02 11:09:22.463169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-21 17:45:38	Screen_S_210925_026	520.00	8x30	61.9	Shaker	2025-09-21 17:45:55.31546	Ramesh	Delivered	Parthiban	2025-10-02 11:11:47.097023	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 11:59:01	Screen_S_220925_039	525.00	8x30	62.8	Shaker	2025-09-22 11:59:13.945239	Ramesh	Delivered	Parthiban	2025-10-02 11:12:27.076537	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 17:47:18	Screen_S_230925_063	536.00	8x30	63.4	Shaker	2025-09-23 17:47:31.476812	Ramesh	Delivered	Parthiban	2025-10-02 11:13:07.972554	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 19:39:44	Screen_S_240925_079	582.00	8x30	61.3	Shaker	2025-09-24 19:40:06.724243	Ramesh	Delivered	Parthiban	2025-10-02 11:13:45.959125	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-25 19:37:34	Screen_S_250925_096	555.00	8x30	55.6	Shaker	2025-09-25 19:37:46.178852	Ramesh	Delivered	Parthiban	2025-10-02 11:15:01.515581	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 02:16:58	Screen_S_260925_100	529.00	8x30	62.1	Shaker	2025-09-26 02:17:19.295974	Angura	Delivered	Parthiban	2025-10-02 11:15:15.508419	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 18:32:48	Screen_S_270925_126	596.00	8x30	58.5	Shaker	2025-09-27 18:33:00.114042	Ramesh	Delivered	Parthiban	2025-10-02 11:18:10.689987	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 05:29:19	Screen_S_031025_212	537.00	8x30	57.0	Shaker	2025-10-03 05:30:27.09968	Ramesh	Delivered	Parthiban	2025-10-09 09:47:30.160986	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 05:29:19	Screen_R_031025_210	558.00	6x12	58.4	Shaker	2025-10-03 05:29:41.139196	Ramesh	Delivered	Parthiban	2025-10-04 19:47:10.283542	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 03:09:02	Screen_V_021025_198	538.00	-30	52.5	Shaker	2025-10-02 03:09:20.744651	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 06:19:43	Screen_R_031025_214	542.00	6x12	56.4	Shaker	2025-10-03 06:20:14.367932	Ramesh	Delivered	Parthiban	2025-10-04 19:47:14.453108	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 09:00:32	Screen_S_021025_200	565.00	8x30	52.7	Shaker	2025-10-02 09:00:54.665936	Angura	Screening	Thiruppathi	2025-10-25 06:44:21.224786	loaded	2025-10-25 06:44:22	Thiruppathi	\N	550.00	\N	\N	Shaker	{"6x12","8x16","12x20"}
2025-10-02 11:37:19	Screen_R_021025_202	568.00	6x12	48.6	Shaker	2025-10-02 11:37:28.205238	Angura	Delivered	Parthiban	2025-10-12 12:30:52.423083	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 17:32:02	Screen_R_021025_207	547.00	6x12	55.0	Shaker	2025-10-02 17:32:13.629421	Angura	Delivered	Parthiban	2025-10-16 11:54:12.532969	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 14:38:39	Screen_S_031025_218	565.00	8x30	59.9	Shaker	2025-10-03 14:38:53.714885	Angura	Delivered	Parthiban	2025-10-09 09:47:44.872467	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 09:28:22	Screen_R_021025_201	569.00	6x12	48.0	Shaker	2025-10-02 09:28:32.078811	Angura	Delivered	Parthiban	2025-10-12 12:30:47.83923	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 07:33:20	Screen_R_031025_215	566.00	6x12	56.2	Shaker	2025-10-03 07:33:30.438935	Ramesh	Delivered	Parthiban	2025-10-04 19:47:18.318339	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 23:02:47	Screen_R_011025_192	570.00	6x12	52.1	Shaker	2025-10-01 23:02:59.237517	Ramesh	Delivered	Parthiban	2025-10-04 19:47:45.111551	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 14:38:39	Screen_S_031025_219	550.00	8x30	57.1	Shaker	2025-10-03 14:41:33.391308	Angura	Delivered	Parthiban	2025-10-09 09:47:52.080926	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 07:41:23	Screen_S_300925_167	517.00	8x30	57.2	Shaker	2025-09-30 07:41:41.84808	Ramesh	Delivered	Parthiban	2025-10-09 09:52:56.308289	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 02:05:49	Screen_R_011025_180	537.00	6x12	56.0	Shaker	2025-10-01 02:06:07.686529	Ramesh	Delivered	Parthiban	2025-10-04 19:45:46.488171	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 01:56:04	Screen_S_041025_227	580.00	8x30	57.0	Shaker	2025-10-04 01:56:14.776466	Ramesh	Delivered	Parthiban	2025-10-09 09:48:24.562223	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 03:20:14	Screen_R_041025_229	538.00	6x12	54.2	Shaker	2025-10-04 03:20:23.155951	Ramesh	Delivered	Parthiban	2025-10-09 10:00:34.63812	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 20:54:18	Screen_V_031025_222	553.00	-30	56.0	Shaker	2025-10-03 20:54:30.317045	Ramesh	Screening	Thiruppathi	2025-11-17 01:25:25.775958	loaded	2025-11-17 01:25:26	Thiruppathi	\N	553.00	\N	\N	Shaker	{"30x60"}
2025-10-04 07:30:38	Screen_R_041025_230	560.00	6x12	50.3	Shaker	2025-10-04 07:30:46.341546	Ramesh	Delivered	Parthiban	2025-10-09 10:16:27.119249	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 03:06:42	Screen_S_041025_228	531.00	8x30	57.1	Shaker	2025-10-04 03:06:57.064477	Ramesh	Delivered	Parthiban	2025-10-09 09:48:30.687195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 07:59:14	Screen_S_041025_231	573.00	8x30	57.8	Shaker	2025-10-04 07:59:53.57294	Ramesh	Delivered	Parthiban	2025-10-09 09:48:37.820174	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 16:55:17	Screen_S_041025_236	543.00	8x30	57.0	Shaker	2025-10-04 17:09:24.548481	Angura	Delivered	Parthiban	2025-10-09 09:48:44.765344	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 10:03:18	Screen_R_041025_232	577.00	6x12	56.8	Shaker	2025-10-04 10:03:34.650891	Angura	Delivered	Parthiban	2025-10-09 10:16:40.861761	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 16:55:17	Screen_R_041025_233	557.00	6x12	55.3	Shaker	2025-10-04 16:55:29.511091	Angura	Delivered	Parthiban	2025-10-09 10:16:53.764172	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 19:31:45	Screen_S_041025_241	554.00	8x30	56.0	Shaker	2025-10-04 19:31:58.036626	Angura	Delivered	Parthiban	2025-10-09 09:48:57.840679	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 16:55:17	Screen_R_041025_234	535.00	6x12	57.1	Shaker	2025-10-04 16:59:39.966416	Angura	Delivered	Parthiban	2025-10-09 10:17:01.352752	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 11:36:44	Screen_R_011025_186	550.00	6x12	63.1	Shaker	2025-10-01 11:36:57.733073	Angura	Delivered	Parthiban	2025-10-04 19:46:00.436116	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 07:34:21	Screen_R_021025_199	560.00	6x12	49.2	Shaker	2025-10-02 07:34:33.458203	Ramesh	Delivered	Parthiban	2025-10-04 19:46:31.851584	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 22:42:50	Screen_R_031025_223	576.00	6x12	56.3	Shaker	2025-10-03 22:43:06.68291	Ramesh	Delivered	Parthiban	2025-10-04 19:47:24.458154	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 23:44:13	Screen_R_031025_224	548.00	6x12	56.2	Shaker	2025-10-03 23:44:21.515126	Ramesh	Delivered	Parthiban	2025-10-04 19:47:30.841079	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-24 22:11:08	Screen_R_240925_081	562.00	6x12	59.2	Shaker	2025-09-24 22:11:21.656756	Angura	Delivered	Parthiban	2025-10-04 19:49:22.744662	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 10:19:20	Screen_R_270925_119	567.00	6x12	47.2	Shaker	2025-09-27 10:19:30.975086	Ramesh	Delivered	Parthiban	2025-10-04 19:50:06.05378	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 07:44:52	Screen_R_290925_150	529.00	6x12	58.1	Shaker	2025-09-29 07:45:04.519343	Ramesh	Delivered	Parthiban	2025-10-04 19:50:34.090961	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 22:08:38	Screen_R_290925_161	552.00	6x12	57.3	Shaker	2025-09-29 22:08:49.549647	Ramesh	Delivered	Parthiban	2025-10-04 19:51:09.176256	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 23:00:26	Screen_R_280925_145	547.00	6x12	61.5	Shaker	2025-09-28 23:00:35.979829	Ramesh	Delivered	Parthiban	2025-10-04 19:52:02.980242	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 19:18:43	Screen_R_041025_240	538.00	6x12	52.7	Shaker	2025-10-04 19:19:47.150918	Angura	Delivered	Parthiban	2025-10-09 10:17:24.754831	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 23:44:59	Screen_R_041025_244	540.00	6x12	58.4	Shaker	2025-10-04 23:45:11.54334	Ramesh	Delivered	Parthiban	2025-10-09 10:17:34.361942	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 23:57:10	Screen_R_041025_245	544.00	6x12	55.3	Shaker	2025-10-04 23:57:19.515263	Ramesh	Delivered	Parthiban	2025-10-09 10:17:41.304558	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 23:23:05	Screen_S_041025_242	569.00	8x30	57.7	Shaker	2025-10-04 23:23:15.29525	Ramesh	Delivered	Parthiban	2025-10-09 09:49:03.160963	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 02:24:14	Screen_S_051025_247	572.00	8x30	55.5	Shaker	2025-10-05 02:24:30.517307	Ramesh	Delivered	Parthiban	2025-10-22 18:18:37.931604	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 08:40:07	Screen_S_051025_248	567.00	8x30	59.2	Shaker	2025-10-05 08:40:20.397971	Ramesh	Delivered	Parthiban	2025-10-09 09:49:10.408606	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 17:30:21	Screen_S_041025_238	521.00	8x30	55.4	Shaker	2025-10-04 17:32:44.416525	Angura	Delivered	Parthiban	2025-10-22 18:18:25.630065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 02:14:49	Screen_R_051025_246	579.00	6x12	55.0	Shaker	2025-10-05 02:14:57.853065	Ramesh	Delivered	Parthiban	2025-10-09 10:17:49.648489	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 14:42:28	Screen_S_051025_252	533.00	8x30	57.5	Shaker	2025-10-05 14:43:30.832853	Ramesh	Delivered	Parthiban	2025-10-09 09:49:16.598293	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 15:37:28	Screen_S_051025_253	550.00	8x30	54.8	Shaker	2025-10-05 15:37:43.424831	Ramesh	Delivered	Parthiban	2025-10-22 18:18:44.163346	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 09:04:15	Screen_R_051025_249	568.00	6x12	56.0	Shaker	2025-10-05 09:04:26.005976	Ramesh	Delivered	Parthiban	2025-10-09 10:17:59.142782	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 14:42:28	Screen_R_051025_251	527.00	6x12	56.6	Shaker	2025-10-05 14:43:13.012822	Ramesh	Delivered	Parthiban	2025-10-09 10:18:15.620145	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 15:42:53	Screen_R_051025_254	532.00	6x12	53.7	Shaker	2025-10-05 15:43:03.723215	Ramesh	Delivered	Parthiban	2025-10-09 10:18:26.985095	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 23:34:02	Screen_V_041025_243	531.00	-30	54.2	Shaker	2025-10-04 23:34:12.834223	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 19:04:12	Screen_S_051025_258	566.00	8x30	58.7	Shaker	2025-10-05 19:04:24.964067	Ramesh	Delivered	Parthiban	2025-10-09 09:49:24.490343	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 01:31:38	Screen_S_061025_261	559.00	8x30	58.2	Shaker	2025-10-06 01:32:24.696818	Angura	Delivered	Parthiban	2025-10-09 09:49:37.248709	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 17:02:46	Screen_R_051025_255	565.00	6x12	53.6	Shaker	2025-10-05 17:02:56.972147	Ramesh	Delivered	Parthiban	2025-10-09 10:18:32.310932	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 18:13:09	Screen_R_051025_257	555.00	6x12	55.5	Shaker	2025-10-05 18:13:20.333206	Ramesh	Delivered	Parthiban	2025-10-09 10:18:40.980278	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 21:34:59	Screen_R_051025_259	555.00	6x12	58.2	Shaker	2025-10-05 21:35:16.795067	Angura	Delivered	Parthiban	2025-10-09 10:18:47.14545	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 07:35:23	Screen_S_061025_265	552.00	8x30	61.3	Shaker	2025-10-06 07:35:33.647795	Angura	Delivered	Parthiban	2025-10-09 09:49:44.110881	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 17:08:56	Screen_S_051025_256	550.00	8x30	54.1	Shaker	2025-10-05 17:09:06.548244	Ramesh	Delivered	Parthiban	2025-10-22 18:18:59.311004	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 02:04:09	Screen_R_061025_263	520.00	6x12	62.6	Shaker	2025-10-06 02:04:20.328404	Angura	Delivered	Parthiban	2025-10-09 10:19:00.588493	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 07:06:35	Screen_R_061025_264	540.00	6x12	63.0	Shaker	2025-10-06 07:06:47.896457	Angura	Delivered	Parthiban	2025-10-09 10:19:08.69684	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 17:03:08	Screen_S_061025_272	510.00	8x30	67.9	Shaker	2025-10-06 17:03:40.274071	Ramesh	Delivered	Parthiban	2025-10-22 18:19:03.038324	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 12:00:29	Screen_R_061025_266	571.00	6x12	61.6	Shaker	2025-10-06 12:00:45.612007	Ramesh	Delivered	Parthiban	2025-10-09 10:19:16.32065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 16:52:03	Screen_S_061025_271	583.00	8x30	57.5	Shaker	2025-10-06 16:52:23.356684	Ramesh	Delivered	Parthiban	2025-10-09 09:49:51.482322	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 12:05:46	Screen_R_061025_267	547.00	6x12	63.0	Shaker	2025-10-06 12:05:56.600262	Ramesh	Delivered	Parthiban	2025-10-09 10:19:24.118547	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 10:51:48	Screen_R_031025_216	570.00	6x12	55.0	Shaker	2025-10-03 10:51:58.154528	Angura	Delivered	Parthiban	2025-10-09 10:00:15.240385	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 19:20:54	Screen_R_031025_221	542.00	6x12	55.2	Shaker	2025-10-03 19:21:42.035823	Angura	Delivered	Parthiban	2025-10-09 10:00:26.218052	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 14:46:46	Screen_R_061025_270	560.00	6x12	54.7	Shaker	2025-10-06 14:46:58.516925	Ramesh	Delivered	Parthiban	2025-10-09 10:19:30.298486	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 06:19:43	Screen_S_031025_213	552.00	8x30	57.9	Shaker	2025-10-03 06:19:55.872877	Ramesh	Delivered	Parthiban	2025-10-09 09:47:59.457931	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 16:23:53	Screen_S_031025_220	554.00	8x30	57.4	Shaker	2025-10-03 16:24:09.871134	Angura	Delivered	Parthiban	2025-10-09 09:48:05.8001	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 11:59:36	Screen_R_071025_282	552.00	6x12	62.6	Shaker	2025-10-07 12:00:03.546855	Ramesh	Delivered	Parthiban	2025-10-09 10:20:23.401429	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 15:17:08	Screen_R_071025_286	550.00	6x12	59.9	Shaker	2025-10-07 15:17:18.191496	Ramesh	Delivered	Parthiban	2025-10-09 10:20:28.681215	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 17:56:24	Screen_R_071025_287	543.00	6x12	66.7	Shaker	2025-10-07 17:56:35.325754	Ramesh	Delivered	Parthiban	2025-10-09 10:20:38.970549	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 07:28:31	Screen_S_071025_279	552.00	8x30	68.1	Shaker	2025-10-07 07:28:42.308518	Angura	Delivered	Parthiban	2025-10-22 18:19:11.833436	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 18:07:11	Screen_R_071025_288	552.00	6x12	66.3	Shaker	2025-10-07 18:07:20.440346	Ramesh	Delivered	Parthiban	2025-10-09 10:20:47.799426	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 23:04:10	Screen_R_071025_291	540.00	6x12	65.5	Shaker	2025-10-07 23:04:30.736332	Angura	Delivered	Parthiban	2025-10-09 10:20:56.800155	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 12:07:18	Screen_S_071025_283	529.00	8x30	64.2	Shaker	2025-10-07 12:07:30.28111	Ramesh	Delivered	Parthiban	2025-10-22 18:19:14.988582	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 01:47:05	Screen_R_081025_293	563.00	6x12	65.5	Shaker	2025-10-08 01:47:29.691375	Angura	Delivered	Parthiban	2025-10-09 10:21:03.970105	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 15:53:04	Screen_R_081025_297	528.00	6x12	58.0	Shaker	2025-10-08 15:53:14.812064	Ramesh	Delivered	Parthiban	2025-10-09 10:21:18.138076	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 12:52:51	Screen_S_071025_284	544.00	8x30	53.9	Shaker	2025-10-07 12:53:04.350005	Ramesh	Delivered	Parthiban	2025-10-22 18:19:18.538658	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 18:13:52	Screen_S_071025_289	552.00	8x30	65.3	Shaker	2025-10-07 18:14:03.004498	Ramesh	Delivered	Parthiban	2025-10-22 18:19:22.4636	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 16:50:26	Screen_S_081025_298	552.00	8x30	62.8	Shaker	2025-10-08 16:50:36.136692	Ramesh	Delivered	Parthiban	2025-10-16 12:13:51.881157	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 23:12:38	Screen_R_081025_300	552.00	6x12	59.1	Shaker	2025-10-08 23:13:07.416805	Angura	Delivered	Parthiban	2025-10-09 10:21:28.365446	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 07:28:43	Screen_R_091025_306	548.00	6x12	56.0	Shaker	2025-10-09 07:28:53.53878	Angura	Delivered	Parthiban	2025-10-12 12:31:09.412634	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 00:36:56	Screen_S_091025_303	548.00	8x30	65.0	Shaker	2025-10-09 00:37:10.376835	Angura	Delivered	Parthiban	2025-10-16 12:13:55.43118	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 11:21:44	Screen_R_091025_308	543.00	6x12	57.9	Shaker	2025-10-09 11:22:01.340657	Ramesh	Delivered	Parthiban	2025-10-12 12:31:15.32277	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 23:17:10	Screen_S_071025_292	538.00	8x30	71.5	Shaker	2025-10-07 23:17:22.610214	Angura	Screening	Parthiban	2025-10-27 08:53:03.908032	loaded	2025-10-27 08:53:17	Parthiban	\N	550.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-09 15:09:24	Screen_S_091025_312	535.00	8x30	64.4	Shaker	2025-10-09 15:09:40.196844	Ramesh	Delivered	Parthiban	2025-10-22 18:19:47.365934	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 07:07:57	Screen_S_091025_305	552.00	8x30	65.1	Shaker	2025-10-09 07:08:06.339578	Angura	Delivered	Parthiban	2025-10-22 18:19:36.58368	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 00:23:24	Screen_V_091025_302	575.00	-30	59.2	Shaker	2025-10-09 00:23:49.747875	Angura	Screening	Parthiban	2025-11-11 10:25:58.903819	loaded	2025-11-11 10:26:33	Parthiban	\N	575.00	\N	\N	gyro	{"30x60"}
2025-10-08 17:00:29	Screen_S_081025_299	552.00	8x30	62.3	Shaker	2025-10-08 17:00:47.730376	Ramesh	Delivered	Parthiban	2025-10-16 12:14:22.166812	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 11:03:48	Screen_S_091025_307	559.00	8x30	60.1	Shaker	2025-10-09 11:04:00.132299	Ramesh	Delivered	Parthiban	2025-10-16 12:14:32.319557	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 12:18:41	Screen_S_061025_268	531.00	8x30	62.6	Shaker	2025-10-06 12:18:52.895953	Ramesh	Delivered	Parthiban	2025-10-16 12:12:54.35168	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 15:27:01	Screen_S_091025_313	556.00	8x30	59.0	Shaker	2025-10-09 15:27:23.343424	Ramesh	Delivered	Parthiban	2025-10-16 12:14:41.276514	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 17:17:25	Screen_S_011025_189	586.00	8x30	56.7	Shaker	2025-10-01 17:23:15.922815	Angura	Delivered	Parthiban	2025-10-09 09:46:48.138237	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-03 05:29:19	Screen_S_031025_211	523.00	8x30	60.9	Shaker	2025-10-03 05:30:05.346757	Ramesh	Delivered	Parthiban	2025-10-09 09:47:37.011823	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 01:44:28	Screen_S_041025_226	570.00	8x30	53.1	Shaker	2025-10-04 01:44:40.085144	Ramesh	Delivered	Parthiban	2025-10-09 09:48:16.220682	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 17:16:25	Screen_S_041025_237	557.00	8x30	59.4	Shaker	2025-10-04 17:16:35.415891	Angura	Delivered	Parthiban	2025-10-09 09:48:50.929519	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 22:54:04	Screen_S_051025_260	535.00	8x30	60.5	Shaker	2025-10-05 22:54:16.453827	Angura	Delivered	Parthiban	2025-10-09 09:49:31.161019	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 21:49:17	Screen_S_061025_274	556.00	8x30	61.0	Shaker	2025-10-06 21:49:29.663284	Angura	Delivered	Parthiban	2025-10-09 09:49:57.925324	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 15:04:50	Screen_S_260925_107	588.00	8x30	52.8	Shaker	2025-09-26 15:05:22.430701	Ramesh	Delivered	Parthiban	2025-10-09 09:51:39.844851	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-28 14:24:15	Screen_S_280925_138	563.00	8x30	59.0	Shaker	2025-09-28 14:24:50.434763	Angura	Delivered	Parthiban	2025-10-09 09:52:25.551693	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 18:48:30	Screen_S_300925_176	542.00	8x30	61.6	Shaker	2025-09-30 18:48:49.087602	Angura	Delivered	Parthiban	2025-10-09 09:53:17.58097	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 01:34:06	Screen_R_041025_225	565.00	6x12	52.2	Shaker	2025-10-04 01:34:15.472351	Ramesh	Delivered	Parthiban	2025-10-09 10:00:30.493186	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-04 16:55:17	Screen_R_041025_235	570.00	6x12	55.0	Shaker	2025-10-04 17:04:45.113593	Angura	Delivered	Parthiban	2025-10-09 10:17:09.482348	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-05 11:41:15	Screen_R_051025_250	553.00	6x12	56.1	Shaker	2025-10-05 11:41:36.338066	Ramesh	Delivered	Parthiban	2025-10-09 10:18:05.230471	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 01:44:47	Screen_R_061025_262	540.00	6x12	60.0	Shaker	2025-10-06 01:44:57.328963	Angura	Delivered	Parthiban	2025-10-09 10:18:54.471801	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 18:46:48	Screen_R_061025_273	552.00	6x12	57.2	Shaker	2025-10-06 18:46:59.334769	Ramesh	Delivered	Parthiban	2025-10-09 10:19:40.448612	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-06 22:19:00	Screen_R_061025_275	552.00	6x12	61.1	Shaker	2025-10-06 22:19:13.027019	Angura	Delivered	Parthiban	2025-10-09 10:19:47.897156	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 02:29:50	Screen_R_071025_277	563.00	6x12	58.0	Shaker	2025-10-07 02:30:18.491452	Angura	Delivered	Parthiban	2025-10-09 10:19:57.59669	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 07:20:53	Screen_R_071025_278	549.00	6x12	65.5	Shaker	2025-10-07 07:21:04.563151	Angura	Delivered	Parthiban	2025-10-09 10:20:04.831785	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 11:59:36	Screen_R_071025_281	556.00	6x12	57.1	Shaker	2025-10-07 11:59:47.687446	Ramesh	Delivered	Parthiban	2025-10-09 10:20:16.914959	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 07:25:55	Screen_R_081025_296	552.00	6x12	63.3	Shaker	2025-10-08 07:26:09.000715	Angura	Delivered	Parthiban	2025-10-09 10:21:10.84768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 02:18:54	Screen_S_071025_276	530.00	8x30	65.4	Shaker	2025-10-07 02:19:10.042733	Angura	Delivered	Parthiban	2025-10-22 18:19:07.703676	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 11:32:00	Screen_R_091025_309	563.00	6x12	56.1	Shaker	2025-10-09 11:32:13.509164	Ramesh	Delivered	Parthiban	2025-10-12 12:31:21.402985	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 12:05:14	Screen_R_091025_310	554.00	6x12	57.6	Shaker	2025-10-09 12:05:25.534574	Ramesh	Delivered	Parthiban	2025-10-12 12:31:28.39317	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 15:08:22	Screen_R_091025_311	538.00	6x12	56.1	Shaker	2025-10-09 15:08:34.243009	Ramesh	Delivered	Parthiban	2025-10-12 12:31:33.013116	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 18:08:04	Screen_R_091025_316	553.00	6x12	59.7	Shaker	2025-10-09 18:08:18.497825	Ramesh	Delivered	Parthiban	2025-10-12 12:31:45.413816	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 19:31:25	Screen_R_091025_318	543.00	6x12	59.3	Shaker	2025-10-09 19:31:38.894363	Ramesh	Delivered	Parthiban	2025-10-12 12:31:48.753082	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 00:23:24	Screen_R_091025_301	551.00	6x12	60.5	Shaker	2025-10-09 00:23:34.792046	Angura	Delivered	Parthiban	2025-10-16 11:54:32.233534	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 14:22:14	Screen_S_071025_285	550.00	8x30	62.7	Shaker	2025-10-07 14:22:27.621209	Ramesh	Delivered	Parthiban	2025-10-16 12:13:14.094506	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 11:52:57	Screen_R_101025_331	559.00	6x12	58.0	Shaker	2025-10-10 11:53:09.628405	Ramesh	Delivered	Parthiban	2025-10-12 12:32:25.712845	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 02:13:29	Screen_S_101025_325	550.00	8x30	62.3	Shaker	2025-10-10 02:13:42.059403	Angura	Delivered	Parthiban	2025-10-16 12:15:17.382959	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 14:41:59	Screen_R_101025_332	550.00	6x12	57.6	Shaker	2025-10-10 14:42:11.869401	Ramesh	Delivered	Parthiban	2025-10-12 12:32:31.491908	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 06:53:29	Screen_S_101025_329	546.00	8x30	64.5	Shaker	2025-10-10 07:25:29.209989	Angura	Delivered	Parthiban	2025-10-22 18:19:53.913494	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 15:46:06	Screen_S_101025_335	552.00	8x30	65.4	Shaker	2025-10-10 15:46:18.820774	Ramesh	Delivered	Parthiban	2025-10-22 18:19:57.878569	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 00:45:27	Screen_R_121025_359	559.00	6x12	54.1	Shaker	2025-10-12 02:38:11.782554	Thiruppathi	Delivered	Parthiban	2025-10-16 11:55:51.851357	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 15:17:27	Screen_S_101025_333	552.00	8x30	60.5	Shaker	2025-10-10 15:17:38.902669	Ramesh	Delivered	Parthiban	2025-10-16 12:15:21.516783	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 09:06:53	Screen_S_121025_361	582.00	8x30	54.4	Shaker	2025-10-12 09:12:58.930372	Angura	Delivered	Parthiban	2025-10-22 18:20:23.26878	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 09:06:53	Screen_R_121025_360	563.00	6x12	54.5	Shaker	2025-10-12 09:07:10.637653	Angura	Delivered	Parthiban	2025-10-16 11:56:00.756996	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 22:23:57	Screen_S_101025_339	553.00	8x30	68.2	Shaker	2025-10-10 22:24:08.172797	Angura	Delivered	Parthiban	2025-10-22 18:20:01.514061	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 15:42:11	Screen_S_101025_334	552.00	8x30	59.3	Shaker	2025-10-10 15:42:24.464312	Ramesh	Delivered	Parthiban	2025-10-16 12:15:26.196415	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 18:07:33	Screen_S_101025_336	551.00	8x30	61	Shaker	2025-10-10 18:07:45.501937	Ramesh	Delivered	Parthiban	2025-10-16 12:15:38.262182	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 07:06:17	Screen_S_111025_344	560.00	8x30	64.4	Shaker	2025-10-11 07:06:30.108153	Angura	Delivered	Parthiban	2025-10-22 18:20:15.153481	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 00:20:40	Screen_S_111025_341	552.00	8x30	60.8	Shaker	2025-10-11 00:27:29.6592	Angura	Delivered	Parthiban	2025-10-16 12:15:43.586604	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 00:20:26	Screen_R_111025_340	523.00	6x12	61.0	Shaker	2025-10-11 00:20:37.362435	Angura	Delivered	Parthiban	2025-10-16 11:55:03.737221	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 02:47:38	Screen_R_111025_342	549.00	6x12	58.3	Shaker	2025-10-11 02:47:55.744913	Angura	Delivered	Parthiban	2025-10-16 11:55:09.006542	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 00:45:27	Screen_S_121025_358	530.00	8x30	55.0	Shaker	2025-10-12 02:37:52.104435	Thiruppathi	Delivered	Parthiban	2025-10-22 18:20:18.343779	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 07:46:34	Screen_R_111025_345	557.00	6x12	56.0	Shaker	2025-10-11 07:46:44.008008	Angura	Delivered	Parthiban	2025-10-16 11:55:27.34833	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 11:31:05	Screen_S_111025_347	559.00	8x30	58.6	Shaker	2025-10-11 11:31:33.10115	Ramesh	Delivered	Parthiban	2025-10-16 12:16:39.096106	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 12:33:59	Screen_R_111025_348	552.00	6x12	55.6	Shaker	2025-10-11 12:34:08.953669	Ramesh	Delivered	Parthiban	2025-10-16 11:55:31.157484	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 12:42:50	Screen_S_111025_349	549.00	8x30	59.7	Shaker	2025-10-11 12:43:00.689895	Ramesh	Delivered	Parthiban	2025-10-16 12:16:45.656794	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 12:48:30	Screen_R_111025_350	552.00	6x12	54.8	Shaker	2025-10-11 12:48:41.772092	Ramesh	Delivered	Parthiban	2025-10-16 11:55:34.416561	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 11:19:18	Screen_V_111025_346	567.00	-30	56.6	Shaker	2025-10-11 11:19:48.412085	Ramesh	Screening	Parthiban	2025-11-11 19:30:03.996622	loaded	2025-11-11 19:30:05	Parthiban	\N	567.00	\N	\N	gyro	{"30x60"}
2025-10-11 18:00:29	Screen_S_111025_352	550.00	8x30	59.5	Shaker	2025-10-11 18:00:39.238024	Ramesh	Delivered	Parthiban	2025-10-16 12:17:00.814858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 19:32:09	Screen_R_111025_353	559.00	6x12	58.5	Shaker	2025-10-11 19:32:26.925806	Ramesh	Delivered	Parthiban	2025-10-16 11:55:41.221444	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 21:21:41	Screen_S_111025_354	574.00	8x30	59.7	Shaker	2025-10-11 21:22:15.868295	Thiruppathi	Delivered	Parthiban	2025-10-16 12:17:08.837022	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 22:45:32	Screen_R_111025_355	550.00	6x12	56.3	Shaker	2025-10-11 22:45:44.125906	Thiruppathi	Delivered	Parthiban	2025-10-16 11:55:45.65648	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 00:45:27	Screen_R_121025_357	541.00	6x12	56.2	Shaker	2025-10-12 00:45:37.362383	Thiruppathi	Delivered	Parthiban	2025-10-16 11:55:48.687734	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 14:31:21	Screen_S_121025_365	564.00	8x30	56.4	Shaker	2025-10-12 14:32:56.088054	Angura	Delivered	Parthiban	2025-10-16 12:17:22.241165	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 11:02:03	Screen_R_121025_363	566.00	6x12	56.6	Shaker	2025-10-12 11:04:30.983716	Angura	Delivered	Parthiban	2025-10-16 11:56:03.87194	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 19:01:17	Screen_S_121025_369	565.00	8x30	58.1	Shaker	2025-10-12 19:01:27.447186	Angura	Delivered	Parthiban	2025-10-16 12:17:46.209447	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 15:49:29	Screen_R_121025_366	523.00	6x12	55.0	Shaker	2025-10-12 15:49:39.829842	Angura	Delivered	Parthiban	2025-10-16 11:56:11.181934	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 06:36:50	Screen_R_091025_304	512.00	6x12	60.4	Shaker	2025-10-09 06:36:59.587734	Angura	Delivered	Parthiban	2025-10-12 12:31:05.509758	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 15:35:52	Screen_R_091025_314	535.00	6x12	58.5	Shaker	2025-10-09 15:36:09.437594	Ramesh	Delivered	Parthiban	2025-10-12 12:31:37.453169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 17:26:26	Screen_R_091025_315	574.00	6x12	54.6	Shaker	2025-10-09 17:26:37.663477	Ramesh	Delivered	Parthiban	2025-10-12 12:31:40.833094	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 19:31:25	Screen_R_091025_319	552.00	6x12	58.8	Shaker	2025-10-09 19:32:03.249883	Ramesh	Delivered	Parthiban	2025-10-12 12:31:54.512099	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 21:54:49	Screen_R_091025_321	539.00	6x12	57.5	Shaker	2025-10-09 21:54:59.677251	Angura	Delivered	Parthiban	2025-10-12 12:31:58.612004	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 23:07:28	Screen_R_091025_322	536.00	6x12	58.7	Shaker	2025-10-09 23:07:38.31891	Angura	Delivered	Parthiban	2025-10-12 12:32:01.833317	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 01:16:10	Screen_R_101025_324	547.00	6x12	58.5	Shaker	2025-10-10 01:16:20.329784	Angura	Delivered	Parthiban	2025-10-12 12:32:09.005265	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 02:13:29	Screen_R_101025_326	537.00	6x12	53.5	Shaker	2025-10-10 02:20:13.026492	Angura	Delivered	Parthiban	2025-10-12 12:32:12.839156	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 06:53:29	Screen_R_101025_328	538.00	6x12	59.0	Shaker	2025-10-10 06:53:40.70443	Angura	Delivered	Parthiban	2025-10-12 12:32:16.52401	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 11:43:15	Screen_R_101025_330	552.00	6x12	59.6	Shaker	2025-10-10 11:43:27.101328	Ramesh	Delivered	Parthiban	2025-10-12 12:32:22.392689	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 18:57:03	Screen_R_121025_368	570.00	6x12	58.5	Shaker	2025-10-12 18:57:39.880867	Angura	Delivered	Parthiban	2025-10-16 11:56:21.162345	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 21:10:16	Screen_R_121025_370	556.00	6x12	56.6	Shaker	2025-10-12 21:11:03.809254	Ramesh	Delivered	Parthiban	2025-10-16 11:56:24.562184	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 00:37:08	Screen_R_131025_372	555.00	6x12	56.1	Shaker	2025-10-13 00:37:18.688762	Ramesh	Delivered	Parthiban	2025-10-16 11:56:27.687128	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 01:55:11	Screen_S_131025_374	546.00	8x30	59.4	Shaker	2025-10-13 01:55:26.135053	Ramesh	Delivered	Parthiban	2025-10-16 12:17:52.329033	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 01:38:19	Screen_R_131025_373	550.00	6x12	55.8	Shaker	2025-10-13 01:38:32.592016	Ramesh	Delivered	Parthiban	2025-10-16 11:56:30.737084	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 01:55:11	Screen_S_131025_375	561.00	8x30	62.5	Shaker	2025-10-13 01:55:48.130399	Ramesh	Delivered	Parthiban	2025-10-16 12:17:57.379078	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 02:28:30	Screen_S_131025_376	557.00	8x30	60.9	Shaker	2025-10-13 02:28:47.092686	Ramesh	Delivered	Parthiban	2025-10-16 12:18:04.121078	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 00:11:56	Screen_S_121025_356	538.00	8x30	59.2	Shaker	2025-10-12 00:12:11.661128	Thiruppathi	Delivered	Parthiban	2025-10-16 12:41:02.357466	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 18:22:59	Screen_R_101025_337	547.00	6x12	58.1	Shaker	2025-10-10 18:23:10.67117	Ramesh	Delivered	Parthiban	2025-10-16 11:54:36.063789	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 10:23:22	Screen_R_131025_379	551.00	6x12	59.8	Shaker	2025-10-13 10:23:32.159578	Angura	Delivered	Parthiban	2025-10-16 11:56:37.552433	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 11:05:41	Screen_S_131025_380	552.00	8x30	63.2	Shaker	2025-10-13 11:05:52.987154	Angura	Delivered	Parthiban	2025-10-16 12:18:23.216263	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 12:02:31	Screen_R_131025_381	560.00	6x12	58.3	Shaker	2025-10-13 12:02:43.269326	Angura	Delivered	Parthiban	2025-10-16 11:56:41.362275	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 15:40:11	Screen_S_131025_384	545.00	8x30	61.3	Shaker	2025-10-13 15:40:24.58962	Angura	Delivered	Parthiban	2025-10-16 12:18:37.723599	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 14:52:58	Screen_R_131025_383	560.00	6x12	57.6	Shaker	2025-10-13 14:53:48.161534	Angura	Delivered	Parthiban	2025-10-16 11:56:44.972142	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 01:51:30	Screen_S_141025_392	539.00	8x30	64.7	Shaker	2025-10-14 01:51:40.590362	Ramesh	Delivered	Parthiban	2025-10-22 18:20:36.489085	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 16:58:23	Screen_R_131025_385	538.00	6x12	61.5	Shaker	2025-10-13 16:58:35.575654	Angura	Delivered	Parthiban	2025-10-16 11:56:48.077089	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 17:20:04	Screen_S_131025_386	558.00	8x30	62.0	Shaker	2025-10-13 17:20:15.130166	Angura	Delivered	Parthiban	2025-10-16 12:18:44.606575	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 18:48:24	Screen_R_131025_387	542.00	6x12	65.5	Shaker	2025-10-13 18:48:34.310624	Angura	Delivered	Parthiban	2025-10-16 11:56:51.757104	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 01:33:57	Screen_S_141025_390	555.00	8x30	61.6	Shaker	2025-10-14 01:34:08.186354	Ramesh	Delivered	Parthiban	2025-10-16 12:19:06.457492	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 00:02:25	Screen_R_141025_389	547.00	6x12	58.7	Shaker	2025-10-14 00:02:37.466908	Ramesh	Delivered	Parthiban	2025-10-16 11:56:56.077172	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 21:17:53	Screen_S_131025_388	545.00	8x30	69.5	Shaker	2025-10-13 21:18:10.762507	Ramesh	Screening	Parthiban	2025-10-27 08:53:13.621385	loaded	2025-10-27 08:53:17	Parthiban	\N	550.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-14 15:24:53	Screen_S_141025_400	535.00	8x30	62.9	Shaker	2025-10-14 15:52:11.590645	Angura	Delivered	Parthiban	2025-10-16 12:19:15.938554	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 09:11:24	Screen_S_141025_395	535.00	8x30	68.8	Shaker	2025-10-14 09:11:41.770112	Angura	Delivered	Parthiban	2025-10-22 18:20:41.634071	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 07:23:46	Screen_R_141025_393	552.00	6x12	59.6	Shaker	2025-10-14 07:25:38.103224	Ramesh	Delivered	Parthiban	2025-10-16 11:56:59.417964	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 07:23:46	Screen_R_141025_394	552.00	6x12	64.1	Shaker	2025-10-14 07:26:23.579457	Ramesh	Delivered	Parthiban	2025-10-16 11:57:02.432452	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 12:03:23	Screen_R_141025_397	552.00	6x12	54.2	Shaker	2025-10-14 12:03:36.064387	Angura	Delivered	Parthiban	2025-10-16 11:57:05.577095	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 11:23:01	Screen_S_141025_396	547.00	8x30	64.8	Shaker	2025-10-14 11:23:14.312526	Angura	Delivered	Parthiban	2025-10-22 18:20:45.364126	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 03:22:39	Screen_S_151025_410	545.00	8x30	60.7	Shaker	2025-10-15 03:22:48.489296	Ramesh	Delivered	Parthiban	2025-10-22 18:20:52.941284	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 15:24:53	Screen_R_141025_398	562.00	6x12	59.9	Shaker	2025-10-14 15:25:08.718321	Angura	Delivered	Parthiban	2025-10-16 11:57:08.657142	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 15:24:53	Screen_R_141025_399	559.00	6x12	61.2	Shaker	2025-10-14 15:36:59.489995	Angura	Delivered	Parthiban	2025-10-16 11:57:12.852347	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 17:37:39	Screen_R_141025_402	547.00	6x12	60.9	Shaker	2025-10-14 17:37:50.931514	Angura	Delivered	Parthiban	2025-10-16 11:57:20.219333	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 18:13:27	Screen_S_141025_403	574.00	8x30	63.1	Shaker	2025-10-14 18:13:38.495793	Angura	Delivered	Parthiban	2025-10-16 12:20:29.708003	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 00:43:05	Screen_S_151025_406	559.00	8x30	59.8	Shaker	2025-10-15 00:43:15.310798	Ramesh	Delivered	Parthiban	2025-10-16 12:20:33.916722	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 22:28:55	Screen_R_141025_404	539.00	6x12	64.8	Shaker	2025-10-14 22:29:13.199014	Ramesh	Delivered	Parthiban	2025-10-16 11:57:23.299585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 00:49:13	Screen_S_151025_407	536.00	8x30	57.3	Shaker	2025-10-15 00:49:24.319373	Ramesh	Delivered	Parthiban	2025-10-16 12:20:44.797532	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 00:17:40	Screen_R_151025_405	539.00	6x12	52.9	Shaker	2025-10-15 00:17:58.123678	Ramesh	Delivered	Parthiban	2025-10-16 11:57:26.704504	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 11:09:23	Screen_R_151025_412	565.00	6x12	56.4	Shaker	2025-10-15 11:19:41.539511	Angura	Delivered	Parthiban	2025-10-16 11:57:39.444372	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 03:20:22	Screen_R_161025_424	548.00	6x12	52.3	Shaker	2025-10-16 03:20:29.50017	Ramesh	Delivered	admin	2025-10-30 12:40:04.133882	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 08:51:04	Screen_R_161025_427	567.00	6x12	52.5	Shaker	2025-10-16 08:51:15.975653	Angura	Delivered	admin	2025-10-30 12:40:14.378626	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 16:48:55	Screen_R_191025_480	560.00	6x12	52.7	Shaker	2025-10-19 16:49:07.952936	Ramesh	Delivered	Parthiban	2025-10-22 18:14:50.706202	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 18:04:05	Screen_R_151025_416	572.00	6x12	51.6	Shaker	2025-10-15 18:04:19.492613	Angura	Delivered	Parthiban	2025-10-16 11:57:53.6962	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 12:01:45	Screen_S_151025_415	497.00	8x30	57.1	Shaker	2025-10-15 12:01:55.404311	Angura	Delivered	Parthiban	2025-10-22 18:21:05.866875	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 18:14:00	Screen_S_151025_418	578.00	8x30	58.6	Shaker	2025-10-15 18:14:11.571099	Angura	Delivered	Parthiban	2025-10-22 18:21:09.716682	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 03:19:03	Screen_R_151025_409	570.00	6x12	57.4	Shaker	2025-10-15 03:19:13.295564	Ramesh	Delivered	Parthiban	2025-10-16 11:57:44.456839	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 11:49:41	Screen_V_151025_413	476.00	-30	53.6	Shaker	2025-10-15 11:49:53.454523	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 14:25:56	Screen_S_131025_382	555.00	8x30	64.4	Shaker	2025-10-13 14:26:09.539473	Angura	Delivered	Parthiban	2025-10-22 18:20:30.783755	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 03:11:09	Screen_S_161025_422	530.00	8x30	62.4	Shaker	2025-10-16 03:11:16.888915	Ramesh	Delivered	Parthiban	2025-10-22 18:21:12.781614	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 18:09:09	Screen_R_151025_417	537.00	6x12	53.9	Shaker	2025-10-15 18:09:19.557647	Angura	Delivered	Parthiban	2025-10-16 11:57:57.636443	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 22:36:39	Screen_R_151025_419	555.00	6x12	55.9	Shaker	2025-10-15 22:36:55.301817	Ramesh	Delivered	Parthiban	2025-10-16 11:58:06.296336	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 01:33:07	Screen_R_161025_421	561.00	6x12	56.7	Shaker	2025-10-16 01:33:28.845726	Ramesh	Delivered	Parthiban	2025-10-16 11:58:49.258421	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 03:14:37	Screen_S_161025_423	549.00	8x30	63.9	Shaker	2025-10-16 03:14:44.794476	Ramesh	Delivered	Parthiban	2025-10-22 18:21:17.346534	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-01 07:10:12	Screen_S_011025_183	545.00	8x30	63.1	Shaker	2025-10-01 07:10:41.555444	Ramesh	Delivered	Parthiban	2025-10-16 12:12:18.092128	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 00:01:45	Screen_R_161025_420	547.00	6x12	56.8	Shaker	2025-10-16 00:02:03.811954	Ramesh	Delivered	Parthiban	2025-10-16 12:00:02.601935	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 06:20:31	Screen_S_161025_425	556.00	8x30	55.8	Shaker	2025-10-16 06:20:44.531813	Ramesh	Delivered	Parthiban	2025-10-22 18:21:20.341775	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 22:32:30	Screen_V_121025_371	540.00	-30	54.9	Shaker	2025-10-12 22:32:44.705824	Ramesh	Screening	Parthiban	2025-11-12 09:05:40.643038	loaded	2025-11-12 09:05:48	Parthiban	\N	540.00	\N	\N	gyro	{"30x60"}
2025-10-04 18:12:13	Screen_R_041025_239	520.00	6x12	51.2	Shaker	2025-10-04 18:12:24.594933	Angura	Delivered	Parthiban	2025-10-16 11:54:23.62596	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 22:06:15	Screen_R_101025_338	569.00	6x12	60.6	Shaker	2025-10-10 22:06:26.408701	Angura	Delivered	Parthiban	2025-10-16 11:54:40.303813	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 17:49:02	Screen_R_111025_351	543.00	6x12	51.3	Shaker	2025-10-11 17:49:11.423664	Ramesh	Delivered	Parthiban	2025-10-16 11:55:38.171547	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 12:25:19	Screen_R_121025_364	552.00	6x12	55.7	Shaker	2025-10-12 12:25:28.403271	Angura	Delivered	Parthiban	2025-10-16 11:56:07.896907	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 06:44:56	Screen_R_131025_377	522.00	6x12	58.9	Shaker	2025-10-13 06:45:12.950668	Ramesh	Delivered	Parthiban	2025-10-16 11:56:34.597003	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 06:52:59	Screen_S_081025_295	530.00	8x30	62.6	Shaker	2025-10-08 06:53:11.57847	Angura	Delivered	Parthiban	2025-10-16 12:13:45.782809	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 18:11:04	Screen_S_091025_317	547.00	8x30	61.6	Shaker	2025-10-09 18:11:40.81516	Ramesh	Delivered	Parthiban	2025-10-16 12:14:45.317558	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 20:48:37	Screen_S_091025_320	537.00	8x30	61.9	Shaker	2025-10-09 20:49:00.376657	Angura	Delivered	Parthiban	2025-10-16 12:14:57.647972	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-11 03:23:12	Screen_S_111025_343	552.00	8x30	62.3	Shaker	2025-10-11 03:23:23.558468	Angura	Delivered	Parthiban	2025-10-16 12:16:29.368901	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 16:58:29	Screen_S_121025_367	533.00	8x30	58.9	Shaker	2025-10-12 16:58:42.439498	Angura	Delivered	Parthiban	2025-10-16 12:17:26.701244	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-13 07:33:17	Screen_S_131025_378	564.00	8x30	61.6	Shaker	2025-10-13 07:33:34.970338	Ramesh	Delivered	Parthiban	2025-10-16 12:18:15.510858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 16:35:54	Screen_S_141025_401	560.00	8x30	61.2	Shaker	2025-10-14 16:36:06.650158	Angura	Delivered	Parthiban	2025-10-16 12:19:44.346243	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-29 23:33:59	Screen_S_290925_163	541.00	8x30	62.0	Shaker	2025-09-29 23:34:10.967575	Ramesh	Delivered	Parthiban	2025-10-16 12:41:17.795306	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 15:20:05	Screen_R_161025_429	551.00	6x12	56.5	Shaker	2025-10-16 15:20:15.611372	Angura	Delivered	admin	2025-10-30 12:41:27.582095	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 09:22:11	Screen_R_181025_450	545.00	6x12	55.2	Shaker	2025-10-18 10:42:54.060467	Parthiban	Delivered	admin	2025-10-30 12:41:34.639285	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 19:14:44	Screen_R_161025_433	546.00	6x12	54.6	Shaker	2025-10-16 19:14:54.928241	Angura	Delivered	Parthiban	2025-10-22 18:13:11.307681	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 18:58:15	Screen_P_161025_432	516.00	12x30	57.2	Shaker	2025-10-16 18:58:56.038118	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 22:42:55	Screen_R_161025_435	563.00	6x12	60.1	Shaker	2025-10-16 22:43:08.915095	Ramesh	Delivered	Parthiban	2025-10-22 18:13:15.766873	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 03:21:48	Screen_R_171025_439	555.00	6x12	60.7	Shaker	2025-10-17 03:22:26.882327	Ramesh	Delivered	Parthiban	2025-10-22 18:13:23.371755	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 02:41:57	Screen_L_171025_437	536.00	8x16	59.7	Shaker	2025-10-17 02:42:07.793696	Ramesh	Delivered	Parthiban	2025-10-27 10:16:23.106585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 09:56:23	Screen_R_171025_441	554.00	6x12	63.9	Shaker	2025-10-17 09:56:33.963502	Angura	Delivered	Parthiban	2025-10-22 18:13:26.751699	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 06:59:29	Screen_L_171025_440	489.00	8x16	60.7	Shaker	2025-10-17 06:59:46.680915	Ramesh	Delivered	Parthiban	2025-10-27 10:16:34.302489	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 03:21:48	Screen_P_171025_438	509.00	12x30	63.4	Shaker	2025-10-17 03:22:08.54028	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 14:42:59	Screen_R_171025_442	525.00	6x12	63.4	Shaker	2025-10-17 14:43:10.907551	Angura	Delivered	Parthiban	2025-10-22 18:13:30.221796	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 15:12:11	Screen_L_171025_443	596.00	8x16	61.5	Shaker	2025-10-17 15:12:22.784092	Angura	Delivered	Parthiban	2025-10-27 10:16:38.581648	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 17:36:00	Screen_R_171025_445	549.00	6x12	61.0	Shaker	2025-10-17 17:36:21.156358	Angura	Delivered	Parthiban	2025-10-22 18:13:33.921992	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 23:12:36	Screen_R_171025_446	548.00	6x12	63.7	Shaker	2025-10-18 00:26:55.851293	Parthiban	Delivered	Parthiban	2025-10-22 18:13:37.2616	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 10:52:28	Screen_L_181025_451	485.00	8x16	63.4	Shaker	2025-10-18 10:52:37.44276	Parthiban	Delivered	Parthiban	2025-10-27 10:16:47.286728	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 15:16:33	Screen_P_171025_444	516.00	12x30	64.2	Shaker	2025-10-17 15:17:02.916572	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 11:47:08	Screen_R_181025_453	549.00	6x12	56.6	Shaker	2025-10-18 11:47:59.68392	Parthiban	Delivered	Parthiban	2025-10-22 18:13:49.049159	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 15:00:35	Screen_R_181025_455	530.00	6x12	53.3	Shaker	2025-10-18 15:00:45.555976	Parthiban	Delivered	Parthiban	2025-10-22 18:13:52.554326	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 15:00:35	Screen_L_181025_456	524.00	8x16	54.8	Shaker	2025-10-18 15:01:01.653433	Parthiban	Delivered	Parthiban	2025-10-27 10:16:52.996798	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 07:27:19	Screen_P_181025_448	545.00	12x30	63.3	Shaker	2025-10-18 07:27:28.638539	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 15:00:35	Screen_R_181025_457	594.00	6x12	53.8	Shaker	2025-10-18 15:03:26.231656	Parthiban	Delivered	Parthiban	2025-10-22 18:13:58.361918	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 16:24:03	Screen_L_161025_430	509.00	8x16	56.1	Shaker	2025-10-16 16:24:56.369673	Angura	Delivered	Parthiban	2025-11-01 11:41:21.386792	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 17:08:57	Screen_L_181025_458	475.00	8x16	54.8	Shaker	2025-10-18 17:09:14.510338	Parthiban	Delivered	Parthiban	2025-10-27 10:20:19.988241	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 11:47:08	Screen_V_181025_452	569.00	-30	54.0	Shaker	2025-10-18 11:47:28.66618	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 17:08:57	Screen_R_181025_459	542.00	6x12	53.7	Shaker	2025-10-18 17:10:19.187424	Parthiban	Delivered	Parthiban	2025-10-22 18:14:02.647322	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 12:52:07	Screen_P_181025_454	496.00	12x30	56.9	Shaker	2025-10-18 12:52:15.18793	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 19:23:00	Screen_R_181025_461	532.00	6x12	58.5	Shaker	2025-10-18 19:23:44.98844	Parthiban	Delivered	Parthiban	2025-10-22 18:14:08.916726	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 19:43:07	Screen_L_181025_464	499.00	8x16	62.5	Shaker	2025-10-18 19:48:01.082461	Parthiban	Delivered	Parthiban	2025-10-27 10:20:24.122044	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 21:39:16	Screen_R_181025_465	537.00	6x12	56.9	Shaker	2025-10-18 21:39:26.58759	Ramesh	Delivered	Parthiban	2025-10-22 18:14:18.910046	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 00:14:11	Screen_L_191025_467	523.00	8x16	52.5	Shaker	2025-10-19 00:14:50.921586	Ramesh	Delivered	Parthiban	2025-10-27 10:20:31.856585	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 00:14:11	Screen_R_191025_466	540.00	6x12	60.7	Shaker	2025-10-19 00:14:25.970129	Ramesh	Delivered	Parthiban	2025-10-22 18:14:25.326894	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 19:23:00	Screen_P_181025_460	465.00	12x30	60.8	Shaker	2025-10-18 19:23:27.470401	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 06:03:54	Screen_R_191025_469	564.00	6x12	56.0	Shaker	2025-10-19 06:07:14.599469	Ramesh	Delivered	Parthiban	2025-10-22 18:14:28.671815	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 19:23:00	Screen_V_181025_462	549.00	-30	45.7	Shaker	2025-10-18 19:23:58.814397	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 06:03:54	Screen_R_191025_471	568.00	6x12	55.6	Shaker	2025-10-19 06:07:56.711605	Ramesh	Delivered	Parthiban	2025-10-22 18:14:31.916787	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 08:53:08	Screen_L_191025_472	510.00	8x16	52.0	Shaker	2025-10-19 08:53:21.963489	Ramesh	Delivered	Parthiban	2025-10-27 10:21:36.73639	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 09:03:36	Screen_R_191025_473	574.00	6x12	52.1	Shaker	2025-10-19 09:03:47.063705	Ramesh	Delivered	Parthiban	2025-10-22 18:14:36.076752	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 12:16:04	Screen_R_191025_476	542.00	6x12	53.7	Shaker	2025-10-19 12:16:13.320423	Ramesh	Delivered	Parthiban	2025-10-22 18:14:44.181622	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 12:24:49	Screen_L_191025_477	507.00	8x16	52.4	Shaker	2025-10-19 12:25:01.209237	Ramesh	Delivered	Parthiban	2025-10-27 10:21:42.386289	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 00:14:11	Screen_P_191025_468	525.00	12x30	59.8	Shaker	2025-10-19 00:15:10.829084	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 19:45:20	Screen_L_161025_434	513.00	8x16	58.5	Shaker	2025-10-16 19:46:01.50384	Angura	Delivered	Parthiban	2025-10-27 10:16:18.174174	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 17:02:15	Screen_L_191025_481	502.00	8x16	54.4	Shaker	2025-10-19 17:02:38.80457	Ramesh	Delivered	Parthiban	2025-10-27 10:21:47.222561	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 12:23:48	Screen_R_161025_428	566.00	6x12	59.4	Shaker	2025-10-16 12:23:58.57391	Angura	Delivered	admin	2025-10-30 12:40:29.65763	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 08:18:31	Screen_V_201025_483	528.00	-30	57.1	Shaker	2025-10-20 08:18:46.319835	Ramesh	Screening	Parthiban	2025-11-11 10:25:19.696402	loaded	2025-11-11 10:26:33	Parthiban	\N	528.00	\N	\N	gyro	{"30x60"}
2025-10-19 09:08:52	Screen_P_191025_474	476.00	12x30	54.9	Shaker	2025-10-19 09:09:04.748394	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 16:27:49	Screen_P_191025_479	502.00	12x30	58.4	Shaker	2025-10-19 16:28:03.759723	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 17:41:08	Screen_R_161025_431	553.00	6x12	54.0	Shaker	2025-10-16 17:41:18.419624	Angura	Delivered	Parthiban	2025-10-22 18:12:48.829922	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 19:04:55	Screen_R_191025_482	562.00	6x12	47.2	Shaker	2025-10-19 19:05:08.642668	Ramesh	Screening	Parthiban	2025-10-20 10:20:21.097886	loaded	2025-10-20 10:20:25	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-10-20 11:03:32	Screen_R_201025_486	555.00	6x12	58.6	Shaker	2025-10-20 11:04:10.510761	Ramesh	Delivered	Parthiban	2025-10-22 18:15:02.320849	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 11:07:57	Screen_L_211025_513	491.00	8x16	56.8	Shaker	2025-10-21 11:08:09.692704	Ramesh	Delivered	Parthiban	2025-10-27 10:23:36.73071	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 12:00:52	Screen_R_201025_489	531.00	6x12	56.0	Shaker	2025-10-20 12:01:02.173063	Ramesh	Delivered	Parthiban	2025-10-22 18:15:06.875021	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 11:18:26	Screen_P_201025_487	523.00	12x30	56.6	Shaker	2025-10-20 11:18:39.459998	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 15:38:35	Screen_L_201025_494	478.00	8x16	56.1	Shaker	2025-10-20 15:38:49.966875	Ramesh	Delivered	Parthiban	2025-10-27 09:23:59.959375	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 12:49:40	Screen_R_201025_490	559.00	6x12	58.1	Shaker	2025-10-20 12:49:50.678058	Ramesh	Delivered	Parthiban	2025-10-22 18:15:11.734736	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 14:50:20	Screen_R_201025_493	541.00	6x12	57.2	Shaker	2025-10-20 14:50:37.681367	Ramesh	Delivered	Parthiban	2025-10-22 18:15:16.02997	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 18:43:50	Screen_L_201025_499	513.00	8x16	58.2	Shaker	2025-10-20 18:44:02.136839	Ramesh	Delivered	Parthiban	2025-10-27 09:24:04.979602	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 14:40:13	Screen_P_201025_492	493.00	12x30	59.9	Shaker	2025-10-20 14:40:32.376129	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 23:28:33	Screen_L_201025_501	475.00	8x16	57.4	Shaker	2025-10-20 23:28:43.256355	Angura	Delivered	Parthiban	2025-10-27 09:24:12.646338	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 17:20:37	Screen_R_201025_497	553.00	6x12	53.8	Shaker	2025-10-20 17:20:51.260342	Ramesh	Delivered	Parthiban	2025-10-22 18:15:32.551026	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 16:59:10	Screen_P_201025_496	487.00	12x30	59.0	Shaker	2025-10-20 16:59:22.511351	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 18:36:50	Screen_R_201025_498	530.00	6x12	57.2	Shaker	2025-10-20 18:37:16.634959	Ramesh	Delivered	Parthiban	2025-10-22 18:15:36.566097	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 23:19:35	Screen_R_201025_500	552.00	6x12	58.9	Shaker	2025-10-20 23:19:43.42255	Angura	Delivered	Parthiban	2025-10-22 18:15:40.836003	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 02:02:36	Screen_L_211025_504	472.00	8x16	60.2	Shaker	2025-10-21 02:02:46.941961	Angura	Delivered	Parthiban	2025-10-27 09:24:19.401059	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 01:25:19	Screen_R_151025_408	543.00	6x12	54.7	Shaker	2025-10-15 01:26:00.734553	Ramesh	Screening	Parthiban	2025-10-21 08:44:49.191736	loaded	2025-10-21 08:44:57	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-10-21 00:34:19	Screen_R_211025_503	544.00	6x12	57.6	Shaker	2025-10-21 00:48:10.036425	Angura	Delivered	Parthiban	2025-10-22 18:15:44.126076	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 07:03:28	Screen_L_211025_509	477.00	8x16	58.7	Shaker	2025-10-21 07:03:39.462236	Angura	Delivered	Parthiban	2025-10-27 09:24:24.306155	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 00:25:14	Screen_P_211025_502	463.00	12x30	60.0	Shaker	2025-10-21 00:25:28.137776	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 02:28:30	Screen_R_211025_505	547.00	6x12	60.9	Shaker	2025-10-21 02:28:44.703928	Angura	Delivered	Parthiban	2025-10-22 18:15:48.081023	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 11:03:32	Screen_L_201025_485	503.00	8x16	50.9	Shaker	2025-10-20 11:03:51.859609	Ramesh	Delivered	Parthiban	2025-10-27 10:21:57.221255	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 10:17:08	Screen_R_211025_511	551.00	6x12	64.1	Shaker	2025-10-21 10:17:23.173953	Ramesh	Delivered	Parthiban	2025-10-22 18:15:56.756962	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 03:06:35	Screen_P_211025_506	548.00	12x30	60.2	Shaker	2025-10-21 03:06:44.691762	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 03:14:03	Screen_V_211025_507	554.00	-30	52.3	Shaker	2025-10-21 03:14:13.014673	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 10:27:54	Screen_R_211025_512	548.00	6x12	57.4	Shaker	2025-10-21 10:28:09.713694	Ramesh	Delivered	Parthiban	2025-10-22 18:15:59.836014	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 15:27:34	Screen_L_211025_518	493.00	8x16	57.4	Shaker	2025-10-21 15:27:46.579866	Ramesh	Delivered	Parthiban	2025-10-27 10:23:41.406299	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 19:09:42	Screen_L_211025_520	507.00	8x16	61.7	Shaker	2025-10-21 19:10:09.599775	Ramesh	Delivered	Parthiban	2025-10-27 10:23:47.376953	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 12:30:52	Screen_R_211025_514	551.00	6x12	57.7	Shaker	2025-10-21 12:31:04.370213	Ramesh	Delivered	Parthiban	2025-10-22 18:16:06.132041	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 14:36:57	Screen_R_211025_515	554.00	6x12	56.0	Shaker	2025-10-21 14:37:22.537648	Ramesh	Delivered	Parthiban	2025-10-22 18:16:11.211911	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 01:13:48	Screen_L_221025_525	504.00	8x16	56.4	Shaker	2025-10-22 01:14:00.639058	Angura	Delivered	Parthiban	2025-10-27 10:23:52.136909	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 19:21:44	Screen_R_211025_521	575.00	6x12	59.6	Shaker	2025-10-21 19:21:58.210167	Ramesh	Delivered	Parthiban	2025-10-22 18:16:21.837559	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 00:57:36	Screen_R_221025_524	534.00	6x12	58.5	Shaker	2025-10-22 00:57:47.406834	Angura	Delivered	Parthiban	2025-10-22 18:16:44.84279	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 15:04:44	Screen_P_211025_516	545.00	12x30	58.8	Shaker	2025-10-21 15:04:56.469162	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 15:04:44	Screen_P_211025_517	500.00	12x30	50.0	Shaker	2025-10-21 15:05:25.120643	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 07:34:44	Screen_R_221025_530	569.00	6x12	56.8	Shaker	2025-10-22 07:34:55.194704	Angura	Delivered	admin	2025-10-30 11:59:16.793932	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:08:09	Screen_R_221025_532	569.00	6x12	55.0	Shaker	2025-10-22 18:08:37.771306	Ramesh	Delivered	Parthiban	2025-11-01 09:04:02.217957	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:08:09	Screen_R_221025_531	588.00	6x12	56.2	Shaker	2025-10-22 18:08:20.896318	Ramesh	Delivered	admin	2025-10-30 12:10:14.976199	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 02:51:41	Screen_R_221025_528	572.00	6x12	56.0	Shaker	2025-10-22 02:56:21.189457	Angura	Delivered	Parthiban	2025-10-22 18:16:50.906041	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 19:26:44	Screen_P_211025_522	490.00	12x30	62.0	Shaker	2025-10-21 19:26:59.196111	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:09:30	Screen_R_221025_534	555.00	6x12	54.5	Shaker	2025-10-22 18:09:40.124206	Ramesh	Delivered	admin	2025-10-30 12:42:17.871115	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:08:09	Screen_R_221025_533	573.00	6x12	53.8	Shaker	2025-10-22 18:08:53.10545	Ramesh	Delivered	Parthiban	2025-11-01 09:04:05.856614	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 17:29:50	Screen_R_211025_519	565.00	6x12	64.1	Shaker	2025-10-21 17:30:02.425839	Ramesh	Delivered	Parthiban	2025-11-01 09:03:54.532742	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 11:50:05	Screen_R_151025_414	529.00	6x12	54.5	Shaker	2025-10-15 11:53:34.280386	Angura	Screening	Parthiban	2025-10-22 11:55:36.140849	loaded	2025-10-22 11:55:41	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-10-22 02:26:06	Screen_V_221025_526	552.00	-30	51.3	Shaker	2025-10-22 02:26:16.666771	Angura	Screening	Thiruppathi	2025-11-16 21:55:48.418142	loaded	2025-11-16 21:55:49	Thiruppathi	\N	552.00	\N	\N	Shaker	{"30x60"}
2025-10-22 02:48:26	Screen_P_221025_527	527.00	12x30	51.0	Shaker	2025-10-22 02:48:36.662697	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-17 01:00:11	Screen_R_171025_436	511.00	6x12	61.8	Shaker	2025-10-17 01:00:25.650176	Ramesh	Delivered	Parthiban	2025-10-22 18:13:19.651955	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 09:22:11	Screen_R_181025_449	571.00	6x12	63.1	Shaker	2025-10-18 09:22:25.630369	Parthiban	Delivered	Parthiban	2025-10-22 18:13:43.141577	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 19:43:07	Screen_R_181025_463	543.00	6x12	62.3	Shaker	2025-10-18 19:43:17.337287	Parthiban	Delivered	Parthiban	2025-10-22 18:14:15.324765	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 10:08:35	Screen_R_191025_475	540.00	6x12	50.6	Shaker	2025-10-19 10:08:47.05229	Ramesh	Delivered	Parthiban	2025-10-22 18:14:39.45691	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 09:29:01	Screen_R_201025_484	560.00	6x12	53.3	Shaker	2025-10-20 09:29:12.596992	Ramesh	Delivered	Parthiban	2025-10-22 18:14:56.106444	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 15:39:04	Screen_R_201025_495	570.00	6x12	55.2	Shaker	2025-10-20 15:39:14.93687	Ramesh	Delivered	Parthiban	2025-10-22 18:15:28.836061	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-20 11:45:21	Screen_L_201025_488	488.00	8x16	54.0	Shaker	2025-10-20 11:45:34.820388	Ramesh	Delivered	Parthiban	2025-10-27 09:23:46.648967	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 06:50:43	Screen_R_211025_508	555.00	6x12	57.6	Shaker	2025-10-21 06:50:51.099332	Angura	Delivered	Parthiban	2025-10-22 18:15:51.941778	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 23:19:38	Screen_R_211025_523	540.00	6x12	59.9	Shaker	2025-10-21 23:19:47.588792	Angura	Delivered	Parthiban	2025-10-22 18:16:26.34902	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-07 18:25:21	Screen_S_071025_290	552.00	8x30	68.3	Shaker	2025-10-07 18:25:31.266177	Ramesh	Delivered	Parthiban	2025-10-22 18:19:25.948811	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-09 23:25:06	Screen_S_091025_323	533.00	8x30	66.1	Shaker	2025-10-09 23:25:17.586583	Angura	Delivered	Parthiban	2025-10-22 18:19:51.005043	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-12 10:55:07	Screen_S_121025_362	523.00	8x30	54.8	Shaker	2025-10-12 10:55:16.95748	Angura	Delivered	Parthiban	2025-10-22 18:20:26.433718	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-15 11:09:23	Screen_S_151025_411	594.00	8x30	59.9	Shaker	2025-10-15 11:09:34.78001	Angura	Delivered	Parthiban	2025-10-22 18:20:57.286509	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-16 07:24:58	Screen_S_161025_426	548.00	8x30	57.4	Shaker	2025-10-16 07:25:21.05036	Ramesh	Delivered	Parthiban	2025-10-22 18:21:29.921237	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-23 14:28:58	Screen_S_230925_058	537.00	8x30	67.0	Shaker	2025-09-23 14:29:09.122363	Ramesh	Delivered	Parthiban	2025-10-22 18:21:43.567134	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 15:25:59	Screen_S_021025_204	503.00	8x30	48.1	Shaker	2025-10-02 15:26:09.168815	Angura	Screening	Thiruppathi	2025-10-23 07:34:02.936968	loaded	2025-10-22 22:34:08	Thiruppathi	\N	550.00	\N	\N	Shaker	{"6x12","8x16","12x20"}
2025-10-22 19:02:09	Screen_L_221025_537	515.00	8x16	55.8	Shaker	2025-10-22 19:02:19.31595	Ramesh	Delivered	Parthiban	2025-10-27 10:25:00.212874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 19:20:15	Screen_L_221025_538	480.00	8x16	53.1	Shaker	2025-10-22 19:20:25.133463	Ramesh	Delivered	Parthiban	2025-10-27 10:25:05.127177	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 08:35:40	Screen_L_231025_542	487.00	8x16	56.7	Shaker	2025-10-23 08:35:55.826149	Ramesh	Delivered	Parthiban	2025-10-27 10:25:11.792224	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 11:48:30	Screen_R_241025_565	550.00	6x12	58.7	Shaker	2025-10-24 11:48:43.215689	Ramesh	Delivered	admin	2025-10-30 12:00:16.168161	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 18:13:52	Screen_R_241025_571	562.00	6x12	58.7	Shaker	2025-10-24 18:14:02.412549	Ramesh	Delivered	admin	2025-10-30 12:00:33.099316	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 03:24:50	Screen_R_241025_556	522.00	6x12	56.4	Shaker	2025-10-24 03:26:13.908934	Angura	Delivered	admin	2025-10-30 12:11:04.664024	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 08:35:40	Screen_L_231025_543	534.00	8x16	52.2	Shaker	2025-10-23 08:36:10.893818	Ramesh	Delivered	Parthiban	2025-10-27 10:25:15.997257	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 08:23:02	Screen_L_241025_557	507.00	8x16	54.2	Shaker	2025-10-24 08:24:30.249105	Ramesh	Delivered	Parthiban	2025-10-27 10:25:28.796846	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 08:52:23	Screen_P_231025_544	515.00	12x30	60.7	Shaker	2025-10-23 08:52:36.945228	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 09:02:05	Screen_P_231025_545	528.00	12x30	54.1	Shaker	2025-10-23 09:02:16.149493	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 09:22:29	Screen_P_231025_546	493.00	12x30	56.0	Shaker	2025-10-23 09:22:40.00801	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 22:52:46	Screen_R_241025_575	553.00	6x12	62.1	Shaker	2025-10-24 22:52:57.519983	Angura	Delivered	Parthiban	2025-11-01 09:04:16.916725	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-26 17:36:21	Screen_S_260925_110	556.00	8x30	52.3	Shaker	2025-09-26 17:36:32.147003	Ramesh	Screening	Parthiban	2025-10-23 14:47:49.281846	loaded	2025-10-23 14:47:56	Parthiban	\N	550.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-24 11:33:53	Screen_L_241025_564	522.00	8x16	61.7	Shaker	2025-10-24 11:34:06.009935	Ramesh	Delivered	Parthiban	2025-10-27 10:25:34.896803	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 17:19:28	Screen_R_231025_552	553.00	6x12	52.5	Shaker	2025-10-23 17:19:38.157885	Ramesh	Delivered	admin	2025-10-30 12:42:56.020371	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 15:19:33	Screen_V_231025_550	531.00	-30	45.3	Shaker	2025-10-23 15:19:51.575751	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 09:10:00	Screen_L_241025_562	496.00	8x16	58.6	Shaker	2025-10-24 09:10:12.752264	Ramesh	Delivered	Parthiban	2025-10-28 12:24:39.370858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 17:32:57	Screen_R_231025_553	569.00	6x12	55.2	Shaker	2025-10-23 17:33:12.882553	Ramesh	Delivered	admin	2025-10-30 12:44:04.517181	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 10:32:59	Screen_R_241025_563	554.00	6x12	60.0	Shaker	2025-10-24 10:33:10.744913	Ramesh	Delivered	admin	2025-10-30 12:44:52.885359	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 22:49:36	Screen_R_221025_539	540.00	6x12	56.6	Shaker	2025-10-22 22:49:47.733527	Angura	Delivered	admin	2025-10-30 11:58:53.80688	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 18:17:00	Screen_L_241025_573	564.00	8x16	57.8	Shaker	2025-10-24 18:17:10.596127	Ramesh	Delivered	Parthiban	2025-10-28 12:24:43.240725	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 14:02:33	Screen_R_231025_549	542.00	6x12	59.5	Shaker	2025-10-23 14:02:42.903133	Ramesh	Delivered	admin	2025-10-30 12:42:45.81287	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 12:45:47	Screen_L_241025_566	476.00	8x16	62.2	Shaker	2025-10-24 12:46:06.081995	Ramesh	Delivered	Parthiban	2025-10-27 10:25:43.116496	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 08:33:16	Screen_P_241025_558	498.00	12x30	57.2	Shaker	2025-10-24 08:33:33.931019	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 08:48:35	Screen_P_241025_559	510.00	12x30	53.7	Shaker	2025-10-24 08:48:51.974509	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 12:45:47	Screen_R_241025_567	537.00	6x12	59.3	Shaker	2025-10-24 12:47:29.850045	Ramesh	Delivered	admin	2025-10-30 12:45:01.120864	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 09:05:50	Screen_P_241025_561	492.00	12x30	59.0	Shaker	2025-10-24 09:06:04.107434	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 02:45:01	Screen_L_251025_578	577.00	8x16	57.8	Shaker	2025-10-25 02:45:15.585771	Angura	Delivered	Parthiban	2025-10-28 12:33:19.977745	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 15:12:59	Screen_R_241025_568	551.00	6x12	58.8	Shaker	2025-10-24 15:13:13.570449	Ramesh	Delivered	admin	2025-10-30 12:45:08.437117	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 15:30:22	Screen_L_241025_569	487.00	8x16	60.5	Shaker	2025-10-24 15:30:35.8447	Ramesh	Delivered	Parthiban	2025-10-27 10:25:47.74395	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 07:10:16	Screen_R_251025_579	543.00	6x12	58.8	Shaker	2025-10-25 07:10:27.272484	Angura	Delivered	admin	2025-10-30 12:00:43.723257	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 15:29:18	Screen_L_231025_551	471.00	8x16	57.3	Shaker	2025-10-23 15:29:30.123055	Ramesh	Delivered	Parthiban	2025-10-28 12:24:30.554427	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 17:11:00	Screen_R_241025_570	560.00	6x12	59.1	Shaker	2025-10-24 17:11:11.462874	Ramesh	Delivered	admin	2025-10-30 12:45:16.357609	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 21:15:10	Screen_R_241025_574	582.00	6x12	59.1	Shaker	2025-10-24 21:15:20.377254	Angura	Delivered	admin	2025-10-30 12:45:27.645304	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 10:48:56	Screen_L_251025_585	568.00	8x16	60.2	Shaker	2025-10-25 10:49:05.587948	Ramesh	Delivered	Parthiban	2025-10-28 12:33:26.441975	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 01:22:38	Screen_R_251025_577	554.00	6x12	59.1	Shaker	2025-10-25 01:23:53.437965	Angura	Delivered	admin	2025-10-30 12:45:42.846578	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 03:15:57	Screen_R_231025_541	552.00	6x12	56.1	Shaker	2025-10-23 03:16:06.055719	Angura	Delivered	admin	2025-10-30 12:09:21.285856	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 18:13:52	Screen_V_241025_572	578.00	-30	52.4	Shaker	2025-10-24 18:14:24.449865	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 19:02:22	Screen_R_231025_555	550.00	6x12	56.5	Shaker	2025-10-23 19:02:32.775328	Ramesh	Delivered	admin	2025-10-30 11:58:42.62217	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 10:22:48	Screen_R_251025_584	571.00	6x12	62.7	Shaker	2025-10-25 10:22:59.775522	Ramesh	Delivered	admin	2025-10-30 12:45:53.43118	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-02 15:31:18	Screen_S_021025_205	552.00	8x30	52.4	Shaker	2025-10-02 15:31:28.497726	Angura	Screening	Parthiban	2025-10-25 10:48:20.519786	loaded	2025-10-25 10:48:22	Parthiban	\N	550.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-25 07:19:27	Screen_P_251025_580	482.00	12x30	57.7	Shaker	2025-10-25 07:19:39.118599	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 07:35:08	Screen_P_251025_581	515.00	12x30	55.8	Shaker	2025-10-25 07:35:19.973895	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 07:45:42	Screen_P_251025_582	501.00	12x30	45.9	Shaker	2025-10-25 07:46:02.292217	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 08:33:23	Screen_P_251025_583	523.00	12x30	56.8	Shaker	2025-10-25 08:33:47.109951	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 00:14:53	Screen_L_261025_598	543.00	8x16	67.3	Shaker	2025-10-26 00:15:05.260289	Angura	Delivered	Parthiban	2025-11-01 11:41:32.333959	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 17:37:26	Screen_R_251025_589	532.00	6x12	55	Shaker	2025-10-25 17:37:50.60423	Ramesh	Delivered	Parthiban	2025-11-01 09:04:28.036903	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 22:33:46	Screen_R_251025_597	537.00	6x12	62.9	Shaker	2025-10-25 22:37:50.478053	Angura	Delivered	Parthiban	2025-11-01 09:04:31.881623	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 14:05:10	Screen_L_261025_607	551.00	8x16	62.7	Shaker	2025-10-26 14:05:21.338804	Angura	Delivered	Parthiban	2025-10-28 12:25:08.50626	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 18:08:11	Screen_P_251025_591	485.00	12x30	59.8	Shaker	2025-10-25 18:08:24.319977	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 18:16:34	Screen_P_251025_592	535.00	12x30	56.7	Shaker	2025-10-25 18:16:59.903724	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 18:31:06	Screen_P_251025_593	485.00	12x30	58.5	Shaker	2025-10-25 18:31:21.450791	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 22:33:46	Screen_R_251025_596	535.00	6x12	60.6	Shaker	2025-10-25 22:33:56.899449	Angura	Delivered	admin	2025-10-30 12:46:25.42801	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 00:59:51	Screen_L_271025_621	543.00	8x16	60.7	Shaker	2025-10-27 01:00:01.479265	Ramesh	Delivered	Parthiban	2025-10-28 12:26:31.084949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 14:35:01	Screen_R_251025_586	540.00	6x12	58.3	Shaker	2025-10-25 14:35:19.252018	Ramesh	Delivered	Parthiban	2025-11-01 09:04:20.881751	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 08:42:34	Screen_R_261025_603	559.00	6x12	63.1	Shaker	2025-10-26 08:42:48.232133	Angura	Delivered	Parthiban	2025-11-01 09:04:35.838137	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-08 03:03:56	Screen_S_081025_294	552.00	8x30	74.8	Shaker	2025-10-08 03:04:38.81505	Angura	Screening	Thiruppathi	2025-10-26 07:12:24.786434	loaded	2025-10-26 07:12:26	Thiruppathi	\N	550.00	\N	\N	Shaker	{"6x12","8x16","12x20"}
2025-10-26 10:34:15	Screen_L_261025_605	546.00	8x16	63.3	Shaker	2025-10-26 10:35:21.539881	Angura	Delivered	Parthiban	2025-11-01 11:41:39.674007	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 09:33:38	Screen_R_271025_630	550.00	6x12	60.1	Shaker	2025-10-27 09:33:49.98581	Angura	Delivered	admin	2025-10-30 12:09:10.784162	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 02:46:25	Screen_V_261025_600	544.00	-30	55.7	Shaker	2025-10-26 02:46:37.354417	Angura	Screening	Thiruppathi	2025-11-16 21:55:42.244135	loaded	2025-11-16 21:55:49	Thiruppathi	\N	544.00	\N	\N	Shaker	{"30x60"}
2025-10-26 17:47:57	Screen_L_261025_613	540.00	8x16	65.3	Shaker	2025-10-26 17:48:10.181754	Angura	Delivered	Parthiban	2025-11-01 11:41:43.433817	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 07:13:21	Screen_P_261025_602	512.00	12x30	55.2	Shaker	2025-10-26 07:13:35.746766	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 12:48:31	Screen_R_261025_606	521.00	6x12	65.7	Shaker	2025-10-26 12:48:42.15874	Angura	Delivered	Parthiban	2025-11-01 09:04:39.656044	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 17:18:06	Screen_R_271025_637	544.00	6x12	60.0	Shaker	2025-10-27 17:18:40.692805	Angura	Delivered	admin	2025-10-30 12:09:51.401158	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 18:09:32	Screen_L_261025_614	509.00	8x16	62.9	Shaker	2025-10-26 18:09:43.163901	Angura	Delivered	Parthiban	2025-11-01 11:41:47.348949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 14:22:35	Screen_R_261025_608	537.00	6x12	57.4	Shaker	2025-10-26 14:22:46.987187	Angura	Delivered	Parthiban	2025-11-01 09:04:43.577141	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 06:50:32	Screen_L_271025_624	540.00	8x16	58.9	Shaker	2025-10-27 06:52:17.91599	Ramesh	Delivered	Parthiban	2025-10-28 12:26:35.998067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 07:49:33	Screen_R_271025_627	537.00	6x12	61.2	Shaker	2025-10-27 07:49:51.661156	Ramesh	Delivered	Parthiban	2025-11-01 09:04:53.80182	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 16:51:13	Screen_P_261025_609	498.00	12x30	60.7	Shaker	2025-10-26 16:51:28.961482	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 16:51:13	Screen_P_261025_610	492.00	12x30	60.1	Shaker	2025-10-26 16:52:55.222154	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 17:05:09	Screen_P_261025_611	514.00	12x30	62.6	Shaker	2025-10-26 17:05:21.974639	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 17:20:10	Screen_P_261025_612	479.00	12x30	59.3	Shaker	2025-10-26 17:20:22.306866	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 18:12:52	Screen_L_261025_615	526.00	8x16	65.6	Shaker	2025-10-26 18:13:03.447137	Angura	Delivered	Parthiban	2025-11-01 11:41:51.16909	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 08:56:26	Screen_L_271025_629	530.00	8x16	60.9	Shaker	2025-10-27 08:56:49.977051	Angura	Delivered	Parthiban	2025-11-01 11:42:04.694024	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 12:30:02	Screen_R_271025_631	542.00	6x12	55.1	Shaker	2025-10-27 12:31:16.531036	Angura	Delivered	Parthiban	2025-11-01 09:04:58.396797	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 18:49:02	Screen_R_251025_594	562.00	6x12	58.9	Shaker	2025-10-25 18:49:14.570482	Ramesh	Delivered	admin	2025-10-30 12:46:16.798288	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 21:45:01	Screen_R_261025_617	548.00	6x12	59.0	Shaker	2025-10-26 21:45:12.23131	Ramesh	Delivered	admin	2025-10-30 12:11:26.851852	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-18 12:09:24	Screen_S_180925_942	561.00	8x30	69.2	Shaker	2025-09-18 12:10:01.686249	Angura	Screening	Parthiban	2025-10-27 08:53:08.621901	loaded	2025-10-27 08:53:17	Parthiban	\N	550.00	\N	\N	Shaker	{"8x16","12x20"}
2025-10-20 14:06:45	Screen_L_201025_491	464.00	8x16	58.0	Shaker	2025-10-20 14:07:02.900397	Ramesh	Delivered	Parthiban	2025-10-27 09:23:53.822834	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-21 09:35:49	Screen_L_211025_510	513.00	8x16	58.2	Shaker	2025-10-21 09:36:07.125317	Ramesh	Delivered	Parthiban	2025-10-27 09:24:28.751117	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-08 10:10:03	Screen_L_080925_736	516.00	8x16	62.0	Shaker	2025-09-08 10:10:23.010709	Ramesh	Delivered	Parthiban	2025-10-27 10:15:39.371748	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-18 06:57:32	Screen_L_181025_447	535.00	8x16	64.9	Shaker	2025-10-18 06:57:38.833757	Parthiban	Delivered	Parthiban	2025-10-27 10:16:42.626875	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 06:03:54	Screen_L_191025_470	534.00	8x16	54.8	Shaker	2025-10-19 06:07:38.963252	Ramesh	Delivered	Parthiban	2025-10-27 10:21:32.715927	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 07:27:15	Screen_L_221025_529	458.00	8x16	52.0	Shaker	2025-10-22 07:27:27.238769	Angura	Delivered	Parthiban	2025-10-27 10:24:51.95017	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:36:20	Screen_L_221025_536	536.00	8x16	54.5	Shaker	2025-10-22 18:36:31.044753	Ramesh	Delivered	Parthiban	2025-10-27 10:24:55.726437	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 12:14:13	Screen_L_231025_548	493.00	8x16	54.6	Shaker	2025-10-23 12:14:26.027328	Ramesh	Delivered	Parthiban	2025-10-27 10:25:20.087195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 01:36:08	Screen_R_261025_599	568.00	6x12	61.1	Shaker	2025-10-26 01:36:21.048997	Angura	Delivered	admin	2025-10-30 12:05:46.04524	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 21:48:22	Screen_R_261025_618	525.00	6x12	59.7	Shaker	2025-10-26 21:48:42.284415	Ramesh	Delivered	admin	2025-10-30 12:11:18.079305	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 01:33:16	Screen_R_271025_622	545.00	6x12	59	Shaker	2025-10-27 01:33:27.10998	Ramesh	Delivered	admin	2025-10-30 12:10:34.854238	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 10:19:31	Screen_R_261025_604	550.00	6x12	60.4	Shaker	2025-10-26 10:19:49.683968	Angura	Delivered	admin	2025-10-30 12:09:34.271496	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 07:15:34	Screen_P_271025_625	511.00	12x30	58.4	Shaker	2025-10-27 07:16:28.525683	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 07:23:15	Screen_P_271025_626	525.00	12x30	61.4	Shaker	2025-10-27 07:23:29.398543	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 15:11:51	Screen_R_271025_633	543.00	6x12	60.1	Shaker	2025-10-27 15:12:02.427494	Angura	Delivered	Parthiban	2025-11-01 09:05:01.910717	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 07:54:23	Screen_V_271025_628	592.00	-30	55.3	Shaker	2025-10-27 07:54:48.197027	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 03:20:21	Screen_R_271025_623	540.00	6x12	59.1	Shaker	2025-10-27 03:20:36.300933	Ramesh	Delivered	admin	2025-10-30 12:10:25.596105	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 15:15:26	Screen_L_251025_587	537.00	8x16	64.7	Shaker	2025-10-25 15:15:39.312565	Ramesh	Delivered	Parthiban	2025-11-01 11:41:25.153861	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 16:49:27	Screen_P_271025_635	489.00	12x30	60.4	Shaker	2025-10-27 16:49:47.172604	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 17:04:08	Screen_P_271025_636	499.00	12x30	61.1	Shaker	2025-10-27 17:04:20.328025	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 23:00:26	Screen_L_241025_576	527.00	8x16	58.0	Shaker	2025-10-24 23:00:39.478073	Angura	Delivered	Parthiban	2025-10-28 12:24:49.438639	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 18:11:08	Screen_P_271025_638	528.00	12x30	63.5	Shaker	2025-10-27 18:13:49.516275	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 02:17:43	Screen_R_281025_641	518.00	6x12	58.0	Shaker	2025-10-28 02:17:56.254391	Ramesh	Delivered	Parthiban	2025-11-01 09:05:10.496648	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 08:33:12	Screen_L_281025_643	564.00	8x16	63.5	Shaker	2025-10-28 08:33:23.751864	Angura	Delivered	Parthiban	2025-11-01 11:42:15.903952	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 17:54:31	Screen_300925_172	454.00	4x8	57.4	Shaker	2025-09-30 17:54:47.163271	Angura	Screening	Parthiban	2025-10-28 12:09:26.378181	loaded	2025-10-28 12:09:29	Parthiban	\N	454.00	\N	\N	Shaker	{"8x16","12x20"}
2025-09-05 02:35:09	Screen_L_050925_688	492.00	8x16	68.6	Shaker	2025-09-05 02:39:22.658072	Ramesh	Delivered	Parthiban	2025-10-28 12:23:53.048031	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-06 15:49:27	Screen_L_060925_713	538.00	8x16	65.3	Shaker	2025-09-06 15:49:38.607005	Angura	Delivered	Parthiban	2025-10-28 12:24:10.212823	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 17:53:29	Screen_L_231025_554	527.00	8x16	56.4	Shaker	2025-10-23 17:53:40.717282	Ramesh	Delivered	Parthiban	2025-10-28 12:24:34.530874	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 19:36:17	Screen_L_251025_595	530.00	8x16	56.9	Shaker	2025-10-25 19:36:31.822718	Ramesh	Delivered	Parthiban	2025-10-28 12:25:01.742169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 00:52:55	Screen_L_271025_620	536.00	8x16	60.2	Shaker	2025-10-27 00:53:03.509142	Ramesh	Delivered	Parthiban	2025-10-28 12:26:24.928236	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 10:09:06	Screen_R_281025_647	551.00	6x12	57.5	Shaker	2025-10-28 10:09:49.459911	Angura	Delivered	Parthiban	2025-11-01 09:05:14.27683	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 07:34:26	Screen_P_281025_642	536.00	12x30	65.2	Shaker	2025-10-28 07:34:46.95548	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 09:39:52	Screen_L_281025_646	551.00	8x16	63.6	Shaker	2025-10-28 09:40:04.998281	Angura	Delivered	Parthiban	2025-11-01 11:42:19.573896	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 08:50:38	Screen_P_281025_644	506.00	12x30	59.3	Shaker	2025-10-28 08:52:06.95776	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 17:54:55	Screen_R_281025_654	559.00	6x12	58.8	Shaker	2025-10-28 17:55:04.508882	Angura	Delivered	admin	2025-10-30 12:11:39.455828	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 12:47:28	Screen_L_281025_650	551.00	8x16	57.7	Shaker	2025-10-28 12:47:37.47016	Angura	Delivered	Parthiban	2025-11-01 11:42:28.508986	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 12:08:48	Screen_R_281025_649	557.00	6x12	60.8	Shaker	2025-10-28 12:08:59.982018	Angura	Delivered	Parthiban	2025-11-01 09:05:17.981903	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 06:23:39	Screen_R_291025_662	560.00	6x12	55.4	Shaker	2025-10-29 06:23:56.136078	Ramesh	Delivered	Parthiban	2025-11-01 09:05:26.931691	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 17:39:11	Screen_L_251025_590	572.00	8x16	57.3	Shaker	2025-10-25 17:39:20.670717	Ramesh	Screening	Parthiban	2025-10-28 12:24:55.582834	loaded	2025-10-28 17:29:14	admin	\N	550.00	\N	\N	Shaker	{"8x16"}
2025-10-28 17:30:05	Screen_L_281025_652	550.00	8x16	560	Shaker	2025-10-28 17:30:33.411277	admin	Delivered	admin	2025-10-28 17:31:21.751467	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 17:43:01	Screen_L_281025_653	561.00	8x16	58.1	Shaker	2025-10-28 17:43:33.199004	Angura	Delivered	Parthiban	2025-11-01 11:42:35.088293	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 02:06:24	Screen_L_291025_661	550.00	8x16	59.5	Shaker	2025-10-29 02:06:34.939283	Ramesh	Delivered	Parthiban	2025-11-01 11:42:44.908346	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 18:45:41	Screen_P_281025_655	474.00	12x30	56.0	Shaker	2025-10-28 18:46:08.080178	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 19:11:22	Screen_P_281025_656	440.00	12x30	52.5	Shaker	2025-10-28 19:11:44.362775	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-19 15:46:45	Screen_R_191025_478	547.00	6x12	55.0	Shaker	2025-10-19 15:47:53.64299	Ramesh	Delivered	admin	2025-10-30 12:42:05.016012	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-24 08:59:35	Screen_R_241025_560	557.00	6x12	54.6	Shaker	2025-10-24 08:59:45.225226	Ramesh	Delivered	admin	2025-10-30 12:44:19.155642	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 12:18:41	Screen_R_291025_666	579.00	6x12	58.4	Shaker	2025-10-29 12:30:01.587087	Angura	Delivered	Parthiban	2025-11-01 09:05:30.457055	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 07:17:12	Screen_S_291025_663	550.00	8x30	59.9	Shaker	2025-10-29 07:17:21.28408	Ramesh	Delivered	Parthiban	2025-11-08 19:36:05.556267	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 12:18:41	Screen_S_291025_665	582.00	8x30	58.3	Shaker	2025-10-29 12:19:04.186612	Angura	Delivered	Parthiban	2025-11-08 19:36:16.629202	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 15:23:52	Screen_R_291025_667	532.00	6x12	61.4	Shaker	2025-10-29 15:24:03.170795	Angura	Delivered	Parthiban	2025-11-01 09:05:33.811892	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 16:08:01	Screen_S_291025_668	549.00	8x30	59.6	Shaker	2025-10-29 16:08:27.644566	Angura	Delivered	Parthiban	2025-11-08 19:36:24.47018	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 07:23:53	Screen_P_291025_664	503.00	12x30	59.6	Shaker	2025-10-29 07:24:04.50783	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 18:30:31	Screen_S_291025_670	508.00	8x30	60.9	Shaker	2025-10-29 18:30:52.710693	Angura	Delivered	Parthiban	2025-11-08 19:36:33.485507	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 16:37:39	Screen_R_291025_669	546.00	6x12	63.0	Shaker	2025-10-29 16:37:52.072365	Angura	Delivered	Parthiban	2025-11-01 09:05:37.418591	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 19:04:35	Screen_R_291025_671	555.00	6x12	62.4	Shaker	2025-10-29 19:04:46.301817	Angura	Delivered	Parthiban	2025-11-01 09:05:41.59688	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 06:24:12	Screen_S_301025_677	547.00	8x30	62.7	Shaker	2025-10-30 07:25:08.219728	Parthiban	Delivered	Parthiban	2025-11-08 19:36:51.707995	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 23:55:45	Screen_R_291025_676	542.00	6x12	63.2	Shaker	2025-10-30 04:40:09.498912	Parthiban	Delivered	Parthiban	2025-11-01 09:05:49.411615	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 18:25:22	Screen_S_301025_683	578.00	8x30	61.3	Shaker	2025-10-30 18:25:50.013884	Angura	Delivered	Parthiban	2025-11-08 19:37:03.620867	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 07:39:57	Screen_R_301025_678	539.00	6x12	64.8	Shaker	2025-10-30 08:02:23.975204	Parthiban	Delivered	Parthiban	2025-11-01 09:05:53.27682	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 22:34:16	Screen_V_291025_672	580.00	-30	41.2	Shaker	2025-10-29 22:34:30.694284	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 15:16:00	Screen_R_301025_680	547.00	6x12	55.6	Shaker	2025-10-30 15:16:20.949389	Angura	Delivered	Parthiban	2025-11-01 09:05:56.941752	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 18:35:45	Screen_S_301025_684	542.00	8x30	62.5	Shaker	2025-10-30 18:35:59.572839	Angura	Delivered	Parthiban	2025-11-08 19:37:14.857249	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 23:55:45	Screen_S_291025_675	554.00	8x30	64.0	Shaker	2025-10-30 04:39:51.733651	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 15:26:13	Screen_R_301025_681	551.00	6x12	59.2	Shaker	2025-10-30 15:26:23.707615	Angura	Delivered	Parthiban	2025-11-01 09:06:00.676661	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 18:47:34	Screen_S_301025_685	548.00	8x30	58.1	Shaker	2025-10-30 18:47:46.300881	Angura	Delivered	Parthiban	2025-11-08 19:37:24.438405	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 17:23:28	Screen_R_301025_682	555.00	6x12	64.1	Shaker	2025-10-30 17:23:40.204638	Angura	Delivered	Parthiban	2025-11-01 09:06:03.92201	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 01:24:18	Screen_R_231025_540	565.00	6x12	56.6	Shaker	2025-10-23 01:25:07.125951	Angura	Delivered	admin	2025-10-30 11:59:02.483618	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 09:35:56	Screen_R_281025_645	586.00	6x12	57.5	Shaker	2025-10-28 09:36:06.144898	Angura	Delivered	admin	2025-10-30 11:59:41.955873	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 23:04:15	Screen_R_281025_658	554.00	6x12	56.4	Shaker	2025-10-28 23:04:24.470047	Ramesh	Delivered	admin	2025-10-30 11:59:50.969169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 19:16:06	Screen_R_281025_657	559.00	6x12	57.6	Shaker	2025-10-28 19:16:17.780442	Angura	Delivered	admin	2025-10-30 11:59:57.684671	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 15:12:41	Screen_R_281025_651	540.00	6x12	58.7	Shaker	2025-10-28 15:12:53.981214	Angura	Delivered	admin	2025-10-30 12:00:56.679344	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 23:34:48	Screen_R_261025_619	535.00	6x12	57.2	Shaker	2025-10-26 23:35:01.75302	Ramesh	Delivered	admin	2025-10-30 12:10:06.946649	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 00:16:09	Screen_L_281025_640	505.00	8x16	65.1	Shaker	2025-10-28 00:17:27.597518	Ramesh	Delivered	Parthiban	2025-11-01 11:42:11.621629	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-28 00:16:09	Screen_R_281025_639	520.00	6x12	67.3	Shaker	2025-10-28 00:16:19.044956	Ramesh	Delivered	Parthiban	2025-11-01 09:05:06.913165	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 12:23:51	Screen_S_301025_679	560.00	8x30	65.1	Shaker	2025-10-30 12:24:05.54263	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 11:55:45	Screen_R_311025_697	569.00	6x12	59.2	Shaker	2025-10-31 11:55:55.396725	Angura	Delivered	Parthiban	2025-11-01 09:06:31.795711	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 02:03:11	Screen_S_311025_689	557.00	8x30	58.1	Shaker	2025-10-31 02:03:20.33184	Ramesh	Delivered	Parthiban	2025-11-08 19:37:45.222571	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 03:07:02	Screen_S_311025_691	530.00	8x30	58.9	Shaker	2025-10-31 03:07:12.312616	Ramesh	Delivered	Parthiban	2025-11-08 19:37:55.98483	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 14:32:41	Screen_R_311025_698	552.00	6x12	61.7	Shaker	2025-10-31 14:32:50.799923	Angura	Delivered	Parthiban	2025-11-01 09:06:35.397932	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 08:19:57	Screen_S_311025_693	546.00	8x30	59.3	Shaker	2025-10-31 08:20:07.050862	Angura	Delivered	Parthiban	2025-11-08 19:38:09.393992	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 16:26:21	Screen_R_311025_700	547.00	6x12	59.2	Shaker	2025-10-31 16:26:32.710934	Angura	Delivered	Parthiban	2025-11-01 09:06:38.735738	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 18:33:10	Screen_S_311025_702	551.00	8x30	61.2	Shaker	2025-10-31 18:33:22.458662	Angura	Delivered	Parthiban	2025-11-08 19:39:18.401933	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 09:29:55	Screen_V_311025_694	581.00	-30	25.1	Shaker	2025-10-31 09:30:05.87595	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 18:06:00	Screen_R_311025_701	557.00	6x12	59.4	Shaker	2025-10-31 18:06:11.161889	Angura	Delivered	Parthiban	2025-11-01 09:06:42.815845	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 10:42:25	Screen_S_311025_696	551.00	8x30	58.4	Shaker	2025-10-31 10:42:33.664699	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 22:50:22	Screen_V_011125_716	574.00	-30	50.1	Shaker	2025-11-01 22:50:33.83261	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 18:55:44	Screen_S_311025_703	551.00	8x30	60.9	Shaker	2025-10-31 18:55:53.24776	Angura	Delivered	Parthiban	2025-11-08 19:39:32.708067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 01:39:32	Screen_R_021125_720	550.00	6x12	60.4	Shaker	2025-11-02 01:39:43.101706	Ramesh	Delivered	Parthiban	2025-11-08 19:17:56.07133	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 01:40:59	Screen_R_011125_705	539.00	6x12	60.6	Shaker	2025-11-01 01:41:10.113897	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 02:23:59	Screen_S_011125_707	557.00	8x30	59.3	Shaker	2025-11-01 02:24:08.846993	Ramesh	Delivered	Parthiban	2025-11-08 19:30:25.617309	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 07:49:09	Screen_S_011125_709	542.00	8x30	56.2	Shaker	2025-11-01 07:49:19.166682	Ramesh	Delivered	Parthiban	2025-11-08 19:30:33.698785	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 02:41:54	Screen_R_011125_708	536.00	6x12	58.3	Shaker	2025-11-01 02:42:03.593289	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-22 18:15:17	Screen_R_221025_535	560.00	6x12	53.4	Shaker	2025-10-22 18:15:26.736301	Ramesh	Delivered	Parthiban	2025-11-01 09:04:09.546724	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-23 11:04:13	Screen_R_231025_547	541.00	6x12	56.0	Shaker	2025-10-23 11:05:04.404805	Ramesh	Delivered	Parthiban	2025-11-01 09:04:13.197708	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-25 15:20:11	Screen_R_251025_588	568.00	6x12	55.0	Shaker	2025-10-25 15:20:19.972888	Ramesh	Delivered	Parthiban	2025-11-01 09:04:24.326965	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 18:31:55	Screen_R_261025_616	552.00	6x12	61.4	Shaker	2025-10-26 18:32:05.227239	Angura	Delivered	Parthiban	2025-11-01 09:04:47.256809	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 01:31:36	Screen_R_291025_659	542.00	6x12	55.2	Shaker	2025-10-29 01:31:43.894303	Ramesh	Delivered	Parthiban	2025-11-01 09:05:22.926692	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 23:55:45	Screen_R_291025_673	529.00	6x12	65.1	Shaker	2025-10-29 23:55:56.194345	Parthiban	Delivered	Parthiban	2025-11-01 09:05:45.986757	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-30 19:28:32	Screen_R_301025_686	548.00	6x12	57.7	Shaker	2025-10-30 19:29:09.344094	Angura	Delivered	Parthiban	2025-11-01 09:06:07.666877	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 01:24:54	Screen_R_311025_687	542.00	6x12	61.8	Shaker	2025-10-31 01:25:03.815261	Ramesh	Delivered	Parthiban	2025-11-01 09:06:15.255923	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 02:28:18	Screen_R_311025_690	540.00	6x12	60.6	Shaker	2025-10-31 02:28:26.714743	Ramesh	Delivered	Parthiban	2025-11-01 09:06:19.267095	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 07:57:05	Screen_R_311025_692	537.00	6x12	59.6	Shaker	2025-10-31 07:57:20.131148	Ramesh	Delivered	Parthiban	2025-11-01 09:06:23.455966	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 09:29:55	Screen_R_311025_695	530.00	6x12	60.5	Shaker	2025-10-31 09:30:51.134839	Angura	Delivered	Parthiban	2025-11-01 09:06:27.581067	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 20:44:01	Screen_R_311025_704	598.00	6x12	57.7	Shaker	2025-10-31 20:44:10.747753	Ramesh	Delivered	Parthiban	2025-11-01 09:06:45.975873	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-26 07:02:05	Screen_L_261025_601	520.00	8x16	62.4	Shaker	2025-10-26 07:02:20.295836	Angura	Delivered	Parthiban	2025-11-01 11:41:36.21392	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 12:30:02	Screen_L_271025_632	549.00	8x16	63.6	Shaker	2025-10-27 12:31:29.050424	Angura	Delivered	Parthiban	2025-11-01 11:42:00.434116	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-27 16:42:16	Screen_L_271025_634	543.00	8x16	62.1	Shaker	2025-10-27 16:42:28.475688	Angura	Delivered	Parthiban	2025-11-01 11:42:08.014769	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 01:44:19	Screen_L_291025_660	575.00	8x16	57.1	Shaker	2025-10-29 01:44:29.878595	Ramesh	Delivered	Parthiban	2025-11-01 11:42:41.16882	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 16:55:52	Screen_S_011125_713	543.00	8x30	60.3	Shaker	2025-11-01 16:56:02.000146	Angura	Delivered	Parthiban	2025-11-08 19:30:49.796802	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 08:27:49	Screen_R_011125_710	562.00	6x12	61.5	Shaker	2025-11-01 08:27:59.987035	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 03:46:37	Screen_R_021125_721	549.00	6x12	62.0	Shaker	2025-11-02 03:46:51.990817	Ramesh	Delivered	Parthiban	2025-11-08 19:18:00.278425	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 19:32:17	Screen_R_011125_715	535.00	6x12	58.0	Shaker	2025-11-01 19:33:04.551676	Angura	Delivered	Parthiban	2025-11-08 19:17:48.131429	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 23:23:51	Screen_S_011125_718	576.00	8x30	60.5	Shaker	2025-11-01 23:24:01.139705	Ramesh	Delivered	Parthiban	2025-11-08 19:30:57.822278	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 23:55:42	Screen_S_011125_719	517.00	8x30	60.5	Shaker	2025-11-01 23:55:56.828146	Ramesh	Delivered	Parthiban	2025-11-08 19:31:04.848265	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 15:45:39	Screen_R_011125_711	560.00	6x12	60.0	Shaker	2025-11-01 15:45:52.706026	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 08:56:46	Screen_S_021125_724	551.00	8x30	60.9	Shaker	2025-11-02 08:57:11.431898	Ramesh	Delivered	Parthiban	2025-11-08 19:31:11.261922	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 14:00:50	Screen_S_021125_726	568.00	8x30	60.2	Shaker	2025-11-02 14:02:26.758541	Ramesh	Delivered	Parthiban	2025-11-08 19:31:17.58392	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 08:32:24	Screen_R_021125_723	539.00	6x12	60.6	Shaker	2025-11-02 08:32:39.417043	Ramesh	Delivered	Parthiban	2025-11-08 19:18:04.631353	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 10:33:48	Screen_R_021125_725	558.00	6x12	60.1	Shaker	2025-11-02 10:34:03.435542	Ramesh	Delivered	Parthiban	2025-11-08 19:18:08.171284	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 14:00:50	Screen_R_021125_727	561.00	6x12	59.6	Shaker	2025-11-02 14:02:40.030577	Ramesh	Delivered	Parthiban	2025-11-08 19:18:11.671264	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 23:13:29	Screen_S_021125_734	562.00	8x30	58.9	Shaker	2025-11-02 23:13:40.526033	Angura	Delivered	Parthiban	2025-11-08 19:31:32.633002	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 03:46:37	Screen_S_021125_722	566.00	8x30	64.2	Shaker	2025-11-02 03:47:16.109864	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 19:30:17	Screen_R_021125_732	538.00	6x12	58.2	Shaker	2025-11-02 19:30:29.037579	Ramesh	Delivered	Parthiban	2025-11-08 19:18:27.048962	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 01:54:20	Screen_S_311025_688	551.00	8x30	60.5	Shaker	2025-10-31 01:54:33.266616	Ramesh	Delivered	Parthiban	2025-11-08 19:37:30.734312	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 22:59:47	Screen_R_021125_733	545.00	6x12	60.8	Shaker	2025-11-02 22:59:57.985859	Angura	Delivered	Parthiban	2025-11-08 19:18:30.498994	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 02:06:18	Screen_S_011125_706	539.00	8x30	56.8	Shaker	2025-11-01 02:06:36.567307	Ramesh	Delivered	Parthiban	2025-11-08 19:30:17.294013	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 18:42:19	Screen_S_021125_731	521.00	8x30	50.1	Shaker	2025-11-02 18:42:29.538274	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 17:07:47	Screen_R_011125_714	541.00	6x12	60.5	Shaker	2025-11-01 17:08:18.786753	Angura	Delivered	Parthiban	2025-11-08 19:17:43.874195	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 06:36:50	Screen_R_031125_736	559.00	6x12	60.0	Shaker	2025-11-03 06:37:00.185611	Angura	Delivered	Parthiban	2025-11-08 19:18:41.720015	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 08:14:44	Screen_R_031125_739	538.00	6x12	62.5	Shaker	2025-11-03 08:15:00.544492	Ramesh	Delivered	Parthiban	2025-11-08 19:18:46.404949	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 07:50:14	Screen_S_031125_738	536.00	8x30	59.2	Shaker	2025-11-03 07:50:27.569187	Angura	Delivered	Parthiban	2025-11-08 19:32:14.962441	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 15:14:55	Screen_S_031125_744	561.00	8x30	60.2	Shaker	2025-11-03 15:15:26.887106	Ramesh	Delivered	Parthiban	2025-11-08 19:32:33.253766	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 11:14:05	Screen_R_031125_740	554.00	6x12	56.0	Shaker	2025-11-03 11:14:20.343866	Ramesh	Delivered	Parthiban	2025-11-08 19:18:50.034925	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 15:14:55	Screen_R_031125_745	560.00	6x12	61.1	Shaker	2025-11-03 15:15:39.876216	Ramesh	Delivered	Parthiban	2025-11-08 19:18:58.799873	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 17:25:39	Screen_S_031125_747	560.00	8x30	61.6	Shaker	2025-11-03 17:25:54.90575	Ramesh	Delivered	Parthiban	2025-11-08 19:32:43.977423	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 17:17:18	Screen_R_031125_746	553.00	6x12	63.7	Shaker	2025-11-03 17:17:29.271614	Ramesh	Delivered	Parthiban	2025-11-08 19:19:02.974971	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 12:53:57	Screen_V_031125_743	584.00	-30	23.2	Shaker	2025-11-03 12:54:39.992932	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 19:33:26	Screen_S_031125_748	527.00	8x30	63.3	Shaker	2025-11-03 19:33:34.945374	Ramesh	Delivered	Parthiban	2025-11-08 19:32:51.62974	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 19:48:01	Screen_R_031125_749	546.00	6x12	58.5	Shaker	2025-11-03 19:48:12.36533	Ramesh	Delivered	Parthiban	2025-11-08 19:19:07.714925	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 00:33:11	Screen_R_041125_752	536.00	6x12	61.0	Shaker	2025-11-04 00:33:26.317222	Angura	Delivered	Parthiban	2025-11-08 19:19:19.43651	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 15:44:49	Screen_S_041125_757	545.00	8x30	56.1	Shaker	2025-11-04 15:45:07.848236	Ramesh	Delivered	Parthiban	2025-11-08 19:33:04.468994	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 15:55:09	Screen_S_041125_758	553.00	8x30	62.2	Shaker	2025-11-04 15:56:51.999426	Ramesh	Delivered	Parthiban	2025-11-08 19:33:14.654768	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 08:29:35	Screen_R_041125_755	0.00	6x12	55	Shaker	2025-11-04 08:31:45.444935	Veeramani	Delivered	Parthiban	2025-11-08 19:19:25.897636	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 22:05:52	Screen_R_031125_750	548.00	6x12	62.1	Shaker	2025-11-03 22:06:07.945642	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 07:57:12	Screen_S_041125_754	537.00	8x30	65.1	Shaker	2025-11-04 07:59:16.602211	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 23:00:30	Screen_S_031125_751	576.00	8x30	57.8	Shaker	2025-11-03 23:00:55.030506	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 16:31:51	Screen_R_041125_759	565.00	6x12	63.6	Shaker	2025-11-04 16:32:02.997727	Ramesh	Delivered	Parthiban	2025-11-08 19:19:39.568619	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 06:36:50	Screen_S_031125_737	534.00	8x30	63.3	Shaker	2025-11-03 06:53:12.534301	Angura	Delivered	Parthiban	2025-11-08 19:31:56.693858	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 17:32:20	Screen_R_041125_760	548.00	6x12	62.3	Shaker	2025-11-04 17:32:30.896148	Ramesh	Delivered	Parthiban	2025-11-08 19:19:45.912925	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 01:52:20	Screen_S_051125_769	523.00	8x30	62.8	Shaker	2025-11-05 01:52:34.819754	Angura	Delivered	Parthiban	2025-11-08 19:33:38.715243	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 18:51:47	Screen_R_041125_763	551.00	6x12	63.9	Shaker	2025-11-04 18:52:01.835843	Ramesh	Delivered	Parthiban	2025-11-08 19:19:59.375402	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 19:48:44	Screen_R_041125_764	528.00	6x12	61.1	Shaker	2025-11-04 19:48:53.66463	Ramesh	Delivered	Parthiban	2025-11-08 19:20:05.617407	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 22:52:01	Screen_R_041125_766	574.00	6x12	65.8	Shaker	2025-11-04 22:52:17.54541	Angura	Delivered	Parthiban	2025-11-08 19:20:10.362115	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 07:33:25	Screen_R_051125_773	535.00	6x12	60.1	Shaker	2025-11-05 07:33:36.701369	Angura	Delivered	Parthiban	2025-11-08 19:20:40.081715	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 10:32:01	Screen_R_051125_775	581.00	6x12	57.4	Shaker	2025-11-05 10:32:12.070997	Ramesh	Delivered	Parthiban	2025-11-08 19:20:45.173749	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 06:41:14	Screen_S_051125_772	549.00	8x30	56.9	Shaker	2025-11-05 06:41:27.587013	Angura	Delivered	Parthiban	2025-11-08 19:34:03.600148	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 17:39:07	Screen_S_041125_761	543.00	8x30	63.3	Shaker	2025-11-04 17:39:18.665039	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 18:39:24	Screen_S_041125_762	582.00	8x30	63.3	Shaker	2025-11-04 18:39:38.077453	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 09:56:59	Screen_S_051125_774	554.00	8x30	62.2	Shaker	2025-11-05 09:57:20.387868	Ramesh	Delivered	Parthiban	2025-11-08 19:34:14.62341	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 23:41:35	Screen_S_041125_767	532.00	8x30	65.2	Shaker	2025-11-04 23:41:50.635989	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 01:06:56	Screen_R_051125_768	563.00	6x12	61.1	Shaker	2025-11-05 01:07:06.111252	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 19:17:25	Screen_S_051125_781	560.00	8x30	56.4	Shaker	2025-11-05 19:17:40.720549	Ramesh	Delivered	Parthiban	2025-11-08 19:34:30.84824	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 12:48:28	Screen_R_051125_776	568.00	6x12	54.3	Shaker	2025-11-05 12:48:43.194043	Ramesh	Delivered	Parthiban	2025-11-08 19:20:58.533567	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 15:50:53	Screen_R_051125_778	552.00	6x12	52.5	Shaker	2025-11-05 15:51:08.918687	Ramesh	Delivered	Parthiban	2025-11-08 19:21:06.653678	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 00:31:20	Screen_S_061125_784	529.00	8x30	60.8	Shaker	2025-11-06 00:31:34.807113	Angura	Delivered	Parthiban	2025-11-08 19:34:46.198742	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 17:39:17	Screen_R_051125_780	573.00	6x12	55.5	Shaker	2025-11-05 17:39:34.422949	Ramesh	Delivered	Parthiban	2025-11-08 19:21:13.530366	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 07:21:09	Screen_S_061125_788	561.00	8x30	57.4	Shaker	2025-11-06 07:21:19.742161	Angura	Delivered	Parthiban	2025-11-08 19:35:08.718203	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 23:44:17	Screen_R_051125_783	551.00	6x12	60.6	Shaker	2025-11-05 23:44:36.686434	Angura	Delivered	Parthiban	2025-11-08 19:21:30.920158	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 12:48:28	Screen_S_051125_777	564.00	8x30	55.6	Shaker	2025-11-05 12:48:54.577524	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 16:35:49	Screen_S_051125_779	556.00	8x30	54.4	Shaker	2025-11-05 16:36:01.091301	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 21:48:49	Screen_S_061125_796	581.00	8x30	54.9	Shaker	2025-11-06 21:49:00.379897	Angura	Delivered	Parthiban	2025-11-08 19:35:19.349285	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 01:37:18	Screen_R_061125_785	554.00	6x12	58.0	Shaker	2025-11-06 01:37:28.026898	Angura	Delivered	Parthiban	2025-11-08 19:21:36.090817	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 03:39:07	Screen_R_061125_787	549.00	6x12	55.3	Shaker	2025-11-06 03:39:18.30381	Angura	Delivered	Parthiban	2025-11-08 19:21:42.177695	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 08:05:02	Screen_R_061125_789	551.00	6x12	53.2	Shaker	2025-11-06 08:05:26.908882	Ramesh	Delivered	Parthiban	2025-11-08 19:21:46.797182	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 19:06:26	Screen_R_061125_793	560.00	6x12	51.5	Shaker	2025-11-06 19:06:35.493494	Ramesh	Delivered	Parthiban	2025-11-08 19:21:57.644458	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 21:38:33	Screen_R_061125_795	569.00	6x12	57.2	Shaker	2025-11-06 21:38:45.265098	Angura	Delivered	Parthiban	2025-11-08 19:22:08.674113	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 23:04:18	Screen_R_061125_797	502.00	6x12	53.6	Shaker	2025-11-06 23:04:31.666468	Angura	Delivered	Parthiban	2025-11-08 19:22:15.568603	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 07:57:12	Screen_R_041125_753	578.00	6x12	66.5	Shaker	2025-11-04 07:57:34.783794	Angura	Delivered	Parthiban	2025-11-08 19:25:05.545809	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 17:49:51	Screen_S_061125_791	602.00	8x30	55.5	Shaker	2025-11-06 17:50:01.139495	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 18:48:20	Screen_S_061125_792	572.00	8x30	52.9	Shaker	2025-11-06 18:48:38.810339	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 02:02:11	Screen_R_031125_735	542.00	6x12	60.1	Shaker	2025-11-03 02:02:28.253627	Angura	Delivered	Parthiban	2025-11-08 19:18:38.0715	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 23:53:44	Screen_S_061125_798	561.00	8x30	53.6	Shaker	2025-11-06 23:54:11.395799	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 00:52:10	Screen_R_071125_799	540.00	6x12	48.8	Shaker	2025-11-07 00:52:20.348202	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 02:18:00	Screen_R_071125_800	570.00	6x12	47.9	Shaker	2025-11-07 02:18:10.29102	Angura	Screening	Parthiban	2025-11-14 15:04:30.487835	loaded	2025-11-14 15:04:36	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12","8x30"}
2025-11-07 02:45:29	Screen_S_071125_801	514.00	8x30	49.0	Shaker	2025-11-07 02:45:40.688602	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 06:50:07	Screen_S_071125_802	562.00	8x30	48.9	Shaker	2025-11-07 06:50:22.934682	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 07:08:50	Screen_R_071125_803	536.00	6x12	46.1	Shaker	2025-11-07 07:09:00.992803	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 08:45:31	Screen_R_091125_816	550.00	6x12	53.7	Shaker	2025-11-09 08:46:23.464175	Thiruppathi	Delivered	Parthiban	2025-11-16 17:46:46.12471	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 10:30:54	Screen_S_071125_805	569.00	8x30	49.1	Shaker	2025-11-07 10:31:03.497664	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 15:05:26	Screen_R_071125_807	577.00	6x12	48.3	Shaker	2025-11-07 15:05:55.549883	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 17:00:44	Screen_S_071125_808	530.00	8x30	49.6	Shaker	2025-11-07 17:00:56.516287	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-08 14:07:34	Screen_V_081125_813	540.00	-30	43.2	Shaker	2025-11-08 14:07:52.261275	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-08 14:07:34	Screen_R_081125_814	571.00	6x12	51.7	Shaker	2025-11-08 14:11:20.295242	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-08 07:19:01	Screen_R_081125_811	542.00	6x12	56.7	Shaker	2025-11-08 07:19:17.042672	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-08 07:33:51	Screen_S_081125_812	540.00	8x30	49.6	Shaker	2025-11-08 07:34:03.084275	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 19:31:40	Screen_R_091125_825	590.00	6x12	53.0	Shaker	2025-11-09 19:32:19.239934	Angura	Delivered	Parthiban	2025-11-16 17:47:10.644803	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 22:09:44	Screen_S_071125_809	530.00	8x30	50.3	Shaker	2025-11-07 22:10:13.902146	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 23:03:28	Screen_R_011125_717	537.00	6x12	59.4	Shaker	2025-11-01 23:03:38.322937	Ramesh	Delivered	Parthiban	2025-11-08 19:17:51.881498	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 15:53:11	Screen_R_021125_728	575.00	6x12	58.9	Shaker	2025-11-02 15:53:22.54776	Ramesh	Delivered	Parthiban	2025-11-08 19:18:16.556179	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 17:31:56	Screen_R_021125_730	556.00	6x12	59.1	Shaker	2025-11-02 17:32:06.363221	Ramesh	Delivered	Parthiban	2025-11-08 19:18:21.361125	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 12:53:57	Screen_R_031125_742	553.00	6x12	58.7	Shaker	2025-11-03 12:54:20.656299	Ramesh	Delivered	Parthiban	2025-11-08 19:18:54.529967	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 12:49:20	Screen_R_041125_756	558.00	6x12	56.5	Shaker	2025-11-04 12:49:32.994912	Ramesh	Delivered	Parthiban	2025-11-08 19:19:34.433448	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 02:37:57	Screen_R_051125_771	536.00	6x12	58.9	Shaker	2025-11-05 02:38:07.713591	Angura	Delivered	Parthiban	2025-11-08 19:20:15.302905	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-05 19:34:55	Screen_R_051125_782	553.00	6x12	60.4	Shaker	2025-11-05 19:35:04.809608	Ramesh	Delivered	Parthiban	2025-11-08 19:21:25.017136	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 17:37:22	Screen_R_061125_790	590.00	6x12	55.8	Shaker	2025-11-06 17:37:32.771596	Ramesh	Delivered	Parthiban	2025-11-08 19:21:53.359217	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 19:39:13	Screen_R_061125_794	533.00	6x12	50.4	Shaker	2025-11-06 19:39:26.928087	Ramesh	Delivered	Parthiban	2025-11-08 19:22:03.734169	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-01 16:43:45	Screen_S_011125_712	573.00	8x30	58.9	Shaker	2025-11-01 16:44:09.512181	Angura	Delivered	Parthiban	2025-11-08 19:30:42.00843	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-02 16:15:31	Screen_S_021125_729	572.00	8x30	58.4	Shaker	2025-11-02 16:16:05.062878	Ramesh	Delivered	Parthiban	2025-11-08 19:31:24.457273	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-03 11:30:29	Screen_S_031125_741	545.00	8x30	58.9	Shaker	2025-11-03 11:30:42.940304	Ramesh	Delivered	Parthiban	2025-11-08 19:32:24.8906	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-04 22:27:14	Screen_S_041125_765	549.00	8x30	63.2	Shaker	2025-11-04 22:27:27.260796	Angura	Delivered	Parthiban	2025-11-08 19:33:28.294248	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-06 02:04:30	Screen_S_061125_786	545.00	8x30	60.1	Shaker	2025-11-06 02:04:41.080851	Angura	Delivered	Parthiban	2025-11-08 19:34:58.850058	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-29 23:55:45	Screen_S_291025_674	547.00	8x30	62.4	Shaker	2025-10-30 04:39:34.911915	Parthiban	Delivered	Parthiban	2025-11-08 19:36:40.994267	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-31 15:19:11	Screen_S_311025_699	547.00	8x30	58.5	Shaker	2025-10-31 15:19:20.83413	Angura	Delivered	Parthiban	2025-11-08 19:38:53.971619	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 08:45:31	Screen_R_091125_815	550.00	6x12	55.9	Shaker	2025-11-09 08:46:04.138674	Thiruppathi	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 15:16:29	Screen_V_091125_818	612.00	-30	47.6	Shaker	2025-11-09 15:19:00.79337	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 08:45:31	Screen_S_091125_817	550.00	8x30	57.2	Shaker	2025-11-09 08:47:15.598582	Thiruppathi	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 21:19:18	Screen_R_091125_827	566.00	6x12	51.3	Shaker	2025-11-09 21:19:27.498737	Ramesh	Delivered	Parthiban	2025-11-16 17:47:20.831608	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 16:42:06	Screen_S_091125_819	551.00	8x30	53.2	Shaker	2025-11-09 16:42:25.297887	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 16:44:27	Screen_S_091125_820	551.00	8x30	52.4	Shaker	2025-11-09 16:51:01.0796	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 17:15:40	Screen_R_091125_821	552.00	6x12	50.3	Shaker	2025-11-09 17:16:19.223554	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 17:27:27	Screen_R_091125_822	551.00	6x12	51.9	Shaker	2025-11-09 17:27:58.930395	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 18:24:30	Screen_R_091125_823	528.00	6x12	54.2	Shaker	2025-11-09 18:24:56.69137	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 23:18:05	Screen_R_091125_828	571.00	6x12	57.6	Shaker	2025-11-09 23:18:24.750708	Ramesh	Delivered	Parthiban	2025-11-16 17:47:28.963833	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 18:37:40	Screen_S_091125_824	542.00	8x30	54.3	Shaker	2025-11-09 18:38:03.042478	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-09 21:14:27	Screen_S_091125_826	521.00	8x30	52.8	Shaker	2025-11-09 21:14:56.482029	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 02:18:34	Screen_R_101125_829	548.00	6x12	57.4	Shaker	2025-11-10 02:18:46.311613	Ramesh	Delivered	Parthiban	2025-11-16 17:47:37.811643	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 07:13:55	Screen_R_101125_832	524.00	6x12	57.7	Shaker	2025-11-10 07:14:17.627231	Ramesh	Delivered	Parthiban	2025-11-16 17:47:46.350618	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 02:41:32	Screen_S_101125_831	549.00	8x30	56.1	Shaker	2025-11-10 02:41:43.408461	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 02:30:09	Screen_S_101125_830	571.00	8x30	52.1	Shaker	2025-11-10 02:30:19.286272	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 09:34:14	Screen_R_101125_836	556.00	6x12	53.6	Shaker	2025-11-10 09:34:45.998236	Angura	Delivered	Parthiban	2025-11-16 17:47:54.950902	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 11:21:36	Screen_R_101125_838	549.00	6x12	57.9	Shaker	2025-11-10 11:22:00.446684	Ramesh	Delivered	Parthiban	2025-11-16 17:48:05.786705	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 07:18:01	Screen_S_101125_833	543.00	8x30	55.6	Shaker	2025-11-10 07:18:11.806925	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 07:44:55	Screen_R_101125_834	537.00	6x12	51.8	Shaker	2025-11-10 07:45:06.184077	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 10:55:55	Screen_S_101125_837	554.00	8x30	55.6	Shaker	2025-11-10 10:56:11.376659	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 12:02:36	Screen_R_071125_806	556.00	6x12	49.1	Shaker	2025-11-07 12:02:47.732757	Ramesh	Screening	Parthiban	2025-11-16 18:28:33.244518	loaded	2025-11-16 18:28:43	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-10 12:38:50	Screen_S_101125_840	547.00	8x30	55.9	Shaker	2025-11-10 12:39:00.94081	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 14:10:07	Screen_V_101125_841	515.00	-30	51.9	Shaker	2025-11-10 14:10:55.318989	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-30 18:01:02	Screen_V_300925_174	574.00	-30	59.1	Shaker	2025-09-30 18:01:18.726315	Angura	Screening	Parthiban	2025-11-10 15:22:20.502662	loaded	2025-11-10 15:22:25	Parthiban	\N	575.00	\N	\N	gyro	{"30x60"}
2025-10-06 14:35:05	Screen_V_061025_269	526.00	-30	57.3	Shaker	2025-10-06 14:35:20.287426	Ramesh	Screening	Parthiban	2025-11-10 15:22:58.063548	loaded	2025-11-10 15:23:01	Parthiban	\N	519.00	\N	\N	Shaker	{"30x60"}
2025-11-10 08:59:23	Screen_S_101125_835	511.00	8x30	55.8	Shaker	2025-11-10 09:00:36.105794	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 18:19:21	Screen_R_111125_855	554.00	6x12	53.2	Shaker	2025-11-11 18:19:39.029846	Parthiban	Delivered	Parthiban	2025-11-16 17:48:58.157806	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 15:54:22	Screen_S_101125_844	574.00	8x30	56.0	Shaker	2025-11-10 15:54:57.158355	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 17:24:00	Screen_S_101125_845	549.00	8x30	56.0	Shaker	2025-11-10 17:24:38.955418	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 17:25:47	Screen_R_101125_846	555.00	6x12	54.0	Shaker	2025-11-10 17:30:35.203056	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-14 01:43:03	Screen_V_141025_391	536.00	-30	57.3	Shaker	2025-10-14 01:43:16.040504	Ramesh	Screening	Parthiban	2025-11-11 10:26:10.50861	loaded	2025-11-11 10:26:33	Parthiban	\N	536.00	\N	\N	gyro	{"30x60"}
2025-10-28 12:04:43	Screen_V_281025_648	553.00	-30	61.3	Shaker	2025-10-28 12:04:56.694616	Angura	Screening	Parthiban	2025-11-11 10:25:03.800115	loaded	2025-11-11 10:26:33	Parthiban	\N	553.00	\N	\N	gyro	{"30x60"}
2025-10-07 07:35:03	Screen_V_071025_280	539.00	-30	61.0	Shaker	2025-10-07 07:35:14.566814	Angura	Screening	Parthiban	2025-11-11 10:24:45.500871	loaded	2025-11-11 10:26:33	Parthiban	\N	539.00	\N	\N	gyro	{"30x60"}
2025-11-12 17:37:49	Screen_S_121125_864	523.00	8x30	60.1	Shaker	2025-11-12 17:38:25.728206	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 10:11:01	Screen_M_111125_849	466.00	30x60	58.8	gyro	2025-11-11 10:12:11.811789	Ramesh	Screening	Parthiban	2025-11-11 18:28:12.707932	loaded	2025-11-11 18:28:15	Parthiban	\N	500.00	\N	\N	gyro	{"30x60"}
2025-11-11 08:24:16	Screen_111125_847	495.00	-60	48.4	Shaker	2025-11-11 08:25:59.281779	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 08:31:35	Screen_111125_848	543.00	-60	52.9	Shaker	2025-11-11 08:31:55.50956	Ramesh	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 11:34:01	Screen_M_111125_850	464.00	30x60	61.2	gyro	2025-11-11 11:34:41.163855	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 14:10:28	Screen_M_111125_851	468.00	30x60	59.6	gyro	2025-11-11 14:11:13.194179	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-10-10 02:30:41	Screen_V_101025_327	535.00	-30	60.3	Shaker	2025-10-10 02:30:53.628055	Angura	Screening	Parthiban	2025-11-11 19:29:48.773312	loaded	2025-11-11 19:30:05	Parthiban	\N	535.00	\N	\N	gyro	{"30x60"}
2025-11-11 16:11:06	Screen_R_111125_852	552.00	6x12	52.8	Shaker	2025-11-11 16:12:24.172948	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 16:20:00	Screen_S_111125_853	552.00	8x30	52.5	Shaker	2025-11-11 16:20:33.244241	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-11 18:00:52	Screen_S_111125_854	559.00	8x30	54.7	Shaker	2025-11-11 18:01:15.619957	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 08:30:51	Screen_R_121125_856	542.00	6x12	53.1	Shaker	2025-11-12 08:32:13.78006	Angura	Delivered	Parthiban	2025-11-16 17:49:09.757332	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 10:33:26	Screen_R_121125_858	537.00	6x12	58.5	Shaker	2025-11-12 10:33:51.82194	Angura	Delivered	Parthiban	2025-11-16 17:49:18.468472	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 08:41:49	Screen_121125_857	490.00	-60	57.5	Shaker	2025-11-12 08:43:03.553294	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 12:07:01	Screen_R_121125_861	557.00	6x12	56.0	Shaker	2025-11-12 12:10:13.359739	Angura	Delivered	Parthiban	2025-11-16 17:49:26.831781	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 10:46:04	Screen_S_121125_859	538.00	8x30	57.8	Shaker	2025-11-12 10:46:32.991418	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 12:07:01	Screen_S_121125_860	584.00	8x30	58.8	Shaker	2025-11-12 12:07:15.97059	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 17:50:29	Screen_R_121125_865	530.00	6x12	58.0	Shaker	2025-11-12 17:50:50.516422	Angura	Delivered	Parthiban	2025-11-16 17:49:36.200892	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 15:06:08	Screen_R_121125_862	547.00	6x12	55.7	Shaker	2025-11-12 15:07:23.960225	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 15:56:25	Screen_S_121125_863	525.00	8x30	61.1	Shaker	2025-11-12 15:56:47.073026	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 18:23:34	Screen_R_121125_866	553.00	6x12	60.2	Shaker	2025-11-12 18:23:52.303512	Angura	Delivered	Parthiban	2025-11-16 17:49:45.214935	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 23:27:02	Screen_R_121125_870	560.00	6x12	58.5	Shaker	2025-11-12 23:27:18.871511	Angura	Delivered	Parthiban	2025-11-16 17:49:57.713288	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 21:29:28	Screen_S_121125_867	551.00	8x30	57.2	Shaker	2025-11-12 21:29:46.282004	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 01:14:53	Screen_R_131125_873	552.00	6x12	61.3	Shaker	2025-11-13 01:15:48.116769	Angura	Delivered	Parthiban	2025-11-16 17:50:06.378686	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 22:31:39	Screen_V_121125_869	566.00	-30	43.4	Shaker	2025-11-12 22:33:04.162728	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 10:13:27	Screen_R_131125_876	562.00	6x12	59.5	Shaker	2025-11-13 10:13:40.43842	Angura	Delivered	Parthiban	2025-11-16 17:50:14.441147	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 23:45:31	Screen_S_121125_871	567.00	8x30	56.0	Shaker	2025-11-12 23:45:52.634184	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 00:49:47	Screen_S_131125_872	541.00	8x30	59.1	Shaker	2025-11-13 00:50:10.095192	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 12:02:38	Screen_R_131125_879	573.00	6x12	57.9	Shaker	2025-11-13 12:03:05.758596	Angura	Delivered	Parthiban	2025-11-16 17:50:27.253666	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 08:49:09	Screen_M_131125_874	501.00	30x60	61.8	gyro	2025-11-13 08:50:34.801605	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 08:49:09	Screen_M_131125_875	501.00	30x60	74.4	gyro	2025-11-13 08:51:00.348032	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 14:38:24	Screen_R_131125_880	546.00	6x12	57.5	Shaker	2025-11-13 14:38:40.768776	Angura	Delivered	Parthiban	2025-11-16 17:50:34.521471	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 11:32:45	Screen_S_131125_877	542.00	8x30	57.9	Shaker	2025-11-13 11:33:00.865363	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 11:34:05	Screen_S_131125_878	562.00	8x30	59.6	Shaker	2025-11-13 11:38:37.161106	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 19:17:18	Screen_R_131125_886	541.00	6x12	58.1	Shaker	2025-11-13 19:18:12.493425	Angura	Delivered	Parthiban	2025-11-16 17:50:53.089009	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 21:07:21	Screen_R_131125_887	532.00	6x12	56.3	Shaker	2025-11-13 21:08:59.660549	Thiruppathi	Delivered	Parthiban	2025-11-16 17:51:01.663518	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 14:52:33	Screen_S_131125_881	588.00	8x30	61.1	Shaker	2025-11-13 14:52:58.699122	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 02:57:04	Screen_R_141125_890	552.00	6x12	60.6	Shaker	2025-11-14 02:57:12.547487	Parthiban	Delivered	Parthiban	2025-11-16 17:51:09.801204	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 17:27:33	Screen_R_131125_883	545.00	6x12	55.9	Shaker	2025-11-13 17:27:54.620097	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 17:36:54	Screen_S_131125_884	546.00	8x30	57.7	Shaker	2025-11-13 17:37:10.557656	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 18:53:28	Screen_S_131125_885	545.00	8x30	60.3	Shaker	2025-11-13 18:53:44.072943	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 15:37:51	Screen_R_101125_843	564.00	6x12	57.8	Shaker	2025-11-10 15:38:28.800449	Angura	Delivered	Parthiban	2025-11-16 17:48:30.549362	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 02:39:39	Screen_S_141125_889	549.00	8x30	60.0	Shaker	2025-11-14 02:42:16.705983	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 07:24:20	Screen_S_141125_892	548.00	8x30	61.9	Shaker	2025-11-14 07:59:36.601005	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 07:24:20	Screen_V_141125_893	599.00	-30	41.1	Shaker	2025-11-14 07:59:49.743551	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 09:46:15	Screen_S_141125_894	554.00	8x30	65.1	Shaker	2025-11-14 09:46:44.099522	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 10:45:49	Screen_R_141125_895	548.00	6x12	60.9	Shaker	2025-11-14 10:46:04.661254	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-07 07:59:12	Screen_R_071125_804	559.00	6x12	46.4	Shaker	2025-11-07 07:59:27.737904	Angura	Screening	Parthiban	2025-11-14 11:41:58.900176	loaded	2025-11-14 11:42:09	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12","8x30"}
2025-11-14 17:34:02	Screen_R_141125_901	549.00	6x12	57.5	Shaker	2025-11-14 17:34:18.194332	Angura	Delivered	Parthiban	2025-11-16 17:51:50.146757	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 11:19:45	Screen_S_141125_897	560.00	8x30	55.1	Shaker	2025-11-14 11:20:06.8181	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 18:13:04	Screen_R_141125_904	567.00	6x12	58.6	Shaker	2025-11-14 18:13:18.103785	Angura	Delivered	Parthiban	2025-11-16 17:52:12.605849	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 14:55:20	Screen_S_141125_899	537.00	8x30	69.0	Shaker	2025-11-14 14:55:36.521266	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 15:22:04	Screen_R_141125_900	537.00	6x12	62.6	Shaker	2025-11-14 15:22:35.377728	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 21:24:06	Screen_R_141125_906	559.00	6x12	58.0	Shaker	2025-11-14 21:25:37.626457	Parthiban	Delivered	Parthiban	2025-11-16 17:52:21.168357	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 19:30:24	Screen_R_151125_921	547.00	6x12	56.1	Shaker	2025-11-15 19:30:46.129704	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 17:38:49	Screen_S_141125_902	552.00	8x30	58.9	Shaker	2025-11-14 17:39:05.333281	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 17:38:49	Screen_S_141125_903	551.00	8x30	58.7	Shaker	2025-11-14 17:48:20.406862	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 07:34:59	Screen_R_151125_909	549.00	6x12	60.4	Shaker	2025-11-15 07:35:45.336253	Parthiban	Delivered	Parthiban	2025-11-16 17:52:40.093266	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 19:12:02	Screen_S_141125_905	562.00	8x30	60.4	Shaker	2025-11-14 19:12:21.853225	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 17:59:01	Screen_R_151125_920	558.00	6x12	57.9	Shaker	2025-11-15 17:59:24.227715	Angura	Delivered	Parthiban	2025-11-16 17:52:53.202065	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 02:07:37	Screen_S_151125_907	534.00	8x30	59.8	Shaker	2025-11-15 02:07:49.675757	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 02:39:39	Screen_R_141125_888	515.00	6x12	60.4	Shaker	2025-11-14 02:39:57.851511	Parthiban	Screening	Parthiban	2025-11-15 18:05:17.72746	loaded	2025-11-15 18:05:34	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-07 22:09:44	Screen_R_071125_810	515.00	6x12	48.8	Shaker	2025-11-07 22:23:43.889005	Angura	Screening	Parthiban	2025-11-15 18:05:27.341484	loaded	2025-11-15 18:05:34	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-15 07:34:59	Screen_R_151125_908	566.00	6x12	62.9	Shaker	2025-11-15 07:35:09.678579	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 19:30:26	Screen_R_151125_923	536.00	6x12	60.0	Shaker	2025-11-15 21:57:47.685668	Parthiban	Delivered	Parthiban	2025-11-16 17:53:02.315944	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 07:34:59	Screen_R_151125_910	539.00	6x12	62.3	Shaker	2025-11-15 07:36:03.260728	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 07:34:59	Screen_S_151125_911	558.00	8x30	59.3	Shaker	2025-11-15 07:36:36.517759	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 08:36:05	Screen_R_151125_912	537.00	6x12	63.9	Shaker	2025-11-15 08:36:26.369377	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 08:38:43	Screen_S_151125_913	551.00	8x30	59.4	Shaker	2025-11-15 08:41:07.107149	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 14:04:54	Screen_R_151125_914	538.00	6x12	62.3	Shaker	2025-11-15 14:05:53.46969	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 14:44:35	Screen_R_151125_915	551.00	6x12	61.5	Shaker	2025-11-15 14:44:50.519633	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 15:00:01	Screen_S_151125_916	557.00	8x30	61.8	Shaker	2025-11-15 15:00:14.848204	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 16:36:35	Screen_S_151125_917	556.00	8x30	60.5	Shaker	2025-11-15 16:37:02.261954	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 16:37:47	Screen_S_151125_918	554.00	8x30	64.3	Shaker	2025-11-15 16:38:28.340964	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 19:30:26	Screen_R_151125_924	566.00	6x12	56.0	Shaker	2025-11-15 21:58:03.492313	Parthiban	Delivered	Parthiban	2025-11-16 17:53:15.423231	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 19:31:01	Screen_S_151125_922	540.00	8x30	58.6	Shaker	2025-11-15 19:31:19.566792	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 17:28:15	Screen_S_151125_919	561.00	8x30	57.4	Shaker	2025-11-15 17:28:55.571528	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-15 22:14:16	Screen_R_151125_925	555.00	6x12	59.4	Shaker	2025-11-15 23:54:10.505525	Parthiban	Delivered	Parthiban	2025-11-16 17:53:26.24261	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 10:28:48	Screen_R_161125_932	552.00	6x12	57.0	Shaker	2025-11-16 10:29:18.678642	Parthiban	Delivered	Parthiban	2025-11-16 17:53:35.822014	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 10:28:48	Screen_R_161125_933	572.00	6x12	58.3	Shaker	2025-11-16 10:29:31.451838	Parthiban	Delivered	Parthiban	2025-11-16 17:53:43.961641	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 01:15:33	Screen_S_161125_926	551.00	8x30	56.7	Shaker	2025-11-16 01:15:46.240023	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 01:15:33	Screen_S_161125_927	541.00	8x30	57.8	Shaker	2025-11-16 01:16:01.096456	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 14:31:40	Screen_R_101125_842	536.00	6x12	54.5	Shaker	2025-11-10 14:32:07.688983	Angura	Screening	Parthiban	2025-11-16 18:28:39.930877	loaded	2025-11-16 18:28:43	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-16 01:54:23	Screen_R_161125_928	551.00	6x12	66.3	Shaker	2025-11-16 01:54:34.775813	Parthiban	Screening	Parthiban	2025-11-16 18:28:15.605539	loaded	2025-11-16 18:28:43	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-16 07:59:54	Screen_S_161125_930	562.00	8x30	59.3	Shaker	2025-11-16 08:00:58.771447	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 10:28:48	Screen_S_161125_931	567.00	8x30	60.6	Shaker	2025-11-16 10:29:02.864876	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 01:54:23	Screen_R_161125_929	558.00	6x12	64.1	Shaker	2025-11-16 06:47:48.261409	Parthiban	Screening	Parthiban	2025-11-16 18:28:25.151628	loaded	2025-11-16 18:28:43	Parthiban	\N	550.00	\N	\N	Shaker	{"6x12"}
2025-11-16 10:45:56	Screen_R_161125_934	551.00	6x12	59.4	Shaker	2025-11-16 11:43:56.16929	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 10:45:56	Screen_S_161125_935	558.00	8x30	60.7	Shaker	2025-11-16 11:44:11.682038	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-10 12:19:11	Screen_R_101125_839	537.00	6x12	53.3	Shaker	2025-11-10 12:19:24.337297	Ramesh	Delivered	Parthiban	2025-11-16 17:48:14.81463	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-12 21:48:56	Screen_R_121125_868	551.00	6x12	58.4	Shaker	2025-11-12 21:49:15.88099	Angura	Delivered	Parthiban	2025-11-16 17:49:52.507751	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-13 16:17:39	Screen_R_131125_882	581.00	6x12	57.8	Shaker	2025-11-13 16:18:00.515102	Angura	Delivered	Parthiban	2025-11-16 17:50:42.013494	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 07:24:20	Screen_R_141125_891	581.00	6x12	57.2	Shaker	2025-11-14 07:24:29.48751	Parthiban	Delivered	Parthiban	2025-11-16 17:51:18.371486	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 11:05:00	Screen_R_141125_896	546.00	6x12	57.7	Shaker	2025-11-14 11:05:16.386397	Angura	Delivered	Parthiban	2025-11-16 17:51:30.710334	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-14 12:25:39	Screen_R_141125_898	558.00	6x12	60.5	Shaker	2025-11-14 12:25:56.481643	Angura	Delivered	Parthiban	2025-11-16 17:51:42.353094	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 15:26:57	Screen_R_161125_937	538.00	6x12	60.4	Shaker	2025-11-16 15:28:31.712893	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 15:26:57	Screen_R_161125_938	548.00	6x12	58.1	Shaker	2025-11-16 15:28:49.239897	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 15:26:57	Screen_S_161125_939	551.00	8x30	59.3	Shaker	2025-11-16 15:29:10.688711	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 17:43:00	Screen_S_161125_940	568.00	8x30	58.5	Shaker	2025-11-16 17:43:25.558683	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 17:43:00	Screen_R_161125_941	542.00	6x12	62.4	Shaker	2025-11-16 17:43:39.335412	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 17:43:00	Screen_R_161125_942	568.00	6x12	59	Shaker	2025-11-16 17:45:20.630748	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 19:37:57	Screen_R_161125_943	551.00	6x12	50.3	Shaker	2025-11-16 19:38:16.414928	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 19:37:57	Screen_R_161125_944	551.00	6x12	49.4	Shaker	2025-11-16 19:38:27.17112	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 19:37:57	Screen_S_161125_945	562.00	8x30	60.1	Shaker	2025-11-16 19:38:42.296791	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-11-16 15:26:57	Screen_S_161125_936	551.00	8x30	58.2	Shaker	2025-11-16 15:28:08.194065	Parthiban	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-27 23:35:29	Screen_V_270925_130	593.00	-30	55.0	Shaker	2025-09-27 23:36:11.941937	Angura	Screening	Thiruppathi	2025-11-16 21:53:54.88838	loaded	2025-11-16 21:54:40	Thiruppathi	\N	594.00	\N	\N	Shaker	{"30x60"}
2025-11-17 01:12:30	Screen_171125_946	483.00	-60	0	Shaker	2025-11-17 01:14:29.313613	Angura	InStock	\N	\N	InQue	\N	\N	\N	\N	\N	\N	\N	\N
2025-09-22 21:15:02	Screen_V_220925_044	566.00	-30	56.4	Shaker	2025-09-22 21:15:13.828919	Angura	Screening	Thiruppathi	2025-11-17 01:25:16.02134	loaded	2025-11-17 01:25:26	Thiruppathi	\N	566.00	\N	\N	Shaker	{"30x60"}
2025-11-05 02:04:03	Screen_V_051125_770	572.00	-30	55.7	Shaker	2025-11-05 02:04:15.57112	Angura	Screening	Thiruppathi	2025-11-17 07:45:07.05798	loaded	2025-11-17 07:45:08	Thiruppathi	\N	572.00	\N	\N	Shaker	{"30x60"}
\.


--
-- TOC entry 4649 (class 2606 OID 17315)
-- Name: samcarbons_screening_outward samcarbon_screening_outward_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresadmin
--

ALTER TABLE ONLY public.samcarbons_screening_outward
    ADD CONSTRAINT samcarbon_screening_outward_pkey PRIMARY KEY (bag_no);


--
-- TOC entry 4650 (class 2620 OID 19012)
-- Name: samcarbons_screening_outward trg_generate_bag_no_samcarbons_screening_outward; Type: TRIGGER; Schema: public; Owner: postgresadmin
--

CREATE TRIGGER trg_generate_bag_no_samcarbons_screening_outward BEFORE INSERT ON public.samcarbons_screening_outward FOR EACH ROW EXECUTE FUNCTION public.trg_set_bag_no_per_samcarbons_screening_outward();


-- Completed on 2025-11-16 22:16:21 CST

--
-- PostgreSQL database dump complete
--

\unrestrict EsXQdJe6FrPGV3b5hxnnvEMfzHOgxBTf8pS81sZljHacphtHfakE4yOkgHozbOv

