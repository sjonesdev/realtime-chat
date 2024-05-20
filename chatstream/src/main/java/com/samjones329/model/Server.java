package com.samjones329.model;

import java.util.Set;

import java.util.Date;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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
@Table(name = "servers", indexes = @Index(columnList = "name"))
public class Server {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "description")
    private String desc;

    private Date createdAt;

    @OneToOne
    @JoinColumn(name = "default_channel_id")
    private Channel defaultChannel;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private User owner;

    @OneToMany(targetEntity = com.samjones329.model.Channel.class, cascade = CascadeType.ALL, mappedBy = "server")
    private Set<Channel> channels;

    @ManyToMany(mappedBy = "joinedServers")
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<User> members;

}
