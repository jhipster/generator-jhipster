package <%=packageName%>.service;

import java.util.List;

import javax.inject.Inject;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import <%=packageName%>.domain.Authority;
import <%=packageName%>.domain.User;
import <%=packageName%>.repository.AuthorityRepository;
import <%=packageName%>.repository.UserRepository;
import <%=packageName%>.service.mapper.UserManagementMapper;
import <%=packageName%>.web.rest.dto.PageDTO;
import <%=packageName%>.web.rest.dto.UserManagementDTO;

@Service
@Transactional(readOnly = true)
public class UserManagementService {

    @Inject
    private UserRepository userRepository;

    @Inject
    private AuthorityRepository authorityRepository;

    @Inject
    private UserManagementMapper userManagementMapper;

    public PageDTO<UserManagementDTO> findOnePageOfPart(Pageable pageRequest) {
        final Page<User> page = userRepository.findAll(pageRequest);

        return userManagementMapper.mapPage(page);
    }

    public UserManagementDTO getUserWithAuthorities(Long id) {
        final User user = userRepository.findOne(id);

        return userManagementMapper.map(user);
    }

    @Transactional(readOnly = false)
    public UserManagementDTO update(UserManagementDTO userManagementDTO) {
        final User user;
        if (userManagementDTO.getId() != null) {
            final User entity = userRepository.findOne(userManagementDTO.getId());
            user = userManagementMapper.merge(userManagementDTO, entity);
        } else {
            final User updated = userManagementMapper.merge(userManagementDTO, new User());
            user = userRepository.save(updated);
        }
        return userManagementMapper.map(user);
    }

    public List<Authority> getAllAuthority() {
        return authorityRepository.findAll();
    }

}
