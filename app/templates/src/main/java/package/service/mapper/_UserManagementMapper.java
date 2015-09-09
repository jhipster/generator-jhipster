package <%=packageName%>.service.mapper;

import java.util.HashSet;

import javax.inject.Inject;

import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.Validate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import <%=packageName%>.domain.Authority;
import <%=packageName%>.domain.User;
import <%=packageName%>.security.AuthoritiesConstants;
import <%=packageName%>.web.rest.dto.UserManagementDTO;

@Component
public class UserManagementMapper extends AbstractMapper<User, UserManagementDTO> {

    @Inject
    private PasswordEncoder passwordEncoder;

    @Override
    public UserManagementDTO map(User user) {
        if (user == null) {
            return null;
        }
        return new UserManagementDTO(user.getId(), user.getLogin(), user.getFirstName(), user.getLastName(), user.getEmail(), user.getActivated(),
                user.getLangKey(), new HashSet<>(user.getAuthorities()), user.getCreatedDate(), user.getLastModifiedDate());
    }

    public User merge(UserManagementDTO dto, User user) {
        user.setLogin(dto.getLogin());
        user.setActivated(dto.isActivated());
        user.setFirstName(dto.getFirstName());
        user.setLastName(dto.getLastName());
        user.setEmail(dto.getEmail());
        user.setLangKey(dto.getLangKey());
        user.setAuthorities(dto.getAuthorities());
        if (!user.hasRole(AuthoritiesConstants.USER)) {
            user.getAuthorities().add(new Authority(AuthoritiesConstants.USER));
        }
        if (!StringUtils.isBlank(dto.getPassword())) {
            Validate.isTrue(dto.getPassword().equals(dto.getConfirmPassword()), "password-mismatch");

            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        return user;
    }

}
