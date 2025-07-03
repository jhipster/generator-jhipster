package com.okta.developer.gateway.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.okta.developer.gateway.domain.Authority;
import com.okta.developer.gateway.domain.User;
import com.okta.developer.gateway.security.AuthoritiesConstants;
import com.okta.developer.gateway.service.dto.AdminUserDTO;
import com.okta.developer.gateway.service.dto.UserDTO;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.apache.commons.lang3.RandomStringUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

/**
 * Unit tests for {@link UserMapper}.
 */
class UserMapperTest {

    private static final String DEFAULT_LOGIN = "johndoe";
    private static final Long DEFAULT_ID = 1L;

    private UserMapper userMapper;
    private User user;
    private AdminUserDTO userDto;

    @BeforeEach
    void init() {
        userMapper = new UserMapper();
        user = new User();
        user.setLogin(DEFAULT_LOGIN);
        user.setPassword(RandomStringUtils.insecure().nextAlphanumeric(60));
        user.setActivated(true);
        user.setEmail("johndoe@localhost");
        user.setFirstName("john");
        user.setLastName("doe");
        user.setImageUrl("image_url");
        user.setCreatedBy(DEFAULT_LOGIN);
        user.setCreatedDate(Instant.now());
        user.setLastModifiedBy(DEFAULT_LOGIN);
        user.setLastModifiedDate(Instant.now());
        user.setLangKey("en");

        Set<Authority> authorities = new HashSet<>();
        Authority authority = new Authority();
        authority.setName(AuthoritiesConstants.USER);
        authorities.add(authority);
        user.setAuthorities(authorities);

        userDto = new AdminUserDTO(user);
    }

    @Test
    void testUserToUserDTO() {
        AdminUserDTO convertedUserDto = userMapper.userToAdminUserDTO(user);

        assertThat(convertedUserDto.getId()).isEqualTo(user.getId());
        assertThat(convertedUserDto.getLogin()).isEqualTo(user.getLogin());
        assertThat(convertedUserDto.getFirstName()).isEqualTo(user.getFirstName());
        assertThat(convertedUserDto.getLastName()).isEqualTo(user.getLastName());
        assertThat(convertedUserDto.getEmail()).isEqualTo(user.getEmail());
        assertThat(convertedUserDto.isActivated()).isEqualTo(user.isActivated());
        assertThat(convertedUserDto.getImageUrl()).isEqualTo(user.getImageUrl());
        assertThat(convertedUserDto.getCreatedBy()).isEqualTo(user.getCreatedBy());
        assertThat(convertedUserDto.getCreatedDate()).isEqualTo(user.getCreatedDate());
        assertThat(convertedUserDto.getLastModifiedBy()).isEqualTo(user.getLastModifiedBy());
        assertThat(convertedUserDto.getLastModifiedDate()).isEqualTo(user.getLastModifiedDate());
        assertThat(convertedUserDto.getLangKey()).isEqualTo(user.getLangKey());
        assertThat(convertedUserDto.getAuthorities()).containsExactly(AuthoritiesConstants.USER);
    }

    @Test
    void testUserDTOtoUser() {
        User convertedUser = userMapper.userDTOToUser(userDto);

        assertThat(convertedUser.getId()).isEqualTo(userDto.getId());
        assertThat(convertedUser.getLogin()).isEqualTo(userDto.getLogin());
        assertThat(convertedUser.getFirstName()).isEqualTo(userDto.getFirstName());
        assertThat(convertedUser.getLastName()).isEqualTo(userDto.getLastName());
        assertThat(convertedUser.getEmail()).isEqualTo(userDto.getEmail());
        assertThat(convertedUser.isActivated()).isEqualTo(userDto.isActivated());
        assertThat(convertedUser.getImageUrl()).isEqualTo(userDto.getImageUrl());
        assertThat(convertedUser.getLangKey()).isEqualTo(userDto.getLangKey());
        assertThat(convertedUser.getCreatedBy()).isEqualTo(userDto.getCreatedBy());
        assertThat(convertedUser.getCreatedDate()).isEqualTo(userDto.getCreatedDate());
        assertThat(convertedUser.getLastModifiedBy()).isEqualTo(userDto.getLastModifiedBy());
        assertThat(convertedUser.getLastModifiedDate()).isEqualTo(userDto.getLastModifiedDate());
        assertThat(convertedUser.getAuthorities()).extracting("name").containsExactly(AuthoritiesConstants.USER);
    }

