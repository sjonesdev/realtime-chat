package com.samjones329.controller;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaAdmin;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datastax.driver.core.utils.UUIDs;
import com.samjones329.constants.KafkaConstants;
import com.samjones329.model.ChatChannel;
import com.samjones329.model.ChatMessage;
import com.samjones329.model.ChatServer;
import com.samjones329.repository.ChatServerRepository;
import com.samjones329.repository.UserRepository;
import com.samjones329.service.UserDetailsServiceImpl;
import com.samjones329.repository.ChatChannelRepository;
import com.samjones329.repository.ChatMessageRepository;

@RestController
@RequestMapping("/api")
public class ChatServerController {

    @Autowired
    UserRepository userRepo;

    @Autowired
    ChatServerRepository serverRepo;

    @Autowired
    ChatChannelRepository channelRepo;

    @Autowired
    ChatMessageRepository msgRepo;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    private KafkaAdmin kafkaAdmin;

    Logger logger = LoggerFactory.getLogger(ChatServerController.class);

    @GetMapping("/servers")
    public ResponseEntity<List<ChatServer>> getAllServers(@RequestParam(required = false) String name,
            @RequestParam(required = false) List<UUID> ids) {
        try {
            List<ChatServer> servers;
            if (name != null && name.length() > 0) {
                servers = serverRepo.findByNameContaining(name);
            } else if (ids != null && !ids.isEmpty()) {
                logger.info("Fetching servers with ids " + ids);
                servers = serverRepo.findAllById(ids);
            } else {
                servers = serverRepo.findAll();
            }
            return new ResponseEntity<>(servers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers with name " + name + " and ids " + ids, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}")
    public ResponseEntity<ChatServer> getServer(@PathVariable("id") UUID id) {
        try {
            var server = serverRepo.findById(id);
            if (server.isPresent())
                return new ResponseEntity<>(server.get(), HttpStatus.OK);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record ServerRequest(String name) {
    }

    @PostMapping("/servers")
    public ResponseEntity<ChatServer> createServer(@CurrentSecurityContext SecurityContext securityContext,
            @RequestBody ServerRequest serverRequest) {
        try {
            var user = userDetailsService.getDetailsFromContext(securityContext).getUser();
            var serverId = UUIDs.timeBased();
            ChatChannel defaultChannel = new ChatChannel(UUIDs.timeBased(), serverId, "Default");
            defaultChannel = channelRepo.save(defaultChannel);

            kafkaAdmin.createOrModifyTopics(
                    TopicBuilder.name(KafkaConstants.KAFKA_TOPIC_BASE + "." + defaultChannel.getId().toString())
                            .build());

            var server = new ChatServer(serverId, serverRequest.name(), user.getId(), defaultChannel.getId(),
                    List.of(defaultChannel.getId()),
                    List.of(user.getId()));
            server = serverRepo.save(server);
            logger.info(String.format("Making ChatServer[id=%s,name=%s,ownerId=%s,chatChannelIds=%s,memberIds=%s]",
                    server.getId(), server.getName(), server.getOwnerId(), server.getChannelIds(),
                    server.getMemberIds()));

            var serverIds = user.getServerIds();
            if (serverIds == null) {
                serverIds = List.of(server.getId());
                user.setServerIds(serverIds);
            } else {
                serverIds.add(defaultChannel.getId());
            }
            userRepo.save(user);

            return new ResponseEntity<>(server, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error at POST /servers with " + serverRequest, e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/servers/{id}")
    public ResponseEntity<ChatServer> updateServer(@PathVariable("id") UUID id, @RequestBody ChatServer chatServer) {
        try {
            var server = serverRepo.findById(id);
            if (server.isPresent()) {
                chatServer.setId(id);
                return new ResponseEntity<>(serverRepo.save(chatServer), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error at PUT /servers/{id} with id " + id + " and update object " + chatServer, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/servers/{id}")
    public ResponseEntity<HttpStatus> deleteServer(@PathVariable("id") UUID id) {
        try {
            serverRepo.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at DELETE /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}/channels")
    public ResponseEntity<List<ChatChannel>> getChannels(@PathVariable("id") UUID id) {
        try {
            var servers = channelRepo.findByServerId(id);
            return new ResponseEntity<>(servers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id}/channels with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record ChatChannelRequest(String name) {

    }

    @PostMapping("/servers/{id}/channels")
    public ResponseEntity<ChatChannel> createChannel(@CurrentSecurityContext SecurityContext context,
            @PathVariable("id") UUID id, @RequestBody ChatChannelRequest request) {
        try {
            var user = userDetailsService.getDetailsFromContext(context).getUser();
            var server = serverRepo.findById(id);
            if (server.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            if (server.get().getOwnerId() != user.getId()) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            var channel = channelRepo.save(new ChatChannel(UUIDs.timeBased(), id, request.name()));
            kafkaAdmin.createOrModifyTopics(
                    TopicBuilder.name(KafkaConstants.KAFKA_TOPIC_BASE + "." + channel.getId().toString()).build());

            return new ResponseEntity<>(channel, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/channels/{id}")
    public ResponseEntity<ChatChannel> getChannel(@PathVariable("id") UUID id) {
        try {
            var channel = channelRepo.findById(id);
            if (channel.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            return new ResponseEntity<>(channel.get(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /channels/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/servers/{id}/join")
    public ResponseEntity<ChatServer> postMethodName(@CurrentSecurityContext SecurityContext context,
            @PathVariable("id") UUID id) {
        try {
            var server = serverRepo.findById(id);
            if (server.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);

            var userId = userDetailsService.getDetailsFromContext(context).getUser().getId();
            server.get().getMemberIds().add(userId);

            var savedServer = serverRepo.save(server.get());
            return new ResponseEntity<>(savedServer, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error joining server", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/channels/{id}/messages")
    public ResponseEntity<List<ChatMessage>> getChannelMessages(@CurrentSecurityContext SecurityContext context,
            @PathVariable UUID id) {
        try {
            var channel = channelRepo.findById(id);
            if (channel.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            var userId = userDetailsService.getDetailsFromContext(context).getUser().getId();
            var server = serverRepo.findById(channel.get().getServerId()).get();
            if (!server.getMemberIds().contains(userId)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            var messages = msgRepo.findByChannelId(id);
            // messages are ordered by timestamp bc of timeuuid, but we want the most recent
            // ones at the end, not the front
            Collections.reverse(messages);
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting messages for channel id=" + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
