package com.example.personal_finance_manager.entity;

import com.example.personal_finance_manager.enums.ReceiptStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "receipts")
public class Receipt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transaction_id", unique = true)
    private Transaction transaction;

    @Column(name = "image_path", nullable = false, length = 500)
    private String imagePath;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ReceiptStatus status;

    @Column(name = "recognized_merchant", length = 255)
    private String recognizedMerchant;

    @Column(name = "recognized_date")
    private LocalDate recognizedDate;

    @Column(name = "recognized_total", precision = 19, scale = 2)
    private BigDecimal recognizedTotal;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recognized_currency_code")
    private Currency recognizedCurrency;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;
}