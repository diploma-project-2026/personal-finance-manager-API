package com.example.personal_finance_manager.controller.api;

import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUser(@PathVariable Long id) {
        User user = userService.getUser(id);

        UserResponse response = new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getDefaultCurrency().getCode()
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request
    ) {
        User updatedUser = userService.updateUser(
                id,
                request.email(),
                request.currencyCode()
        );

        UserResponse response = new UserResponse(
                updatedUser.getId(),
                updatedUser.getEmail(),
                updatedUser.getDefaultCurrency().getCode()
        );

        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    public record UpdateUserRequest(
            String email,
            String currencyCode
    ) {}

    public record UserResponse(
            Long id,
            String email,
            String currencyCode
    ) {}
}