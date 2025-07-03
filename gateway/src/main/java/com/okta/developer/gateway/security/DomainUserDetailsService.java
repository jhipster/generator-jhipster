package com.okta.developer.gateway.security;

import com.okta.developer.gateway.domain.Authority;
import com.okta.developer.gateway.domain.User;
import com.okta.developer.gateway.repository.UserRepository;
import java.util.*;
import org.hibernate.validator.internal.constraintvalidators.hv.EmailValidator;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

/**
 * Authenticate a user from the database.
 */
@Component("userDetailsService")
public class DomainUserDetailsService implements ReactiveUserDetailsService {

    private static final Logger LOG = LoggerFactory.getLogger(DomainUserDetailsService.class);

    private final UserRepository userRepository;

    public DomainUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Mono<UserDetails> findByUsername(final String login) {
        LOG.debug("Authenticating {}", login);

        if (new EmailValidator().isValid(login, null)) {
            return userRepository
                .findOneWithAuthoritiesByEmailIgnoreCase(login)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User with email " + login + " was not found in the database")))
                .map(user -> createSpringSecurityUser(login, user));
        }

        String lowercaseLogin = login.toLowerCase(Locale.ENGLISH);
        return userRepository
            .findOneWithAuthoritiesByLogin(lowercaseLogin)
            .switchIfEmpty(Mono.error(new UsernameNotFoundException("User " + lowercaseLogin + " was not found in the database")))
            .map(user -> createSpringSecurityUser(lowercaseLogin, user));
    }

    private org.springframework.security.core.userdetails.User createSpringSecurityUser(String lowercaseLogin, User user) {
        if (!user.isActivated()) {
            throw new UserNotActivatedException("User " + lowercaseLogin + " was not activated");
        }
        return UserWithId.fromUser(user);
    }

    public static class UserWithId extends org.springframework.security.core.userdetails.User {

        private final Long id;

        public UserWithId(String login, String password, Collection<? extends GrantedAuthority> authorities, Long id) {
            super(login, password, authorities);
            this.id = id;
        }

        public Long getId() {
            return id;
        }

        @Override
        public boolean equals(Object obj) {
            return super.equals(obj);
        }

        @Override
        public int hashCode() {
            return super.hashCode();
        }

        public static UserWithId fromUser(User user) {
            return new UserWithId(
                user.getLogin(),
                user.getPassword(),
                user.getAuthorities().stream().map(Authority::getName).map(SimpleGrantedAuthority::new).toList(),
                user.getId()
            );
        }
    }
}
