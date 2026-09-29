package com.example.personal_finance_manager.exception;

public class UserAlreadyExistsException extends RuntimeException {

    public UserAlreadyExistsException() {
        super("User already exists with this email");
    }
}