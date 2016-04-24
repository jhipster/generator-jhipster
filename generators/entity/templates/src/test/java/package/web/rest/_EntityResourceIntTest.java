package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;
import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (service != 'no') { %>
import <%=packageName%>.service.<%= entityClass %>Service;<% } if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } if (dto == 'mapstruct') { %>
import <%=packageName%>.web.rest.dto.<%= entityClass %>DTO;
import <%=packageName%>.web.rest.mapper.<%= entityClass %>Mapper;<% } %>

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.IntegrationTest;
import org.springframework.boot.test.SpringApplicationConfiguration;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.context.junit4.SpringJUnit4ClassRunner;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %><% if (fieldsContainBlob == true) { %>
import org.springframework.util.Base64Utils;<% } %>

import javax.annotation.PostConstruct;
import javax.inject.Inject;<% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;<% } %><% if (fieldsContainLocalDate == true || fieldsContainZonedDateTime == true) { %>
import java.time.ZoneId;<% } %><% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainDate == true) { %>
import java.util.Date;<% } %>
import java.util.List;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

<% for (idx in fields) { if (fields[idx].fieldIsEnum == true) { %>import <%=packageName%>.domain.enumeration.<%= fields[idx].fieldType %>;
<% } } %>
/**
 * Test class for the <%= entityClass %>Resource REST controller.
 *
 * @see <%= entityClass %>Resource
 */
@RunWith(SpringJUnit4ClassRunner.class)
@SpringApplicationConfiguration(classes = <%= mainClass %>.class)
@WebAppConfiguration
@IntegrationTest
public class <%= entityClass %>ResourceIntTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{<% if (fieldsContainZonedDateTime == true) { %>

    private static final DateTimeFormatter dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'").withZone(ZoneId.of("Z"));<% } %>
<% for (idx in fields) {
    var defaultValueName = 'DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase();
    var updatedValueName = 'UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase();

    var defaultValue = 1;
    var updatedValue = 2;

    if (fields[idx].fieldValidate == true) {
        if (fields[idx].fieldValidateRules.indexOf('max') != -1) {
            defaultValue = fields[idx].fieldValidateRulesMax;
            updatedValue = parseInt(fields[idx].fieldValidateRulesMax) - 1;
        }
        if (fields[idx].fieldValidateRules.indexOf('min') != -1) {
            defaultValue = fields[idx].fieldValidateRulesMin;
            updatedValue = parseInt(fields[idx].fieldValidateRulesMin) + 1;
        }
        if (fields[idx].fieldValidateRules.indexOf('minbytes') != -1) {
            defaultValue = fields[idx].fieldValidateRulesMinbytes;
            updatedValue = fields[idx].fieldValidateRulesMinbytes;
        }
        if (fields[idx].fieldValidateRules.indexOf('maxbytes') != -1) {
            updatedValue = fields[idx].fieldValidateRulesMaxbytes;
        }
    }

    var fieldType = fields[idx].fieldType;
    var fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
    var isEnum = fields[idx].fieldIsEnum;
    var enumValue1;
    var enumValue2;
    if (isEnum) {
        var values = fields[idx].fieldValues.replace(/\s/g, '').split(',');
        enumValue1 = values[0];
        if (values.length > 1) {
            enumValue2 = values[1];
        } else {
            enumValue2 = enumValue1;
        }
    }

    if (fieldType == 'String') {
        // Generate Strings, using the min and max string length if they are configured
        var sampleTextString = "";
        var updatedTextString = "";
        var sampleTextMinLength = fields[idx].fieldValidateRulesMinlength;
        if (sampleTextMinLength == undefined) {
            sampleTextMinLength = fields[idx].fieldValidateRulesMaxlength;
            if (sampleTextMinLength == undefined) {
                sampleTextMinLength = 5;
            }
        }
        for( var i = 0; i < sampleTextMinLength; i++ ) {
            sampleTextString += "A";
            updatedTextString += "B";
        }
        %>
    private static final String <%=defaultValueName %> = "<%=sampleTextString %>";
    private static final String <%=updatedValueName %> = "<%=updatedTextString %>";<% } else if (fieldType == 'Integer') { %>

    private static final Integer <%=defaultValueName %> = <%= defaultValue %>;
    private static final Integer <%=updatedValueName %> = <%= updatedValue %>;<% } else if (fieldType == 'Long') { %>

    private static final Long <%=defaultValueName %> = <%= defaultValue %>L;
    private static final Long <%=updatedValueName %> = <%= updatedValue %>L;<% } else if (fieldType == 'Float') { %>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>F;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>F;<% } else if (fieldType == 'Double') { %>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>D;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>D;<% } else if (fieldType == 'BigDecimal') { %>

    private static final BigDecimal <%=defaultValueName %> = new BigDecimal(<%= defaultValue %>);
    private static final BigDecimal <%=updatedValueName %> = new BigDecimal(<%= updatedValue %>);<% } else if (fieldType == 'UUID') { %>

    private static final UUID <%=defaultValueName %> = UUID.randomUUID();
    private static final UUID <%=updatedValueName %> = UUID.randomUUID();<% } else if (fieldType == 'Date') { %>

    private static final Date <%=defaultValueName %> = new Date();
    private static final Date <%=updatedValueName %> = new Date();<% } else if (fieldType == 'LocalDate') { %>

    private static final LocalDate <%=defaultValueName %> = LocalDate.ofEpochDay(0L);
    private static final LocalDate <%=updatedValueName %> = LocalDate.now(ZoneId.systemDefault());<% } else if (fieldType == 'ZonedDateTime') { %>

    private static final ZonedDateTime <%=defaultValueName %> = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneId.systemDefault());
    private static final ZonedDateTime <%=updatedValueName %> = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final String <%=defaultValueName %>_STR = dateTimeFormatter.format(<%= defaultValueName %>);<% } else if (fieldType == 'Boolean') { %>

    private static final Boolean <%=defaultValueName %> = false;
    private static final Boolean <%=updatedValueName %> = true;<% } else if (fieldType == 'byte[]' && fieldTypeBlobContent != 'text') { %>

    private static final byte[] <%=defaultValueName %> = TestUtil.createByteArray(<%= defaultValue %>, "0");
    private static final byte[] <%=updatedValueName %> = TestUtil.createByteArray(<%= updatedValue %>, "1");
    private static final String <%=defaultValueName %>_CONTENT_TYPE = "image/jpg";
    private static final String <%=updatedValueName %>_CONTENT_TYPE = "image/png";<% } else if (fieldTypeBlobContent == 'text') { %>

    private static final String <%=defaultValueName %> = "<%=sampleTextString %>";
    private static final String <%=updatedValueName %> = "<%=updatedTextString %>";<% } else if (isEnum) { %>

    private static final <%=fieldType %> <%=defaultValueName %> = <%=fieldType %>.<%=enumValue1 %>;
    private static final <%=fieldType %> <%=updatedValueName %> = <%=fieldType %>.<%=enumValue2 %>;<% } } %>

