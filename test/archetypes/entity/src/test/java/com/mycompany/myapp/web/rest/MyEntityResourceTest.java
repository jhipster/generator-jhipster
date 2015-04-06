package com.mycompany.myapp.web.rest;

import com.mycompany.myapp.Application;
import com.mycompany.myapp.domain.MyEntity;
import com.mycompany.myapp.repository.MyEntityRepository;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.PostConstruct;
import javax.inject.Inject;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the MyEntityResource REST controller.
 *
 * @see MyEntityResource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class MyEntityResourceTest {

    private static final String DEFAULT_FIELD1 = "SAMPLE_TEXT";
    private static final String UPDATED_FIELD1 = "UPDATED_TEXT";

    @Inject
    private MyEntityRepository myEntityRepository;

    private MockMvc restMyEntityMockMvc;

    private MyEntity myEntity;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        MyEntityResource myEntityResource = new MyEntityResource();
        ReflectionTestUtils.setField(myEntityResource, "myEntityRepository", myEntityRepository);
        this.restMyEntityMockMvc = MockMvcBuilders.standaloneSetup(myEntityResource).build();
    }

    @Before
    public void initTest() {
        myEntity = new MyEntity();
        myEntity.setStringField(DEFAULT_FIELD1);
    }

    @Test
    @Transactional
    public void createMyEntity() throws Exception {
        int databaseSizeBeforeCreate = myEntityRepository.findAll().size();

        // Create the MyEntity
        restMyEntityMockMvc.perform(post("/api/myEntitys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(myEntity)))
                .andExpect(status().isCreated());

        // Validate the MyEntity in the database
        List<MyEntity> myEntitys = myEntityRepository.findAll();
        assertThat(myEntitys).hasSize(databaseSizeBeforeCreate + 1);
        MyEntity testMyEntity = myEntitys.get(myEntitys.size() - 1);
        assertThat(testMyEntity.getStringField()).isEqualTo(DEFAULT_FIELD1);
    }

    @Test
    @Transactional
    public void checkStringFieldIsRequired() throws Exception {
        // Validate the database is empty
        assertThat(myEntityRepository.findAll()).hasSize(0);
        // set the field null
        myEntity.setStringField(null);

        // Create the MyEntity, which fails.
        restMyEntityMockMvc.perform(post("/api/myEntitys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(myEntity)))
                .andExpect(status().isBadRequest());

        // Validate the database is still empty
        List<MyEntity> myEntitys = myEntityRepository.findAll();
        assertThat(myEntitys).hasSize(0);
    }

    @Test
    @Transactional
    public void getAllMyEntitys() throws Exception {
        // Initialize the database
        myEntityRepository.saveAndFlush(myEntity);

        // Get all the myEntitys
        restMyEntityMockMvc.perform(get("/api/myEntitys"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.[*].id").value(hasItem(myEntity.getId().intValue())))
                .andExpect(jsonPath("$.[*].field1").value(hasItem(DEFAULT_FIELD1.toString())));
    }

    @Test
    @Transactional
    public void getMyEntity() throws Exception {
        // Initialize the database
        myEntityRepository.saveAndFlush(myEntity);

        // Get the myEntity
        restMyEntityMockMvc.perform(get("/api/myEntitys/{id}", myEntity.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.id").value(myEntity.getId().intValue()))
            .andExpect(jsonPath("$.field1").value(DEFAULT_FIELD1.toString()));
    }

    @Test
    @Transactional
    public void getNonExistingMyEntity() throws Exception {
        // Get the myEntity
        restMyEntityMockMvc.perform(get("/api/myEntitys/{id}", Long.MAX_VALUE))
                .andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    public void updateMyEntity() throws Exception {
        // Initialize the database
        myEntityRepository.saveAndFlush(myEntity);
		
		int databaseSizeBeforeUpdate = myEntityRepository.findAll().size();

        // Update the myEntity
        myEntity.setStringField(UPDATED_FIELD1);
        restMyEntityMockMvc.perform(put("/api/myEntitys")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(myEntity)))
                .andExpect(status().isOk());

        // Validate the MyEntity in the database
        List<MyEntity> myEntitys = myEntityRepository.findAll();
        assertThat(myEntitys).hasSize(databaseSizeBeforeUpdate);
        MyEntity testMyEntity = myEntitys.get(myEntitys.size() - 1);
        assertThat(testMyEntity.getStringField()).isEqualTo(UPDATED_FIELD1);
    }

    @Test
    @Transactional
    public void deleteMyEntity() throws Exception {
        // Initialize the database
        myEntityRepository.saveAndFlush(myEntity);
		
		int databaseSizeBeforeDelete = myEntityRepository.findAll().size();

        // Get the myEntity
        restMyEntityMockMvc.perform(delete("/api/myEntitys/{id}", myEntity.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<MyEntity> myEntitys = myEntityRepository.findAll();
        assertThat(myEntitys).hasSize(databaseSizeBeforeDelete - 1);
    }
}
