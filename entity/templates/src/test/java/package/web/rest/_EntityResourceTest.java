package <%=packageName%>.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.inject.Inject;

import org.joda.time.LocalDate;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListeners;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.support.DependencyInjectionTestExecutionListener;
import org.springframework.test.context.support.DirtiesContextTestExecutionListener;
import org.springframework.test.context.transaction.TransactionalTestExecutionListener;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import <%=packageName%>.Application;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;


/**
 * Test class for the <%= entityClass %>Resource REST controller.
 *
 * @see <%= entityClass %>Resource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@TestExecutionListeners({ DependencyInjectionTestExecutionListener.class,
    DirtiesContextTestExecutionListener.class,
    TransactionalTestExecutionListener.class })
@ActiveProfiles("dev")
public class <%= entityClass %>ResourceTest {
	
	private static final Long DEFAULT_ID = new Long(1L);
	private static final LocalDate DEFAULT_SAMPLE_DATE_ATTR = new LocalDate(0L);
	private static final LocalDate UPD_SAMPLE_DATE_ATTR = new LocalDate();
	private static final String DEFAULT_SAMPLE_TEXT_ATTR = "sampleTextAttribute";
	private static final String UPD_SAMPLE_TEXT_ATTR = "sampleTextAttributeUpt";

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    private MockMvc rest<%= entityClass %>MockMvc;
    
    private <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource();
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Repository", <%= entityInstance %>Repository);

        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource).build();

        <%= entityInstance %>.setId(DEFAULT_ID);
    	<%= entityInstance %>.setSampleDateAttribute(DEFAULT_SAMPLE_DATE_ATTR);
    	<%= entityInstance %>.setSampleTextAttribute(DEFAULT_SAMPLE_TEXT_ATTR);
    }

    @Test
    public void testCRUD<%= entityClass %>() throws Exception {

    	// Create <%= entityClass %>
    	rest<%= entityClass %>MockMvc.perform(post("/app/rest/<%= entityInstance %>s")
    			.contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %>)))
                .andExpect(status().isOk());

    	// Read <%= entityClass %>
    	rest<%= entityClass %>MockMvc.perform(get("/app/rest/<%= entityInstance %>s/{id}", DEFAULT_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(DEFAULT_ID.intValue()))
    			.andExpect(jsonPath("$.sampleDateAttribute").value(DEFAULT_SAMPLE_DATE_ATTR.toString()))
    			.andExpect(jsonPath("$.sampleTextAttribute").value(DEFAULT_SAMPLE_TEXT_ATTR));

    	// Update <%= entityClass %>
    	<%= entityInstance %>.setSampleDateAttribute(UPD_SAMPLE_DATE_ATTR);
    	<%= entityInstance %>.setSampleTextAttribute(UPD_SAMPLE_TEXT_ATTR);
  
    	rest<%= entityClass %>MockMvc.perform(post("/app/rest/<%= entityInstance %>s")
    			.contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %>)))
                .andExpect(status().isOk());

    	// Read updated <%= entityClass %>
    	rest<%= entityClass %>MockMvc.perform(get("/app/rest/<%= entityInstance %>s/{id}", DEFAULT_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(DEFAULT_ID.intValue()))
    			.andExpect(jsonPath("$.sampleDateAttribute").value(UPD_SAMPLE_DATE_ATTR.toString()))
    			.andExpect(jsonPath("$.sampleTextAttribute").value(UPD_SAMPLE_TEXT_ATTR));

    	// Delete <%= entityClass %>
    	rest<%= entityClass %>MockMvc.perform(delete("/app/rest/<%= entityInstance %>s/{id}", DEFAULT_ID)
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

    	// Read nonexisting <%= entityClass %>
    	rest<%= entityClass %>MockMvc.perform(get("/app/rest/<%= entityInstance %>s/{id}", DEFAULT_ID)
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isNotFound());
    }

}
