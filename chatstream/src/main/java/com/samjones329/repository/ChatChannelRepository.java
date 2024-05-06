package com.samjones329.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.stereotype.Repository;

import com.samjones329.model.ChatChannel;

@Repository
public interface ChatChannelRepository extends CassandraRepository<ChatChannel, UUID> {
    List<ChatChannel> findByNameContaining(String name);

    List<ChatChannel> findByServerId(UUID serverId);
}
