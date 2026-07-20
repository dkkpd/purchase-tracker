package com.purchasetracker.backend.config;

import org.springframework.context.annotation.*;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
    
    // TEMPERORY: opens EVERY endpoint. replace with real JWT-based rules once login exists
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable()); // The client sends a token header on every request, not a cookie; CSRF protection is not needed
        http.authorizeHttpRequests(auth -> auth.anyRequest().permitAll()); // TEMPERORY

        return http.build();

    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
