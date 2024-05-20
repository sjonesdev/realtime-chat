CREATE SCHEMA IF NOT EXISTS chat;

CREATE TABLE IF NOT EXISTS
    chat.users (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        enabled BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL
    );

CREATE UNIQUE INDEX IF NOT EXISTS usernameidx ON chat.users (username);

CREATE UNIQUE INDEX IF NOT EXISTS useremailidx ON chat.users (email);

CREATE TABLE IF NOT EXISTS
    chat.servers (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        owner_id BIGINT NOT NULL REFERENCES chat.users (id) ON DELETE CASCADE
    );

CREATE INDEX IF NOT EXISTS servernameidx ON chat.servers (name);

CREATE TABLE IF NOT EXISTS
    chat.channels (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL,
        server_id BIGINT NOT NULL REFERENCES chat.servers (id) ON DELETE CASCADE
    );

ALTER TABLE chat.servers
ADD COLUMN IF NOT EXISTS default_channel_id BIGINT REFERENCES chat.channels (id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS
    chat.users_joined_servers (
        user_id BIGINT REFERENCES chat.users (id) ON DELETE CASCADE,
        server_id BIGINT REFERENCES chat.servers (id) ON DELETE CASCADE,
        PRIMARY KEY (user_id, server_id)
    );