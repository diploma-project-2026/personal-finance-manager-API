
package com.example.personal_finance_manager.service;

import com.example.personal_finance_manager.entity.Category;
import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.enums.TransactionType;
import com.example.personal_finance_manager.repository.CategoryRepository;
import com.example.personal_finance_manager.repository.UserRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    @Transactional
    public Category create(
            Long userId,
            String name,
            TransactionType type) {

        validate(name, type);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (categoryRepository.existsByUserIdAndNameAndType(
                userId, name.trim(), type)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Category already exists");
        }

        Category category = Category.builder()
                .user(user)
                .name(name.trim())
                .type(type)
                .active(true)
                .build();

        return categoryRepository.save(category);
    }

    @Transactional(readOnly = true)
    public List<Category> getAll(Long userId) {
        return categoryRepository.findByUserIdOrderByNameAsc(userId);
    }

    @Transactional(readOnly = true)
    public Category getById(Long userId, Long categoryId) {
        return findCategory(userId, categoryId);
    }

    @Transactional
    public Category update(
            Long userId,
            Long categoryId,
            String name,
            TransactionType type) {

        validate(name, type);

        Category category = findCategory(userId, categoryId);

        boolean changed = !category.getName().equals(name.trim())
                || category.getType() != type;

        if (changed && categoryRepository.existsByUserIdAndNameAndType(
                userId, name.trim(), type)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Category already exists");
        }

        category.setName(name.trim());
        category.setType(type);

        return categoryRepository.save(category);
    }

    @Transactional
    public void delete(Long userId, Long categoryId) {
        Category category = findCategory(userId, categoryId);

        category.setActive(false);
        categoryRepository.save(category);
    }

    private Category findCategory(Long userId, Long categoryId) {
        return categoryRepository.findByIdAndUserId(categoryId, userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Category not found"));
    }

    private void validate(String name, TransactionType type) {
        if (name == null || name.isBlank() || name.length() > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Invalid category name");
        }

        if (type == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Category type is required");
        }
    }
}
