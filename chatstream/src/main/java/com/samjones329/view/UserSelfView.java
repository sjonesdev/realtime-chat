package com.samjones329.view;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import com.samjones329.model.User;

import lombok.Getter;

@Getter
public class UserSelfView {
    private Long id;
    private String username;
    private Date createdAt;
    private List<ServerView> joinedServers;
    private List<Long> ownedServerIds;

    public UserSelfView(User user) {
        id = user.getId();
        username = user.getUsername();
        createdAt = user.getCreatedAt();

        var joinedServersSet = user.getJoinedServers();
        joinedServers = new ArrayList<>(joinedServersSet.size());
        for (var server : joinedServersSet) {
            joinedServers.add(new ServerView(server));
        }

        var ownedServersSet = user.getOwnedServers();
        ownedServerIds = new ArrayList<>(ownedServersSet.size());
        for (var server : ownedServersSet) {
            ownedServerIds.add(server.getId());
        }
    }
}
