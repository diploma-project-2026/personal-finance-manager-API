package com.example.personal_finance_manager.mapper;

import com.example.personal_finance_manager.controller.api.UserController.UserResponse;
import com.example.personal_finance_manager.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

  @Mapping(source = "defaultCurrency.code", target = "currencyCode")
  UserResponse toResponse(User user);
}
