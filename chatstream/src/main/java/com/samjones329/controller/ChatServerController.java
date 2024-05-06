package com.samjones329.controller;

import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.samjones329.model.ChatChannel;
import com.samjones329.model.ChatServer;
import com.samjones329.repository.ChatServerRepository;
import com.samjones329.repository.ChatChannelRepository;

@CrossOrigin(originPatterns = "*")
@RestController
@RequestMapping("/api")
public class ChatServerController {

    @Autowired
    ChatServerRepository chatServerRepository;

    @Autowired
    ChatChannelRepository chatChannelRepository;

    Logger logger = LoggerFactory.getLogger(ChatServerController.class);

    @GetMapping("/servers")
    public ResponseEntity<List<ChatServer>> getAllServers(@RequestParam(required = false) String name) {
        try {
            List<ChatServer> servers;
            if (name == null) {
                servers = chatServerRepository.findAll();
            } else {
                servers = chatServerRepository.findByNameContaining(name);
            }
            if (servers.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            logger.info("Chat Servers: " + servers);
            return new ResponseEntity<>(servers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers with name " + name, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}")
    public ResponseEntity<ChatServer> getServer(@PathVariable("id") UUID id) {
        try {
            var server = chatServerRepository.findById(id);
            if (server.isPresent())
                return new ResponseEntity<>(server.get(), HttpStatus.OK);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/servers")
    public ResponseEntity<ChatServer> createServer(@RequestBody ChatServer chatServer) {
        try {
            chatServer.setId(Uuids.timeBased());
            ChatServer _chatServer = chatServerRepository.save(chatServer);
            return new ResponseEntity<>(_chatServer, HttpStatus.CREATED);
        } catch (Exception e) {
            logger.error("Error at POST /servers with " + chatServer, e);
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PutMapping("/servers/{id}")
    public ResponseEntity<ChatServer> updateServer(@PathVariable("id") UUID id, @RequestBody ChatServer chatServer) {
        try {
            var server = chatServerRepository.findById(id);
            if (server.isPresent()) {
                chatServer.setId(id);
                return new ResponseEntity<>(chatServerRepository.save(chatServer), HttpStatus.OK);
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
            chatServerRepository.deleteById(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (Exception e) {
            logger.error("Error at DELETE /servers/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/servers/{id}/channels")
    public ResponseEntity<List<ChatChannel>> getChannels(@PathVariable("id") UUID id) {
        try {
            var servers = chatChannelRepository.findByServerId(id);
            if (servers.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            return new ResponseEntity<>(servers, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /servers/{id}/channels with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/channels/{id}")
    public ResponseEntity<ChatChannel> getChannel(@PathVariable("id") UUID id) {
        try {
            var channel = chatChannelRepository.findById(id);
            if (channel.isEmpty())
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            return new ResponseEntity<>(channel.get(), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error at GET /channels/{id} with id " + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
