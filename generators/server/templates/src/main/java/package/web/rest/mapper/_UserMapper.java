package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.Authority;
import <%=packageName%>.domain.User;
import <%=packageName%>.web.rest.dto.UserDTO;
import org.mapstruct.Mapper;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Mapper for the entity User and its DTO UserDTO.
 */
@Mapper(componentModel = "spring", uses = {})
public interface UserMapper {

    UserDTO userToUserDTO(User user);

    List<UserDTO> usersToUserDTOs(List<User> users);

    User userDTOToUser(UserDTO userDTO);

    List<User> userDTOsToUsers(List<UserDTO> userDTOs);

    default User userFromId(Long id) {
        if (id == null) {
            return null;
        }
        User user = new User();
        user.setId(id);
        return user;
    }

    default Set<String> stringsFromAuthorities(Set<Authority> authorities) {
        Set<String> auths = new HashSet<>();
        for(Authority auth : authorities){
            auths.add(auth.getName());
        }
        return auths;
    }

    default Set<Authority> authoritiesFromStrings(Set<String> strings) {
        Set<Authority> auths = new HashSet<>();
        for(String auth : strings){
            Authority a = new Authority();
            a.setName(auth);
            auths.add(a);
        }
        return auths;
    }
}
