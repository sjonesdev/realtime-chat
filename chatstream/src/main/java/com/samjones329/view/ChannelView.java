package com.samjones329.view;

import java.util.Date;

import com.samjones329.model.Channel;

import lombok.Getter;

@Getter
public class ChannelView {
    private Long id;
    private String name;
    private Date createdAt;

    public ChannelView(Channel channel) {
        this.id = channel.getId();
        this.name = channel.getName();
        this.createdAt = channel.getCreatedAt();
    }
}
