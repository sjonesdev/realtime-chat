package com.samjones329.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.samjones329.model.ChatUserDetails;
import com.samjones329.repository.UserRepository;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepository userRepo;

    @Override
    public ChatUserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepo.findByEmail(username);
        if (user.isEmpty())
            throw new UsernameNotFoundException("No user with email " + username);
        return new ChatUserDetails(user.get());
    }

    public ChatUserDetails getDetailsFromContext(SecurityContext context) {
        return (ChatUserDetails) context.getAuthentication().getPrincipal();
    }

}
