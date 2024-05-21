package com.samjones329.controller;

import java.security.Principal;
import java.sql.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutionException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
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
import com.samjones329.model.Message;
import com.samjones329.repository.ChannelRepo;
import com.samjones329.repository.MessageRepo;
import com.samjones329.repository.ServerRepo;
import com.samjones329.service.ServerService;
import com.samjones329.service.UserDetailsServiceImpl;

@Controller
public class MessageController {

    @Autowired
    private KafkaTemplate<String, Message> kafkaTemplate;

    @Autowired
    SimpMessagingTemplate template;

    @Autowired
    MessageRepo messageRepo;

    @Autowired
    ChannelRepo channelRepo;

    @Autowired
    ServerRepo serverRepo;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    ServerService serverServ;

    Logger logger = LoggerFactory.getLogger(MessageController.class);

    public record ChatUpdateResponse(UUID channelId, List<Message> newMessages) {
    }

    public record ChatUpdateError(String message) {
    }

    @MessageMapping("/chatUpdateRequest/{channelId}")
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateResponse connectToChat(@DestinationVariable("channelId") UUID channelId,
            Date since) {
        System.out.println("Chat Update Request");
        List<Message> messages = messageRepo.getLatestChatMessages(since, channelId);
        return new ChatUpdateResponse(channelId, messages);
    }

    @MessageExceptionHandler
    @SendToUser("/chatUpdateResponse")
    public ChatUpdateError connectToChat(Throwable exception) {
        logger.error("Message Exception Handler", exception);
        return new ChatUpdateError(exception.getMessage());
    }

    @MessageMapping("/chat/{channelId}")
    public void chatMessage(Principal principal,
            @DestinationVariable("channelId") Long channelId, Message message) {
        try {
            logger.info("Session principal name: " + principal.getName());

            // check permissions
            var user = userDetailsService.loadUserByUsername(principal.getName()).getUser();
            if (!serverServ.canUserSendMessageInChannel(user, channelId))
                throw new RuntimeException("User cannot message in unjoined server");
            // Sending the message to kafka topic queue
            Message savedMessage = messageRepo
                    .save(new Message(Uuids.timeBased(), channelId, user.getId(), message.getMessage()));
            System.out.println("Saved message: " + savedMessage);
            kafkaTemplate
                    .send(KafkaConstants.KAFKA_TOPIC_BASE + "." + channelId.toString(), savedMessage)
                    .get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException(e);
        }
    }

    @KafkaListener(topicPattern = KafkaConstants.KAFKA_TOPIC_BASE + "[.].*", groupId = KafkaConstants.GROUP_ID)
    public void listen(Message message, @Header(KafkaHeaders.RECEIVED_TOPIC) String topic) {
        System.out.println(topic + ": prepend with topic. and send via kafka listener..");
        template.convertAndSend("topic/" + topic.replace('.', '/'), message);
    }
}
