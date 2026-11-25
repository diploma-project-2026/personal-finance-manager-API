package com.example.personal_finance_manager.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "line_items")
public class LineItem {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "receipt_id", nullable = false)
  private Receipt receipt;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "category_id")
  private Category category;

  @Column(name = "name", nullable = false, length = 255)
  private String name;

  @Column(name = "quantity", precision = 10, scale = 2)
  private BigDecimal quantity;

  @Column(name = "unit_price", precision = 19, scale = 2)
  private BigDecimal unitPrice;

  @Column(name = "total_amount", precision = 19, scale = 2)
  private BigDecimal totalAmount;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at", nullable = false)
  private LocalDateTime updatedAt;
}
