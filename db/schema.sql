--
-- PostgreSQL database dump
--

\restrict Bua4eXPzKkaS26kdlrFC4JcESzSAk85t3aQB9b5Ljz2qhNBJeOQHup5kuRVjAO1

-- Dumped from database version 17.12
-- Dumped by pg_dump version 17.11

-- Started on 2026-11-26 08:34:44 UTC

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
-- TOC entry 218 (class 1259 OID 16392)
-- Name: categories; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    slug character varying(100) NOT NULL
);
ALTER TABLE ONLY public.categories ALTER COLUMN id SET (pg_attver=29735760);
ALTER TABLE ONLY public.categories ALTER COLUMN name SET (pg_attver=29735760);
ALTER TABLE ONLY public.categories ALTER COLUMN slug SET (pg_attver=29735760);


ALTER TABLE public.categories OWNER TO cinema_app;

--
-- TOC entry 217 (class 1259 OID 16391)
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_app
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO cinema_app;

--
-- TOC entry 4120 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_app
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- TOC entry 224 (class 1259 OID 16430)
-- Name: order_items; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    CONSTRAINT order_items_price_at_purchase_check CHECK ((price_at_purchase >= (0)::numeric)),
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);
ALTER TABLE ONLY public.order_items ALTER COLUMN id SET (pg_attver=29930824);
ALTER TABLE ONLY public.order_items ALTER COLUMN order_id SET (pg_attver=29930824);
ALTER TABLE ONLY public.order_items ALTER COLUMN product_id SET (pg_attver=29930824);
ALTER TABLE ONLY public.order_items ALTER COLUMN quantity SET (pg_attver=29930824);
ALTER TABLE ONLY public.order_items ALTER COLUMN price_at_purchase SET (pg_attver=29930824);


ALTER TABLE public.order_items OWNER TO cinema_app;

--
-- TOC entry 223 (class 1259 OID 16429)
-- Name: order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_app
--

CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.order_items_id_seq OWNER TO cinema_app;

--
-- TOC entry 4121 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_app
--

ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;


--
-- TOC entry 222 (class 1259 OID 16420)
-- Name: orders; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.orders (
    id integer NOT NULL,
    customer_name character varying(150) NOT NULL,
    customer_email character varying(150),
    customer_phone character varying(30),
    total_price numeric(10,2) DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT orders_total_price_check CHECK ((total_price >= (0)::numeric))
);
ALTER TABLE ONLY public.orders ALTER COLUMN id SET (pg_attver=29912776);
ALTER TABLE ONLY public.orders ALTER COLUMN customer_name SET (pg_attver=29912776);
ALTER TABLE ONLY public.orders ALTER COLUMN customer_email SET (pg_attver=29912776);
ALTER TABLE ONLY public.orders ALTER COLUMN customer_phone SET (pg_attver=29912776);
ALTER TABLE ONLY public.orders ALTER COLUMN total_price SET (pg_attver=29912776);
ALTER TABLE ONLY public.orders ALTER COLUMN created_at SET (pg_attver=29912776);


ALTER TABLE public.orders OWNER TO cinema_app;

--
-- TOC entry 221 (class 1259 OID 16419)
-- Name: orders_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_app
--

CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.orders_id_seq OWNER TO cinema_app;

--
-- TOC entry 4122 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_app
--

ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;


--
-- TOC entry 227 (class 1259 OID 16457)
-- Name: product_tags; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.product_tags (
    product_id integer NOT NULL,
    tag_id integer NOT NULL
);
ALTER TABLE ONLY public.product_tags ALTER COLUMN product_id SET (pg_attver=30022832);
ALTER TABLE ONLY public.product_tags ALTER COLUMN tag_id SET (pg_attver=30022832);


ALTER TABLE public.product_tags OWNER TO cinema_app;

--
-- TOC entry 220 (class 1259 OID 16403)
-- Name: products; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.products (
    id integer NOT NULL,
    category_id integer NOT NULL,
    title character varying(200) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text,
    stock_count integer DEFAULT 0 NOT NULL,
    CONSTRAINT products_price_check CHECK ((price >= (0)::numeric)),
    CONSTRAINT products_stock_count_check CHECK ((stock_count >= 0))
);
ALTER TABLE ONLY public.products ALTER COLUMN id SET (pg_attver=29853048);
ALTER TABLE ONLY public.products ALTER COLUMN category_id SET (pg_attver=29853048);
ALTER TABLE ONLY public.products ALTER COLUMN title SET (pg_attver=29853048);
ALTER TABLE ONLY public.products ALTER COLUMN price SET (pg_attver=29853048);
ALTER TABLE ONLY public.products ALTER COLUMN description SET (pg_attver=29853048);
ALTER TABLE ONLY public.products ALTER COLUMN stock_count SET (pg_attver=29853048);


