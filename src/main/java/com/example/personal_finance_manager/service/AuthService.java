package com.example.personal_finance_manager.service;


import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.exception.InvalidCredentialsException;
import com.example.personal_finance_manager.exception.UserNotFoundException;
import com.example.personal_finance_manager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;

    @Transactional
    public void register(String email, String password) {

        String passwordHash = passwordEncoder.encode(password);

        userService.createUser(email, passwordHash);
    }

    @Transactional(readOnly = true)
    public User login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(UserNotFoundException::new);

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        return user;
    }
}