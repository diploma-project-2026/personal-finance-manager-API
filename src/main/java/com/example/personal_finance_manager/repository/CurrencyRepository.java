package com.example.personal_finance_manager.repository;

import com.example.personal_finance_manager.entity.Currency;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CurrencyRepository extends JpaRepository<Currency, String> {}