ALTER TABLE public.products OWNER TO cinema_app;

--
-- TOC entry 219 (class 1259 OID 16402)
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_app
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO cinema_app;

--
-- TOC entry 4123 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_app
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- TOC entry 226 (class 1259 OID 16449)
-- Name: tags; Type: TABLE; Schema: public; Owner: cinema_app
--

CREATE TABLE public.tags (
    id integer NOT NULL,
    name character varying(50) NOT NULL
);
ALTER TABLE ONLY public.tags ALTER COLUMN id SET (pg_attver=30010232);
ALTER TABLE ONLY public.tags ALTER COLUMN name SET (pg_attver=30010232);


ALTER TABLE public.tags OWNER TO cinema_app;

--
-- TOC entry 225 (class 1259 OID 16448)
-- Name: tags_id_seq; Type: SEQUENCE; Schema: public; Owner: cinema_app
--

CREATE SEQUENCE public.tags_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tags_id_seq OWNER TO cinema_app;

--
-- TOC entry 4124 (class 0 OID 0)
-- Dependencies: 225
-- Name: tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: cinema_app
--

ALTER SEQUENCE public.tags_id_seq OWNED BY public.tags.id;


--
-- TOC entry 3922 (class 2604 OID 16395)
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- TOC entry 3928 (class 2604 OID 16433)
-- Name: order_items id; Type: DEFAULT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);


--
-- TOC entry 3925 (class 2604 OID 16423)
-- Name: orders id; Type: DEFAULT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);


--
-- TOC entry 3923 (class 2604 OID 16406)
-- Name: products id; Type: DEFAULT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- TOC entry 3929 (class 2604 OID 16452)
-- Name: tags id; Type: DEFAULT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.tags ALTER COLUMN id SET DEFAULT nextval('public.tags_id_seq'::regclass);


--
-- TOC entry 4104 (class 0 OID 16392)
-- Dependencies: 218
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.categories (id, name, slug) FROM stdin;
1	Документальный	documentary
2	Драма	drama
3	Криминальный триллер	crime-thriller
4	Боевик	action
5	Хоррор	horror
\.


--
-- TOC entry 4110 (class 0 OID 16430)
-- Dependencies: 224
-- Data for Name: order_items; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.order_items (id, order_id, product_id, quantity, price_at_purchase) FROM stdin;
1	1042	3	1	520.00
2	1042	4	2	500.00
\.


--
-- TOC entry 4108 (class 0 OID 16420)
-- Dependencies: 222
-- Data for Name: orders; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.orders (id, customer_name, customer_email, customer_phone, total_price, created_at) FROM stdin;
1042	Анна Смирнова	anna@example.ru	+7 (916) 555-44-33	1520.00	2026-11-20 18:42:07
\.


--
-- TOC entry 4113 (class 0 OID 16457)
-- Dependencies: 227
-- Data for Name: product_tags; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.product_tags (product_id, tag_id) FROM stdin;
1	1
2	1
3	1
4	1
5	1
6	1
3	2
6	2
4	3
3	4
4	4
\.


