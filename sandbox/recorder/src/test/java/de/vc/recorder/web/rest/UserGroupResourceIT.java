package de.vc.recorder.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.recorder.IntegrationTest;
import de.vc.recorder.domain.UserGroup;
import de.vc.recorder.repository.UserGroupRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link UserGroupResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class UserGroupResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/user-groups";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private UserGroupRepository userGroupRepository;

    @Mock
    private UserGroupRepository userGroupRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUserGroupMockMvc;

    private UserGroup userGroup;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserGroup createEntity(EntityManager em) {
        UserGroup userGroup = new UserGroup().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return userGroup;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UserGroup createUpdatedEntity(EntityManager em) {
        UserGroup userGroup = new UserGroup().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return userGroup;
    }

    @BeforeEach
    public void initTest() {
        userGroup = createEntity(em);
    }

    @Test
    @Transactional
    void createUserGroup() throws Exception {
        int databaseSizeBeforeCreate = userGroupRepository.findAll().size();
        // Create the UserGroup
        restUserGroupMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userGroup)))
            .andExpect(status().isCreated());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeCreate + 1);
        UserGroup testUserGroup = userGroupList.get(userGroupList.size() - 1);
        assertThat(testUserGroup.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testUserGroup.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createUserGroupWithExistingId() throws Exception {
        // Create the UserGroup with an existing ID
        userGroup.setId(1L);

        int databaseSizeBeforeCreate = userGroupRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUserGroupMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userGroup)))
            .andExpect(status().isBadRequest());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = userGroupRepository.findAll().size();
        // set the field null
        userGroup.setName(null);

        // Create the UserGroup, which fails.

        restUserGroupMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userGroup)))
            .andExpect(status().isBadRequest());

        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUserGroups() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        // Get all the userGroupList
        restUserGroupMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(userGroup.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUserGroupsWithEagerRelationshipsIsEnabled() throws Exception {
        when(userGroupRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUserGroupMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(userGroupRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUserGroupsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(userGroupRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUserGroupMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(userGroupRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getUserGroup() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        // Get the userGroup
        restUserGroupMockMvc
            .perform(get(ENTITY_API_URL_ID, userGroup.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(userGroup.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingUserGroup() throws Exception {
        // Get the userGroup
        restUserGroupMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewUserGroup() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();

        // Update the userGroup
        UserGroup updatedUserGroup = userGroupRepository.findById(userGroup.getId()).get();
        // Disconnect from session so that the updates on updatedUserGroup are not directly saved in db
        em.detach(updatedUserGroup);
        updatedUserGroup.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restUserGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUserGroup.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedUserGroup))
            )
            .andExpect(status().isOk());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
        UserGroup testUserGroup = userGroupList.get(userGroupList.size() - 1);
        assertThat(testUserGroup.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testUserGroup.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, userGroup.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(userGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(userGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(userGroup)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUserGroupWithPatch() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();

        // Update the userGroup using partial update
        UserGroup partialUpdatedUserGroup = new UserGroup();
        partialUpdatedUserGroup.setId(userGroup.getId());

        partialUpdatedUserGroup.description(UPDATED_DESCRIPTION);

        restUserGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedUserGroup))
            )
            .andExpect(status().isOk());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
        UserGroup testUserGroup = userGroupList.get(userGroupList.size() - 1);
        assertThat(testUserGroup.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testUserGroup.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateUserGroupWithPatch() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();

        // Update the userGroup using partial update
        UserGroup partialUpdatedUserGroup = new UserGroup();
        partialUpdatedUserGroup.setId(userGroup.getId());

        partialUpdatedUserGroup.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restUserGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUserGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedUserGroup))
            )
            .andExpect(status().isOk());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
        UserGroup testUserGroup = userGroupList.get(userGroupList.size() - 1);
        assertThat(testUserGroup.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testUserGroup.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, userGroup.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(userGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(userGroup))
            )
            .andExpect(status().isBadRequest());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUserGroup() throws Exception {
        int databaseSizeBeforeUpdate = userGroupRepository.findAll().size();
        userGroup.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUserGroupMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(userGroup))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UserGroup in the database
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUserGroup() throws Exception {
        // Initialize the database
        userGroupRepository.saveAndFlush(userGroup);

        int databaseSizeBeforeDelete = userGroupRepository.findAll().size();

        // Delete the userGroup
        restUserGroupMockMvc
            .perform(delete(ENTITY_API_URL_ID, userGroup.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<UserGroup> userGroupList = userGroupRepository.findAll();
        assertThat(userGroupList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
