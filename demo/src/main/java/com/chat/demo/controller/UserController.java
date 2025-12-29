package com.chat.demo.controller;

import com.chat.demo.data.dto.ErrorResponse;
import com.chat.demo.data.dto.MessageDto;
import com.chat.demo.data.dto.AdvancedSearchRequest;
import com.chat.demo.data.entity.User;
import com.chat.demo.data.entity.Chatroom;
import com.chat.demo.data.service.UserService;
import com.chat.demo.data.service.ChatroomService;
import lombok.RequiredArgsConstructor;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final ChatroomService chatRoomService;
    @Autowired
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if(userService.userExistsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Username already exists"));
        }
        String encryptedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encryptedPassword);
        user.setRole("ROLE_USER");
        return ResponseEntity.ok(userService.saveUser(user));
    }
    
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<?> getUserByUsername(@PathVariable String username) {
        User user = userService.getUserByUsername(username);
        if (userService.userExistsByUsername(username)) {
            return ResponseEntity.ok(new MessageDto(user.getId()));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUserById(id);
        return ResponseEntity.noContent().build();
    }


    //controller per friends
    @PostMapping("/{id}/friends/{friendId}")
    public ResponseEntity<?> addFriend(@PathVariable String id, @PathVariable String friendId) {
        try {
            // Validazione base
            if (id.equals(friendId)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("You cannot add yourself as a friend"));
            }

            // Verifica che entrambi gli utenti esistano
            Optional<User> userOpt = userService.getUserById(id);
            Optional<User> friendOpt = userService.getUserById(friendId);
            
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found: " + id));
            }
            
            if (friendOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Friend not found: " + friendId));
            }

            User user = userOpt.get();
            User friend = friendOpt.get();

            // Verifica se sono già amici
            if (userService.areFriends(id, friendId)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Users are already friends"));
            }

            // Aggiungi l'amicizia
            boolean success = userService.addFriend(user, friend);
            
            if (!success) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new ErrorResponse("Failed to add friend"));
            }

            // Crea la chat room
            try {
                Chatroom chatRoom = new Chatroom();
                chatRoom.setName("Chat between " + user.getUsername() + " and " + friend.getUsername());
                chatRoom.setDescription("Private chat room for " + user.getUsername() + " and " + friend.getUsername());
                chatRoom.setParticipantIds(Set.of(user.getId(), friend.getId()));
                chatRoomService.createRoom(chatRoom);
            } catch (Exception e) {
                // Log l'errore ma non fallire l'operazione di amicizia
                System.err.println("Failed to create chat room: " + e.getMessage());
            }

            return ResponseEntity.ok(new MessageDto("Friend added successfully"));
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/user/{id}/friends")
    public ResponseEntity<?> getUserFriends(@PathVariable String id) {
        try {
            Optional<User> userOpt = userService.getUserById(id);
            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("User not found: " + id));
            }

            var friends = userService.getUserFriends(id);
            return ResponseEntity.ok(friends);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to retrieve friends"));
        }
    }
    
    @DeleteMapping("/user/{id}/friends/{friendId}")
    public ResponseEntity<?> removeFriend(@PathVariable String id, @PathVariable String friendId) {
        try {
            if (id.equals(friendId)) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Invalid operation"));
            }

            boolean success = userService.removeFriend(id, friendId);
            
            if (success) {
                return ResponseEntity.ok(new MessageDto("Friend removed successfully"));
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(new ErrorResponse("Friendship not found"));
            }
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to remove friend"));
        }
    }


    //search user by username
    @PostMapping("/search/")
    public ResponseEntity<?> advancedSearchUsers(@RequestBody AdvancedSearchRequest request) {
        try {
            // Validazione input
            if (request.getSearchTerm() == null || request.getSearchTerm().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("Search term cannot be empty"));
            }

            String searchTerm = request.getSearchTerm().trim();
            String currentUserId = request.getCurrentUserId();
            
            // Esegui la ricerca
            List<User> searchResults = userService.searchUsers(searchTerm,currentUserId, true, request.getLimit());
             
            // Limita i risultati se specificato
            if (request.getLimit() != null && request.getLimit() > 0) {
                searchResults = searchResults.stream()
                        .limit(request.getLimit())
                        .collect(java.util.stream.Collectors.toList());
            }
            
            return ResponseEntity.ok(searchResults);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Failed to search users: " + e.getMessage()));
        }
    }

}