    @Inject
    private <%= entityClass %>Repository <%= entityInstance %>Repository;<% if (dto == 'mapstruct') { %>

    @Inject
    private <%= entityClass %>Mapper <%= entityInstance %>Mapper;<% } if (service != 'no') { %>

    @Inject
    private <%= entityClass %>Service <%= entityInstance %>Service;<% } if (searchEngine == 'elasticsearch') { %>

    @Inject
    private <%= entityClass %>SearchRepository <%= entityInstance %>SearchRepository;<% } %>

    @Inject
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Inject
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    private MockMvc rest<%= entityClass %>MockMvc;

    private <%= entityClass %> <%= entityInstance %>;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource();<% if (service != 'no') { %>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Service", <%= entityInstance %>Service);<% } else { if (searchEngine == 'elasticsearch') { %>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>SearchRepository", <%= entityInstance %>SearchRepository);<% } %>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Repository", <%= entityInstance %>Repository);<% } if (dto == 'mapstruct') { %>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Mapper", <%= entityInstance %>Mapper);<% } %>
        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    @Before
    public void initTest() {<% if (databaseType == 'mongodb' || databaseType == 'cassandra') { %>
        <%= entityInstance %>Repository.deleteAll();<% } if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.deleteAll();<% } %>
        <%= entityInstance %> = new <%= entityClass %>();
        <%_ for (idx in fields) { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
            <%_ if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
            <%_ } _%>
        <%_ } _%>
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void create<%= entityClass %>() throws Exception {
        int databaseSizeBeforeCreate = <%= entityInstance %>Repository.findAll().size();

        // Create the <%= entityClass %><% if (dto == 'mapstruct') { %>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(<%= entityInstance %>);<% } %>

        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityApiUrl %>")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto == 'mapstruct') { %>DTO<% } %>)))
                .andExpect(status().isCreated());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstancePlural %> = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstancePlural %>).hasSize(databaseSizeBeforeCreate + 1);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstancePlural %>.get(<%= entityInstancePlural %>.size() - 1);
        <%_ for (idx in fields) { if (fields[idx].fieldType == 'ZonedDateTime') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>ContentType()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
        <%_ } else if (fields[idx].fieldType.toLowerCase() == 'boolean') { _%>
        assertThat(test<%= entityClass %>.is<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ }} if (searchEngine == 'elasticsearch') { _%>

        // Validate the <%= entityClass %> in ElasticSearch
        <%= entityClass %> <%= entityInstance %>Es = <%= entityInstance %>SearchRepository.findOne(test<%= entityClass %>.getId());
        assertThat(<%= entityInstance %>Es).isEqualToComparingFieldByField(test<%= entityClass %>);
        <%_ } _%>
    }
