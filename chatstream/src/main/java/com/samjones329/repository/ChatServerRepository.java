package com.samjones329.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import com.samjones329.model.ChatServer;

@Repository
public interface ChatServerRepository extends CassandraRepository<ChatServer, UUID> {
    List<ChatServer> findByNameContaining(String name);
}
