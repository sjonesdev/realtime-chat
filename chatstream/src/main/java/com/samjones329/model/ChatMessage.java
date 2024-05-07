package com.samjones329.model;

import java.util.Date;
import java.util.UUID;

import org.springframework.data.annotation.Transient;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import com.datastax.driver.core.utils.UUIDs;
import com.datastax.oss.driver.api.core.uuid.Uuids;

@Table("messages")
public class ChatMessage {
    @PrimaryKey
    private UUID id;

    @Indexed
    @Column("channel_id")
    private UUID channelId;

    @Column("sender_id")
    private UUID senderId;

    private String message;

    @Transient
    private Date createdAt;

    public ChatMessage() {
    }

    public ChatMessage(UUID id, UUID channelId, UUID senderId, String message) {
        this.id = id;
        this.channelId = channelId;
        this.senderId = senderId;
        this.message = message;
        this.createdAt = new Date(UUIDs.unixTimestamp(id));
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
        createdAt = new Date(Uuids.unixTimestamp(id));
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
        return createdAt;
    }
}
