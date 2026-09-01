--
-- PostgreSQL database dump
--

\restrict Fjine0pFgp1wrJL1G8UtUEntFN42h8cj4L4Ma1QOA7Ih2HYoptZbxPW38ofdjst

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: TaskActivityType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskActivityType" AS ENUM (
    'START',
    'CLIENT_ARRIVAL',
    'MEETING',
    'WORK',
    'CLIENT_COMPLETED',
    'RETURN'
);


ALTER TYPE public."TaskActivityType" OWNER TO postgres;

--
-- Name: TaskPriority; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskPriority" AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'URGENT'
);


ALTER TYPE public."TaskPriority" OWNER TO postgres;

--
-- Name: TaskStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskStatus" AS ENUM (
    'ASSIGNED',
    'IN_PROGRESS',
    'SUBMITTED',
    'APPROVED',
    'REJECTED'
);


ALTER TYPE public."TaskStatus" OWNER TO postgres;

--
-- Name: TaskType; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."TaskType" AS ENUM (
    'SALES_VISIT',
    'TECHNICIAN_VISIT'
);


ALTER TYPE public."TaskType" OWNER TO postgres;

--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserRole" AS ENUM (
    'ADMIN',
    'SALES',
    'TECHNICIAN'
);


ALTER TYPE public."UserRole" OWNER TO postgres;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE'
);


ALTER TYPE public."UserStatus" OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Company; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Company" (
    id text NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    email text,
    phone text,
    address text,
    logo text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Company" OWNER TO postgres;

--
-- Name: Customer; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Customer" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    "contactName" text,
    phone text,
    email text,
    address text,
    latitude double precision,
    longitude double precision,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Customer" OWNER TO postgres;

--
-- Name: Task; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."Task" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    "assignedToId" text NOT NULL,
    "createdById" text NOT NULL,
    "customerId" text NOT NULL,
    type public."TaskType" NOT NULL,
    title text NOT NULL,
    description text,
    status public."TaskStatus" DEFAULT 'ASSIGNED'::public."TaskStatus" NOT NULL,
    priority public."TaskPriority" DEFAULT 'MEDIUM'::public."TaskPriority" NOT NULL,
    "scheduledDate" timestamp(3) without time zone NOT NULL,
    "rejectionReason" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Task" OWNER TO postgres;

--
-- Name: TaskActivity; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskActivity" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    type public."TaskActivityType" NOT NULL,
    latitude double precision,
    longitude double precision,
    "capturedAt" timestamp(3) without time zone NOT NULL,
    "serverTime" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TaskActivity" OWNER TO postgres;

--
-- Name: TaskActivityAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskActivityAttachment" (
    id text NOT NULL,
    "activityId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" text,
    "fileSize" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TaskActivityAttachment" OWNER TO postgres;

--
-- Name: TaskAttachment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskAttachment" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "fileName" text NOT NULL,
    "fileUrl" text NOT NULL,
    "fileType" text,
    "fileSize" integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."TaskAttachment" OWNER TO postgres;

