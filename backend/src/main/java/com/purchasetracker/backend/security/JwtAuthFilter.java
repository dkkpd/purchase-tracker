package com.purchasetracker.backend.security;

import io.micrometer.core.instrument.binder.system.FileDescriptorMetrics;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtAuthFilter(JwtService jwtService, FileDescriptorMetrics fileDescriptorMetrics) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws IOException, ServletException {
        String authToken = request.getHeader("Authorization");
        if (authToken == null || !( authToken.startsWith("Bearer ")) ) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = authToken.substring(7);

        if (jwtService.isTokenValid(token)) {
            Long userId = jwtService.extractUserId(token);
            UsernamePasswordAuthenticationToken authenticationToken = new UsernamePasswordAuthenticationToken(userId, null, Collections.emptyList()); //used null for credentials as we're already proved identity from the userId which was derived from the token. Empty set for roles as the project has no roles currently

            SecurityContextHolder.getContext().setAuthentication(authenticationToken);
        }

        filterChain.doFilter(request, response);


    }

}