<% for (idx in fields) { %><% if (fields[idx].fieldValidate == true) {
    var required = false;
    if (fields[idx].fieldValidate == true && fields[idx].fieldValidateRules.indexOf('required') != -1) {
        required = true;
    }
    if (required) { %>
    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void check<%= fields[idx].fieldInJavaBeanMethod %>IsRequired() throws Exception {
        int databaseSizeBeforeTest = <%= entityInstance %>Repository.findAll().size();
        // set the field null
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>(null);

        // Create the <%= entityClass %>, which fails.<% if (dto == 'mapstruct') { %>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(<%= entityInstance %>);<% } %>

        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityApiUrl %>")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto == 'mapstruct') { %>DTO<% } %>)))
                .andExpect(status().isBadRequest());

        List<<%= entityClass %>> <%= entityInstancePlural %> = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstancePlural %>).hasSize(databaseSizeBeforeTest);
    }
<%  } } } %>
    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get all the <%= entityInstancePlural %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>?sort=id,desc"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType == 'mongodb') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType == 'cassandra') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
                <%_ if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
                .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
                <%_ } _%>
                .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else if (fields[idx].fieldType == 'Date') { %>.getTime()<% } else { %>.toString()<% } %>)))<% } %>;
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void get<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>/{id}", <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().intValue()))<% } %><% if (databaseType == 'mongodb') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId()))<% } %><% if (databaseType == 'cassandra') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().toString()))<% } %><% for (idx in fields) {%>
            <%_ if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>ContentType").value(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE))
            <%_ } _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>").value(<% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else if (fields[idx].fieldType == 'Date') { %>.getTime()<% } else { %>.toString()<% } %>))<% } %>;
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void getNonExisting<%= entityClass %>() throws Exception {
        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>/{id}", <% if (databaseType == 'sql' || databaseType == 'mongodb') { %>Long.MAX_VALUE<% } %><% if (databaseType == 'cassandra') { %>UUID.randomUUID().toString()<% } %>))
                .andExpect(status().isNotFound());
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void update<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service != 'no' && dto != 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);<%_ } _%>
<%_ } _%>

        int databaseSizeBeforeUpdate = <%= entityInstance %>Repository.findAll().size();

        // Update the <%= entityInstance %>
        <%= entityClass %> updated<%= entityClass %> = new <%= entityClass %>();
        updated<%= entityClass %>.setId(<%= entityInstance %>.getId());
        <%_ for (idx in fields) { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
            <%_ if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
            <%_ } _%>
        <%_ } _%>
        <%_ if (dto == 'mapstruct') { _%>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.<%= entityInstance %>To<%= entityClass %>DTO(updated<%= entityClass %>);
        <%_ } _%>

        rest<%= entityClass %>MockMvc.perform(put("/api/<%= entityApiUrl %>")
                .contentType(TestUtil.APPLICATION_JSON_UTF8)
                .content(TestUtil.convertObjectToJsonBytes(<% if (dto == 'mapstruct') { %><%= entityInstance %>DTO<% } else { %>updated<%= entityClass %><% } %>)))
                .andExpect(status().isOk());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstancePlural %> = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstancePlural %>).hasSize(databaseSizeBeforeUpdate);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstancePlural %>.get(<%= entityInstancePlural %>.size() - 1);
        <%_ for (idx in fields) { if (fields[idx].fieldType == 'ZonedDateTime') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>ContentType()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
        <%_ } else if (fields[idx].fieldType.toLowerCase() == 'boolean') { _%>
        assertThat(test<%= entityClass %>.is<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } } if (searchEngine == 'elasticsearch') { _%>

        // Validate the <%= entityClass %> in ElasticSearch
        <%= entityClass %> <%= entityInstance %>Es = <%= entityInstance %>SearchRepository.findOne(test<%= entityClass %>.getId());
        assertThat(<%= entityInstance %>Es).isEqualToComparingFieldByField(test<%= entityClass %>);
        <%_ } _%>
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void delete<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service != 'no' && dto != 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);<% if (searchEngine == 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);<%_ } _%>
<%_ } _%>

        int databaseSizeBeforeDelete = <%= entityInstance %>Repository.findAll().size();

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(delete("/api/<%= entityApiUrl %>/{id}", <%= entityInstance %>.getId())
                .accept(TestUtil.APPLICATION_JSON_UTF8))
                .andExpect(status().isOk());<% if (searchEngine == 'elasticsearch') { %>

        // Validate ElasticSearch is empty
        boolean <%= entityInstance %>ExistsInEs = <%= entityInstance %>SearchRepository.exists(<%= entityInstance %>.getId());
        assertThat(<%= entityInstance %>ExistsInEs).isFalse();<% } %>

        // Validate the database is empty
        List<<%= entityClass %>> <%= entityInstancePlural %> = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstancePlural %>).hasSize(databaseSizeBeforeDelete - 1);
    }<% if (searchEngine == 'elasticsearch') { %>

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void search<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service != 'no' && dto != 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);
<%_ } _%>

        // Search the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/_search/<%= entityApiUrl %>?query=id:" + <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))<% if (databaseType == 'sql') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType == 'mongodb') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType == 'cassandra') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
            <%_ if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if (fields[idx].fieldType == 'byte[]' && fields[idx].fieldTypeBlobContent != 'text') { %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else if (fields[idx].fieldType == 'Date') { %>.getTime()<% } else { %>.toString()<% } %>)))<% } %>;
    }<% } %>
}
