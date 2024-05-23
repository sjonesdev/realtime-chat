package com.samjones329.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.samjones329.model.User;
import com.samjones329.repository.UserRepo;
import com.samjones329.service.UserDetailsServiceImpl;
import com.samjones329.view.UserSelfView;
import com.samjones329.view.UserView;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
public class UserController {

    public record RegisterRequest(String username, String email, String password) {
    }

    @Autowired
    UserRepo userRepo;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserDetailsServiceImpl userDetailsService;

    @Autowired
    SecurityContextRepository securityContextRepository;

    Logger logger = LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public ResponseEntity<UserSelfView> register(@RequestBody RegisterRequest req) {
        try {
            var existingEmail = userRepo.findByEmail(req.email());
            if (existingEmail.isPresent())
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            var existingUsername = userRepo.findByUsername(req.username());
            if (existingUsername.isPresent())
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            String encodedPassword = passwordEncoder.encode(req.password);
            var user = new User(null, req.username(), req.email(), encodedPassword, false, new Date(), Set.of(),
                    Set.of());
            user = userRepo.save(user);

            var owned = new ArrayList<Long>();
            for (var server : user.getOwnedServers()) {
                owned.add(server.getId());
            }
            return new ResponseEntity<>(
                    new UserSelfView(user),
                    HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<UserSelfView> login(@CurrentSecurityContext SecurityContext securityContext,
            @RequestBody LoginRequest req) {
        try {
            // check user credentials
            Authentication authenticationRequest = UsernamePasswordAuthenticationToken
                    .unauthenticated(req.email(), req.password());
            Authentication authenticationResponse = this.authenticationManager.authenticate(authenticationRequest);

            // accessor to HttpServletRequest and HttpServletResponse
            ServletRequestAttributes reqAttr = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes());

            // replace authentication
            securityContext.setAuthentication(authenticationResponse);

            // new security context for thread (I don't think this is necessary?)
            SecurityContextHolder.setContext(securityContext);

            // persist authentication
            securityContextRepository.saveContext(securityContext, reqAttr.getRequest(), reqAttr.getResponse());

            // return user info
            var user = userRepo.findByEmail(req.email()).get();
            var owned = new ArrayList<Long>();
            for (var server : user.getOwnedServers()) {
                owned.add(server.getId());
            }
            return new ResponseEntity<>(
                    new UserSelfView(user),
                    HttpStatus.OK);
        } catch (Exception e) {
            if (e instanceof BadCredentialsException) {
                return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
            }
            logger.error(e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record LoginRequest(String email, String password) {
    }

    @PostMapping("/logout")
    public ResponseEntity<HttpStatus> logout(@CurrentSecurityContext SecurityContext securityContext) {
        try {
            ServletRequestAttributes reqAttr = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes());
            securityContext.setAuthentication(null);
            securityContextRepository.saveContext(securityContext, reqAttr.getRequest(), reqAttr.getResponse());
            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error logging out", e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/authentication")
    public ResponseEntity<UserSelfView> getAuthentication(
            @CurrentSecurityContext SecurityContext context) {
        var user = userDetailsService.getUserFromContext(context);

        return new ResponseEntity<>(
                new UserSelfView(user),
                HttpStatus.OK);
    }

    @GetMapping("/user/{id}")
    public ResponseEntity<UserView> getUser(@PathVariable("id") Long id) {
        try {
            var user = userRepo.findById(id);
            if (user.isEmpty()) {
                return new ResponseEntity<>(HttpStatus.NO_CONTENT);
            }
            return new ResponseEntity<>(new UserView(user.get()), HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error getting user id=" + id, e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserView>> getUsers(@RequestParam List<Long> ids) {
        try {
            var users = userRepo.findAllById(ids);
            var userResponses = new ArrayList<UserView>();
            for (var user : users) {
                userResponses.add(new UserView(user));
            }
            return new ResponseEntity<>(userResponses, HttpStatus.OK);
        } catch (Exception e) {
            logger.error("Error fetching users with ids=" + ids);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
