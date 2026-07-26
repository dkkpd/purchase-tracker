package com.purchasetracker.backend.service;

import com.purchasetracker.backend.dto.MeResponse;
import com.purchasetracker.backend.entity.User;
import com.purchasetracker.backend.repository.UserRepository;
import com.purchasetracker.backend.security.CurrentUserProvider;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    
    private final CurrentUserProvider currentUserProvider;
    private final UserRepository userRepository;

    public UserService(
        CurrentUserProvider currentUserProvider,
        UserRepository userRepository
    ) {
        this.currentUserProvider = currentUserProvider;
        this.userRepository = userRepository;
    }

    public MeResponse getMe() {
        Long currentUserId = currentUserProvider.getCurrentUserId();
        User user = userRepository.findById(currentUserId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));

        return new MeResponse(user.getId(), user.getName(), user.getEmail());

    }

}
