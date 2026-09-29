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
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        User user = userService.getUser(id);
        return ResponseEntity.ok(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(
            @PathVariable Long id,
            @RequestParam String email,
            @RequestParam(required = false) String currencyCode
    ) {
        User updatedUser = userService.updateUser(id, email, currencyCode);
        return ResponseEntity.ok(updatedUser);
    }

    @PostMapping("/new")
    public ResponseEntity<User> createUser(
            @RequestParam String email,
            @RequestParam String password
    ){
        User createUser = userService.createUser(email, password);
        return ResponseEntity.ok(createUser);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}