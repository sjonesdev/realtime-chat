package com.samjones329.model;

import java.util.Date;
import java.util.UUID;

import org.springframework.data.cassandra.core.cql.Ordering;
import org.springframework.data.cassandra.core.cql.PrimaryKeyType;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.PrimaryKeyColumn;
import org.springframework.data.cassandra.core.mapping.Table;

import com.datastax.oss.driver.api.core.uuid.Uuids;

@Table("messages")
public class ChatMessage {
    @PrimaryKeyColumn(name = "id", ordinal = 1, type = PrimaryKeyType.CLUSTERED, ordering = Ordering.ASCENDING)
    private UUID id;

    @PrimaryKeyColumn(name = "channel_id", ordinal = 0, type = PrimaryKeyType.PARTITIONED)
    private UUID channelId;

    @Column("sender_id")
    private UUID senderId;

    private String message;

    public ChatMessage() {
    }

    public ChatMessage(UUID id, UUID channelId, UUID senderId, String message) {
        this.id = id;
        this.channelId = channelId;
        this.senderId = senderId;
        this.message = message;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getChannelId() {
        return channelId;
    }

    public void setChannelId(UUID channelId) {
        this.channelId = channelId;
    }

    public UUID getSenderId() {
        return senderId;
    }

    public String getMessage() {
        return message;
    }

    public void setSenderId(UUID senderId) {
        this.senderId = senderId;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Date getCreatedAt() {
        return new Date(Uuids.unixTimestamp(id));
    }
}
