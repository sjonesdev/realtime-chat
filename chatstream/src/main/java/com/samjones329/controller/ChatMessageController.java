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
import org.springframework.stereotype.Controller;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.samjones329.constants.KafkaConstants;
import com.samjones329.model.ChatMessage;
import com.samjones329.repository.ChatMessageRepository;

@Controller
public class ChatMessageController {

    @Autowired
    private KafkaTemplate<String, ChatMessage> kafkaTemplate;

    @Autowired
    SimpMessagingTemplate template;

    @Autowired
    ChatMessageRepository chatMessageRepository;

    private class ChatUpdateResponse {
        @SuppressWarnings("unused")
        UUID channelId;
        @SuppressWarnings("unused")
        List<ChatMessage> newMessages;

        ChatUpdateResponse(UUID channelId, List<ChatMessage> newMessages) {
            this.channelId = channelId;
            this.newMessages = newMessages;
        }
    }

    @MessageMapping("/chatUpdateRequest/{channelId}")
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateResponse connectToChat(@DestinationVariable("channelId") UUID channelId,
            Date since) {
        List<ChatMessage> messages = chatMessageRepository.getLatestChatMessages(since, channelId);
        return new ChatUpdateResponse(channelId, messages);
    }

    private class ChatUpdateError {
        @SuppressWarnings("unused")
        String message;

        ChatUpdateError(String message) {
            this.message = message;
        }
    }

    @MessageExceptionHandler
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateError connectToChat(Throwable exception) {
        return new ChatUpdateError(exception.getMessage());
    }

    @MessageMapping("/chat/{channelId}")
    public void chatMessage(@DestinationVariable("channelId") UUID channelId, ChatMessage message) {
        try {
            // Sending the message to kafka topic queue
            ChatMessage savedMessage = chatMessageRepository
                    .save(new ChatMessage(Uuids.timeBased(), channelId, message.getUsername(), message.getMessage()));
            kafkaTemplate.send(KafkaConstants.KAFKA_TOPIC_BASE + "/" + channelId, savedMessage).get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topicPattern = KafkaConstants.KAFKA_TOPIC_BASE + "/.*", groupId = KafkaConstants.GROUP_ID)
    // @SendTo("/topic/chat")
    public void listen(ChatMessage message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        System.out.println(topic + ": prepend with /topic/ and send via kafka listener..");
        template.convertAndSend("/topic/" + topic, message);
    }
}
