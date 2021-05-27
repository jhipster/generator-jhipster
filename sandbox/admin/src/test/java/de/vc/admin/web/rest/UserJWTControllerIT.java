package de.vc.admin.web.rest;

import de.vc.admin.IntegrationTest;
import de.vc.admin.config.Constants;
import de.vc.admin.domain.User;
import de.vc.admin.repository.UserRepository;
import de.vc.admin.web.rest.vm.LoginVM;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link UserJWTController} REST controller.
 */
@AutoConfigureWebTestClient
@IntegrationTest
class UserJWTControllerIT {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WebTestClient webTestClient;

    @Test
    void testAuthorize() throws Exception {
        User user = new User();
        user.setLogin("user-jwt-controller");
        user.setEmail("user-jwt-controller@example.com");
        user.setActivated(true);
        user.setPassword(passwordEncoder.encode("test"));
        user.setCreatedBy(Constants.SYSTEM);

        userRepository.save(user).block();

        LoginVM login = new LoginVM();
        login.setUsername("user-jwt-controller");
        login.setPassword("test");
        webTestClient
            .post()
            .uri("/api/authenticate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .valueMatches("Authorization", "Bearer .+")
            .expectBody()
            .jsonPath("$.id_token")
            .isNotEmpty();
    }

    @Test
    void testAuthorizeWithRememberMe() throws Exception {
        User user = new User();
        user.setLogin("user-jwt-controller-remember-me");
        user.setEmail("user-jwt-controller-remember-me@example.com");
        user.setActivated(true);
        user.setPassword(passwordEncoder.encode("test"));
        user.setCreatedBy(Constants.SYSTEM);

        userRepository.save(user).block();

        LoginVM login = new LoginVM();
        login.setUsername("user-jwt-controller-remember-me");
        login.setPassword("test");
        login.setRememberMe(true);
        webTestClient
            .post()
            .uri("/api/authenticate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .valueMatches("Authorization", "Bearer .+")
            .expectBody()
            .jsonPath("$.id_token")
            .isNotEmpty();
    }

    @Test
    void testAuthorizeFails() throws Exception {
        LoginVM login = new LoginVM();
        login.setUsername("wrong-user");
        login.setPassword("wrong password");
        webTestClient
            .post()
            .uri("/api/authenticate")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(TestUtil.convertObjectToJsonBytes(login))
            .exchange()
            .expectStatus()
            .isUnauthorized()
            .expectHeader()
            .doesNotExist("Authorization")
            .expectBody()
            .jsonPath("$.id_token")
            .doesNotExist();
    }
}
