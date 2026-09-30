package com.example.personal_finance_manager.controller.api;

import com.example.personal_finance_manager.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<Void> register(
            @RequestBody RegisterRequest request
    ) {
        authService.register(
                request.email(),
                request.password()
        );

        return ResponseEntity.ok().build();
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request
    ) {
        authService.login(
                request.email(),
                request.password()
        );

        LoginResponse response = new LoginResponse(
                "Login successful"
        );

        return ResponseEntity.ok(response);
    }

    public record RegisterRequest(
            String email,
            String password
    ) {}

    public record LoginRequest(
            String email,
            String password
    ) {}

    public record LoginResponse(
            String message
    ) {}
}