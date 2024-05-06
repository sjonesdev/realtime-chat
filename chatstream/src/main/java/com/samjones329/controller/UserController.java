package com.samjones329.controller;

import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import com.datastax.oss.driver.api.core.uuid.Uuids;
import com.samjones329.model.User;
import com.samjones329.repository.UserRepository;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(originPatterns = "*")
@RestController
public class UserController {

    public record RegisterRequest(String username, String email, String password) {
    }

    @Autowired
    UserRepository userRepo;

    @Autowired
    PasswordEncoder passwordEncoder;

    @Autowired
    AuthenticationManager authenticationManager;

    Logger logger = LoggerFactory.getLogger(UserController.class);

    @PostMapping("/register")
    public ResponseEntity<UserResponse> register(@RequestBody RegisterRequest userRequest) {
        try {
            var existingUser = userRepo.findByEmail(userRequest.email());
            if (existingUser.isPresent())
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            // BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
            String encodedPassword = passwordEncoder.encode(userRequest.password);
            User user = new User(Uuids.timeBased(), userRequest.username, userRequest.email, encodedPassword);
            User savedUser = userRepo.save(user);
            return new ResponseEntity<>(
                    new UserResponse(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail()), HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Autowired
    SecurityContextRepository securityContextRepository;

    @PostMapping("/login")
    public ResponseEntity<HttpStatusCode> login(@CurrentSecurityContext SecurityContext securityContext,
            @RequestBody LoginRequest loginRequest) {
        try {
            // check user credentials
            Authentication authenticationRequest = UsernamePasswordAuthenticationToken
                    .unauthenticated(loginRequest.username(), loginRequest.password());
            Authentication authenticationResponse = this.authenticationManager.authenticate(authenticationRequest);

            // accessor to HttpServletRequest and HttpServletResponse
            ServletRequestAttributes reqAttr = ((ServletRequestAttributes) RequestContextHolder.getRequestAttributes());

            // replace authentication
            securityContext.setAuthentication(authenticationResponse);

            // new security context for thread
            SecurityContextHolder.setContext(securityContext);

            // persist authentication
            securityContextRepository.saveContext(securityContext, reqAttr.getRequest(), reqAttr.getResponse());

            return new ResponseEntity<>(HttpStatus.OK);
        } catch (Exception e) {
            logger.error(e.getMessage(), e);
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    public record LoginRequest(String username, String password) {
    }

    public record UserResponse(UUID id, String username, String email) {
    }

    @GetMapping("/authentication")
    public ResponseEntity<Object> getAuthentication(
            @CurrentSecurityContext(expression = "authentication") Authentication authentication) {
        logger.info("Authenticated: " + authentication.isAuthenticated() + "; Details: " + authentication.getDetails());
        return new ResponseEntity<>(authentication.getDetails(), HttpStatus.OK);
    }

}
