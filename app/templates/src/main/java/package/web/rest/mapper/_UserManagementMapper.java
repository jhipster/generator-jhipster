package <%=packageName%>.web.rest.mapper;

import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.web.rest.dto.userManagementDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;<% if (javaVersion == '7') { %>
import org.mapstruct.Mappings;<% } %>

import javax.inject.Inject;
import java.util.List;

@Mapper(componentModel = "spring", uses = {})
public abstract class userManagementMapper {
    @Inject
    private UserRepository userRepository;

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
        return userRepository.findOneWithEagerRelationships(userManagementDTO.getId())
            .map(user -> this.updateUserFromDto(userManagementDTO, user))
            .orElse(null);<% } else { %>
        User user = userRepository.findOneWithEagerRelationships(userManagementDTO.getId());
        return updateUserFromDto(userManagementDTO, user);<% } %>
    }
}
