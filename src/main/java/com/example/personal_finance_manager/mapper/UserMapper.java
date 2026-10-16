package com.example.personal_finance_manager.mapper;

import com.example.personal_finance_manager.controller.api.UserController.UserResponse;
import com.example.personal_finance_manager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  /**
   * Maps a user to a public profile without exposing the password hash.
   *
   * @param user the user to map, or null
   * @return the ID, email, and default currency code, or null if the user is null
   */
  @Mapping(source = "defaultCurrency.code", target = "currencyCode")
  UserResponse toResponse(User user);
}
