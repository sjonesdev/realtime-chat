package com.samjones329.view;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.samjones329.model.Server;

import lombok.Getter;

@Getter
public class ServerView {
    private Long id;
    private String name;
    private String desc;
    private Date createdAt;
    private Long ownerId;
    private Long defaultChannelId;
    private List<ChannelView> channels;
    private List<UserView> members;

    public ServerView(Server server) {
        id = server.getId();
        name = server.getName();
        desc = server.getDesc();
        createdAt = server.getCreatedAt();
        ownerId = server.getOwner().getId();
        var defaultChannel = server.getDefaultChannel();
        if (defaultChannel != null) {
            defaultChannelId = defaultChannel.getId();
        }

        var channelSet = server.getChannels();
        channels = new ArrayList<>(channelSet.size());
        for (var ch : channelSet) {
            channels.add(new ChannelView(ch));
        }

        var memberSet = server.getMembers();
        members = new ArrayList<>(memberSet.size());
        for (var member : memberSet) {
            members.add(new UserView(member));
        }
    }
}
