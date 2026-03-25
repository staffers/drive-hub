-- schema.sql
CREATE TABLE IF NOT EXISTS clients (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  color        TEXT NOT NULL,
  initials     TEXT NOT NULL,
  share_slug   TEXT,
  share_token  TEXT
);


CREATE TABLE IF NOT EXISTS docs (
  id         TEXT PRIMARY KEY,
  title      TEXT NOT NULL,
  url        TEXT NOT NULL,
