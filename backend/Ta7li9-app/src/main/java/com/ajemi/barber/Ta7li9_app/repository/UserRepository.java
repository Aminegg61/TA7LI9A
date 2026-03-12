package com.ajemi.barber.Ta7li9_app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ajemi.barber.Ta7li9_app.entity.User;

public interface UserRepository extends JpaRepository<User, Long>{
    Optional<User> findByEmail(String email);
    Boolean existsByEmail(String email);
    Optional<User> findByPhoneNumber(String phoneNumber);

    //search barber-----------------------------------------------------------------------------------
    @Query("SELECT u FROM User u WHERE u.role = 'ROLE_COIFFEUR' AND (" +
           // 1. Check Full Name (First + Last)
           "LOWER(CONCAT(u.firstName, ' ', u.lastName)) LIKE LOWER(CONCAT('%', :query, '%')) OR " +

           // 3. Check Phone Number (Exact match or starts with)
           "u.phoneNumber LIKE CONCAT('%', :query, '%'))")
    List<User> searchBarbers(@Param("query") String query);
    
}
