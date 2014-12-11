package <%=packageName%>.security;

    import <%=packageName%>.domain.Authority;
    import <%=packageName%>.domain.User;
    import <%=packageName%>.repository.UserRepository;
    import org.slf4j.Logger;
    import org.slf4j.LoggerFactory;
    import org.springframework.security.core.GrantedAuthority;
    import org.springframework.security.core.authority.SimpleGrantedAuthority;
    import org.springframework.security.core.userdetails.UserDetails;
    import org.springframework.security.core.userdetails.UsernameNotFoundException;
    import org.springframework.stereotype.Component;
    import org.springframework.transaction.annotation.Transactional;

    import javax.inject.Inject;
    import java.util.ArrayList;
    import java.util.Collection;
<%if (javaVersion == '8') {%>
    import java.util.Optional;
    import java.util.stream.Collectors;
    import java.util.Collections;
    import java.util.List;


<%}%>
/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class UserDetailsService implements org.springframework.security.core.userdetails.UserDetailsService {

    private final Logger log = LoggerFactory.getLogger(UserDetailsService.class);

    @Inject
    private UserRepository userRepository;

    @Override
    @Transactional
    public UserDetails loadUserByUsername(final String login) {
        log.debug("Authenticating {}", login);
        final String lowercaseLogin = login.toLowerCase();
        <%if (javaVersion == '8') {%>

            final Optional<User> userFromDatabase =  userRepository.findOneByLogin(lowercaseLogin);
            final boolean activated = userFromDatabase.map(u -> u.getActivated()).orElseThrow(() -> new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database"));
            if (!activated) {
                throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
            }

            final List<GrantedAuthority> grantedAuthorities = userFromDatabase.map(u -> u.getAuthorities().stream().map(authority -> {
                final GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(authority.getName());
                return grantedAuthority ;
            }).collect(Collectors.toList())).orElse(Collections.emptyList());

            return new org.springframework.security.core.userdetails.User(lowercaseLogin, userFromDatabase.map(u -> u.getPassword()).orElse(null),
                grantedAuthorities);

            <%} else {%>


            final User userFromDatabase = userRepository.findOneByLogin(lowercaseLogin);
            if (userFromDatabase == null) {
                throw new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database");
            } else if (!userFromDatabase.getActivated()) {
                throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
            }

        Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();
        for (Authority authority : userFromDatabase.getAuthorities()) {
            GrantedAuthority grantedAuthority = new SimpleGrantedAuthority(authority.getName());
            grantedAuthorities.add(grantedAuthority);
        }

            return new org.springframework.security.core.userdetails.User(lowercaseLogin, userFromDatabase.getPassword(),
                grantedAuthorities);
            <%}%>


    }
}
