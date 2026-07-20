package com.purchasetracker.backend.repository;

import com.purchasetracker.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

// Inherits JpaRepository<User, Long> class to get access to a full set of working CRUD methods:
// save(), findById(), findAll(), deleteById()
// User is the entity type and Long is the primary key type
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email); //use Optional<User> instead of just User because the user might not exist at all, which may result in a NullPointerException error.
    boolean existsByEmail(String email);

}
