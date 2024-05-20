package com.samjones329.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.samjones329.model.Channel;

@Repository
public interface ChannelRepo extends JpaRepository<Channel, Long> {
    List<Channel> findByNameContaining(String name);

    List<Channel> findByServerId(Long serverId);
}
