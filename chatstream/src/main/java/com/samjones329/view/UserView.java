package com.samjones329.view;

import java.util.Date;

import com.samjones329.model.User;

import lombok.Getter;

@Getter
public class UserView {
    private Long id;
    private String username;
    private Date createdAt;

    public UserView(User user) {
        id = user.getId();
        username = user.getUsername();
        createdAt = user.getCreatedAt();
    }
}
