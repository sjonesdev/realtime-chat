-- Create a keyspace
CREATE KEYSPACE IF NOT EXISTS chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

use chat;

-- Create a table
CREATE TABLE IF NOT EXISTS servers (
    id timeuuid PRIMARY KEY,
    name text,
    owner_id timeuuid,
    default_channel_id timeuuid,
    channel_ids list<timeuuid>,
    member_ids list<timeuuid>
);
CREATE CUSTOM INDEX IF NOT EXISTS servernamecustomidx ON servers (name)
USING 'org.apache.cassandra.index.sasi.SASIIndex';

CREATE TABLE IF NOT EXISTS channels (
    id timeuuid PRIMARY KEY,
    name text,
    server_id timeuuid
);
CREATE INDEX IF NOT EXISTS serveridx ON channels (server_id);

CREATE TABLE IF NOT EXISTS messages (
    id timeuuid PRIMARY KEY,
    sender_id timeuuid,
    channel_id timeuuid,
    message text
);
CREATE INDEX IF NOT EXISTS channelidx ON messages (channel_id);

CREATE TABLE IF NOT EXISTS users (
    id timeuuid PRIMARY KEY,
    username text,
    email text,
    password_hash text,
    server_ids list<timeuuid>
);
CREATE INDEX IF NOT EXISTS emailidx ON users (email);
CREATE INDEX IF NOT EXISTS unameidx ON users (username);