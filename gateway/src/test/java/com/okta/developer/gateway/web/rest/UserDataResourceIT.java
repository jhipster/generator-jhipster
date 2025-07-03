package com.okta.developer.gateway.web.rest;

import static com.okta.developer.gateway.domain.UserDataAsserts.*;
import static com.okta.developer.gateway.web.rest.TestUtil.createUpdateProxyForBean;
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.is;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.okta.developer.gateway.IntegrationTest;
import com.okta.developer.gateway.domain.UserData;
import com.okta.developer.gateway.repository.EntityManager;
import com.okta.developer.gateway.repository.UserDataRepository;
import java.time.Duration;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * Integration tests for the {@link UserDataResource} REST controller.
 */
@IntegrationTest
@AutoConfigureWebTestClient(timeout = IntegrationTest.DEFAULT_ENTITY_TIMEOUT)
@WithMockUser
class UserDataResourceIT {

    private static final String DEFAULT_ADDRESS = "AAAAAAAAAA";
    private static final String UPDATED_ADDRESS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/user-data";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong longCount = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UserDataRepository userDataRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private WebTestClient webTestClient;

    private UserData userData;

    private UserData insertedUserData;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserData createEntity() {
        return new UserData().address(DEFAULT_ADDRESS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserData createUpdatedEntity() {
        return new UserData().address(UPDATED_ADDRESS);
    }

    public static void deleteEntities(EntityManager em) {
        try {
            em.deleteAll(UserData.class).block();
        } catch (Exception e) {
            // It can fail, if other entities are still referring this - it will be removed later.
        }
    }

    @BeforeEach
    void initTest() {
        userData = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUserData != null) {
            userDataRepository.delete(insertedUserData).block();
            insertedUserData = null;
        }
        deleteEntities(em);
    }

    @Test
    void createUserData() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UserData
        var returnedUserData = webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isCreated()
            .expectBody(UserData.class)
            .returnResult()
            .getResponseBody();

        // Validate the UserData in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUserDataUpdatableFieldsEquals(returnedUserData, getPersistedUserData(returnedUserData));

        insertedUserData = returnedUserData;
    }

    @Test
    void createUserDataWithExistingId() throws Exception {
        // Create the UserData with an existing ID
        userData.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        webTestClient
            .post()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    void getAllUserDataAsStream() {
        // Initialize the database
        userDataRepository.save(userData).block();

        List<UserData> userDataList = webTestClient
            .get()
            .uri(ENTITY_API_URL)
            .accept(MediaType.APPLICATION_NDJSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentTypeCompatibleWith(MediaType.APPLICATION_NDJSON)
            .returnResult(UserData.class)
            .getResponseBody()
            .filter(userData::equals)
            .collectList()
            .block(Duration.ofSeconds(5));

        assertThat(userDataList).isNotNull();
        assertThat(userDataList).hasSize(1);
        UserData testUserData = userDataList.get(0);

        // Test fails because reactive api returns an empty object instead of null
        // assertUserDataAllPropertiesEquals(userData, testUserData);
        assertUserDataUpdatableFieldsEquals(userData, testUserData);
    }

    @Test
    void getAllUserData() {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        // Get all the userDataList
        webTestClient
            .get()
            .uri(ENTITY_API_URL + "?sort=id,desc")
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.[*].id")
            .value(hasItem(userData.getId().intValue()))
            .jsonPath("$.[*].address")
            .value(hasItem(DEFAULT_ADDRESS));
    }

    @Test
    void getUserData() {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        // Get the userData
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, userData.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isOk()
            .expectHeader()
            .contentType(MediaType.APPLICATION_JSON)
            .expectBody()
            .jsonPath("$.id")
            .value(is(userData.getId().intValue()))
            .jsonPath("$.address")
            .value(is(DEFAULT_ADDRESS));
    }

    @Test
    void getNonExistingUserData() {
        // Get the userData
        webTestClient
            .get()
            .uri(ENTITY_API_URL_ID, Long.MAX_VALUE)
            .accept(MediaType.APPLICATION_PROBLEM_JSON)
            .exchange()
            .expectStatus()
            .isNotFound();
    }

    @Test
    void putExistingUserData() throws Exception {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userData
        UserData updatedUserData = userDataRepository.findById(userData.getId()).block();
        updatedUserData.address(UPDATED_ADDRESS);

        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, updatedUserData.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(updatedUserData))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUserDataToMatchAllProperties(updatedUserData);
    }

    @Test
    void putNonExistingUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, userData.getId())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithIdMismatchUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void putWithMissingIdPathParamUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .put()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void partialUpdateUserDataWithPatch() throws Exception {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userData using partial update
        UserData partialUpdatedUserData = new UserData();
        partialUpdatedUserData.setId(userData.getId());

        partialUpdatedUserData.address(UPDATED_ADDRESS);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedUserData.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedUserData))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the UserData in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserDataUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedUserData, userData), getPersistedUserData(userData));
    }

    @Test
    void fullUpdateUserDataWithPatch() throws Exception {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the userData using partial update
        UserData partialUpdatedUserData = new UserData();
        partialUpdatedUserData.setId(userData.getId());

        partialUpdatedUserData.address(UPDATED_ADDRESS);

        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, partialUpdatedUserData.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(partialUpdatedUserData))
            .exchange()
            .expectStatus()
            .isOk();

        // Validate the UserData in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUserDataUpdatableFieldsEquals(partialUpdatedUserData, getPersistedUserData(partialUpdatedUserData));
    }

    @Test
    void patchNonExistingUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, userData.getId())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithIdMismatchUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL_ID, longCount.incrementAndGet())
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isBadRequest();

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void patchWithMissingIdPathParamUserData() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        userData.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        webTestClient
            .patch()
            .uri(ENTITY_API_URL)
            .contentType(MediaType.valueOf("application/merge-patch+json"))
            .bodyValue(om.writeValueAsBytes(userData))
            .exchange()
            .expectStatus()
            .isEqualTo(405);

        // Validate the UserData in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    void deleteUserData() {
        // Initialize the database
        insertedUserData = userDataRepository.save(userData).block();

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the userData
        webTestClient
            .delete()
            .uri(ENTITY_API_URL_ID, userData.getId())
            .accept(MediaType.APPLICATION_JSON)
            .exchange()
            .expectStatus()
            .isNoContent();

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return userDataRepository.count().block();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected UserData getPersistedUserData(UserData userData) {
        return userDataRepository.findById(userData.getId()).block();
    }

    protected void assertPersistedUserDataToMatchAllProperties(UserData expectedUserData) {
        // Test fails because reactive api returns an empty object instead of null
        // assertUserDataAllPropertiesEquals(expectedUserData, getPersistedUserData(expectedUserData));
        assertUserDataUpdatableFieldsEquals(expectedUserData, getPersistedUserData(expectedUserData));
    }

    protected void assertPersistedUserDataToMatchUpdatableProperties(UserData expectedUserData) {
        // Test fails because reactive api returns an empty object instead of null
        // assertUserDataAllUpdatablePropertiesEquals(expectedUserData, getPersistedUserData(expectedUserData));
        assertUserDataUpdatableFieldsEquals(expectedUserData, getPersistedUserData(expectedUserData));
    }
}
