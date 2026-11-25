
package com.example.personal_finance_manager.service;

import com.example.personal_finance_manager.entity.Currency;
import com.example.personal_finance_manager.entity.Transaction;
import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.repository.CurrencyRepository;
import com.example.personal_finance_manager.repository.TransactionRepository;
import com.example.personal_finance_manager.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class TransactionService {

  private final TransactionRepository transactionRepository;
  private final UserRepository userRepository;
  private final CurrencyRepository currencyRepository;

  // CREATE
  @Transactional
  public Transaction create(
          Long userId,
          BigDecimal amount,
          String currencyCode,
          LocalDate transactionDate,
          String description) {

    validateTransaction(amount, transactionDate);

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "User not found"));

    Currency currency = findCurrency(currencyCode);

    Transaction transaction = Transaction.builder()
            .user(user)
            .amount(amount)
            .currency(currency)
            .transactionDate(transactionDate)
            .description(description)
            .build();

    return transactionRepository.save(transaction);
  }

  // GET ALL TRANSACTIONS
  @Transactional(readOnly = true)
  public List<Transaction> getHistory(Long userId) {
    return transactionRepository
            .findByUserIdOrderByTransactionDateDesc(userId);
  }

  // GET ONE TRANSACTION
  @Transactional(readOnly = true)
  public Transaction getById(Long userId, Long transactionId) {
    return findUserTransaction(userId, transactionId);
  }

  // GET 5 MOST RECENT TRANSACTIONS
  @Transactional(readOnly = true)
  public List<Transaction> getRecent(Long userId) {
    return transactionRepository
            .findTop5ByUserIdOrderByTransactionDateDesc(userId);
  }

  // GET TRANSACTIONS BY SPECIFIC DATE
  @Transactional(readOnly = true)
  public List<Transaction> getByDate(Long userId, LocalDate date) {

    if (date == null) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Date is required");
    }

    return transactionRepository
            .findByUserIdAndTransactionDateOrderByTransactionDateDesc(
                    userId, date);
  }

  // GET TRANSACTIONS BY DATE RANGE
  @Transactional(readOnly = true)
  public List<Transaction> getByDateRange(
          Long userId,
          LocalDate from,
          LocalDate to) {

    if (from == null || to == null || from.isAfter(to)) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Invalid date range");
    }

    return transactionRepository
            .findByUserIdAndTransactionDateBetweenOrderByTransactionDateDesc(
                    userId, from, to);
  }

  // UPDATE TRANSACTION
  @Transactional
  public Transaction update(
          Long transactionId,
          Long userId,
          BigDecimal amount,
          String currencyCode,
          LocalDate transactionDate,
          String description) {

    Transaction transaction = findUserTransaction(userId, transactionId);

    validateTransaction(amount, transactionDate);

    Currency currency = findCurrency(currencyCode);

    transaction.setAmount(amount);
    transaction.setCurrency(currency);
    transaction.setTransactionDate(transactionDate);
    transaction.setDescription(description);

    return transactionRepository.save(transaction);
  }

  // DELETE TRANSACTION
  @Transactional
  public void delete(Long transactionId, Long userId) {
    Transaction transaction = findUserTransaction(userId, transactionId);
    transactionRepository.delete(transaction);
  }

  // FIND TRANSACTION BELONGING TO USER
  private Transaction findUserTransaction(
          Long userId,
          Long transactionId) {

    Transaction transaction = transactionRepository.findById(transactionId)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Transaction not found"));

    if (userId == null ||
            !transaction.getUser().getId().equals(userId)) {
      throw new ResponseStatusException(
              HttpStatus.NOT_FOUND, "Transaction not found");
    }

    return transaction;
  }

  // FIND CURRENCY
  private Currency findCurrency(String currencyCode) {

    if (currencyCode == null || currencyCode.isBlank()) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Currency code is required");
    }

    return currencyRepository.findById(currencyCode)
            .orElseThrow(() -> new ResponseStatusException(
                    HttpStatus.NOT_FOUND, "Currency not found"));
  }

  // VALIDATE TRANSACTION DATA
  private void validateTransaction(
          BigDecimal amount,
          LocalDate transactionDate) {

    if (amount == null || amount.signum() <= 0) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Amount must be positive");
    }

    if (transactionDate == null) {
      throw new ResponseStatusException(
              HttpStatus.BAD_REQUEST, "Transaction date is required");
    }
  }
}
