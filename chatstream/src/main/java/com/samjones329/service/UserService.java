package com.samjones329.service;

import java.io.UnsupportedEncodingException;
import java.util.Date;
import java.util.Random;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.samjones329.constants.DomainConstants;
import com.samjones329.model.User;
import com.samjones329.repository.UserRepo;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

public class UserService {
    @Autowired
    private UserRepo repo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender mailSender;

    public User register(String email, String username, String password)
            throws UnsupportedEncodingException, MessagingException {
        String randomCode = new Random().ints(97, 123).limit(64)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append).toString();
        var user = new User(null, username, email, passwordEncoder.encode(password), false, new Date(), randomCode,
                Set.of(), Set.of());
        repo.save(user);

        sendVerificationEmail(user);

        return user;
    }

    private void sendVerificationEmail(User user)
            throws MessagingException, UnsupportedEncodingException {
        String toAddress = user.getEmail();
        String fromAddress = "Your email address";
        String senderName = "Your company name";
        String subject = "Please verify your registration";
        String content = "Dear [[name]],<br>"
                + "Please click the link below to verify your registration:<br>"
                + "<h3><a href=\"[[URL]]\" target=\"_self\">VERIFY</a></h3>"
                + "Thank you,<br>"
                + "Your company name.";

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message);

        helper.setFrom(fromAddress, senderName);
        helper.setTo(toAddress);
        helper.setSubject(subject);

        content = content.replace("[[name]]", user.getUsername());
        String verifyURL = DomainConstants.FRONTEND + "/verify?user=" + user.getUsername() + "&code="
                + user.getVerificationCode();

        content = content.replace("[[URL]]", verifyURL);

        helper.setText(content, true);

        mailSender.send(message);
    }

    public User verify(Long id, String code) {
        var userOpt = repo.findById(id);
        if (userOpt.isEmpty()) {
            return null;
        }

        var user = userOpt.get();
        if (!user.isEnabled() && user.getVerificationCode() == code) {
            user.setVerificationCode(null);
            user.setEnabled(true);
            repo.save(user);
        }

        return user;
    }
}
