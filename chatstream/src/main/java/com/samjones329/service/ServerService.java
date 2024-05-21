package com.samjones329.service;

import java.util.Arrays;
import java.util.Date;
import java.util.HashSet;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.stereotype.Service;

import com.samjones329.constants.KafkaConstants;
import com.samjones329.model.Channel;
import com.samjones329.model.Server;
import com.samjones329.model.User;
import com.samjones329.repository.ChannelRepo;
import com.samjones329.repository.ServerRepo;
import com.samjones329.repository.UserRepo;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;

@Service
public class ServerService {
    @Autowired
    ServerRepo serverRepo;

    @Autowired
    ChannelRepo channelRepo;

    @Autowired
    UserRepo userRepo;

    @Autowired
    private KafkaAdmin kafkaAdmin;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public Server createServer(User owner, String name, String desc) {
        var server = new Server(null, name, desc, new Date(), null,
                owner, new HashSet<>(), new HashSet<>());
        server.getMembers().add(owner);

        owner.getJoinedServers().add(server);

        server = serverRepo.save(server);
        System.out.println("SERVER: " + server + server.getMembers());

        // add try catch to this later since it's not critical
        Channel defaultChannel = new Channel(null, "Default", new Date(), server);
        defaultChannel = channelRepo.save(defaultChannel);

        kafkaAdmin.createOrModifyTopics(
                TopicBuilder.name(KafkaConstants.KAFKA_TOPIC_BASE + "." + defaultChannel.getId().toString())
                        .build());

        server.setChannels(new HashSet<>(Arrays.asList(defaultChannel)));
        server.setDefaultChannel(defaultChannel);
        return serverRepo.save(server);
    }

    @Transactional
    public boolean canUserSendMessageInChannel(User user, Long channelId) {
        var channel = channelRepo.findById(channelId);
        if (channel.isEmpty())
            return false;
        return channel.get().getServer().getMembers().contains(user);
    }

    @Transactional
    public Optional<Channel> createChannel(User requester, Long serverId, String name) {
        var server = serverRepo.findById(serverId);
        if (server.isEmpty() || server.get().getOwner().getId() != requester.getId()) {
            return Optional.empty();
        }

        var channel = channelRepo.save(new Channel(null, name, new Date(), server.get()));
        kafkaAdmin.createOrModifyTopics(
                TopicBuilder.name(KafkaConstants.KAFKA_TOPIC_BASE + "." + channel.getId().toString()).build());

        return Optional.of(channel);
    }
}
