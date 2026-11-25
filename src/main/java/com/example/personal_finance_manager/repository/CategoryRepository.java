
package com.example.personal_finance_manager.repository;

import com.example.personal_finance_manager.entity.Category;
import com.example.personal_finance_manager.enums.TransactionType;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository
        extends JpaRepository<Category, Long> {

    List<Category> findByUserIdOrderByNameAsc(Long userId);

    Optional<Category> findByIdAndUserId(
            Long id, Long userId
    );

    boolean existsByUserIdAndNameAndType(
            Long userId,
            String name,
            TransactionType type
    );
}
