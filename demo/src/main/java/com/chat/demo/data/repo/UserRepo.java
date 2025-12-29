package com.chat.demo.data.repo;

import com.chat.demo.data.entity.User;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;


public interface UserRepo extends MongoRepository<User, String> {
    User findByUsername(String username);
    User findByEmail(String email);
    boolean existsByUsername(String username);

    @Query("{ 'username': { $regex: ?0, $options: 'i' } }")
    List<User> searchByUsernameRegex(String regex);

    List<User> findByUsernameContainingIgnoreCase(String username);
}