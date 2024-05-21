package com.samjones329.controller;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
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

import com.samjones329.model.Message;
import com.samjones329.model.Server;
import com.samjones329.repository.ServerRepo;
import com.samjones329.repository.UserRepo;
import com.samjones329.service.ServerService;
import com.samjones329.service.UserDetailsServiceImpl;
import com.samjones329.view.ChannelView;
import com.samjones329.view.ServerView;
import com.samjones329.repository.ChannelRepo;
import com.samjones329.repository.MessageRepo;

@RestController
@RequestMapping("/api")
public class ServerController {

    @Autowired
    UserRepo userRepo;

    @Autowired
    ServerRepo serverRepo;

    @Autowired
    ChannelRepo channelRepo;

    @Autowired
    MessageRepo msgRepo;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    ServerService serverServ;

    Logger logger = LoggerFactory.getLogger(ServerController.class);

    @GetMapping("/servers")
    public ResponseEntity<List<ServerView>> getAllServers(@RequestParam(required = false) String name,
            @RequestParam(required = false) List<Long> ids) {
        try {
            List<Server> servers;
            if (name != null && name.length() > 0) {
                servers = serverRepo.findByNameContaining(name);
            } else if (ids != null && !ids.isEmpty()) {
                logger.info("Fetching servers with ids " + ids);
                servers = serverRepo.findAllById(ids);
            } else {
                servers = serverRepo.findAll();
            }

            List<ServerView> serverViews = new ArrayList<>(servers.size());
            for (var server : servers) {
                serverViews.add(new ServerView(server));
            }
            return new ResponseEntity<>(serverViews, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers with name " + name + " and ids " + ids, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}")
    public ResponseEntity<ServerView> getServer(@PathVariable("id") Long id) {
        try {
            var server = serverRepo.findById(id);
            if (server.isPresent())
                return new ResponseEntity<>(new ServerView(server.get()), HttpStatus.OK);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record ServerRequest(String name, String description) {
    }

    @PostMapping("/servers")
    public ResponseEntity<ServerView> createServer(@CurrentSecurityContext SecurityContext securityContext,
            @RequestBody ServerRequest req) {
        try {
            var user = userDetailsService.getDetailsFromContext(securityContext).getUser();

            var server = serverServ.createServer(user, req.name(), req.description());

            logger.info(String.format("Made ChatServer[id=%s,name=%s,ownerId=%s,chatChannelIds=%s,memberIds=%s]",
                    server.getId(), server.getName(), server.getOwner().getId(), server.getChannels(),
                    server.getMembers()));

            return new ResponseEntity<>(new ServerView(server), HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error at POST /servers with " + req, e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/servers/{id}")
    public ResponseEntity<ServerView> updateServer(@PathVariable("id") Long id, @RequestBody Server serverReq) {
        try {
            var server = serverRepo.findById(id);
            if (server.isPresent()) {
                serverReq.setId(id);
                return new ResponseEntity<>(new ServerView(serverRepo.save(serverReq)), HttpStatus.OK);
            } else {
                return new ResponseEntity<>(HttpStatus.NOT_FOUND);
            }
        } catch (Exception e) {
            logger.error("Error at PUT /servers/{id} with id " + id + " and update object " + serverReq, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/servers/{id}")
    public ResponseEntity<HttpStatus> deleteServer(@PathVariable("id") Long id) {
        try {
            serverRepo.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at DELETE /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}/channels")
    public ResponseEntity<List<ChannelView>> getChannels(@PathVariable("id") Long id) {
        try {
            var channels = channelRepo.findByServerId(id);
            List<ChannelView> channelViews = new ArrayList<>(channels.size());
            for (var channel : channels) {
                channelViews.add(new ChannelView(channel));
            }
            return new ResponseEntity<>(channelViews, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id}/channels with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record ChatChannelRequest(String name) {

    }

    @PostMapping("/servers/{id}/channels")
    public ResponseEntity<ChannelView> createChannel(@CurrentSecurityContext SecurityContext context,
            @PathVariable("id") Long id, @RequestBody ChatChannelRequest req) {
        try {
            var user = userDetailsService.getDetailsFromContext(context).getUser();

            var channel = serverServ.createChannel(user, id, req.name());
            if (channel.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            return new ResponseEntity<>(new ChannelView(channel.get()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/channels/{id}")
    public ResponseEntity<ChannelView> getChannel(@PathVariable("id") Long id) {
        try {
            var channel = channelRepo.findById(id);
            if (channel.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            return new ResponseEntity<>(new ChannelView(channel.get()), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /channels/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/servers/{id}/join")
    public ResponseEntity<HttpStatusCode> postMethodName(@CurrentSecurityContext SecurityContext context,
            @PathVariable("id") Long id) {
        try {
            var maybeServer = serverRepo.findById(id);
            if (maybeServer.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            var server = maybeServer.get();
            var user = userDetailsService.getDetailsFromContext(context).getUser();
            server.getMembers().add(user);

            serverRepo.save(server);
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error joining server with id=" + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/channels/{id}/messages")
    public ResponseEntity<List<Message>> getChannelMessages(@CurrentSecurityContext SecurityContext context,
            @PathVariable Long id) {
        try {
            var maybeChannel = channelRepo.findById(id);
            if (maybeChannel.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }

            var user = userDetailsService.getDetailsFromContext(context).getUser();
            var channel = maybeChannel.get();
            if (!channel.getServer().getMembers().contains(user)) {
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }

            var messages = msgRepo.findByChannelIdOrderByIdAsc(id);
            logger.info("Messages:");
            for (var message : messages) {
                logger.info(String.format("\tChatMessage[id=%s,channelId=%s,senderId=%s,message=\"%s\",createdAt=%s]",
                        message.getId(), message.getChannelId(), message.getSenderId(), message.getMessage(),
                        message.getCreatedAt()));
            }
            return new ResponseEntity<>(messages, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting messages for channel id=" + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
