-- Migration number: 0001 	 2026-06-23T12:54:10.162Z
CREATE TABLE IF NOT EXISTS Users (
  username TEXT PRIMARY KEY,
  password TEXT NOT NULL,
  secret TEXT NOT NULL
);
