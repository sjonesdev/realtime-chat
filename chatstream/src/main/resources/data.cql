-- Create a keyspace
CREATE KEYSPACE IF NOT EXISTS chat WITH REPLICATION = { 'class' : 'SimpleStrategy', 'replication_factor' : '1' };

use chat;

CREATE TABLE IF NOT EXISTS messages (
    id timeuuid,
    sender_id bigint,
    channel_id bigint,
    message text,
    PRIMARY KEY (channel_id, id)
) WITH CLUSTERING ORDER BY (id ASC);