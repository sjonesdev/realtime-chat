package com.samjones329.repository;

import java.sql.Date;
import java.util.List;
import java.util.UUID;

import org.springframework.data.cassandra.repository.CassandraRepository;
import org.springframework.data.cassandra.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.samjones329.model.Message;

@Repository
public interface MessageRepo extends CassandraRepository<Message, UUID> {
    List<Message> findByChannelIdOrderByIdAsc(Long channelId);

    @Query("SELECT * FROM chat.messages WHERE channel_id = :channelId AND toTimestamp(id) > :since ORDER BY id ASC;")
    List<Message> getLatestChatMessages(@Param("since") Date since, @Param("channelId") UUID channelId);
}
