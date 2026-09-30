package com.example.personal_finance_manager.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import com.example.personal_finance_manager.entity.Currency;
import com.example.personal_finance_manager.entity.User;
import com.example.personal_finance_manager.exception.CurrencyNotFoundException;
import com.example.personal_finance_manager.exception.UserAlreadyExistsException;
import com.example.personal_finance_manager.exception.UserNotFoundException;
import com.example.personal_finance_manager.repository.CurrencyRepository;
import com.example.personal_finance_manager.repository.UserRepository;
import java.time.LocalDateTime;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

  private static final String DEFAULT_CURRENCY_CODE = "EUR";
  private static final String EMAIL = "test@example.com";
  private static final String PASSWORD_HASH = "hashed-password";

  @Mock private UserRepository userRepository;

  @Mock private CurrencyRepository currencyRepository;

  @InjectMocks private UserService userService;

  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(userService, "DEFAULT_CURRENCY_CODE", DEFAULT_CURRENCY_CODE);
  }

  // =========================
  // createUser
  // =========================

  @Test
  void createUser_shouldSaveUser_whenEmailDoesNotExistAndCurrencyExists() {
    // Arrange
    Currency currency = mock(Currency.class);

    when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

    when(currencyRepository.findById(DEFAULT_CURRENCY_CODE)).thenReturn(Optional.of(currency));

    // Act
    userService.createUser(EMAIL, PASSWORD_HASH);

    // Assert
    ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

    verify(userRepository).save(userCaptor.capture());

    User savedUser = userCaptor.getValue();

    assertEquals(EMAIL, savedUser.getEmail());
    assertEquals(PASSWORD_HASH, savedUser.getPasswordHash());
    assertSame(currency, savedUser.getDefaultCurrency());

    verify(userRepository).existsByEmail(EMAIL);
    verify(currencyRepository).findById(DEFAULT_CURRENCY_CODE);
  }

  @Test
  void createUser_shouldThrowUserAlreadyExistsException_whenEmailAlreadyExists() {
    // Arrange
    when(userRepository.existsByEmail(EMAIL)).thenReturn(true);

    // Act + Assert
    assertThrows(
        UserAlreadyExistsException.class, () -> userService.createUser(EMAIL, PASSWORD_HASH));

    verify(userRepository).existsByEmail(EMAIL);

    verifyNoInteractions(currencyRepository);
    verify(userRepository, never()).save(any(User.class));
  }

  @Test
  void createUser_shouldThrowCurrencyNotFoundException_whenDefaultCurrencyDoesNotExist() {
    // Arrange
    when(userRepository.existsByEmail(EMAIL)).thenReturn(false);

    when(currencyRepository.findById(DEFAULT_CURRENCY_CODE)).thenReturn(Optional.empty());

    // Act + Assert
    assertThrows(
        CurrencyNotFoundException.class, () -> userService.createUser(EMAIL, PASSWORD_HASH));

    verify(userRepository).existsByEmail(EMAIL);
    verify(currencyRepository).findById(DEFAULT_CURRENCY_CODE);

    verify(userRepository, never()).save(any(User.class));
  }

  // =========================
  // getUser
  // =========================

  @Test
  void getUser_shouldReturnUser_whenUserExists() {
    // Arrange
    Long userId = 1L;

    User user = User.builder().email(EMAIL).passwordHash(PASSWORD_HASH).build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    // Act
    User result = userService.getUser(userId);

    // Assert
    assertSame(user, result);

    verify(userRepository).findById(userId);
  }

  @Test
  void getUser_shouldThrowUserNotFoundException_whenUserDoesNotExist() {
    // Arrange
    Long userId = 1L;

    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    // Act + Assert
    assertThrows(UserNotFoundException.class, () -> userService.getUser(userId));

    verify(userRepository).findById(userId);
  }

  // =========================
  // updateUser
  // =========================

  @Test
  void updateUser_shouldUpdateEmail_whenNewEmailIsValidAndNotTaken() {
    // Arrange
    Long userId = 1L;
    String oldEmail = "old@example.com";
    String newEmail = "new@example.com";

    User user = User.builder().email(oldEmail).passwordHash(PASSWORD_HASH).build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    when(userRepository.existsByEmail(newEmail)).thenReturn(false);

    // Act
    User result = userService.updateUser(userId, newEmail, null);

    // Assert
    assertSame(user, result);
    assertEquals(newEmail, result.getEmail());
    assertNotNull(result.getUpdatedAt());

    verify(userRepository).findById(userId);
    verify(userRepository).existsByEmail(newEmail);

    verifyNoInteractions(currencyRepository);
  }

  @Test
  void updateUser_shouldNotCheckEmailExistence_whenEmailHasNotChanged() {
    // Arrange
    Long userId = 1L;

    User user = User.builder().email(EMAIL).passwordHash(PASSWORD_HASH).build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    // Act
    User result = userService.updateUser(userId, EMAIL, null);

    // Assert
    assertEquals(EMAIL, result.getEmail());
    assertNotNull(result.getUpdatedAt());

    verify(userRepository).findById(userId);

    verify(userRepository, never()).existsByEmail(anyString());

    verifyNoInteractions(currencyRepository);
  }

  @Test
  void updateUser_shouldThrowUserAlreadyExistsException_whenNewEmailIsAlreadyTaken() {
    // Arrange
    Long userId = 1L;
    String oldEmail = "old@example.com";
    String newEmail = "taken@example.com";

    User user = User.builder().email(oldEmail).passwordHash(PASSWORD_HASH).build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    when(userRepository.existsByEmail(newEmail)).thenReturn(true);

    // Act + Assert
    assertThrows(
        UserAlreadyExistsException.class, () -> userService.updateUser(userId, newEmail, null));

    assertEquals(oldEmail, user.getEmail());

    verify(userRepository).findById(userId);
    verify(userRepository).existsByEmail(newEmail);

    verifyNoInteractions(currencyRepository);
  }

  @Test
  void updateUser_shouldUpdateCurrency_whenCurrencyExists() {
    // Arrange
    Long userId = 1L;
    String newCurrencyCode = "USD";

    Currency oldCurrency = mock(Currency.class);
    Currency newCurrency = mock(Currency.class);

    User user =
        User.builder()
            .email(EMAIL)
            .passwordHash(PASSWORD_HASH)
            .defaultCurrency(oldCurrency)
            .build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    when(currencyRepository.findById(newCurrencyCode)).thenReturn(Optional.of(newCurrency));

    // Act
    User result = userService.updateUser(userId, null, newCurrencyCode);

    // Assert
    assertSame(newCurrency, result.getDefaultCurrency());
    assertNotNull(result.getUpdatedAt());

    verify(userRepository).findById(userId);
    verify(currencyRepository).findById(newCurrencyCode);
  }

  @Test
  void updateUser_shouldThrowCurrencyNotFoundException_whenCurrencyDoesNotExist() {
    // Arrange
    Long userId = 1L;
    String currencyCode = "ABC";

    Currency originalCurrency = mock(Currency.class);

    User user =
        User.builder()
            .email(EMAIL)
            .passwordHash(PASSWORD_HASH)
            .defaultCurrency(originalCurrency)
            .build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    when(currencyRepository.findById(currencyCode)).thenReturn(Optional.empty());

    // Act + Assert
    assertThrows(
        CurrencyNotFoundException.class, () -> userService.updateUser(userId, null, currencyCode));

    assertSame(originalCurrency, user.getDefaultCurrency());

    verify(userRepository).findById(userId);
    verify(currencyRepository).findById(currencyCode);
  }

  @Test
  void updateUser_shouldIgnoreBlankEmailAndBlankCurrencyCode() {
    // Arrange
    Long userId = 1L;

    Currency originalCurrency = mock(Currency.class);

    User user =
        User.builder()
            .email(EMAIL)
            .passwordHash(PASSWORD_HASH)
            .defaultCurrency(originalCurrency)
            .build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    // Act
    User result = userService.updateUser(userId, "   ", "   ");

    // Assert
    assertEquals(EMAIL, result.getEmail());
    assertSame(originalCurrency, result.getDefaultCurrency());
    assertNotNull(result.getUpdatedAt());

    verify(userRepository).findById(userId);

    verify(userRepository, never()).existsByEmail(anyString());

    verifyNoInteractions(currencyRepository);
  }

  @Test
  void updateUser_shouldUpdateBothEmailAndCurrency() {
    // Arrange
    Long userId = 1L;
    String newEmail = "new@example.com";
    String newCurrencyCode = "USD";

    Currency oldCurrency = mock(Currency.class);
    Currency newCurrency = mock(Currency.class);

    User user =
        User.builder()
            .email(EMAIL)
            .passwordHash(PASSWORD_HASH)
            .defaultCurrency(oldCurrency)
            .build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    when(userRepository.existsByEmail(newEmail)).thenReturn(false);

    when(currencyRepository.findById(newCurrencyCode)).thenReturn(Optional.of(newCurrency));

    LocalDateTime beforeUpdate = LocalDateTime.now();

    // Act
    User result = userService.updateUser(userId, newEmail, newCurrencyCode);

    LocalDateTime afterUpdate = LocalDateTime.now();

    // Assert
    assertEquals(newEmail, result.getEmail());
    assertSame(newCurrency, result.getDefaultCurrency());

    assertNotNull(result.getUpdatedAt());

    assertFalse(result.getUpdatedAt().isBefore(beforeUpdate));
    assertFalse(result.getUpdatedAt().isAfter(afterUpdate));

    verify(userRepository).findById(userId);
    verify(userRepository).existsByEmail(newEmail);
    verify(currencyRepository).findById(newCurrencyCode);
  }

  @Test
  void updateUser_shouldThrowUserNotFoundException_whenUserDoesNotExist() {
    // Arrange
    Long userId = 999L;

    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    // Act + Assert
    assertThrows(UserNotFoundException.class, () -> userService.updateUser(userId, EMAIL, "EUR"));

    verify(userRepository).findById(userId);

    verify(userRepository, never()).existsByEmail(anyString());

    verifyNoInteractions(currencyRepository);
  }

  // =========================
  // deleteUser
  // =========================

  @Test
  void deleteUser_shouldDeleteUser_whenUserExists() {
    // Arrange
    Long userId = 1L;

    User user = User.builder().email(EMAIL).passwordHash(PASSWORD_HASH).build();

    when(userRepository.findById(userId)).thenReturn(Optional.of(user));

    // Act
    userService.deleteUser(userId);

    // Assert
    verify(userRepository).findById(userId);
    verify(userRepository).delete(user);
  }

  @Test
  void deleteUser_shouldThrowUserNotFoundException_whenUserDoesNotExist() {
    // Arrange
    Long userId = 999L;

    when(userRepository.findById(userId)).thenReturn(Optional.empty());

    // Act + Assert
    assertThrows(UserNotFoundException.class, () -> userService.deleteUser(userId));

    verify(userRepository).findById(userId);

    verify(userRepository, never()).delete(any(User.class));
  }
}
