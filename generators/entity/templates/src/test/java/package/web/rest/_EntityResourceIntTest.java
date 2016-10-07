package <%=packageName%>.web.rest;
<% if (databaseType == 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;
<% if (authenticationType == 'uaa') { %>
import <%=packageName%>.config.SecurityBeanOverrideConfiguration;
<% } %>
import <%=packageName%>.domain.<%= entityClass %>;
<%_ for (idx in relationships) { // import entities in required relationships
        var relationshipValidate = relationships[idx].relationshipValidate;
        var otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        if (relationshipValidate != null && relationshipValidate === true) { _%>
import <%=packageName%>.domain.<%= otherEntityNameCapitalized %>;
<%_ } } _%>
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (service != 'no') { %>
import <%=packageName%>.service.<%= entityClass %>Service;<% } if (searchEngine == 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } if (dto == 'mapstruct') { %>
import <%=packageName%>.service.dto.<%= entityClass %>DTO;
import <%=packageName%>.service.mapper.<%= entityClass %>Mapper;<% } %>

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import static org.hamcrest.Matchers.hasItem;
import org.mockito.MockitoAnnotations;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;<% if (databaseType == 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %><% if (fieldsContainBlob == true) { %>
import org.springframework.util.Base64Utils;<% } %>

import javax.annotation.PostConstruct;
import javax.inject.Inject;<% if (databaseType == 'sql') { %>
import javax.persistence.EntityManager;<% } %><% if (fieldsContainLocalDate == true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime == true) { %>
import java.time.Instant;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;<% } %><% if (fieldsContainLocalDate == true || fieldsContainZonedDateTime == true) { %>
import java.time.ZoneId;<% } %><% if (fieldsContainBigDecimal == true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainBlob == true && databaseType === 'cassandra') { %>
import java.nio.ByteBuffer;<% } %>
import java.util.List;<% if (databaseType == 'cassandra') { %>
import java.util.UUID;<% } %>

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

<%_ for (idx in fields) { if (fields[idx].fieldIsEnum == true) { _%>import <%=packageName%>.domain.enumeration.<%= fields[idx].fieldType %>;
<%_ } } _%>
/**
 * Test class for the <%= entityClass %>Resource REST controller.
 *
 * @see <%= entityClass %>Resource
 */
@RunWith(SpringRunner.class)
<%_ if (authenticationType === 'uaa') { _%>
@SpringBootTest(classes = {<%= mainClass %>.class, SecurityBeanOverrideConfiguration.class})
<%_ } else { _%>
@SpringBootTest(classes = <%= mainClass %>.class)
<%_ } _%>
public class <%= entityClass %>ResourceIntTest <% if (databaseType == 'cassandra') { %>extends AbstractCassandraTest <% } %>{
    <%_ for (idx in fields) {
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
        }_%>

    private static final String <%=defaultValueName %> = "<%=sampleTextString %>";
    private static final String <%=updatedValueName %> = "<%=updatedTextString %>";
    <%_ } else if (fieldType == 'Integer') { _%>

    private static final Integer <%=defaultValueName %> = <%= defaultValue %>;
    private static final Integer <%=updatedValueName %> = <%= updatedValue %>;
    <%_ } else if (fieldType == 'Long') { _%>

    private static final Long <%=defaultValueName %> = <%= defaultValue %>L;
    private static final Long <%=updatedValueName %> = <%= updatedValue %>L;
    <%_ } else if (fieldType == 'Float') { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>F;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>F;
    <%_ } else if (fieldType == 'Double') { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>D;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>D;
    <%_ } else if (fieldType == 'BigDecimal') { _%>

    private static final BigDecimal <%=defaultValueName %> = new BigDecimal(<%= defaultValue %>);
    private static final BigDecimal <%=updatedValueName %> = new BigDecimal(<%= updatedValue %>);
    <%_ } else if (fieldType == 'UUID') { _%>

    private static final UUID <%=defaultValueName %> = UUID.randomUUID();
    private static final UUID <%=updatedValueName %> = UUID.randomUUID();
    <%_ } else if (fieldType == 'LocalDate') { _%>

    private static final LocalDate <%=defaultValueName %> = LocalDate.ofEpochDay(0L);
    private static final LocalDate <%=updatedValueName %> = LocalDate.now(ZoneId.systemDefault());
    <%_ } else if (fieldType == 'ZonedDateTime') { _%>

    private static final ZonedDateTime <%=defaultValueName %> = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneId.systemDefault());
    private static final ZonedDateTime <%=updatedValueName %> = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    private static final String <%=defaultValueName %>_STR = DateTimeFormatter.ISO_OFFSET_DATE_TIME.format(<%= defaultValueName %>);
    <%_ } else if (fieldType == 'Boolean') { _%>

    private static final Boolean <%=defaultValueName %> = false;
    private static final Boolean <%=updatedValueName %> = true;
    <%_ } else if ((fieldType == 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent != 'text') { _%>

    <%_ if (databaseType !== 'cassandra') { _%>
    private static final byte[] <%=defaultValueName %> = TestUtil.createByteArray(<%= defaultValue %>, "0");
    private static final byte[] <%=updatedValueName %> = TestUtil.createByteArray(<%= updatedValue %>, "1");
    <%_ } else { _%>
    private static final ByteBuffer <%=defaultValueName %> = ByteBuffer.wrap(TestUtil.createByteArray(<%= defaultValue %>, "0"));
    private static final ByteBuffer <%=updatedValueName %> = ByteBuffer.wrap(TestUtil.createByteArray(<%= updatedValue %>, "1"));
    <%_ } _%>
    private static final String <%=defaultValueName %>_CONTENT_TYPE = "image/jpg";
    private static final String <%=updatedValueName %>_CONTENT_TYPE = "image/png";
    <%_ } else if (fieldTypeBlobContent == 'text') { _%>

    private static final String <%=defaultValueName %> = "<%=sampleTextString %>";
    private static final String <%=updatedValueName %> = "<%=updatedTextString %>";
    <%_ } else if (isEnum) { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%=fieldType %>.<%=enumValue1 %>;
    private static final <%=fieldType %> <%=updatedValueName %> = <%=fieldType %>.<%=enumValue2 %>;
    <%_ } } _%>

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
<%_ if (databaseType == 'sql') { _%>

    @Inject
    private EntityManager em;
<%_ } _%>

    private MockMvc rest<%= entityClass %>MockMvc;

    private <%= entityClass %> <%= entityInstance %>;

    @PostConstruct
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource();
        <%_ if (service != 'no') { _%>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Service", <%= entityInstance %>Service);
        <%_ } else { _%>
            <%_ if (searchEngine == 'elasticsearch') { _%>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>SearchRepository", <%= entityInstance %>SearchRepository);
            <%_ } _%>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Repository", <%= entityInstance %>Repository);
        <%_ } _%>
        <%_ if (service == 'no' && dto == 'mapstruct') { _%>
        ReflectionTestUtils.setField(<%= entityInstance %>Resource, "<%= entityInstance %>Mapper", <%= entityInstance %>Mapper);
        <%_ } _%>
        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static <%= entityClass %> createEntity(<% if (databaseType == 'sql') { %>EntityManager em<% } %>) {
        <%_ if (fluentMethods) { _%>
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>()<% for (idx in fields) { %>
                .<%= fields[idx].fieldName %>(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>)<% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %>
                .<%= fields[idx].fieldName %>ContentType(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)<% } %><% } %>;
        <%_ } else { _%>
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
            <%_ for (idx in fields) { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase() %>);
                <%_ if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase() %>_CONTENT_TYPE);
                <%_ } _%>
            <%_ } _%>
        <%_ } _%>
        <%_ for (idx in relationships) {
            var relationshipValidate = relationships[idx].relationshipValidate;
            var otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
            var relationshipFieldName = relationships[idx].relationshipFieldName;
            var relationshipType = relationships[idx].relationshipType;
            var relationshipNameCapitalizedPlural = relationships[idx].relationshipNameCapitalizedPlural;
            var relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
            if (relationshipValidate != null && relationshipValidate === true) { _%>
        // Add required entity
        <%= otherEntityNameCapitalized %> <%= relationshipFieldName %> = <%= otherEntityNameCapitalized %>ResourceIntTest.createEntity(em);
        em.persist(<%= relationshipFieldName %>);
        em.flush();
            <%_ if (relationshipType == 'many-to-many') { _%>
        <%= entityInstance %>.get<%= relationshipNameCapitalizedPlural %>().add(<%= relationshipFieldName %>);
            <%_ } else { _%>
        <%= entityInstance %>.set<%= relationshipNameCapitalized %>(<%= relationshipFieldName %>);
            <%_ } _%>
        <%_ } } _%>
        return <%= entityInstance %>;
    }

    @Before
    public void initTest() {
        <%_ if (databaseType == 'mongodb' || databaseType == 'cassandra') { _%>
        <%= entityInstance %>Repository.deleteAll();
        <%_ } if (searchEngine == 'elasticsearch') { _%>
        <%= entityInstance %>SearchRepository.deleteAll();
        <%_ } _%>
        <%= entityInstance %> = createEntity(<% if (databaseType == 'sql') { %>em<% } %>);
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
        <%_ } else if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
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
                .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType == 'sql') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType == 'mongodb') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType == 'cassandra') { %>
                .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
                <%_ if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
                .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
                <%_ } _%>
                .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %><% if (databaseType == 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else { %>.toString()<% } %>)))<% } %>;
    }

    @Test<% if (databaseType == 'sql') { %>
    @Transactional<% } %>
    public void get<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType == 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>/{id}", <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType == 'sql') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().intValue()))<% } %><% if (databaseType == 'mongodb') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId()))<% } %><% if (databaseType == 'cassandra') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().toString()))<% } %><% for (idx in fields) {%>
            <%_ if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType == 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>ContentType").value(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE))
            <%_ } _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>").value(<% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else { %>.toString()<% } %>))<% } %>;
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
        <%= entityClass %> updated<%= entityClass %> = <%= entityInstance %>Repository.findOne(<%= entityInstance %>.getId());
        <%_ if (fluentMethods && fields.length > 0) { _%>
        updated<%= entityClass %><% for (idx in fields) { %>
                .<%= fields[idx].fieldName %>(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>)<% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %>
                .<%= fields[idx].fieldName %>ContentType(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)<% } %><% } %>;
        <%_ } else { _%>
            <%_ for (idx in fields) { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
                <%_ if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType == 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
                <%_ } _%>
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
        <%_ } else if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
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
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType == 'sql') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType == 'mongodb') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType == 'cassandra') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
            <%_ if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %>Base64Utils.encodeToString(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType == 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent != 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType == 'Integer') { %><% } else if (fields[idx].fieldType == 'Long') { %>.intValue()<% } else if (fields[idx].fieldType == 'Float' || fields[idx].fieldType == 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType == 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType == 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType == 'ZonedDateTime') { %>_STR<% } else { %>.toString()<% } %>)))<% } %>;
    }<% } %>
}
