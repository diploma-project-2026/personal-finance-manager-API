package com.example.personal_finance_manager.repository;

import com.example.personal_finance_manager.entity.Receipt;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReceiptRepository extends JpaRepository<Receipt, Long> {}
