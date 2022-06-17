package tech.jhipster.sample.service;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import tech.jhipster.sample.config.Constants;
import tech.jhipster.sample.domain.Authority;
import tech.jhipster.sample.domain.User;
import tech.jhipster.sample.repository.AuthorityRepository;
import tech.jhipster.sample.repository.UserRepository;
import tech.jhipster.sample.security.SecurityUtils;
import tech.jhipster.sample.service.dto.AdminUserDTO;
import tech.jhipster.sample.service.dto.UserDTO;

/**
 * Service class for managing users.
 */
@Service
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final AuthorityRepository authorityRepository;

    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     * @return a completed {@link Mono}.
     */
    @Transactional
    public Mono<Void> updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        return SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .flatMap(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                return saveUser(user);
            })
            .doOnNext(user -> log.debug("Changed Information for User: {}", user))
            .then();
    }

    @Transactional
    public Mono<User> saveUser(User user) {
        return saveUser(user, false);
    }

    @Transactional
    public Mono<User> saveUser(User user, boolean forceCreate) {
        return SecurityUtils
            .getCurrentUserLogin()
            .switchIfEmpty(Mono.just(Constants.SYSTEM))
            .flatMap(login -> {
                if (user.getCreatedBy() == null) {
                    user.setCreatedBy(login);
                }
                user.setLastModifiedBy(login);
                // Saving the relationship can be done in an entity callback
                // once https://github.com/spring-projects/spring-data-r2dbc/issues/215 is done
                Mono<User> persistedUser;
                if (forceCreate) {
                    persistedUser = userRepository.create(user);
                } else {
                    persistedUser = userRepository.save(user);
                }
                return persistedUser.flatMap(savedUser ->
                    Flux
                        .fromIterable(user.getAuthorities())
                        .flatMap(authority -> userRepository.saveUserAuthority(savedUser.getId(), authority.getName()))
                        .then(Mono.just(savedUser))
                );
            });
    }

    @Transactional(readOnly = true)
    public Flux<AdminUserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAllWithAuthorities(pageable).map(AdminUserDTO::new);
    }

    @Transactional(readOnly = true)
    public Flux<UserDTO> getAllPublicUsers(Pageable pageable) {
        return userRepository.findAllByIdNotNullAndActivatedIsTrue(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Mono<Long> countManagedUsers() {
        return userRepository.count();
    }

    @Transactional(readOnly = true)
    public Mono<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public Flux<String> getAuthorities() {
        return authorityRepository.findAll().map(Authority::getName);
    }

    private Mono<User> syncUserWithIdP(Map<String, Object> details, User user) {
        // save authorities in to sync user roles/groups between IdP and JHipster's local database
        Collection<String> userAuthorities = user.getAuthorities().stream().map(Authority::getName).collect(Collectors.toList());

        return getAuthorities()
            .collectList()
            .flatMapMany(dbAuthorities -> {
                List<Authority> authoritiesToSave = userAuthorities
                    .stream()
                    .filter(authority -> !dbAuthorities.contains(authority))
                    .map(authority -> {
                        Authority authorityToSave = new Authority();
                        authorityToSave.setName(authority);
                        return authorityToSave;
                    })
                    .collect(Collectors.toList());
                return Flux.fromIterable(authoritiesToSave);
            })
            .doOnNext(authority -> log.debug("Saving authority '{}' in local database", authority))
            .flatMap(authorityRepository::save)
            .then(userRepository.findOneByLogin(user.getLogin()))
            .switchIfEmpty(saveUser(user, true))
            .flatMap(existingUser -> {
                // if IdP sends last updated information, use it to determine if an update should happen
                if (details.get("updated_at") != null) {
                    Instant dbModifiedDate = existingUser.getLastModifiedDate();
                    Instant idpModifiedDate;
                    if (details.get("updated_at") instanceof Instant) {
                        idpModifiedDate = (Instant) details.get("updated_at");
                    } else {
                        idpModifiedDate = Instant.ofEpochSecond((Integer) details.get("updated_at"));
                    }
                    if (idpModifiedDate.isAfter(dbModifiedDate)) {
                        log.debug("Updating user '{}' in local database", user.getLogin());
                        return updateUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getLangKey(), user.getImageUrl());
                    }
                    // no last updated info, blindly update
                } else {
                    log.debug("Updating user '{}' in local database", user.getLogin());
                    return updateUser(user.getFirstName(), user.getLastName(), user.getEmail(), user.getLangKey(), user.getImageUrl());
                }
                return Mono.empty();
            })
            .thenReturn(user);
    }

    /**
     * Returns the user from an OAuth 2.0 login or resource server with JWT.
     * Synchronizes the user in the local repository.
     *
     * @param authToken the authentication token.
     * @return the user from the authentication.
     */
    @Transactional
    public Mono<AdminUserDTO> getUserFromAuthentication(AbstractAuthenticationToken authToken) {
        Map<String, Object> attributes;
        if (authToken instanceof OAuth2AuthenticationToken) {
            attributes = ((OAuth2AuthenticationToken) authToken).getPrincipal().getAttributes();
        } else if (authToken instanceof JwtAuthenticationToken) {
            attributes = ((JwtAuthenticationToken) authToken).getTokenAttributes();
        } else {
            throw new IllegalArgumentException("AuthenticationToken is not OAuth2 or JWT!");
        }
        User user = getUser(attributes);
        user.setAuthorities(
            authToken
                .getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .map(authority -> {
                    Authority auth = new Authority();
                    auth.setName(authority);
                    return auth;
                })
                .collect(Collectors.toSet())
        );

        return syncUserWithIdP(attributes, user).flatMap(u -> Mono.just(new AdminUserDTO(u)));
    }

    private static User getUser(Map<String, Object> details) {
        User user = new User();
        Boolean activated = Boolean.TRUE;
        String sub = String.valueOf(details.get("sub"));
        String username = null;
        if (details.get("preferred_username") != null) {
            username = ((String) details.get("preferred_username")).toLowerCase();
        }
        // handle resource server JWT, where sub claim is email and uid is ID
        if (details.get("uid") != null) {
            user.setId((String) details.get("uid"));
            user.setLogin(sub);
        } else {
            user.setId(sub);
        }
        if (username != null) {
            user.setLogin(username);
        } else if (user.getLogin() == null) {
            user.setLogin(user.getId());
        }
        if (details.get("given_name") != null) {
            user.setFirstName((String) details.get("given_name"));
        } else if (details.get("name") != null) {
            user.setFirstName((String) details.get("name"));
        }
        if (details.get("family_name") != null) {
            user.setLastName((String) details.get("family_name"));
        }
        if (details.get("email_verified") != null) {
            activated = (Boolean) details.get("email_verified");
        }
        if (details.get("email") != null) {
            user.setEmail(((String) details.get("email")).toLowerCase());
        } else if (sub.contains("|") && (username != null && username.contains("@"))) {
            // special handling for Auth0
            user.setEmail(username);
        } else {
            user.setEmail(sub);
        }
        if (details.get("langKey") != null) {
            user.setLangKey((String) details.get("langKey"));
        } else if (details.get("locale") != null) {
            // trim off country code if it exists
            String locale = (String) details.get("locale");
            if (locale.contains("_")) {
                locale = locale.substring(0, locale.indexOf('_'));
            } else if (locale.contains("-")) {
                locale = locale.substring(0, locale.indexOf('-'));
            }
            user.setLangKey(locale.toLowerCase());
        } else {
            // set langKey to default if not specified by IdP
            user.setLangKey(Constants.DEFAULT_LANGUAGE);
        }
        if (details.get("picture") != null) {
            user.setImageUrl((String) details.get("picture"));
        }
        user.setActivated(activated);
        return user;
    }
}
