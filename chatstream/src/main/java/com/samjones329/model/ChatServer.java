package com.samjones329.model;

import java.util.List;
import java.util.Date;
import java.util.UUID;

import org.springframework.data.annotation.Transient;
import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

import com.datastax.oss.driver.api.core.uuid.Uuids;

@Table("servers")
public class ChatServer {

    @PrimaryKey
    private UUID id;

    @Indexed
    private String name;

    @Column("owner_id")
    private UUID ownerId;

    @Column("default_channel_id")
    private UUID defaultChannelId;

    @Column("channel_ids")
    private List<UUID> channelIds;

    @Column("member_ids")
    private List<UUID> memberIds;

    @Transient
    private Date createdAt;

    public ChatServer(UUID id, String name, UUID ownerId, List<UUID> channelIds, List<UUID> memberIds) {
        this.id = id;
        this.name = name;
        this.ownerId = ownerId;
        this.channelIds = channelIds;
        this.memberIds = memberIds;
        this.createdAt = new Date(Uuids.unixTimestamp(id));
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

    public UUID getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(UUID ownerId) {
        this.ownerId = ownerId;
    }

    public List<UUID> getChannelIds() {
        return channelIds;
    }

    public void setChannelIds(List<UUID> chatChannelIds) {
        this.channelIds = chatChannelIds;
    }

    public List<UUID> getMemberIds() {
        return memberIds;
    }

    public void setMemberIds(List<UUID> memberIds) {
        this.memberIds = memberIds;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    @Override
    public String toString() {
        return "ChatServer<id=" + id + ", name=" + name + ", channelIds=" + channelIds + ", memberIds=" + memberIds
                + ">";
    }
}