--
-- TOC entry 4106 (class 0 OID 16403)
-- Dependencies: 220
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.products (id, category_id, title, price, description, stock_count) FROM stdin;
1	1	Увидеть всё	450.00	Элизабет Холмс была одной из самых молодых миллиардерш мира, пока её компания не оказалась в центре крупнейшего мошеннического скандала в истории Кремниевой долины. За месяц до заключения, потеряв всё состояние, она приглашает в свой дом съёмочную группу во главе с комиком-авангардистом — камерный портрет превращается в трёхлетнее путешествие в бездну.	120
2	2	Мисти Грин	480.00	Карьера актрисы Мисти Грин идёт на спад, и уже прошли годы после её прорывной роли в Голливуде. Мисти не может найти новые роли и, оказавшись на грани выселения, она пытается вернуть своё место в киноиндустрии.	85
3	3	Праймтайм	520.00	2006 год. Журналист и телеведущий Крис Хэнсен работает на NBC. Он запускает новое необычное шоу «Поймать хищника», в котором разоблачает педофилов, используя актёров в качестве приманки. Программа пользуется большим успехом, и глава канала ставит передачу в прайм-тайм. Однако в жизни самого Криса назревают серьёзные проблемы.	150
4	4	Натиск	500.00	Из секретной лаборатории в Нью-Мексико сбегают трое суперсолдат — модифицированные машины для убийств, не знающие сострадания. Оставляя за собой кровавый след, они нападают на трейлерный парк, где живёт бывшая военная снайпер Селеста с маленькой дочерью. Но эту женщину так легко не возьмёшь.	95
5	5	Закулисье реальности	460.00	Кларк, одинокий владелец мебельного магазина, никак не может оправиться после развода и ночует на работе. Однажды он обнаруживает проход в другое измерение и оказывается в бесконечном лабиринте жёлтых комнат и коридоров, где пространство живёт по своей логике, а нечто жуткое может скрываться за каждым углом.	70
6	2	Мать Мария	510.00	Поп-звезда Мать Мария готовится к возвращению на сцену после жуткого происшествия и 10-летнего отсутствия. Её совершенно не устраивает созданное для концерта платье, поэтому она без предупреждения заявляется к своей бывшей подруге и соратнице Сэм, ставшей успешным модным дизайнером, чтобы та сделала ей концертный наряд.	110
\.


--
-- TOC entry 4112 (class 0 OID 16449)
-- Dependencies: 226
-- Data for Name: tags; Type: TABLE DATA; Schema: public; Owner: cinema_app
--

COPY public.tags (id, name) FROM stdin;
1	A24
2	Триллер
3	Хоррор
4	IMAX
\.


--
-- TOC entry 4125 (class 0 OID 0)
-- Dependencies: 217
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_app
--

SELECT pg_catalog.setval('public.categories_id_seq', 5, true);


--
-- TOC entry 4126 (class 0 OID 0)
-- Dependencies: 223
-- Name: order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_app
--

SELECT pg_catalog.setval('public.order_items_id_seq', 2, true);


--
-- TOC entry 4127 (class 0 OID 0)
-- Dependencies: 221
-- Name: orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_app
--

SELECT pg_catalog.setval('public.orders_id_seq', 1042, true);


--
-- TOC entry 4128 (class 0 OID 0)
-- Dependencies: 219
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_app
--

SELECT pg_catalog.setval('public.products_id_seq', 6, true);


--
-- TOC entry 4129 (class 0 OID 0)
-- Dependencies: 225
-- Name: tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: cinema_app
--

SELECT pg_catalog.setval('public.tags_id_seq', 4, true);


--
-- TOC entry 3936 (class 2606 OID 16399)
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- TOC entry 3938 (class 2606 OID 16397)
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- TOC entry 3940 (class 2606 OID 16401)
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- TOC entry 3946 (class 2606 OID 16437)
-- Name: order_items order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);


--
-- TOC entry 3944 (class 2606 OID 16428)
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- TOC entry 3952 (class 2606 OID 16461)
-- Name: product_tags product_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_pkey PRIMARY KEY (product_id, tag_id);


--
-- TOC entry 3942 (class 2606 OID 16413)
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- TOC entry 3948 (class 2606 OID 16456)
-- Name: tags tags_name_key; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_name_key UNIQUE (name);


--
-- TOC entry 3950 (class 2606 OID 16454)
-- Name: tags tags_pkey; Type: CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.tags
    ADD CONSTRAINT tags_pkey PRIMARY KEY (id);


--
-- TOC entry 3954 (class 2606 OID 16438)
-- Name: order_items order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;


--
-- TOC entry 3955 (class 2606 OID 16443)
-- Name: order_items order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE RESTRICT;


--
-- TOC entry 3956 (class 2606 OID 16462)
-- Name: product_tags product_tags_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- TOC entry 3957 (class 2606 OID 16467)
-- Name: product_tags product_tags_tag_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.product_tags
    ADD CONSTRAINT product_tags_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id) ON DELETE CASCADE;


--
-- TOC entry 3953 (class 2606 OID 16414)
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: cinema_app
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- TOC entry 4119 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

GRANT ALL ON SCHEMA public TO cinema_app;


-- Completed on 2026-11-26 08:34:44 UTC

--
-- PostgreSQL database dump complete
--

\unrestrict Bua4eXPzKkaS26kdlrFC4JcESzSAk85t3aQB9b5Ljz2qhNBJeOQHup5kuRVjAO1