    @Test
    void usersToUserDTOsShouldMapOnlyNonNullUsers() {
        List<User> users = new ArrayList<>();
        users.add(user);
        users.add(null);

        List<UserDTO> userDTOS = userMapper.usersToUserDTOs(users);

        assertThat(userDTOS).isNotEmpty().size().isEqualTo(1);
    }

    @Test
    void userDTOsToUsersShouldMapOnlyNonNullUsers() {
        List<AdminUserDTO> usersDto = new ArrayList<>();
        usersDto.add(userDto);
        usersDto.add(null);

        List<User> users = userMapper.userDTOsToUsers(usersDto);

        assertThat(users).isNotEmpty().size().isEqualTo(1);
    }

    @Test
    void userDTOsToUsersWithAuthoritiesStringShouldMapToUsersWithAuthoritiesDomain() {
        Set<String> authoritiesAsString = new HashSet<>();
        authoritiesAsString.add("ADMIN");
        userDto.setAuthorities(authoritiesAsString);

        List<AdminUserDTO> usersDto = new ArrayList<>();
        usersDto.add(userDto);

        List<User> users = userMapper.userDTOsToUsers(usersDto);

        assertThat(users).isNotEmpty().size().isEqualTo(1);
        assertThat(users.get(0).getAuthorities()).isNotNull();
        assertThat(users.get(0).getAuthorities()).isNotEmpty();
        assertThat(users.get(0).getAuthorities().iterator().next().getName()).isEqualTo("ADMIN");
    }

    @Test
    void userDTOsToUsersMapWithNullAuthoritiesStringShouldReturnUserWithEmptyAuthorities() {
        userDto.setAuthorities(null);

        List<AdminUserDTO> usersDto = new ArrayList<>();
        usersDto.add(userDto);

        List<User> users = userMapper.userDTOsToUsers(usersDto);

        assertThat(users).isNotEmpty().size().isEqualTo(1);
        assertThat(users.get(0).getAuthorities()).isNotNull();
        assertThat(users.get(0).getAuthorities()).isEmpty();
    }

    @Test
    void userDTOToUserMapWithAuthoritiesStringShouldReturnUserWithAuthorities() {
        User convertedUser = userMapper.userDTOToUser(userDto);

        assertThat(convertedUser).isNotNull();
        assertThat(convertedUser.getAuthorities()).isNotNull();
        assertThat(convertedUser.getAuthorities()).isNotEmpty();
        assertThat(convertedUser.getAuthorities().iterator().next().getName()).isEqualTo(AuthoritiesConstants.USER);
    }

    @Test
    void userDTOToUserMapWithNullAuthoritiesStringShouldReturnUserWithEmptyAuthorities() {
        userDto.setAuthorities(null);

        User persistUser = userMapper.userDTOToUser(userDto);

        assertThat(persistUser).isNotNull();
        assertThat(persistUser.getAuthorities()).isNotNull();
        assertThat(persistUser.getAuthorities()).isEmpty();
    }

    @Test
    void userDTOToUserMapWithNullUserShouldReturnNull() {
        assertThat(userMapper.userDTOToUser(null)).isNull();
    }

    @Test
    void testUserFromId() {
        assertThat(userMapper.userFromId(DEFAULT_ID).getId()).isEqualTo(DEFAULT_ID);
        assertThat(userMapper.userFromId(null)).isNull();
    }
}
