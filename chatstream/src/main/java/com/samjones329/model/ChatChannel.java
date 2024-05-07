package com.samjones329.model;

import java.util.UUID;
import java.util.Date;

import org.springframework.data.annotation.Transient;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import com.datastax.oss.driver.api.core.uuid.Uuids;

@Table("channels")
public class ChatChannel {

    @PrimaryKey
    private UUID id;

    @Column("server_id")
    @Indexed
    private UUID serverId;

    private String name;

    @Transient
    private Date createdAt;

    public ChatChannel(UUID id, UUID serverId, String name) {
        this.id = id;
        this.serverId = serverId;
        this.name = name;
        this.createdAt = new Date(Uuids.unixTimestamp(id));
    }

    public UUID getServerId() {
        return serverId;
    }

    public void setServerId(UUID serverId) {
        this.serverId = serverId;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
        createdAt = new Date(Uuids.unixTimestamp(id));
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "ChatChannel<id=" + id + ", serverId=" + serverId + ", name=" + name + ">";
    }

}
