<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see https://jhipster.github.io/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.service.mapper;

<%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
import <%=packageName%>.domain.Authority;
<%_ } _%>
import <%=packageName%>.domain.User;
import <%=packageName%>.service.dto.UserDTO;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Mapper for the entity User and its DTO called UserDTO.
 *
 * Normal mappers are generated using MapStruct, this one is hand-coded as MapStruct
 * support is still in beta, and requires a manual step with an IDE.
 */
@Service
public class UserMapper {

    public UserDTO userToUserDTO(User user) {
        return new UserDTO(user);
    }

    public List<UserDTO> usersToUserDTOs(List<User> users) {
        return users.stream()
            .filter(Objects::nonNull)
            .map(this::userToUserDTO)
            .collect(Collectors.toList());
    }

    public User userDTOToUser(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        } else {
            User user = new User();
            user.setId(userDTO.getId());
            user.setLogin(userDTO.getLogin());
            user.setFirstName(userDTO.getFirstName());
            user.setLastName(userDTO.getLastName());
            user.setEmail(userDTO.getEmail());
            <%_ if (databaseType !== 'cassandra') { _%>
            user.setImageUrl(userDTO.getImageUrl());
            <%_ } _%>
            user.setActivated(userDTO.isActivated());
            user.setLangKey(userDTO.getLangKey());
            <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>
            Set<Authority> authorities = this.authoritiesFromStrings(userDTO.getAuthorities());
            if(authorities != null) {
                user.setAuthorities(authorities);
            }
            <%_ } _%>
            <%_ if (databaseType === 'cassandra') { _%>
            user.setAuthorities(userDTO.getAuthorities());
            <%_ } _%>
            return user;
        }
    }

    public List<User> userDTOsToUsers(List<UserDTO> userDTOs) {
        return userDTOs.stream()
            .filter(Objects::nonNull)
            .map(this::userDTOToUser)
            .collect(Collectors.toList());
    }

    public User userFromId(<% if (databaseType === 'mongodb' || databaseType === 'cassandra') { %>String<% } else { %>Long<% } %> id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.setId(id);
        return user;
    }
    <%_ if (databaseType === 'sql' || databaseType === 'mongodb') { _%>

    public Set<Authority> authoritiesFromStrings(Set<String> strings) {
        return strings.stream().map(string -> {
            Authority auth = new Authority();
            auth.setName(string);
            return auth;
        }).collect(Collectors.toSet());
    }
    <%_ } _%>
}
