-- Create a keyspace
CREATE KEYSPACE IF NOT EXISTS chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

use chat;

-- Create a table
CREATE TABLE IF NOT EXISTS servers (
    id uuid PRIMARY KEY,
    name text,
    owner_id uuid,
    channel_ids list<uuid>,
    member_ids list<uuid>
);
CREATE INDEX IF NOT EXISTS servernameidx ON servers (name);

CREATE TABLE IF NOT EXISTS channels (
    id uuid PRIMARY KEY,
    name text,
    server_id uuid
);
CREATE INDEX IF NOT EXISTS serveridx ON channels (server_id);

CREATE TABLE IF NOT EXISTS messages (
    id uuid PRIMARY KEY,
    sender_id uuid,
    channel_id uuid,
    created_at timestamp,
    message text
);
CREATE INDEX IF NOT EXISTS channelidx ON messages (channel_id);

CREATE TABLE IF NOT EXISTS users (
    id uuid PRIMARY KEY,
    username text,
    email text,
    password_hash text,
    server_ids list<uuid>
);
CREATE INDEX IF NOT EXISTS emailidx ON users (email);