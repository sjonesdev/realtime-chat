package com.samjones329.model;

import java.util.Date;
import java.util.UUID;

import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

@Table("messages")
public class ChatMessage {
    @PrimaryKey
    private UUID id;

    @Indexed
    private UUID channelId;

    private String username;

    private String message;

    @Column("created_at")
    private Date createdAt;

    public ChatMessage() {
    }

    public ChatMessage(UUID id, UUID channelId, String username, String message) {
        this.id = id;
        this.channelId = channelId;
        this.username = username;
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

    public String getUsername() {
        return username;
    }

    public String getMessage() {
        return message;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
