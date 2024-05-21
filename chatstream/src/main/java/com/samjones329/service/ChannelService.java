package com.samjones329.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.samjones329.model.User;
import com.samjones329.repository.ChannelRepo;

import jakarta.transaction.Transactional;

@Service
public class ChannelService {
    @Autowired
    ChannelRepo channelRepo;

    @Transactional
    public boolean canUserSendMessageInChannel(User user, Long channelId) {
        var channel = channelRepo.findById(channelId);
        if (channel.isEmpty())
            return false;
        return channel.get().getServer().getMembers().contains(user);
    }
}
