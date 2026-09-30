package com.example.personal_finance_manager.service;

import com.example.personal_finance_manager.entity.Currency;
import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.exception.CurrencyNotFoundException;
import com.example.personal_finance_manager.exception.UserAlreadyExistsException;
import com.example.personal_finance_manager.exception.UserNotFoundException;
import com.example.personal_finance_manager.repository.CurrencyRepository;
import com.example.personal_finance_manager.repository.UserRepository;
import java.time.LocalDateTime;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

  private final UserRepository userRepository;
  private final CurrencyRepository currencyRepository;

  @Value("${app.currency.default.code}")
  private String DEFAULT_CURRENCY_CODE;

  @Transactional
  public User createUser(String email, String passwordHash) {

    if (userRepository.existsByEmail(email)) {
      throw new UserAlreadyExistsException();
    }

    Currency defaultCurrency =
        currencyRepository
            .findById(DEFAULT_CURRENCY_CODE)
            .orElseThrow(CurrencyNotFoundException::new);

    User user =
        User.builder()
            .email(email)
            .passwordHash(passwordHash)
            .defaultCurrency(defaultCurrency)
            .build();

    return userRepository.save(user);
  }

  @Transactional(readOnly = true)
  public User getUser(Long id) {
    return userRepository.findById(id).orElseThrow(UserNotFoundException::new);
  }

  @Transactional
  public User updateUser(Long id, String email, String currencyCode) {
    User user = getUser(id);

    if (email != null && !email.isBlank()) {
      if (!email.equals(user.getEmail()) && userRepository.existsByEmail(email)) {
        throw new UserAlreadyExistsException();
      }

      user.setEmail(email);
    }

    if (currencyCode != null && !currencyCode.isBlank()) {
      Currency currency =
          currencyRepository.findById(currencyCode).orElseThrow(CurrencyNotFoundException::new);

      user.setDefaultCurrency(currency);
    }

    user.setUpdatedAt(LocalDateTime.now());

    return user;
  }

  @Transactional
  public void deleteUser(Long id) {
    User user = getUser(id);
    userRepository.delete(user);
  }
}
