package de.vc.recorder.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.recorder.IntegrationTest;
import de.vc.recorder.domain.CategoryLabel;
import de.vc.recorder.repository.CategoryLabelRepository;
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
 * Integration tests for the {@link CategoryLabelResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CategoryLabelResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_AUTHORITY_ATTACH = "AAAAAAAAAA";
    private static final String UPDATED_AUTHORITY_ATTACH = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/category-labels";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private CategoryLabelRepository categoryLabelRepository;

    @Mock
    private CategoryLabelRepository categoryLabelRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCategoryLabelMockMvc;

    private CategoryLabel categoryLabel;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoryLabel createEntity(EntityManager em) {
        CategoryLabel categoryLabel = new CategoryLabel()
            .name(DEFAULT_NAME)
            .description(DEFAULT_DESCRIPTION)
            .authorityAttach(DEFAULT_AUTHORITY_ATTACH);
        return categoryLabel;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CategoryLabel createUpdatedEntity(EntityManager em) {
        CategoryLabel categoryLabel = new CategoryLabel()
            .name(UPDATED_NAME)
            .description(UPDATED_DESCRIPTION)
            .authorityAttach(UPDATED_AUTHORITY_ATTACH);
        return categoryLabel;
    }

    @BeforeEach
    public void initTest() {
        categoryLabel = createEntity(em);
    }

    @Test
    @Transactional
    void createCategoryLabel() throws Exception {
        int databaseSizeBeforeCreate = categoryLabelRepository.findAll().size();
        // Create the CategoryLabel
        restCategoryLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isCreated());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeCreate + 1);
        CategoryLabel testCategoryLabel = categoryLabelList.get(categoryLabelList.size() - 1);
        assertThat(testCategoryLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCategoryLabel.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testCategoryLabel.getAuthorityAttach()).isEqualTo(DEFAULT_AUTHORITY_ATTACH);
    }

    @Test
    @Transactional
    void createCategoryLabelWithExistingId() throws Exception {
        // Create the CategoryLabel with an existing ID
        categoryLabel.setId(1L);

        int databaseSizeBeforeCreate = categoryLabelRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCategoryLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isBadRequest());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoryLabelRepository.findAll().size();
        // set the field null
        categoryLabel.setName(null);

        // Create the CategoryLabel, which fails.

        restCategoryLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isBadRequest());

        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkDescriptionIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoryLabelRepository.findAll().size();
        // set the field null
        categoryLabel.setDescription(null);

        // Create the CategoryLabel, which fails.

        restCategoryLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isBadRequest());

        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAuthorityAttachIsRequired() throws Exception {
        int databaseSizeBeforeTest = categoryLabelRepository.findAll().size();
        // set the field null
        categoryLabel.setAuthorityAttach(null);

        // Create the CategoryLabel, which fails.

        restCategoryLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isBadRequest());

        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCategoryLabels() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        // Get all the categoryLabelList
        restCategoryLabelMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(categoryLabel.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].authorityAttach").value(hasItem(DEFAULT_AUTHORITY_ATTACH)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCategoryLabelsWithEagerRelationshipsIsEnabled() throws Exception {
        when(categoryLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCategoryLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(categoryLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCategoryLabelsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(categoryLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCategoryLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(categoryLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getCategoryLabel() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        // Get the categoryLabel
        restCategoryLabelMockMvc
            .perform(get(ENTITY_API_URL_ID, categoryLabel.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(categoryLabel.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.authorityAttach").value(DEFAULT_AUTHORITY_ATTACH));
    }

    @Test
    @Transactional
    void getNonExistingCategoryLabel() throws Exception {
        // Get the categoryLabel
        restCategoryLabelMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewCategoryLabel() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();

        // Update the categoryLabel
        CategoryLabel updatedCategoryLabel = categoryLabelRepository.findById(categoryLabel.getId()).get();
        // Disconnect from session so that the updates on updatedCategoryLabel are not directly saved in db
        em.detach(updatedCategoryLabel);
        updatedCategoryLabel.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).authorityAttach(UPDATED_AUTHORITY_ATTACH);

        restCategoryLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedCategoryLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedCategoryLabel))
            )
            .andExpect(status().isOk());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
        CategoryLabel testCategoryLabel = categoryLabelList.get(categoryLabelList.size() - 1);
        assertThat(testCategoryLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCategoryLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testCategoryLabel.getAuthorityAttach()).isEqualTo(UPDATED_AUTHORITY_ATTACH);
    }

    @Test
    @Transactional
    void putNonExistingCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, categoryLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoryLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(categoryLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(categoryLabel)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCategoryLabelWithPatch() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();

        // Update the categoryLabel using partial update
        CategoryLabel partialUpdatedCategoryLabel = new CategoryLabel();
        partialUpdatedCategoryLabel.setId(categoryLabel.getId());

        partialUpdatedCategoryLabel.description(UPDATED_DESCRIPTION).authorityAttach(UPDATED_AUTHORITY_ATTACH);

        restCategoryLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoryLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCategoryLabel))
            )
            .andExpect(status().isOk());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
        CategoryLabel testCategoryLabel = categoryLabelList.get(categoryLabelList.size() - 1);
        assertThat(testCategoryLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testCategoryLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testCategoryLabel.getAuthorityAttach()).isEqualTo(UPDATED_AUTHORITY_ATTACH);
    }

    @Test
    @Transactional
    void fullUpdateCategoryLabelWithPatch() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();

        // Update the categoryLabel using partial update
        CategoryLabel partialUpdatedCategoryLabel = new CategoryLabel();
        partialUpdatedCategoryLabel.setId(categoryLabel.getId());

        partialUpdatedCategoryLabel.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).authorityAttach(UPDATED_AUTHORITY_ATTACH);

        restCategoryLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCategoryLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedCategoryLabel))
            )
            .andExpect(status().isOk());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
        CategoryLabel testCategoryLabel = categoryLabelList.get(categoryLabelList.size() - 1);
        assertThat(testCategoryLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testCategoryLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testCategoryLabel.getAuthorityAttach()).isEqualTo(UPDATED_AUTHORITY_ATTACH);
    }

    @Test
    @Transactional
    void patchNonExistingCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, categoryLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(categoryLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(categoryLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCategoryLabel() throws Exception {
        int databaseSizeBeforeUpdate = categoryLabelRepository.findAll().size();
        categoryLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCategoryLabelMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(categoryLabel))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CategoryLabel in the database
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCategoryLabel() throws Exception {
        // Initialize the database
        categoryLabelRepository.saveAndFlush(categoryLabel);

        int databaseSizeBeforeDelete = categoryLabelRepository.findAll().size();

        // Delete the categoryLabel
        restCategoryLabelMockMvc
            .perform(delete(ENTITY_API_URL_ID, categoryLabel.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<CategoryLabel> categoryLabelList = categoryLabelRepository.findAll();
        assertThat(categoryLabelList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
