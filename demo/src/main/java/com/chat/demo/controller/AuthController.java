package com.chat.demo.controller;

import org.springframework.security.core.Authentication;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;

import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.chat.demo.Util.JwtUtil;
import com.chat.demo.data.dto.LoginMessage;

import com.chat.demo.data.dto.LoginResponse;
import com.chat.demo.data.dto.ErrorResponse;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;


import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;


    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;

    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginMessage loginRequest, HttpServletResponse response) {
        try {
            // Autentica l'utente
                Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                        loginRequest.getUsername(), 
                        loginRequest.getPassword()
                    )
                );
                // Genera il JWT
                UserDetails userDetails = (UserDetails) authentication.getPrincipal();
                String jwt = jwtUtil.generateToken(userDetails.getUsername(), 
                                                userDetails.getAuthorities().stream()
                                                            .map(GrantedAuthority::getAuthority)
                                                            .collect(Collectors.toList()));
                // Crea il cookie HttpOnly
                Cookie jwtCookie = new Cookie("jwt-token", jwt);
                jwtCookie.setHttpOnly(true);           
                jwtCookie.setSecure(false);            // false per sviluppo HTTP
                jwtCookie.setPath("/");                
                jwtCookie.setMaxAge(24 * 60 * 60);     // 24 ore
                
                // IMPORTANTE: Per il testing, non impostare SameSite in sviluppo
                // jwtCookie.setSameSite(Cookie.SameSite.LAX.attributeValue());

                // Aggiungi il cookie alla risposta
                response.addCookie(jwtCookie);
                
                // Per debug, aggiungi anche il cookie nell'header (temporaneo)
                response.setHeader("Set-Cookie", "jwt-token=" + jwt + "; Path=/; HttpOnly; Max-Age=" + (24 * 60 * 60));
                
                return ResponseEntity.ok(new LoginResponse("Login effettuato con successo",userDetails.getUsername()));
            
        } catch (BadCredentialsException e) {

            return ResponseEntity.status(401).body(new ErrorResponse("Credenziali non valide"));

        } catch (Exception e) {

            e.printStackTrace();
            return ResponseEntity.status(500).body(new ErrorResponse("Errore durante il login"));
        }
}

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie jwtCookie = ResponseCookie.from("jwt-token", "")
                .httpOnly(true)
                .secure(false)  // true in produzione
                .path("/")
                .maxAge(0)      // Elimina il cookie
                .sameSite("Lax")
                .build();
        
        response.addHeader("Set-Cookie", jwtCookie.toString());
        
        return ResponseEntity.ok(Map.of("message", "Logout effettuato con successo"));
    }

    //TODO: Endpoint per verificare se l'utente è autenticato
    @GetMapping("/verify")
    public ResponseEntity<?> verifyAuthentication(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated()) {
            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            return ResponseEntity.ok(Map.of("username", userDetails.getUsername(), 
                                            "roles", userDetails.getAuthorities().stream()
                                                                .map(GrantedAuthority::getAuthority)
                                                                .collect(Collectors.toList())));
        } else {
            return ResponseEntity.status(401).body(new ErrorResponse("Utente non autenticato"));
        }
    }
}