--
-- Name: TaskComment; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."TaskComment" (
    id text NOT NULL,
    "taskId" text NOT NULL,
    "userId" text NOT NULL,
    message text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."TaskComment" OWNER TO postgres;

--
-- Name: User; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "companyId" text NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    password text NOT NULL,
    role public."UserRole" DEFAULT 'SALES'::public."UserRole" NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "profileImage" text,
    "lastLoginAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."User" OWNER TO postgres;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Data for Name: Company; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Company" (id, name, slug, email, phone, address, logo, "createdAt", "updatedAt") FROM stdin;
eb358c81-1e11-4b3d-94cd-7ee219e65043	Kroztek Integrated Solution	kroztek-integrated-solution	kroztekintegratedsolution@gmail.com	\N	\N	\N	2026-08-21 10:40:16.328	2026-08-21 10:40:16.328
\.


--
-- Data for Name: Customer; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Customer" (id, "companyId", name, "contactName", phone, email, address, latitude, longitude, "createdAt", "updatedAt") FROM stdin;
6d0956ea-66ef-4f1e-bbaa-8f045821eb52	eb358c81-1e11-4b3d-94cd-7ee219e65043	ABC	\N	\N	\N	\N	\N	\N	2026-08-25 09:26:13.885	2026-08-25 09:26:13.885
15f3ca24-66fd-44c6-9c7d-91f5da346cad	eb358c81-1e11-4b3d-94cd-7ee219e65043	XYZ	\N	\N	\N	\N	\N	\N	2026-09-01 03:10:06.113	2026-09-01 03:10:06.113
\.


--
-- Data for Name: Task; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."Task" (id, "companyId", "assignedToId", "createdById", "customerId", type, title, description, status, priority, "scheduledDate", "rejectionReason", "createdAt", "updatedAt") FROM stdin;
c31bd3a8-266f-4a90-9c13-a01fe5513fc9	eb358c81-1e11-4b3d-94cd-7ee219e65043	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	6d0956ea-66ef-4f1e-bbaa-8f045821eb52	SALES_VISIT	Test	Test Desc	ASSIGNED	HIGH	2026-08-28 03:56:00	\N	2026-08-25 09:26:13.903	2026-09-01 03:06:05.929
9d2c8c1f-b50c-4df0-819e-69bea98e2b97	eb358c81-1e11-4b3d-94cd-7ee219e65043	737914ad-a2bb-4266-bfb2-7d30db724a98	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	15f3ca24-66fd-44c6-9c7d-91f5da346cad	SALES_VISIT	testing 2	\N	ASSIGNED	MEDIUM	2026-09-15 03:09:00	\N	2026-09-01 03:10:06.139	2026-09-01 03:10:06.139
\.


--
-- Data for Name: TaskActivity; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskActivity" (id, "taskId", "userId", type, latitude, longitude, "capturedAt", "serverTime", notes, "createdAt") FROM stdin;
a2ae6320-a559-4671-9b99-722abcbb8d79	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	START	\N	\N	2026-08-26 07:42:57.728	2026-08-26 07:42:59.654	started	2026-08-26 07:42:59.654
76f3a6a6-b7af-4f55-a9fd-95039e70b052	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	CLIENT_ARRIVAL	\N	\N	2026-08-26 16:48:02.496	2026-08-26 16:48:02.512	test	2026-08-26 16:48:02.512
15fc207e-3912-4a15-a19e-32a5172bd384	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	CLIENT_ARRIVAL	\N	\N	2026-08-26 16:51:52.891	2026-08-26 16:51:52.902	test	2026-08-26 16:51:52.902
75d6f225-0ace-454a-a97a-5f8a53b4ce8d	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	CLIENT_ARRIVAL	\N	\N	2026-08-26 16:52:39.336	2026-08-26 16:52:39.346	test	2026-08-26 16:52:39.346
ed3642c1-862f-4638-98a7-82624eb72cc5	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	MEETING	\N	\N	2026-08-30 02:57:41.718	2026-08-30 02:57:41.725	Staerted meeting withmanagaer	2026-08-30 02:57:41.725
dcc9427e-281d-4e2a-a53f-5e4a63d2439b	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	WORK	\N	\N	2026-08-26 16:54:31.97	2026-08-26 16:54:31.981	test	2026-08-26 16:54:31.981
\.


--
-- Data for Name: TaskActivityAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskActivityAttachment" (id, "activityId", "fileName", "fileUrl", "fileType", "fileSize", "createdAt") FROM stdin;
fce272f6-80b1-4d83-9c47-4f8642b8583b	dcc9427e-281d-4e2a-a53f-5e4a63d2439b	77a7d67b-76e3-4e5b-8f14-0da25d6b2d75.png	/uploads/task-activities/1787763272174-rco7mhly.png	image/jpeg	194332	2026-08-26 16:54:32.228
30b087f2-6b31-457c-87dd-d243bf3d30ab	dcc9427e-281d-4e2a-a53f-5e4a63d2439b	2eb14eea-ff12-4b09-98fc-7eb9279a5e11.png	/uploads/task-activities/1787763272179-lyh09r93.png	image/jpeg	492113	2026-08-26 16:54:32.228
0233b2f6-7070-4e4c-9c6a-bd52a5277d29	ed3642c1-862f-4638-98a7-82624eb72cc5	80cd8e85-9b0d-4036-b7fa-76d11c79bdac.png	/uploads/task-activities/1788058661846-sqlyrgk4.png	image/jpeg	1571855	2026-08-30 02:57:41.962
9c97c7fb-a5d8-4d06-8efc-b354a1e254d4	ed3642c1-862f-4638-98a7-82624eb72cc5	c82ee5b0-8d27-4512-9659-d7e080b34653.png	/uploads/task-activities/1788058661917-tanjsaxz.png	image/jpeg	194332	2026-08-30 02:57:41.962
0c8c54c2-dbb7-4f76-b3eb-3ccd118809cd	ed3642c1-862f-4638-98a7-82624eb72cc5	08678f6c-04c7-4537-807f-4bf32d67b089.png	/uploads/task-activities/1788058661926-6q83pha1.png	image/jpeg	492113	2026-08-30 02:57:41.962
\.


--
-- Data for Name: TaskAttachment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskAttachment" (id, "taskId", "fileName", "fileUrl", "fileType", "fileSize", "createdAt") FROM stdin;
\.


--
-- Data for Name: TaskComment; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."TaskComment" (id, "taskId", "userId", message, "createdAt", "updatedAt") FROM stdin;
4f43eb72-4199-404e-9125-8bf076732730	c31bd3a8-266f-4a90-9c13-a01fe5513fc9	fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	first comment updated	2026-09-01 02:42:13.236	2026-09-01 02:42:26.19
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."User" (id, "companyId", name, email, phone, password, role, status, "profileImage", "lastLoginAt", "createdAt", "updatedAt") FROM stdin;
737914ad-a2bb-4266-bfb2-7d30db724a98	eb358c81-1e11-4b3d-94cd-7ee219e65043	sale test 01	sales@gmail.com	8144128737	$2b$12$x00XkWQQGXSTIeonFkAxDOLtWeXSQiagkaVR0qMff5Ue2XN7qMmqe	SALES	ACTIVE	\N	\N	2026-08-22 20:56:45.157	2026-08-22 21:28:33.164
fb0c7c14-bfb6-4aa9-b3a4-aee491cec053	eb358c81-1e11-4b3d-94cd-7ee219e65043	Kroztek Admin	kroztekintegratedsolution@gmail.com	\N	$2b$10$eRRwEOm4el/fAf1UUfcWgOHfwRNE0dYZX5sPpjxv3xeyzvI7YpSQe	ADMIN	ACTIVE	\N	2026-09-01 11:20:28.541	2026-08-21 10:40:16.451	2026-09-01 11:20:28.543
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
aa7885e8-f313-4a69-9492-62360538d502	404e140e5639a48a35108588754e9764083183ca9f195331777d09790c2259aa	2026-08-21 10:31:32.871435+00	20260821102008_init	\N	\N	2026-08-21 10:31:32.841404+00	1
53155c7a-4c96-41da-bda9-1cb0dc1f45e4	d13cdd3744d7632ed66bbabf6a65a69141a6c09a993040db630edaf539b03ad2	2026-08-22 23:17:27.54922+00	20260822231727_add_task_attachments	\N	\N	2026-08-22 23:17:27.534946+00	1
97bed1cf-3da1-4647-b712-240ff63f381f	e1a45db2f78143c0a7acbc187a39a9f08011291cded5055ec5ac0fbc23ed9184	2026-08-26 07:48:10.286176+00	20260826074810_add_task_activity_attachments	\N	\N	2026-08-26 07:48:10.273399+00	1
\.


--
-- Name: Company Company_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Company"
    ADD CONSTRAINT "Company_pkey" PRIMARY KEY (id);


--
-- Name: Customer Customer_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_pkey" PRIMARY KEY (id);


--
-- Name: TaskActivityAttachment TaskActivityAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivityAttachment"
    ADD CONSTRAINT "TaskActivityAttachment_pkey" PRIMARY KEY (id);


--
-- Name: TaskActivity TaskActivity_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_pkey" PRIMARY KEY (id);


--
-- Name: TaskAttachment TaskAttachment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAttachment"
    ADD CONSTRAINT "TaskAttachment_pkey" PRIMARY KEY (id);


--
-- Name: TaskComment TaskComment_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_pkey" PRIMARY KEY (id);


--
-- Name: Task Task_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_pkey" PRIMARY KEY (id);


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Company_slug_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "Company_slug_key" ON public."Company" USING btree (slug);


--
-- Name: Customer_companyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Customer_companyId_idx" ON public."Customer" USING btree ("companyId");


--
-- Name: TaskActivityAttachment_activityId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivityAttachment_activityId_idx" ON public."TaskActivityAttachment" USING btree ("activityId");


--
-- Name: TaskActivity_taskId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivity_taskId_idx" ON public."TaskActivity" USING btree ("taskId");


--
-- Name: TaskActivity_taskId_type_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivity_taskId_type_idx" ON public."TaskActivity" USING btree ("taskId", type);


--
-- Name: TaskActivity_userId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskActivity_userId_idx" ON public."TaskActivity" USING btree ("userId");


--
-- Name: TaskAttachment_taskId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskAttachment_taskId_idx" ON public."TaskAttachment" USING btree ("taskId");


--
-- Name: TaskComment_taskId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "TaskComment_taskId_idx" ON public."TaskComment" USING btree ("taskId");


--
-- Name: Task_assignedToId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_assignedToId_idx" ON public."Task" USING btree ("assignedToId");


--
-- Name: Task_companyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_companyId_idx" ON public."Task" USING btree ("companyId");


--
-- Name: Task_customerId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_customerId_idx" ON public."Task" USING btree ("customerId");


--
-- Name: Task_scheduledDate_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_scheduledDate_idx" ON public."Task" USING btree ("scheduledDate");


--
-- Name: Task_status_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "Task_status_idx" ON public."Task" USING btree (status);


--
-- Name: User_companyId_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_companyId_idx" ON public."User" USING btree ("companyId");


--
-- Name: User_companyId_role_idx; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "User_companyId_role_idx" ON public."User" USING btree ("companyId", role);


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: Customer Customer_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Customer"
    ADD CONSTRAINT "Customer_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskActivityAttachment TaskActivityAttachment_activityId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivityAttachment"
    ADD CONSTRAINT "TaskActivityAttachment_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES public."TaskActivity"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskActivity TaskActivity_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskActivity TaskActivity_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskActivity"
    ADD CONSTRAINT "TaskActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: TaskAttachment TaskAttachment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskAttachment"
    ADD CONSTRAINT "TaskAttachment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskComment TaskComment_taskId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES public."Task"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: TaskComment TaskComment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."TaskComment"
    ADD CONSTRAINT "TaskComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_assignedToId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Task Task_createdById_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Task Task_customerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."Task"
    ADD CONSTRAINT "Task_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES public."Customer"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: User User_companyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES public."Company"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict Fjine0pFgp1wrJL1G8UtUEntFN42h8cj4L4Ma1QOA7Ih2HYoptZbxPW38ofdjst

