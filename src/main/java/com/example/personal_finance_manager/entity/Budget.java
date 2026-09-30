package com.example.personal_finance_manager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(
    name = "budgets",
    uniqueConstraints = {
      @UniqueConstraint(
          name = "uq_budgets_user_category_month",
          columnNames = {"user_id", "category_id", "budget_month"})
    })
public class Budget {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "user_id", nullable = false)
  private User user;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id", nullable = false)
  private Category category;

  @Column(name = "budget_month", nullable = false)
  private LocalDate budgetMonth;

  @Column(name = "limit_amount", nullable = false, precision = 19, scale = 2)
  private BigDecimal limitAmount;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "currency_code", nullable = false)
  private Currency currency;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;
}
