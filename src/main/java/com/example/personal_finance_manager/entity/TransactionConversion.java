package com.example.personal_finance_manager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "transaction_conversions")
public class TransactionConversion {

  @Id
  @Column(name = "transaction_id")
  private Long transactionId;

  @OneToOne(fetch = FetchType.LAZY)
  @MapsId
  @JoinColumn(name = "transaction_id")
  private Transaction transaction;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "target_currency_code", nullable = false)
  private Currency targetCurrency;

  @Column(name = "exchange_rate", nullable = false, precision = 19, scale = 8)
  private BigDecimal exchangeRate;

  @Column(name = "converted_at", nullable = false)
  private LocalDateTime convertedAt;
}
