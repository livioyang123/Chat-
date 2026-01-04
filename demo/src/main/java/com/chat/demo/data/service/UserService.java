package com.chat.demo.data.service;
import com.chat.demo.data.entity.User;
import com.chat.demo.data.repo.UserRepo;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

import org.springframework.security.core.userdetails.User.UserBuilder;

@Service
@RequiredArgsConstructor
public class UserService implements UserDetailsService {

    private final UserRepo userRepository;
    private final RedisCacheService redisCacheService; // ✨ NUOVO

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Cacheable(value = "users", key = "#id")
    public Optional<User> getUserById(String id) {
        return redisCacheService.getUserFromCache(id).isPresent() ?
               redisCacheService.getUserFromCache(id) :
               userRepository.findById(id);
    }

    @Cacheable(value = "users", key = "#username")
    public User getUserByUsername(String username) {
        User user = userRepository.findByUsername(username);
        if (user != null) {
            redisCacheService.cacheUser(user.getId(), user);
        }
        return user;
    }

    @CacheEvict(value = "users", key = "#id")
    public void deleteUserById(String id) {
        userRepository.deleteById(id);
        redisCacheService.invalidateUserCache(id);
    }

    @CachePut(value = "users", key = "#user.id")
    public User saveUser(User user) {
        User savedUser = userRepository.save(user);
        redisCacheService.cacheUser(savedUser.getId(), savedUser);
        return userRepository.save(savedUser);
    }

    public boolean userExistsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException("Utente non trovato: " + username);
        }
        UserBuilder builder = org.springframework.security.core.userdetails.User.withUsername(user.getUsername())
                .password(user.getPassword())  // deve essere criptata
                .authorities(user.getRole());   // es. "ROLE_USER"
        return builder.build();
    }
    // Aggiungi un amico
    public boolean addFriend(User user, User friend) {
        try {
            // Carica l'utente corrente e aggiungi l'amico
            Optional<User> userOpt = userRepository.findById(user.getId());
            if (userOpt.isPresent()) {
                User currentUser = userOpt.get();
                Set<String> friends = currentUser.getFriends();
                if (friends == null) {
                    friends = new HashSet<>();
                    currentUser.setFriends(friends);
                }
                friends.add(friend.getId());
                userRepository.save(currentUser); // Salva l'oggetto corretto
            }

            // Carica l'amico e aggiungi l'utente corrente
            Optional<User> friendOpt = userRepository.findById(friend.getId());
            if (friendOpt.isPresent()) {
                User currentFriend = friendOpt.get();
                Set<String> friendsFriends = currentFriend.getFriends();
                if (friendsFriends == null) {
                    friendsFriends = new HashSet<>();
                    currentFriend.setFriends(friendsFriends);
                }
                friendsFriends.add(user.getId());
                userRepository.save(currentFriend); // Salva l'oggetto corretto
            }

            return true;
        } catch (Exception e) {
            System.err.println("Error adding friend: " + e.getMessage());
            return false;
        }
    }

    public boolean removeFriend(String userId, String friendId) {
        try {
            // Rimuovi l'amicizia dall'utente
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                if (user.getFriends() != null) {
                    user.getFriends().remove(friendId);
                    userRepository.save(user);
                }
            }

            // Rimuovi l'amicizia dall'amico
            Optional<User> friendOpt = userRepository.findById(friendId);
            if (friendOpt.isPresent()) {
                User friend = friendOpt.get();
                if (friend.getFriends() != null) {
                    friend.getFriends().remove(userId);
                    userRepository.save(friend);
                }
            }

            return true;
        } catch (Exception e) {
            System.err.println("Error removing friend: " + e.getMessage());
            return false;
        }
    }

    public boolean areFriends(String userId, String friendId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            return user.getFriends() != null && user.getFriends().contains(friendId);
        }
        return false;
    }
    
    @Cacheable(value = "users", key = "'friends_' + #userId")
    public List<User> getUserFriends(String userId) {
        Optional<User> userOpt = userRepository.findById(userId);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (user.getFriends() != null && !user.getFriends().isEmpty()) {
                return userRepository.findAllById(user.getFriends());
            }
        }
        return new ArrayList<>();
    }

    
public List<User> searchUsers(String searchTerm, String currentUserId, boolean excludeFriends, Integer limit) {
    // Validazione input
    if (searchTerm == null || searchTerm.trim().isEmpty()) {
        System.err.println("Search term is empty or null");
        return new ArrayList<>();
    }
    
    System.out.println("=== SEARCH USERS DEBUG ===");
    System.out.println("Original searchTerm: '" + searchTerm + "'");
    
    // RIMUOVI Pattern.quote() - è questo il problema!
    String cleanSearchTerm = searchTerm.trim();
    System.out.println("Clean searchTerm: '" + cleanSearchTerm + "'");
    
    // Cerca gli utenti - la query nel repository già gestisce case-insensitive
    List<User> users = userRepository.findByUsernameContainingIgnoreCase(cleanSearchTerm);
    System.out.println("Users found by repository: " + users.size());
    users.forEach(user -> System.out.println("  - " + user.getUsername()));
    
    // Rimuovi l'utente corrente se specificato
    if (currentUserId != null && !currentUserId.trim().isEmpty()) {
        int beforeSize = users.size();
        users.removeIf(user -> user.getId().equals(currentUserId));
        System.out.println("After removing current user: " + users.size() + " (removed: " + (beforeSize - users.size()) + ")");
    }
    
    // Escludi gli amici se richiesto
    if (excludeFriends && currentUserId != null && !currentUserId.trim().isEmpty()) {
        try {
            Set<String> friendIds = getUserFriends(currentUserId)
                    .stream()
                    .map(User::getId)
                    .collect(Collectors.toSet());
            
            System.out.println("Friend IDs to exclude: " + friendIds);
            int beforeSize = users.size();
            users.removeIf(user -> friendIds.contains(user.getId()));
            System.out.println("After removing friends: " + users.size() + " (removed: " + (beforeSize - users.size()) + ")");
            
        } catch (Exception e) {
            System.err.println("Error fetching friends for user " + currentUserId + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // Applica il limite se specificato
    if (limit != null && limit > 0 && users.size() > limit) {
        users = users.stream().limit(limit).collect(Collectors.toList());
        System.out.println("After applying limit " + limit + ": " + users.size());
    }
    
    System.out.println("Final results: " + users.size());
    return users;
}
}
