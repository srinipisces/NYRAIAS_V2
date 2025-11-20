--
-- PostgreSQL database dump
--

\restrict oY0pQD1pPocEm02R6eBvaNTfzR9gnzoX7aoQcANLygOIcimvd9hCmZs0T6o3VVU

-- Dumped from database version 17.4
-- Dumped by pg_dump version 18.0

-- Started on 2025-11-17 09:06:44 CST

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
-- TOC entry 313 (class 1259 OID 17238)
-- Name: samcarbons_suppliers; Type: TABLE; Schema: public; Owner: postgresadmin
--

CREATE TABLE public.samcarbons_suppliers (
    supplier_name text NOT NULL,
    street text,
    city text,
    pincode integer,
    contact_person text,
    contact_number bigint,
    create_userid text NOT NULL,
    created_dt timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    activities jsonb DEFAULT '[]'::jsonb
);


ALTER TABLE public.samcarbons_suppliers OWNER TO postgresadmin;

--
-- TOC entry 4823 (class 0 OID 17238)
-- Dependencies: 313
-- Data for Name: samcarbons_suppliers; Type: TABLE DATA; Schema: public; Owner: postgresadmin
--

COPY public.samcarbons_suppliers (supplier_name, street, city, pincode, contact_person, contact_number, create_userid, created_dt, activities) FROM stdin;
BC Carbons	70 - C Bunglowpudur Road	Kangayam	638701	Boominathan	9965521852	admin	2025-07-09 07:02:58.918288	[]
SS Traders	75 Nattarpalayam , Paranchervazhi 	Kangayam	638701	Sivasubramaniyam	9842756688	admin	2025-07-09 07:04:42.741314	[]
Suthiksha Carbon	DNo 2/121, Semalaigoundanpalayam	Tirupur	641665	Dinesh	9715447811	admin	2025-07-09 07:27:57.305318	[]
Harshitha Enterprises	Hirelingeshwara swami inlay	Tiptur	572201	Thangadurai	9632413371	admin	2025-07-09 07:32:30.69996	[]
Janith Traders	152 D/g Melur Cholapuram	Tiptur	641665	Thangadurai	9843789947	admin	2025-07-25 10:46:12.050785	[]
Lakshmi Ranga Agro Processing	Sri Maruthi Vidyapeeta	Bommanahalli, Tiptur	572201	Lakshmi Narayan	9591499280	admin	2025-07-25 16:25:31.18614	[]
Organature		Palladam	641664		9745302233	admin	2025-07-26 08:47:29.255507	[]
Vels Carbon	Rattikattu Thottam, semmankalipalayam	Kangeyam	638701	Murugan	997612849	admin	2025-07-27 09:30:26.115499	[]
Dinesh Charcoal			\N	Dinesh	9976611307	admin	2025-09-17 12:38:34.67061	[]
\.


--
-- TOC entry 4648 (class 2606 OID 17246)
-- Name: samcarbons_suppliers samcarbon_suppliers_pkey; Type: CONSTRAINT; Schema: public; Owner: postgresadmin
--

ALTER TABLE ONLY public.samcarbons_suppliers
    ADD CONSTRAINT samcarbon_suppliers_pkey PRIMARY KEY (supplier_name);


-- Completed on 2025-11-17 09:06:55 CST

--
-- PostgreSQL database dump complete
--

\unrestrict oY0pQD1pPocEm02R6eBvaNTfzR9gnzoX7aoQcANLygOIcimvd9hCmZs0T6o3VVU

