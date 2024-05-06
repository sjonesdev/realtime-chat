package com.samjones329.controller;

import java.sql.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Controller;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.samjones329.constants.KafkaConstants;
import com.samjones329.model.ChatMessage;
import com.samjones329.repository.ChatChannelRepository;
import com.samjones329.repository.ChatMessageRepository;
import com.samjones329.repository.ChatServerRepository;
import com.samjones329.service.UserDetailsServiceImpl;

@Controller
public class ChatMessageController {

    @Autowired
    private KafkaTemplate<String, ChatMessage> kafkaTemplate;

    @Autowired
    SimpMessagingTemplate template;

    @Autowired
    ChatMessageRepository messageRepo;

    @Autowired
    ChatChannelRepository channelRepo;

    @Autowired
    ChatServerRepository serverRepo;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    public record ChatUpdateResponse(UUID channelId, List<ChatMessage> newMessages) {
    }

    public record ChatUpdateError(String message) {
    }

    @MessageMapping("/chatUpdateRequest/{channelId}")
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateResponse connectToChat(@DestinationVariable("channelId") UUID channelId,
            Date since) {
        List<ChatMessage> messages = messageRepo.getLatestChatMessages(since, channelId);
        return new ChatUpdateResponse(channelId, messages);
    }

    @MessageExceptionHandler
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateError connectToChat(Throwable exception) {
        return new ChatUpdateError(exception.getMessage());
    }

    @MessageMapping("/chat/{channelId}")
    public void chatMessage(@CurrentSecurityContext SecurityContext context,
            @DestinationVariable("channelId") UUID channelId, ChatMessage message) {
        try {
            // check permissions
            var channel = channelRepo.findById(channelId).get(); // will throw error if channel not exist
            var server = serverRepo.findById(channel.getServerId()).get();
            var user = userDetailsService.getDetailsFromContext(context).getUser();
            if (!server.getMemberIds().contains(user.getId()))
                throw new RuntimeException("User cannot message in unjoined server");

            // Sending the message to kafka topic queue
            ChatMessage savedMessage = messageRepo
                    .save(new ChatMessage(Uuids.timeBased(), channelId, user.getId(), message.getMessage()));
            kafkaTemplate.send(KafkaConstants.KAFKA_TOPIC_BASE + "/" + channelId, savedMessage).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topicPattern = KafkaConstants.KAFKA_TOPIC_BASE + "/.*", groupId = KafkaConstants.GROUP_ID)
    public void listen(ChatMessage message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        System.out.println(topic + ": prepend with /topic/ and send via kafka listener..");
        template.convertAndSend("/topic/" + topic, message);
    }
}
