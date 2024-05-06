package com.samjones329.model;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

@Table("servers")
public class ChatServer {

    @PrimaryKey
    private UUID id;

    @Indexed
    private String name;

    @Column("owner_id")
    private UUID ownerId;

    @Column("channel_ids")
    private List<UUID> channelIds;

    @Column("member_ids")
    private List<UUID> memberIds;

    public ChatServer() {
    }

    public ChatServer(String name) {
        this.name = name;
        this.channelIds = new ArrayList<>();
        this.memberIds = new ArrayList<>();
    }

    public ChatServer(String name, UUID ownerId, List<UUID> chatChannelIds, List<UUID> memberIds) {
        this.name = name;
        this.ownerId = ownerId;
        this.channelIds = chatChannelIds;
        this.memberIds = memberIds;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    @Override
    public String toString() {
        return "ChatServer<id=" + id + ", name=" + name + ", channelIds=" + channelIds + ", memberIds=" + memberIds
                + ">";
    }
}
