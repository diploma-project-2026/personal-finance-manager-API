
package com.example.personal_finance_manager.controller.api;

import com.example.personal_finance_manager.entity.Transaction;
import com.example.personal_finance_manager.service.TransactionService;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/{userId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

  private final TransactionService transactionService;

  public record TransactionRequest(
          BigDecimal amount,
          String currencyCode,
          LocalDate transactionDate,
          String description
  ) {}

  public record TransactionResponse(
          Long id,
          Long userId,
          BigDecimal amount,
          String currencyCode,
          LocalDate transactionDate,
          String description
  ) {}

  private TransactionResponse toResponse(Transaction transaction) {
    return new TransactionResponse(
            transaction.getId(),
            transaction.getUser().getId(),
            transaction.getAmount(),
            transaction.getCurrency().getCode(),
            transaction.getTransactionDate(),
            transaction.getDescription()
    );
  }

  // CREATE
  @PostMapping
  @ResponseStatus(HttpStatus.CREATED)
  public TransactionResponse create(
          @PathVariable Long userId,
          @RequestBody TransactionRequest request
  ) {
    return toResponse(transactionService.create(
            userId,
            request.amount(),
            request.currencyCode(),
            request.transactionDate(),
            request.description()
    ));
  }

  // GET ALL TRANSACTIONS
  @GetMapping
  public List<TransactionResponse> getHistory(
          @PathVariable Long userId
  ) {
    return transactionService.getHistory(userId)
            .stream()
            .map(this::toResponse)
            .toList();
  }

  // GET 5 MOST RECENT TRANSACTIONS
  @GetMapping("/recent")
  public List<TransactionResponse> getRecent(
          @PathVariable Long userId
  ) {
    return transactionService.getRecent(userId)
            .stream()
            .map(this::toResponse)
            .toList();
  }

  // GET TRANSACTIONS BY DATE
  @GetMapping("/date/{date}")
  public List<TransactionResponse> getByDate(
          @PathVariable Long userId,
          @PathVariable
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate date
  ) {
    return transactionService.getByDate(userId, date)
            .stream()
            .map(this::toResponse)
            .toList();
  }

  // GET TRANSACTIONS BY DATE RANGE
  @GetMapping("/filter")
  public List<TransactionResponse> getByDateRange(
          @PathVariable Long userId,
          @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate from,
          @RequestParam
          @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
          LocalDate to
  ) {
    return transactionService.getByDateRange(userId, from, to)
            .stream()
            .map(this::toResponse)
            .toList();
  }

  // GET ONE TRANSACTION
  @GetMapping("/{transactionId}")
  public TransactionResponse getById(
          @PathVariable Long userId,
          @PathVariable Long transactionId
  ) {
    return toResponse(
            transactionService.getById(userId, transactionId)
    );
  }

  // UPDATE TRANSACTION
  @PutMapping("/{transactionId}")
  public TransactionResponse update(
          @PathVariable Long userId,
          @PathVariable Long transactionId,
          @RequestBody TransactionRequest request
  ) {
    return toResponse(transactionService.update(
            transactionId,
            userId,
            request.amount(),
            request.currencyCode(),
            request.transactionDate(),
            request.description()
    ));
  }

  // DELETE TRANSACTION
  @DeleteMapping("/{transactionId}")
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void delete(
          @PathVariable Long userId,
          @PathVariable Long transactionId
  ) {
    transactionService.delete(transactionId, userId);
  }
}
