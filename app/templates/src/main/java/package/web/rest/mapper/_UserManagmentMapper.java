package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.web.rest.dto.UserManagmentDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import javax.inject.Inject;
import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public abstract class UserManagmentMapper {
    @Inject
    private UserRepository userRepository;

    public abstract UserManagmentDTO userToUserManagmentDTO(User user);
    public abstract List<UserManagmentDTO> usersToUserManagmentsDTO(List<User> users);

    <% if (javaVersion == '8') { %>@Mapping(target = "createdBy", ignore=true)
    @Mapping(target = "createdDate", ignore=true)
    @Mapping(target = "lastModifiedBy", ignore=true)
    @Mapping(target = "lastModifiedDate", ignore=true)<% } %><% if (javaVersion == '7') { %>
    @Mappings({
      @Mapping(target = "createdBy", ignore=true),
      @Mapping(target = "createdDate", ignore=true),
      @Mapping(target = "lastModifiedBy", ignore=true),
      @Mapping(target = "lastModifiedDate", ignore=true)
    })<% } %>
    public abstract User updateUserFromDto(UserManagmentDTO userManagmentDTO, @MappingTarget User user);

    public User userManagmentDTOToUser(UserManagmentDTO userManagmentDTO) {<% if (javaVersion == '8') { %>
        return userRepository.findOneWithEagerRelationships(userManagmentDTO.getId())
            .map(user -> this.updateUserFromDto(userManagmentDTO, user))
            .orElse(null);<% } else { %>
        User user = findOneWithEagerRelationships(userManagmentDTO.getId());
        return updateUserFromDto(userManagmentDTO, user);<% } %>
    }
}
