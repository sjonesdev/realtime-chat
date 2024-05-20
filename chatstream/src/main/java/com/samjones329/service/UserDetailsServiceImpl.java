package com.samjones329.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.samjones329.model.UserDetailsImpl;
import com.samjones329.repository.UserRepo;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    @Autowired
    private UserRepo userRepo;

    @Override
    public UserDetailsImpl loadUserByUsername(String username) throws UsernameNotFoundException {
        var user = userRepo.findByEmail(username);
        if (user.isEmpty())
            throw new UsernameNotFoundException("No user with email " + username);
        return new UserDetailsImpl(user.get());
    }

    public UserDetailsImpl getDetailsFromContext(SecurityContext context) {
        return (UserDetailsImpl) context.getAuthentication().getPrincipal();
    }

}
