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

  /** Configures the default currency on the service created by Mockito. */
  @BeforeEach
  void setUp() {
    ReflectionTestUtils.setField(userService, "DEFAULT_CURRENCY_CODE", DEFAULT_CURRENCY_CODE);
  }

  // =========================
  // createUser
  // =========================

  /** Verifies that a new user is saved with the supplied credentials and default currency. */
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

  /** Verifies that a duplicate email prevents currency lookup and user persistence. */
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

  /** Verifies that a missing default currency prevents user persistence. */
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

  /** Verifies that an existing user is returned from the repository. */
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

  /** Verifies that looking up a missing user raises UserNotFoundException. */
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

  /** Verifies that an available email replaces the old email and updates the timestamp. */
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

  /** Verifies that keeping the current email skips the duplicate email check. */
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

  /** Verifies that a duplicate email is rejected without changing the current email. */
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

  /** Verifies that an existing currency replaces the default currency and updates the timestamp. */
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

  /** Verifies that a missing currency is rejected without replacing the current currency. */
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

  /**
   * Verifies that blank fields leave email and currency unchanged while refreshing the timestamp.
   */
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

  /**
   * Verifies that both profile fields change and the timestamp falls within the update interval.
   */
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

  /** Verifies that updating a missing user fails before email or currency validation. */
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

  /** Verifies that deletion passes the retrieved user to the repository. */
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

  /**
   * Verifies that deleting a missing user raises an exception without invoking repository deletion.
   */
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
