package <%=packageName%>.web.rest;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import javax.inject.Inject;<% if (fieldsContainLocalDate == true) { %>
import org.joda.time.LocalDate;<% } %><% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %>

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
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
public class <%= entityClass %>ResourceTest {
    <% if (databaseType == 'sql') { %>
    private static final Long DEFAULT_ID = new Long(1L);<% } %><% if (databaseType == 'nosql') { %>
    private static final String DEFAULT_ID = "1";<% } %>
    <% for (fieldId in fields) {
      var defaultValueName = 'DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase();
      var updatedValueName = 'UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase();
      if (fields[fieldId].fieldType == 'String') { %>
    private static final String <%=defaultValueName %> = "SAMPLE_TEXT";
    private static final String <%=updatedValueName %> = "UPDATED_TEXT";
        <% } else if (fields[fieldId].fieldType == 'Integer') { %>
    private static final Integer <%=defaultValueName %> = 0;
    private static final Integer <%=updatedValueName %> = 1;
        <% } else if (fields[fieldId].fieldType == 'Long') { %>
    private static final Long <%=defaultValueName %> = 0L;
    private static final Long <%=updatedValueName %> = 1L;
        <% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>
    private static final BigDecimal <%=defaultValueName %> = BigDecimal.ZERO;
    private static final BigDecimal <%=updatedValueName %> = BigDecimal.ONE;
        <% } else if (fields[fieldId].fieldType == 'LocalDate') { %>
    private static final LocalDate <%=defaultValueName %> = new LocalDate(0L);
    private static final LocalDate <%=updatedValueName %> = new LocalDate();
        <% } else if (fields[fieldId].fieldType == 'Boolean') { %>
    private static final Boolean <%=defaultValueName %> = false;
    private static final Boolean <%=updatedValueName %> = true;<% } } %>
    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    private MockMvc rest<%= entityClass %>MockMvc;

    private <%= entityClass %> <%= entityInstance %>;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource();
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Repository", <%= entityInstance %>Repository);

        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource).build();

        <%= entityInstance %> = new <%= entityClass %>();
        <%= entityInstance %>.setId(DEFAULT_ID);
<% for (fieldId in fields) { %>
        <%= entityInstance %>.set<%= fields[fieldId].fieldNameCapitalized %>(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } %>
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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
                .andExpect(jsonPath("$.id").value(DEFAULT_ID.intValue()))<% } %><% if (databaseType == 'nosql') { %>
                .andExpect(jsonPath("$.id").value(DEFAULT_ID))<% } %><% for (fieldId in fields) {%>
                .andExpect(jsonPath("$.<%=fields[fieldId].fieldName%>").value(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%><% if (fields[fieldId].fieldType == 'Integer') { %><% } else if (fields[fieldId].fieldType == 'Long') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>.doubleValue()<% } else if (fields[fieldId].fieldType == 'Boolean') { %>.booleanValue()<% } else { %>.toString()<% } %>))<% } %>;

        // Update <%= entityClass %><% for (fieldId in fields) {%>
        <%= entityInstance %>.set<%= fields[fieldId].fieldNameCapitalized %>(<%='UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } %>

        rest<%= entityClass %>MockMvc.perform(post("/app/rest/<%= entityInstance %>s")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %>)))
                .andExpect(status().isOk());

        // Read updated <%= entityClass %>
        rest<%= entityClass %>MockMvc.perform(get("/app/rest/<%= entityInstance %>s/{id}", DEFAULT_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
                .andExpect(jsonPath("$.id").value(DEFAULT_ID.intValue()))<% } %><% if (databaseType == 'nosql') { %>
                .andExpect(jsonPath("$.id").value(DEFAULT_ID))<% } %><% for (fieldId in fields) {%>
                .andExpect(jsonPath("$.<%=fields[fieldId].fieldName%>").value(<%='UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%><% if (fields[fieldId].fieldType == 'Integer') { %><% } else if (fields[fieldId].fieldType == 'Long') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>.doubleValue()<% } else if (fields[fieldId].fieldType == 'Boolean') { %>.booleanValue()<% } else { %>.toString()<% } %>))<% } %>;

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
