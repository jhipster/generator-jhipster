package <%=packageName%>.security;

import <%=packageName%>.domain.User;
import <%=packageName%>.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;

/**
 * Finds a User in the database.
 */
@Component("userDetailsService")
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(UserDetailsService.class);

    private final Collection<GrantedAuthority> userGrantedAuthorities = new ArrayList<GrantedAuthority>();

    @Inject
    private UserRepository userRepository;

    @Inject
    Environment env;

    @PostConstruct
    public void init() {
        //Roles for "normal" users
        GrantedAuthority roleUser = new SimpleGrantedAuthority(SecurityRoles.MEMBER);
        userGrantedAuthorities.add(roleUser);
    }

    @Override
    public UserDetails loadUserByUsername(final String login) throws UsernameNotFoundException {
        log.debug("Authenticating {}", login);
        String lowercaseLogin = login.toLowerCase();

        User userFromDatabase = userRepository.findByLogin(login);
        if (userFromDatabase == null) {
            throw new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database");
        }
        return new org.springframework.security.core.userdetails.User(lowercaseLogin, userFromDatabase.getPassword(),
                userGrantedAuthorities);
    }
}
