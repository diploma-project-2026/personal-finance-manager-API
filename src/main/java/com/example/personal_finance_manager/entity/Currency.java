package com.example.personal_finance_manager.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;

@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "currencies")
public class Currency {

  @Id
  @Column(name = "code", length = 3)
  private String code;

  @Column(name = "name", nullable = false, length = 100)
  private String name;
}
