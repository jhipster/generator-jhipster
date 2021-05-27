package de.vc.recorder.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import de.vc.recorder.IntegrationTest;
import de.vc.recorder.domain.MachineLabel;
import de.vc.recorder.repository.MachineLabelRepository;
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
 * Integration tests for the {@link MachineLabelResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class MachineLabelResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/machine-labels";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private MachineLabelRepository machineLabelRepository;

    @Mock
    private MachineLabelRepository machineLabelRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restMachineLabelMockMvc;

    private MachineLabel machineLabel;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MachineLabel createEntity(EntityManager em) {
        MachineLabel machineLabel = new MachineLabel().name(DEFAULT_NAME).value(DEFAULT_VALUE);
        return machineLabel;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MachineLabel createUpdatedEntity(EntityManager em) {
        MachineLabel machineLabel = new MachineLabel().name(UPDATED_NAME).value(UPDATED_VALUE);
        return machineLabel;
    }

    @BeforeEach
    public void initTest() {
        machineLabel = createEntity(em);
    }

    @Test
    @Transactional
    void createMachineLabel() throws Exception {
        int databaseSizeBeforeCreate = machineLabelRepository.findAll().size();
        // Create the MachineLabel
        restMachineLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(machineLabel)))
            .andExpect(status().isCreated());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeCreate + 1);
        MachineLabel testMachineLabel = machineLabelList.get(machineLabelList.size() - 1);
        assertThat(testMachineLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testMachineLabel.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    void createMachineLabelWithExistingId() throws Exception {
        // Create the MachineLabel with an existing ID
        machineLabel.setId(1L);

        int databaseSizeBeforeCreate = machineLabelRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restMachineLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(machineLabel)))
            .andExpect(status().isBadRequest());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = machineLabelRepository.findAll().size();
        // set the field null
        machineLabel.setName(null);

        // Create the MachineLabel, which fails.

        restMachineLabelMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(machineLabel)))
            .andExpect(status().isBadRequest());

        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllMachineLabels() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        // Get all the machineLabelList
        restMachineLabelMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(machineLabel.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMachineLabelsWithEagerRelationshipsIsEnabled() throws Exception {
        when(machineLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMachineLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(machineLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMachineLabelsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(machineLabelRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMachineLabelMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(machineLabelRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getMachineLabel() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        // Get the machineLabel
        restMachineLabelMockMvc
            .perform(get(ENTITY_API_URL_ID, machineLabel.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(machineLabel.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE));
    }

    @Test
    @Transactional
    void getNonExistingMachineLabel() throws Exception {
        // Get the machineLabel
        restMachineLabelMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewMachineLabel() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();

        // Update the machineLabel
        MachineLabel updatedMachineLabel = machineLabelRepository.findById(machineLabel.getId()).get();
        // Disconnect from session so that the updates on updatedMachineLabel are not directly saved in db
        em.detach(updatedMachineLabel);
        updatedMachineLabel.name(UPDATED_NAME).value(UPDATED_VALUE);

        restMachineLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedMachineLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedMachineLabel))
            )
            .andExpect(status().isOk());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
        MachineLabel testMachineLabel = machineLabelList.get(machineLabelList.size() - 1);
        assertThat(testMachineLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testMachineLabel.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    void putNonExistingMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, machineLabel.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(machineLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(machineLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(machineLabel)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateMachineLabelWithPatch() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();

        // Update the machineLabel using partial update
        MachineLabel partialUpdatedMachineLabel = new MachineLabel();
        partialUpdatedMachineLabel.setId(machineLabel.getId());

        restMachineLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMachineLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedMachineLabel))
            )
            .andExpect(status().isOk());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
        MachineLabel testMachineLabel = machineLabelList.get(machineLabelList.size() - 1);
        assertThat(testMachineLabel.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testMachineLabel.getValue()).isEqualTo(DEFAULT_VALUE);
    }

    @Test
    @Transactional
    void fullUpdateMachineLabelWithPatch() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();

        // Update the machineLabel using partial update
        MachineLabel partialUpdatedMachineLabel = new MachineLabel();
        partialUpdatedMachineLabel.setId(machineLabel.getId());

        partialUpdatedMachineLabel.name(UPDATED_NAME).value(UPDATED_VALUE);

        restMachineLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMachineLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedMachineLabel))
            )
            .andExpect(status().isOk());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
        MachineLabel testMachineLabel = machineLabelList.get(machineLabelList.size() - 1);
        assertThat(testMachineLabel.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testMachineLabel.getValue()).isEqualTo(UPDATED_VALUE);
    }

    @Test
    @Transactional
    void patchNonExistingMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, machineLabel.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(machineLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(machineLabel))
            )
            .andExpect(status().isBadRequest());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMachineLabel() throws Exception {
        int databaseSizeBeforeUpdate = machineLabelRepository.findAll().size();
        machineLabel.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMachineLabelMockMvc
            .perform(
                patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(machineLabel))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MachineLabel in the database
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteMachineLabel() throws Exception {
        // Initialize the database
        machineLabelRepository.saveAndFlush(machineLabel);

        int databaseSizeBeforeDelete = machineLabelRepository.findAll().size();

        // Delete the machineLabel
        restMachineLabelMockMvc
            .perform(delete(ENTITY_API_URL_ID, machineLabel.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<MachineLabel> machineLabelList = machineLabelRepository.findAll();
        assertThat(machineLabelList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
