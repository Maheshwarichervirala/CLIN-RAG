package com.capstone.ragclinical.controller;

import com.capstone.ragclinical.dto.AuthDtos.*;
import com.capstone.ragclinical.model.User;
import com.capstone.ragclinical.security.JwtUtil;
import com.capstone.ragclinical.service.UserService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest req) {
        User user = userService.register(req.name, req.email, req.password);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest req) {
        User user = userService.login(req.email, req.password);
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole());
        return new AuthResponse(token, user.getName(), user.getEmail(), user.getRole());
    }
}
