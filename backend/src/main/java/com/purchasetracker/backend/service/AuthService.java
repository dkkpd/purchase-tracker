package com.purchasetracker.backend.service;


import com.purchasetracker.backend.dto.RegisterRequest;
import com.purchasetracker.backend.dto.RegisterResponse;
import com.purchasetracker.backend.entity.User;
import com.purchasetracker.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;

    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.existsByEmail(request.email() ) ) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.name());
        user.setEmail(request.email());
        user.setPasswordHash(passwordEncoder.encode(request.password()));

        User savedUser = userRepository.save(user);

        return new RegisterResponse(savedUser.getId(), savedUser.getName(), savedUser.getEmail());

    }

}
