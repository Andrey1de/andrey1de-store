-- Table: public.actions

DROP TABLE IF  EXISTS public.actions;

CREATE TABLE public.actions
(
    kind character varying COLLATE pg_catalog."default" NOT NULL,
    key character varying COLLATE pg_catalog."default" NOT NULL,
    jdata jsonb,
    status  int NOT NULL DEFAULT 0,
    stored timestamp(3) with time zone NOT NULL DEFAULT now(),
    store_to timestamp(3) with time zone NOT NULL DEFAULT to_timestamp('2100-01-02'::text, 'YYYY-MM-DD'::text),
    CONSTRAINT actions_type_key PRIMARY KEY (kind, key)
)

TABLESPACE pg_default;

ALTER TABLE public.actions
    OWNER to andrey1de;

COMMENT ON COLUMN public.actions.jdata
    IS 'json additional content';

-- Table: public.store

DROP TABLE IF EXISTS public.store;

CREATE TABLE public.store
(
    kind character varying COLLATE pg_catalog."default" NOT NULL,
    key character varying COLLATE pg_catalog."default" NOT NULL,
    jdata jsonb,
    status  int NOT NULL DEFAULT 0,
    stored timestamp(3) with time zone NOT NULL DEFAULT now(),
    store_to timestamp(3) with time zone NOT NULL DEFAULT to_timestamp('2100-01-02'::text, 'YYYY-MM-DD'::text),
    CONSTRAINT store_pkey PRIMARY KEY (kind, key)
)

TABLESPACE pg_default;

ALTER TABLE public.store
    OWNER to andrey1de;

COMMENT ON COLUMN public.store.jdata
    IS 'json additional content';

-- Table: public.users

DROP TABLE IF EXISTS public.users;

CREATE TABLE public.users
(
     kind character varying COLLATE pg_catalog."default" NOT NULL,
    key character varying COLLATE pg_catalog."default" NOT NULL,
    jdata jsonb,
    status  int NOT NULL DEFAULT 0,
    stored timestamp(3) with time zone DEFAULT now(),
    store_to timestamp(3) with time zone DEFAULT to_timestamp('2100-01-02'::text, 'YYYY-MM-DD'::text),
    CONSTRAINT users_pkey PRIMARY KEY (kind, key)
)

TABLESPACE pg_default;

ALTER TABLE public.users
    OWNER to andrey1de;

COMMENT ON COLUMN public.users.jdata
    IS 'json additional content';

