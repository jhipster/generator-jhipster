package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.User;
import <%=packageName%>.service.UserService;
import <%=packageName%>.web.rest.dto.userManagementDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;<% if (javaVersion == '7') { %>
import org.mapstruct.Mappings;<% } %><% if (javaVersion == '8') { %>
import java.util.Optional;<% } %>

import javax.inject.Inject;
import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public abstract class userManagementMapper {

    @Inject
    private UserService userService;

    public abstract userManagementDTO userTouserManagementDTO(User user);
    public abstract List<userManagementDTO> usersTouserManagementsDTO(List<User> users);

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
    public abstract User updateUserFromDto(userManagementDTO userManagementDTO, @MappingTarget User user);

    public User userManagementDTOToUser(userManagementDTO userManagementDTO) {<% if (javaVersion == '8') { %>
        return  Optional.ofNullable(userService.getUserWithAuthorities(userManagementDTO.getLogin()))
            .map(user -> this.updateUserFromDto(userManagementDTO, user))
            .orElse(null);<% } else { %>
        User user = userService.getUserWithAuthorities(userManagementDTO.getLogin());
        return updateUserFromDto(userManagementDTO, user);<% } %>
    }
}
