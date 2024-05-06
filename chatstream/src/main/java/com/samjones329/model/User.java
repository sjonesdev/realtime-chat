package com.samjones329.model;

import java.util.UUID;
import java.util.List;

import org.springframework.data.cassandra.core.mapping.Column;
import org.springframework.data.cassandra.core.mapping.Indexed;
import org.springframework.data.cassandra.core.mapping.PrimaryKey;
import org.springframework.data.cassandra.core.mapping.Table;

@Table("users")
public class User {
    @PrimaryKey
    private UUID id;

    @Indexed
    private String username;

    @Indexed
    private String email;

    @Column("password_hash")
    private String passwordHash;

    @Column("server_ids")
    private List<UUID> serverIds;

    public User() {
    }

    public User(UUID id, String username, String email, String passwordHash, List<UUID> serverIds) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.serverIds = serverIds;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<UUID> getServerIds() {
        return serverIds;
    }

    public void setServerIds(List<UUID> serverIds) {
        this.serverIds = serverIds;
    }
}
