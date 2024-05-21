package com.samjones329.model;

import java.util.Set;

import java.util.Date;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "users", indexes = { @Index(columnList = "email"), @Index(columnList = "username") })
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String username;

    private String email;

    private String passwordHash;

    private boolean enabled;

    private Date createdAt;

    @OneToMany(mappedBy = "owner", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<Server> ownedServers;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(name = "users_joined_servers", joinColumns = @JoinColumn(name = "user_id"), inverseJoinColumns = @JoinColumn(name = "server_id"))
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<Server> joinedServers;
}
