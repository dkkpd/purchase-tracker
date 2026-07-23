package com.purchasetracker.backend.service;


import com.purchasetracker.backend.dto.LoginRequest;
import com.purchasetracker.backend.dto.LoginResponse;
import com.purchasetracker.backend.dto.RegisterRequest;
import com.purchasetracker.backend.dto.RegisterResponse;
import com.purchasetracker.backend.entity.User;
import com.purchasetracker.backend.repository.UserRepository;
import com.purchasetracker.backend.security.JwtService;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;

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

    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password")); // user not found

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password"); // invalid password
        }

        String token = jwtService.generateToken(user.getId(), user.getEmail());

        return new LoginResponse(token, user.getId(), user.getName());
    }

}
