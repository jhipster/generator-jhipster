
CREATE TABLE IF NOT EXISTS user (
    id text,
    login text,
    password text,
    firstname text,
    lastname text,
    email text,
    activated boolean,
    lang_key text,
    activation_key text,
    reset_key text,
    reset_date timestamp,
    authorities set<text>,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS user_by_login (
    login text,
    id text,
    PRIMARY KEY(login, id)
);

CREATE TABLE IF NOT EXISTS user_by_email (
    email text,
    id text,
    PRIMARY KEY(email, id)
);

CREATE TABLE IF NOT EXISTS user_by_activation_key (
    activation_key text,
    id text,
    PRIMARY KEY(activation_key, id)
);

CREATE TABLE IF NOT EXISTS user_by_reset_key (
    reset_key text,
    id text,
    PRIMARY KEY(reset_key, id)
);

CREATE TABLE IF NOT EXISTS activation_key_by_creation_date (
    creation_date timeuuid,
    activation_key text,
    PRIMARY KEY(creation_date, activation_key)
);

CREATE TABLE IF NOT EXISTS persistent_token (
    series text,
    token_date timestamp,
    user_agent text,
    token_value text,
    login text,
    user_id text,
    ip_address text,
    PRIMARY KEY(series)
);

CREATE TABLE IF NOT EXISTS persistent_token_by_user (
    user_id text,
    persistent_token_series text,
    PRIMARY KEY(user_id)
);

INSERT INTO user (id, login, password , firstname, lastname ,email ,activated ,lang_key, activation_key, authorities)
VALUES('1','system','$2a$10$mE.qmcV0mFU5NcKh73TZx.z4ueI/.bDWbj0T1BYyqP481kGGarKLG','','System','system@localhost',true,'en','', {'ROLE_USER', 'ROLE_ADMIN'});

INSERT INTO user_by_login (login, id)
VALUES('system','1');

INSERT INTO user (id, login, password , firstname, lastname ,email ,activated ,lang_key, activation_key, authorities)
VALUES('2','anonymousUser','$2a$10$j8S5d7Sr7.8VTOYNviDPOeWX8KcYILUVJBsYV83Y5NtECayypx9lO','','Anonymous','anonymous@localhost',true,'en','', {});

INSERT INTO user_by_login (login, id)
VALUES('anonymousUser','2');

INSERT INTO user (id, login, password , firstname, lastname ,email ,activated ,lang_key, activation_key, authorities)
VALUES('3','admin','$2a$10$gSAhZrxMllrbgj/kkK9UceBPpChGWJA7SYIb1Mqo.n5aNLq1/oRrC','','Administrator','admin@localhost',true,'en','', {'ROLE_USER', 'ROLE_ADMIN'});

INSERT INTO user_by_login (login, id)
VALUES('admin','3');

INSERT INTO user (id, login, password , firstname, lastname ,email ,activated ,lang_key, activation_key, authorities)
VALUES('4','user','$2a$10$VEjxo0jq2YG9Rbk2HmX9S.k1uZBGYUHdUcid3g/vfiEl7lwWgOH/K','','User','user@localhost',true,'en','', {'ROLE_USER'});

INSERT INTO user_by_login (login, id)
VALUES('user','4');
