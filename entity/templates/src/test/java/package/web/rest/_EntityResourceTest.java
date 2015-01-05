package <%=packageName%>.web.rest;

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %>

import javax.annotation.PostConstruct;
import javax.inject.Inject;<% if (fieldsContainLocalDate == true) { %>
import org.joda.time.LocalDate;<% } %><% if (fieldsContainDateTime == true) { %>
import org.joda.time.DateTime;
import org.joda.time.DateTimeZone;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;<% } %><% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %>
import java.util.List;

import <%=packageName%>.Application;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for the <%= entityClass %>Resource REST controller.
 *
 * @see <%= entityClass %>Resource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = Application.class)
@WebAppConfiguration
@IntegrationTest
public class <%= entityClass %>ResourceTest {<% if (fieldsContainDateTime == true) { %>

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss'Z'");<% } %>
<% for (fieldId in fields) {
    var defaultValueName = 'DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase();
    var updatedValueName = 'UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase();
    if (fields[fieldId].fieldType == 'String') { %>
    private static final String <%=defaultValueName %> = "SAMPLE_TEXT";
    private static final String <%=updatedValueName %> = "UPDATED_TEXT";<% } else if (fields[fieldId].fieldType == 'Integer') { %>

    private static final Integer <%=defaultValueName %> = 0;
    private static final Integer <%=updatedValueName %> = 1;<% } else if (fields[fieldId].fieldType == 'Long') { %>

    private static final Long <%=defaultValueName %> = 0L;
    private static final Long <%=updatedValueName %> = 1L;<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>

    private static final BigDecimal <%=defaultValueName %> = BigDecimal.ZERO;
    private static final BigDecimal <%=updatedValueName %> = BigDecimal.ONE;<% } else if (fields[fieldId].fieldType == 'LocalDate') { %>

    private static final LocalDate <%=defaultValueName %> = new LocalDate(0L);
    private static final LocalDate <%=updatedValueName %> = new LocalDate();<% } else if (fields[fieldId].fieldType == 'DateTime') { %>

    private static final DateTime <%=defaultValueName %> = new DateTime(0L, DateTimeZone.UTC);
    private static final DateTime <%=updatedValueName %> = new DateTime(DateTimeZone.UTC).withMillisOfSecond(0);
    private static final String <%=defaultValueName %>_STR = dateTimeFormatter.print(<%= defaultValueName %>);<% } else if (fields[fieldId].fieldType == 'Boolean') { %>

    private static final Boolean <%=defaultValueName %> = false;
    private static final Boolean <%=updatedValueName %> = true;<% } } %>

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;

    private MockMvc rest<%= entityClass %>MockMvc;

    private <%= entityClass %> <%= entityInstance %>;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource();
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Repository", <%= entityInstance %>Repository);
        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource).build();
    }

    @Before
    public void initTest() {<% if (databaseType == 'mongodb') { %>
        <%= entityInstance %>Repository.deleteAll();<% } %>
        <%= entityInstance %> = new <%= entityClass %>();<% for (fieldId in fields) { %>
        <%= entityInstance %>.set<%= fields[fieldId].fieldNameCapitalized %>(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } %>
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void create<%= entityClass %>() throws Exception {
        // Validate the database is empty
        assertThat(<%= entityInstance %>Repository.findAll()).hasSize(0);

        // Create the <%= entityClass %>
        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityInstance %>s")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %>)))
                .andExpect(status().isOk());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>s = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>s).hasSize(1);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstance %>s.iterator().next();<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'DateTime') { %>
        assertThat(test<%= entityClass %>.get<%=fields[fieldId].fieldNameCapitalized%>().toDateTime(DateTimeZone.UTC)).isEqualTo(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } else { %>
        assertThat(test<%= entityClass %>.get<%=fields[fieldId].fieldNameCapitalized%>()).isEqualTo(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% }} %>
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClass %>s() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get all the <%= entityInstance %>s
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityInstance %>s"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
                .andExpect(jsonPath("$.[0].id").value(<%= entityInstance %>.getId().intValue()))<% } %><% if (databaseType == 'mongodb') { %>
                .andExpect(jsonPath("$.[0].id").value(<%= entityInstance %>.getId()))<% } %><% for (fieldId in fields) {%>
                .andExpect(jsonPath("$.[0].<%=fields[fieldId].fieldName%>").value(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%><% if (fields[fieldId].fieldType == 'Integer') { %><% } else if (fields[fieldId].fieldType == 'Long') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[fieldId].fieldType == 'DateTime') { %>_STR<% } else { %>.toString()<% } %>))<% } %>;
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void get<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityInstance %>s/{id}", <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().intValue()))<% } %><% if (databaseType == 'mongodb') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId()))<% } %><% for (fieldId in fields) {%>
            .andExpect(jsonPath("$.<%=fields[fieldId].fieldName%>").value(<%='DEFAULT_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%><% if (fields[fieldId].fieldType == 'Integer') { %><% } else if (fields[fieldId].fieldType == 'Long') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[fieldId].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[fieldId].fieldType == 'DateTime') { %>_STR<% } else { %>.toString()<% } %>))<% } %>;
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void getNonExisting<%= entityClass %>() throws Exception {
        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityInstance %>s/{id}", 1L))
                .andExpect(status().isNotFound());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void update<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Update the <%= entityInstance %><% for (fieldId in fields) { %>
        <%= entityInstance %>.set<%= fields[fieldId].fieldNameCapitalized %>(<%='UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } %>
        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityInstance %>s")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %>)))
                .andExpect(status().isOk());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>s = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>s).hasSize(1);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstance %>s.iterator().next();<% for (fieldId in fields) { if (fields[fieldId].fieldType == 'DateTime') { %>
        assertThat(test<%= entityClass %>.get<%=fields[fieldId].fieldNameCapitalized%>().toDateTime(DateTimeZone.UTC)).isEqualTo(<%='UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } else { %>
        assertThat(test<%= entityClass %>.get<%=fields[fieldId].fieldNameCapitalized%>()).isEqualTo(<%='UPDATED_' + fields[fieldId].fieldNameUnderscored.toUpperCase()%>);<% } } %>
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void delete<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(delete("/api/<%= entityInstance %>s/{id}", <%= entityInstance %>.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());

        // Validate the database is empty
        List<<%= entityClass %>> <%= entityInstance %>s = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>s).hasSize(0);
    }
}
