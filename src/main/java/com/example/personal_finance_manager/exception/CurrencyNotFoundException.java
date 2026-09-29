package com.example.personal_finance_manager.exception;

public class CurrencyNotFoundException extends RuntimeException {

    public CurrencyNotFoundException() {
        super("Currency not found");
    }
}