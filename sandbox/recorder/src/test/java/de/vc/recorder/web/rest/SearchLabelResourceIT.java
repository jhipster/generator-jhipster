package de.vc.recorder.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.recorder.IntegrationTest;
import de.vc.recorder.domain.SearchLabel;
import de.vc.recorder.repository.SearchLabelRepository;
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
 * Integration tests for the {@link SearchLabelResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class SearchLabelResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/search-labels";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private SearchLabelRepository searchLabelRepository;

    @Mock
    private SearchLabelRepository searchLabelRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restSearchLabelMockMvc;

    private SearchLabel searchLabel;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SearchLabel createEntity(EntityManager em) {
        SearchLabel searchLabel = new SearchLabel().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION);
        return searchLabel;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static SearchLabel createUpdatedEntity(EntityManager em) {
        SearchLabel searchLabel = new SearchLabel().name(UPDATED_NAME).description(UPDATED_DESCRIPTION);
        return searchLabel;
    }

    @BeforeEach
    public void initTest() {
        searchLabel = createEntity(em);
    }

    @Test
    @Transactional
    void createSearchLabel() throws Exception {
        int databaseSizeBeforeCreate = searchLabelRepository.findAll().size();
        // Create the SearchLabel
        restSearchLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(searchLabel)))
            .andExpect(status().isCreated());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeCreate + 1);
        SearchLabel testSearchLabel = searchLabelList.get(searchLabelList.size() - 1);
        assertThat(testSearchLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSearchLabel.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
    }

    @Test
    @Transactional
    void createSearchLabelWithExistingId() throws Exception {
        // Create the SearchLabel with an existing ID
        searchLabel.setId(1L);

        int databaseSizeBeforeCreate = searchLabelRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restSearchLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(searchLabel)))
            .andExpect(status().isBadRequest());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = searchLabelRepository.findAll().size();
        // set the field null
        searchLabel.setName(null);

        // Create the SearchLabel, which fails.

        restSearchLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(searchLabel)))
            .andExpect(status().isBadRequest());

        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllSearchLabels() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        // Get all the searchLabelList
        restSearchLabelMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(searchLabel.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSearchLabelsWithEagerRelationshipsIsEnabled() throws Exception {
        when(searchLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSearchLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(searchLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllSearchLabelsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(searchLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restSearchLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(searchLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getSearchLabel() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        // Get the searchLabel
        restSearchLabelMockMvc
            .perform(get(ENTITY_API_URL_ID, searchLabel.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(searchLabel.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION));
    }

    @Test
    @Transactional
    void getNonExistingSearchLabel() throws Exception {
        // Get the searchLabel
        restSearchLabelMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewSearchLabel() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();

        // Update the searchLabel
        SearchLabel updatedSearchLabel = searchLabelRepository.findById(searchLabel.getId()).get();
        // Disconnect from session so that the updates on updatedSearchLabel are not directly saved in db
        em.detach(updatedSearchLabel);
        updatedSearchLabel.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restSearchLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedSearchLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedSearchLabel))
            )
            .andExpect(status().isOk());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
        SearchLabel testSearchLabel = searchLabelList.get(searchLabelList.size() - 1);
        assertThat(testSearchLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSearchLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void putNonExistingSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, searchLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(searchLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(searchLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(searchLabel)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateSearchLabelWithPatch() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();

        // Update the searchLabel using partial update
        SearchLabel partialUpdatedSearchLabel = new SearchLabel();
        partialUpdatedSearchLabel.setId(searchLabel.getId());

        partialUpdatedSearchLabel.description(UPDATED_DESCRIPTION);

        restSearchLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSearchLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSearchLabel))
            )
            .andExpect(status().isOk());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
        SearchLabel testSearchLabel = searchLabelList.get(searchLabelList.size() - 1);
        assertThat(testSearchLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testSearchLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void fullUpdateSearchLabelWithPatch() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();

        // Update the searchLabel using partial update
        SearchLabel partialUpdatedSearchLabel = new SearchLabel();
        partialUpdatedSearchLabel.setId(searchLabel.getId());

        partialUpdatedSearchLabel.name(UPDATED_NAME).description(UPDATED_DESCRIPTION);

        restSearchLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedSearchLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedSearchLabel))
            )
            .andExpect(status().isOk());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
        SearchLabel testSearchLabel = searchLabelList.get(searchLabelList.size() - 1);
        assertThat(testSearchLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testSearchLabel.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void patchNonExistingSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, searchLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(searchLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(searchLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamSearchLabel() throws Exception {
        int databaseSizeBeforeUpdate = searchLabelRepository.findAll().size();
        searchLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restSearchLabelMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(searchLabel))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the SearchLabel in the database
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteSearchLabel() throws Exception {
        // Initialize the database
        searchLabelRepository.saveAndFlush(searchLabel);

        int databaseSizeBeforeDelete = searchLabelRepository.findAll().size();

        // Delete the searchLabel
        restSearchLabelMockMvc
            .perform(delete(ENTITY_API_URL_ID, searchLabel.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<SearchLabel> searchLabelList = searchLabelRepository.findAll();
        assertThat(searchLabelList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
