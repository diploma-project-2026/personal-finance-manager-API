
package com.example.personal_finance_manager.repository;

import com.example.personal_finance_manager.entity.Transaction;
import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TransactionRepository
        extends JpaRepository<Transaction, Long> {

  List<Transaction> findByUserIdOrderByTransactionDateDesc(
          Long userId
  );

  List<Transaction> findTop5ByUserIdOrderByTransactionDateDesc(
          Long userId
  );

  List<Transaction>
  findByUserIdAndTransactionDateOrderByTransactionDateDesc(
          Long userId,
          LocalDate date
  );

  List<Transaction>
  findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
          Long userId,
          LocalDate from,
          LocalDate to
  );
}
