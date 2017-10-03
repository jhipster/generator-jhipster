<%#
 Copyright 2013-2017 the original author or authors from the JHipster project.

 This file is part of the JHipster project, see http://www.jhipster.tech/
 for more information.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
-%>
package <%=packageName%>.web.rest;
<% if (databaseType === 'cassandra') { %>
import <%=packageName%>.AbstractCassandraTest;<% } %>
import <%=packageName%>.<%= mainClass %>;
<% if (authenticationType === 'uaa') { %>
import <%=packageName%>.config.SecurityBeanOverrideConfiguration;
<% } %>
import <%=packageName%>.domain.<%= entityClass %>;
<%_ for (idx in relationships) { // import entities in required relationships
        const relationshipValidate = relationships[idx].relationshipValidate;
        const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
        if (relationshipValidate !== null && relationshipValidate === true) { _%>
import <%=packageName%>.domain.<%= otherEntityNameCapitalized %>;
<%_ } } _%>
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (service !== 'no') { %>
import <%=packageName%>.service.<%= entityClass %>Service;<% } if (searchEngine === 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } if (dto === 'mapstruct') { %>
import <%=packageName%>.service.dto.<%= entityClass %>DTO;
import <%=packageName%>.service.mapper.<%= entityClass %>Mapper;<% } %>
import <%=packageName%>.web.rest.errors.ExceptionTranslator;
<%_ if (jpaMetamodelFiltering) { _%>
import <%=packageName%>.service.dto.<%= entityClass %>Criteria;
import <%=packageName%>.service.<%= entityClass %>QueryService;
<%_ } _%>

import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.mockito.MockitoAnnotations;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.web.PageableHandlerMethodArgumentResolver;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.context.junit4.SpringRunner;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;<% if (databaseType === 'sql') { %>
import org.springframework.transaction.annotation.Transactional;<% } %><% if (fieldsContainBlob === true) { %>
import org.springframework.util.Base64Utils;<% } %>
<% if (databaseType === 'sql') { %>
import javax.persistence.EntityManager;<% } %><% if (fieldsContainBigDecimal === true) { %>
import java.math.BigDecimal;<% } %><% if (fieldsContainBlob === true && databaseType === 'cassandra') { %>
import java.nio.ByteBuffer;<% } %><% if (fieldsContainLocalDate === true) { %>
import java.time.LocalDate;<% } %><% if (fieldsContainInstant === true || fieldsContainZonedDateTime === true) { %>
import java.time.Instant;<% } %><% if (fieldsContainZonedDateTime === true) { %>
import java.time.ZonedDateTime;
import java.time.ZoneOffset;<% } %><% if (fieldsContainLocalDate === true || fieldsContainZonedDateTime === true) { %>
import java.time.ZoneId;<% } %><% if (fieldsContainInstant === true) { %>
import java.time.temporal.ChronoUnit;<% } %>
import java.util.List;<% if (databaseType === 'cassandra') { %>
import java.util.UUID;<% } %>
<% if (fieldsContainZonedDateTime === true) { %>
import static <%=packageName%>.web.rest.TestUtil.sameInstant;<% } %>
import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

<%_ for (idx in fields) { if (fields[idx].fieldIsEnum === true) { _%>import <%=packageName%>.domain.enumeration.<%= fields[idx].fieldType %>;
<%_ } } _%>
/**
 * Test class for the <%= entityClass %>Resource REST controller.
 *
 * @see <%= entityClass %>Resource
 */
@RunWith(SpringRunner.class)
<%_ if (authenticationType === 'uaa' && applicationType !== 'uaa') { _%>
@SpringBootTest(classes = {<%= mainClass %>.class, SecurityBeanOverrideConfiguration.class})
<%_ } else { _%>
@SpringBootTest(classes = <%= mainClass %>.class)
<%_ } _%>
public class <%= entityClass %>ResourceIntTest <% if (databaseType === 'cassandra') { %>extends AbstractCassandraTest <% } %>{
<%_
    let oldSource = '';
    try {
        oldSource = this.fs.readFileSync(this.SERVER_TEST_SRC_DIR + packageFolder + '/web/rest/' + entityClass + 'ResourceIntTest.java', 'utf8');
    } catch (e) {}
_%>
    <%_ for (idx in fields) {
    const defaultValueName = 'DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase();
    const updatedValueName = 'UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase();

    let defaultValue = 1;
    let updatedValue = 2;

    if (fields[idx].fieldValidate === true) {
        if (fields[idx].fieldValidateRules.indexOf('max') !== -1) {
            defaultValue = fields[idx].fieldValidateRulesMax;
            updatedValue = parseInt(fields[idx].fieldValidateRulesMax) - 1;
        }
        if (fields[idx].fieldValidateRules.indexOf('min') !== -1) {
            defaultValue = fields[idx].fieldValidateRulesMin;
            updatedValue = parseInt(fields[idx].fieldValidateRulesMin) + 1;
        }
        if (fields[idx].fieldValidateRules.indexOf('minbytes') !== -1) {
            defaultValue = fields[idx].fieldValidateRulesMinbytes;
            updatedValue = fields[idx].fieldValidateRulesMinbytes;
        }
        if (fields[idx].fieldValidateRules.indexOf('maxbytes') !== -1) {
            updatedValue = fields[idx].fieldValidateRulesMaxbytes;
        }
    }

    const fieldType = fields[idx].fieldType;
    const fieldTypeBlobContent = fields[idx].fieldTypeBlobContent;
    const isEnum = fields[idx].fieldIsEnum;
    let enumValue1;
    let enumValue2;
    if (isEnum) {
        const values = fields[idx].fieldValues.replace(/\s/g, '').split(',');
        enumValue1 = values[0];
        if (values.length > 1) {
            enumValue2 = values[1];
        } else {
            enumValue2 = enumValue1;
        }
    }

    if (fieldType === 'String' || fieldTypeBlobContent === 'text') {
        // Generate Strings, using the min and max string length if they are configured
        let sampleTextString = "";
        let updatedTextString = "";
        let sampleTextLength = 10;
        if (fields[idx].fieldValidateRulesMinlength > sampleTextLength) {
            sampleTextLength = fields[idx].fieldValidateRulesMinlength;
        }
        if (fields[idx].fieldValidateRulesMaxlength < sampleTextLength) {
            sampleTextLength = fields[idx].fieldValidateRulesMaxlength;
        }
        for (let i = 0; i < sampleTextLength; i++) {
            sampleTextString += "A";
            updatedTextString += "B";
        }
        if (!this._.isUndefined(fields[idx].fieldValidateRulesPattern)) {
            if (oldSource !== '') {
                // Check for old values
                const sampleTextStringSearchResult = new RegExp('private static final String ' + defaultValueName + ' = "(.*)";', 'm').exec(oldSource);
                if (sampleTextStringSearchResult != null) {
                    sampleTextString = sampleTextStringSearchResult[1];
                }
                const updatedTextStringSearchResult = new RegExp('private static final String ' + updatedValueName + ' = "(.*)";', 'm').exec(oldSource);
                if (updatedTextStringSearchResult != null) {
                    updatedTextString = updatedTextStringSearchResult[1];
                }
            }
            // Generate Strings, using pattern
            try {
                const patternRegExp = new RegExp(fields[idx].fieldValidateRulesPattern);
                const randExp = new this.randexp(fields[idx].fieldValidateRulesPattern);
                // set infinite repetitionals max range
                randExp.max = 1;
                if (!patternRegExp.test(sampleTextString.replace(/\\"/g, '"').replace(/\\\\/g, '\\'))) {
                    sampleTextString = randExp.gen().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                }
                if (!patternRegExp.test(updatedTextString.replace(/\\"/g, '"').replace(/\\\\/g, '\\'))) {
                    updatedTextString = randExp.gen().replace(/\\/g, '\\\\').replace(/"/g, '\\"');
                }
            } catch (error) {
                log(this.chalkRed('Error generating test value for entity "' + entityClass +
                    '" field "' + fields[idx].fieldName + '" with pattern "' + fields[idx].fieldValidateRulesPattern +
                    '", generating default values for this field. Detailed error message: "' + error.message + '".'));
            }
            if (sampleTextString === updatedTextString) {
                updatedTextString = updatedTextString + "B";
                log(this.chalkRed('Randomly generated first and second test values for entity "' + entityClass +
                    '" field "' + fields[idx].fieldName + '" with pattern "' + fields[idx].fieldValidateRulesPattern +
                    '" in file "' + entityClass + 'ResourceIntTest" where equal, added symbol "B" to second value.'));
            }
        }_%>

    private static final String <%=defaultValueName %> = "<%-sampleTextString %>";
    private static final String <%=updatedValueName %> = "<%-updatedTextString %>";
    <%_ } else if (fieldType === 'Integer') { _%>

    private static final Integer <%=defaultValueName %> = <%= defaultValue %>;
    private static final Integer <%=updatedValueName %> = <%= updatedValue %>;
    <%_ } else if (fieldType === 'Long') { _%>

    private static final Long <%=defaultValueName %> = <%= defaultValue %>L;
    private static final Long <%=updatedValueName %> = <%= updatedValue %>L;
    <%_ } else if (fieldType === 'Float') { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>F;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>F;
    <%_ } else if (fieldType === 'Double') { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%= defaultValue %>D;
    private static final <%=fieldType %> <%=updatedValueName %> = <%= updatedValue %>D;
    <%_ } else if (fieldType === 'BigDecimal') { _%>

    private static final BigDecimal <%=defaultValueName %> = new BigDecimal(<%= defaultValue %>);
    private static final BigDecimal <%=updatedValueName %> = new BigDecimal(<%= updatedValue %>);
    <%_ } else if (fieldType === 'UUID') { _%>

    private static final UUID <%=defaultValueName %> = UUID.randomUUID();
    private static final UUID <%=updatedValueName %> = UUID.randomUUID();
    <%_ } else if (fieldType === 'LocalDate') { _%>

    private static final LocalDate <%=defaultValueName %> = LocalDate.ofEpochDay(0L);
    private static final LocalDate <%=updatedValueName %> = LocalDate.now(ZoneId.systemDefault());
    <%_ } else if (fieldType === 'Instant') { _%>

    private static final Instant <%=defaultValueName %> = Instant.ofEpochMilli(0L);
    private static final Instant <%=updatedValueName %> = Instant.now().truncatedTo(ChronoUnit.MILLIS);
    <%_ } else if (fieldType === 'ZonedDateTime') { _%>

    private static final ZonedDateTime <%=defaultValueName %> = ZonedDateTime.ofInstant(Instant.ofEpochMilli(0L), ZoneOffset.UTC);
    private static final ZonedDateTime <%=updatedValueName %> = ZonedDateTime.now(ZoneId.systemDefault()).withNano(0);
    <%_ } else if (fieldType === 'Boolean') { _%>

    private static final Boolean <%=defaultValueName %> = false;
    private static final Boolean <%=updatedValueName %> = true;
    <%_ } else if ((fieldType === 'byte[]' || fieldType === 'ByteBuffer') && fieldTypeBlobContent !== 'text') { _%>

    <%_ if (databaseType !== 'cassandra') { _%>
    private static final byte[] <%=defaultValueName %> = TestUtil.createByteArray(<%= defaultValue %>, "0");
    private static final byte[] <%=updatedValueName %> = TestUtil.createByteArray(<%= updatedValue %>, "1");
    <%_ } else { _%>
    private static final ByteBuffer <%=defaultValueName %> = ByteBuffer.wrap(TestUtil.createByteArray(<%= defaultValue %>, "0"));
    private static final ByteBuffer <%=updatedValueName %> = ByteBuffer.wrap(TestUtil.createByteArray(<%= updatedValue %>, "1"));
    <%_ } _%>
    private static final String <%=defaultValueName %>_CONTENT_TYPE = "image/jpg";
    private static final String <%=updatedValueName %>_CONTENT_TYPE = "image/png";
    <%_ } else if (isEnum) { _%>

    private static final <%=fieldType %> <%=defaultValueName %> = <%=fieldType %>.<%=enumValue1 %>;
    private static final <%=fieldType %> <%=updatedValueName %> = <%=fieldType %>.<%=enumValue2 %>;
    <%_ } } _%>

    @Autowired
    private <%= entityClass %>Repository <%= entityInstance %>Repository;<% if (dto === 'mapstruct') { %>

    @Autowired
    private <%= entityClass %>Mapper <%= entityInstance %>Mapper;<% } if (service !== 'no') { %>

    @Autowired
    private <%= entityClass %>Service <%= entityInstance %>Service;<% } if (searchEngine === 'elasticsearch') { %>

    @Autowired
    private <%= entityClass %>SearchRepository <%= entityInstance %>SearchRepository;<% } %>
    <%_ if (jpaMetamodelFiltering) { _%>

    @Autowired
    private <%= entityClass %>QueryService <%= entityInstance %>QueryService;
    <%_ } _%>

    @Autowired
    private MappingJackson2HttpMessageConverter jacksonMessageConverter;

    @Autowired
    private PageableHandlerMethodArgumentResolver pageableArgumentResolver;

    @Autowired
    private ExceptionTranslator exceptionTranslator;
<%_ if (databaseType === 'sql') { _%>

    @Autowired
    private EntityManager em;
<%_ } _%>

    private MockMvc rest<%= entityClass %>MockMvc;

    private <%= entityClass %> <%= entityInstance %>;

    @Before
    public void setup() {
        MockitoAnnotations.initMocks(this);
        <%_ if (service !== 'no') { _%>
        final <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource(<%= entityInstance %>Service<% if (jpaMetamodelFiltering) { %>, <%= entityInstance %>QueryService<% } %>);
        <%_ } else { _%>
        final <%= entityClass %>Resource <%= entityInstance %>Resource = new <%= entityClass %>Resource(<%= entityInstance %>Repository<% if (dto === 'mapstruct') { %>, <%= entityInstance %>Mapper<% } %><% if (searchEngine === 'elasticsearch') { %>, <%= entityInstance %>SearchRepository<% } %><% if (jpaMetamodelFiltering) { %>, <%= entityInstance %>QueryService<% } %>);
        <%_ } _%>
        this.rest<%= entityClass %>MockMvc = MockMvcBuilders.standaloneSetup(<%= entityInstance %>Resource)
            .setCustomArgumentResolvers(pageableArgumentResolver)
            .setControllerAdvice(exceptionTranslator)
            .setMessageConverters(jacksonMessageConverter).build();
    }

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static <%= entityClass %> createEntity(<% if (databaseType === 'sql') { %>EntityManager em<% } %>) {
        <%_ if (fluentMethods) { _%>
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>()<% for (idx in fields) { %>
            .<%= fields[idx].fieldName %>(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>)<% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %>
            .<%= fields[idx].fieldName %>ContentType(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)<% } %><% } %>;
        <%_ } else { _%>
        <%= entityClass %> <%= entityInstance %> = new <%= entityClass %>();
            <%_ for (idx in fields) { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase() %>);
                <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase() %>_CONTENT_TYPE);
                <%_ } _%>
            <%_ } _%>
        <%_ } _%>
        <%_ for (idx in relationships) {
            const relationshipValidate = relationships[idx].relationshipValidate;
            const otherEntityNameCapitalized = relationships[idx].otherEntityNameCapitalized;
            const relationshipFieldName = relationships[idx].relationshipFieldName;
            const relationshipType = relationships[idx].relationshipType;
            const relationshipNameCapitalizedPlural = relationships[idx].relationshipNameCapitalizedPlural;
            const relationshipNameCapitalized = relationships[idx].relationshipNameCapitalized;
            if (relationshipValidate !== null && relationshipValidate === true) { _%>
        // Add required entity
        <%= otherEntityNameCapitalized %> <%= relationshipFieldName %> = <%= otherEntityNameCapitalized %>ResourceIntTest.createEntity(em);
        em.persist(<%= relationshipFieldName %>);
        em.flush();
            <%_ if (relationshipType === 'many-to-many' || relationshipType === 'one-to-many') { _%>
        <%= entityInstance %>.get<%= relationshipNameCapitalizedPlural %>().add(<%= relationshipFieldName %>);
            <%_ } else { _%>
        <%= entityInstance %>.set<%= relationshipNameCapitalized %>(<%= relationshipFieldName %>);
            <%_ } _%>
        <%_ } } _%>
        return <%= entityInstance %>;
    }

    @Before
    public void initTest() {
        <%_ if (databaseType === 'mongodb' || databaseType === 'cassandra') { _%>
        <%= entityInstance %>Repository.deleteAll();
        <%_ } if (searchEngine === 'elasticsearch') { _%>
        <%= entityInstance %>SearchRepository.deleteAll();
        <%_ } _%>
        <%= entityInstance %> = createEntity(<% if (databaseType === 'sql') { %>em<% } %>);
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void create<%= entityClass %>() throws Exception {
        int databaseSizeBeforeCreate = <%= entityInstance %>Repository.findAll().size();

        // Create the <%= entityClass %>
        <%_ if (dto === 'mapstruct') { _%>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.toDto(<%= entityInstance %>);
        <%_ } _%>
        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityApiUrl %>")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto === 'mapstruct') { %>DTO<% } %>)))
            .andExpect(status().isCreated());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeCreate + 1);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstance %>List.get(<%= entityInstance %>List.size() - 1);
        <%_ for (idx in fields) { if (fields[idx].fieldType === 'ZonedDateTime') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>ContentType()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
        <%_ } else if (fields[idx].fieldType.toLowerCase() === 'boolean') { _%>
        assertThat(test<%= entityClass %>.is<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ }} if (searchEngine === 'elasticsearch') { _%>

        // Validate the <%= entityClass %> in Elasticsearch
        <%= entityClass %> <%= entityInstance %>Es = <%= entityInstance %>SearchRepository.findOne(test<%= entityClass %>.getId());
        assertThat(<%= entityInstance %>Es).isEqualToComparingFieldByField(test<%= entityClass %>);
        <%_ } _%>
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void create<%= entityClass %>WithExistingId() throws Exception {
        int databaseSizeBeforeCreate = <%= entityInstance %>Repository.findAll().size();

        // Create the <%= entityClass %> with an existing ID
        <%= entityInstance %>.setId(<% if (databaseType === 'sql') { %>1L<% } else if (databaseType === 'mongodb') { %>"existing_id"<% } else if (databaseType === 'cassandra') { %>UUID.randomUUID()<% } %>);
        <%_ if (dto === 'mapstruct') { _%>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.toDto(<%= entityInstance %>);
        <%_ } _%>

        // An entity with an existing ID cannot be created, so this API call must fail
        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityApiUrl %>")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto === 'mapstruct') { %>DTO<% } %>)))
            .andExpect(status().isBadRequest());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeCreate);
    }
<% for (idx in fields) { %><% if (fields[idx].fieldValidate === true) {
    let required = false;
    if (fields[idx].fieldValidate === true && fields[idx].fieldValidateRules.indexOf('required') !== -1) {
        required = true;
    }
    if (required) { %>
    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void check<%= fields[idx].fieldInJavaBeanMethod %>IsRequired() throws Exception {
        int databaseSizeBeforeTest = <%= entityInstance %>Repository.findAll().size();
        // set the field null
        <%= entityInstance %>.set<%= fields[idx].fieldInJavaBeanMethod %>(null);

        // Create the <%= entityClass %>, which fails.<% if (dto === 'mapstruct') { %>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.toDto(<%= entityInstance %>);<% } %>

        rest<%= entityClass %>MockMvc.perform(post("/api/<%= entityApiUrl %>")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto === 'mapstruct') { %>DTO<% } %>)))
            .andExpect(status().isBadRequest());

        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeTest);
    }
<%  } } } %>
    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %><% if (databaseType !== 'cassandra') { %>?sort=id,desc<% } %>"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType === 'sql') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType === 'mongodb') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType === 'cassandra') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
            <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %>Base64Utils.encodeToString(<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>sameInstant(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType === 'Integer') { %><% } else if (fields[idx].fieldType === 'Long') { %>.intValue()<% } else if (fields[idx].fieldType === 'Float' || fields[idx].fieldType === 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType === 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType === 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>)<% } else { %>.toString()<% } %>)))<% } %>;
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void get<%= entityClass %>() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>/{id}", <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType === 'sql') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().intValue()))<% } %><% if (databaseType === 'mongodb') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId()))<% } %><% if (databaseType === 'cassandra') { %>
            .andExpect(jsonPath("$.id").value(<%= entityInstance %>.getId().toString()))<% } %><% for (idx in fields) {%>
            <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>ContentType").value(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE))
            <%_ } _%>
            .andExpect(jsonPath("$.<%=fields[idx].fieldName%>").value(<% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %>Base64Utils.encodeToString(<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>sameInstant(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType === 'Integer') { %><% } else if (fields[idx].fieldType === 'Long') { %>.intValue()<% } else if (fields[idx].fieldType === 'Float' || fields[idx].fieldType === 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType === 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType === 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>)<% } else { %>.toString()<% } %>))<% } %>;
    }
<%_ if (jpaMetamodelFiltering) {
        fields.forEach((searchBy) => {
            // we can't filter by all the fields.
            if (isFilterableType(searchBy.fieldType)) {
                 _%>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>By<%= searchBy.fieldInJavaBeanMethod %>IsEqualToSomething() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.saveAndFlush(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> equals to <%='DEFAULT_' + searchBy.fieldNameUnderscored.toUpperCase()%>
        default<%= entityClass %>ShouldBeFound("<%= searchBy.fieldName %>.equals=" + <%='DEFAULT_' + searchBy.fieldNameUnderscored.toUpperCase()%>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> equals to <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>
        default<%= entityClass %>ShouldNotBeFound("<%= searchBy.fieldName %>.equals=" + <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>);
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>By<%= searchBy.fieldInJavaBeanMethod %>IsInShouldWork() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.saveAndFlush(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> in <%='DEFAULT_' + searchBy.fieldNameUnderscored.toUpperCase()%> or <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>
        default<%= entityClass %>ShouldBeFound("<%= searchBy.fieldName %>.in=" + <%='DEFAULT_' + searchBy.fieldNameUnderscored.toUpperCase()%> + "," + <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> equals to <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>
        default<%= entityClass %>ShouldNotBeFound("<%= searchBy.fieldName %>.in=" + <%='UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase()%>);
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>By<%= searchBy.fieldInJavaBeanMethod %>IsNullOrNotNull() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.saveAndFlush(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> is not null
        default<%= entityClass %>ShouldBeFound("<%= searchBy.fieldName %>.specified=true");

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> is null
        default<%= entityClass %>ShouldNotBeFound("<%= searchBy.fieldName %>.specified=false");
    }
<%_
            }
            // the range criterias
            if (['Byte', 'Short', 'Integer', 'Long', 'LocalDate', 'ZonedDateTime'].includes(searchBy.fieldType)) { 
              var defaultValue = 'DEFAULT_' + searchBy.fieldNameUnderscored.toUpperCase();
              var biggerValue = 'UPDATED_' + searchBy.fieldNameUnderscored.toUpperCase();
              if (searchBy.fieldValidate === true && searchBy.fieldValidateRules.includes('max')) {
                  // if maximum is specified the updated variable is smaller than the default one!
                  biggerValue = '(' + defaultValue + ' + 1)';
              }
            _%>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>By<%= searchBy.fieldInJavaBeanMethod %>IsGreaterThanOrEqualToSomething() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.saveAndFlush(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> greater than or equals to <%= defaultValue %>
        default<%= entityClass %>ShouldBeFound("<%= searchBy.fieldName %>.greaterOrEqualThan=" + <%= defaultValue %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> greater than or equals to <%= biggerValue %>
        default<%= entityClass %>ShouldNotBeFound("<%= searchBy.fieldName %>.greaterOrEqualThan=" + <%= biggerValue %>);
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getAll<%= entityClassPlural %>By<%= searchBy.fieldInJavaBeanMethod %>IsLessThanSomething() throws Exception {
        // Initialize the database
        <%= entityInstance %>Repository.saveAndFlush(<%= entityInstance %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> less than or equals to <%= defaultValue %>
        default<%= entityClass %>ShouldNotBeFound("<%= searchBy.fieldName %>.lessThan=" + <%= defaultValue %>);

        // Get all the <%= entityInstance %>List where <%= searchBy.fieldName %> less than or equals to <%= biggerValue %>
        default<%= entityClass %>ShouldBeFound("<%= searchBy.fieldName %>.lessThan=" + <%= biggerValue %>);
    }

<%_         } _%>
<%_     }); _%>

    /**
     * Executes the search, and checks that the default entity is returned
     */
    private void default<%= entityClass %>ShouldBeFound(String filter) throws Exception {
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% fields.forEach((field) => { %>
            <%_ if ((field.fieldType === 'byte[]' || field.fieldType === 'ByteBuffer') && field.fieldTypeBlobContent !== 'text') { _%>
            .andExpect(jsonPath("$.[*].<%=field.fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + field.fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].<%=field.fieldName%>").value(hasItem(<% if ((field.fieldType === 'byte[]' || field.fieldType === 'ByteBuffer') && field.fieldTypeBlobContent !== 'text') { %>Base64Utils.encodeToString(<% } else if (field.fieldType === 'ZonedDateTime') { %>sameInstant(<% } %><%='DEFAULT_' + field.fieldNameUnderscored.toUpperCase()%><% if ((field.fieldType === 'byte[]' || field.fieldType === 'ByteBuffer') && field.fieldTypeBlobContent !== 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (field.fieldType === 'Integer') { %><% } else if (field.fieldType === 'Long') { %>.intValue()<% } else if (field.fieldType === 'Float' || field.fieldType === 'Double') { %>.doubleValue()<% } else if (field.fieldType === 'BigDecimal') { %>.intValue()<% } else if (field.fieldType === 'Boolean') { %>.booleanValue()<% } else if (field.fieldType === 'ZonedDateTime') { %>)<% } else { %>.toString()<% } %>)))<% }); %>;
    }

    /**
     * Executes the search, and checks that the default entity is not returned
     */
    private void default<%= entityClass %>ShouldNotBeFound(String filter) throws Exception {
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());
    }

<%_  } _%>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void getNonExisting<%= entityClass %>() throws Exception {
        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/<%= entityApiUrl %>/{id}", <% if (databaseType === 'sql' || databaseType === 'mongodb') { %>Long.MAX_VALUE<% } %><% if (databaseType === 'cassandra') { %>UUID.randomUUID().toString()<% } %>))
            .andExpect(status().isNotFound());
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void update<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service !== 'no' && dto !== 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);<% if (searchEngine === 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);<%_ } _%>
<%_ } _%>

        int databaseSizeBeforeUpdate = <%= entityInstance %>Repository.findAll().size();

        // Update the <%= entityInstance %>
        <%= entityClass %> updated<%= entityClass %> = <%= entityInstance %>Repository.findOne(<%= entityInstance %>.getId());
        <%_ if (fluentMethods && fields.length > 0) { _%>
        updated<%= entityClass %><% for (idx in fields) { %>
            .<%= fields[idx].fieldName %>(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>)<% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %>
            .<%= fields[idx].fieldName %>ContentType(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)<% } %><% } %>;
        <%_ } else { _%>
            <%_ for (idx in fields) { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
                <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
        updated<%= entityClass %>.set<%= fields[idx].fieldInJavaBeanMethod %>ContentType(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
                <%_ } _%>
            <%_ } _%>
        <%_ } _%>
        <%_ if (dto === 'mapstruct') { _%>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.toDto(updated<%= entityClass %>);
        <%_ } _%>

        rest<%= entityClass %>MockMvc.perform(put("/api/<%= entityApiUrl %>")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(<% if (dto === 'mapstruct') { %><%= entityInstance %>DTO<% } else { %>updated<%= entityClass %><% } %>)))
            .andExpect(status().isOk());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeUpdate);
        <%= entityClass %> test<%= entityClass %> = <%= entityInstance %>List.get(<%= entityInstance %>List.size() - 1);
        <%_ for (idx in fields) { if (fields[idx].fieldType === 'ZonedDateTime') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>ContentType()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE);
        <%_ } else if (fields[idx].fieldType.toLowerCase() === 'boolean') { _%>
        assertThat(test<%= entityClass %>.is<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } else { _%>
        assertThat(test<%= entityClass %>.get<%=fields[idx].fieldInJavaBeanMethod%>()).isEqualTo(<%='UPDATED_' + fields[idx].fieldNameUnderscored.toUpperCase()%>);
        <%_ } } if (searchEngine === 'elasticsearch') { _%>

        // Validate the <%= entityClass %> in Elasticsearch
        <%= entityClass %> <%= entityInstance %>Es = <%= entityInstance %>SearchRepository.findOne(test<%= entityClass %>.getId());
        assertThat(<%= entityInstance %>Es).isEqualToComparingFieldByField(test<%= entityClass %>);
        <%_ } _%>
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void updateNonExisting<%= entityClass %>() throws Exception {
        int databaseSizeBeforeUpdate = <%= entityInstance %>Repository.findAll().size();

        // Create the <%= entityClass %><% if (dto === 'mapstruct') { %>
        <%= entityClass %>DTO <%= entityInstance %>DTO = <%= entityInstance %>Mapper.toDto(<%= entityInstance %>);<% } %>

        // If the entity doesn't have an ID, it will be created instead of just being updated
        rest<%= entityClass %>MockMvc.perform(put("/api/<%= entityApiUrl %>")
            .contentType(TestUtil.APPLICATION_JSON_UTF8)
            .content(TestUtil.convertObjectToJsonBytes(<%= entityInstance %><% if (dto === 'mapstruct') { %>DTO<% } %>)))
            .andExpect(status().isCreated());

        // Validate the <%= entityClass %> in the database
        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeUpdate + 1);
    }

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void delete<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service !== 'no' && dto !== 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);<% if (searchEngine === 'elasticsearch') { %>
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);<%_ } _%>
<%_ } _%>

        int databaseSizeBeforeDelete = <%= entityInstance %>Repository.findAll().size();

        // Get the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(delete("/api/<%= entityApiUrl %>/{id}", <%= entityInstance %>.getId())
            .accept(TestUtil.APPLICATION_JSON_UTF8))
            .andExpect(status().isOk());<% if (searchEngine === 'elasticsearch') { %>

        // Validate Elasticsearch is empty
        boolean <%= entityInstance %>ExistsInEs = <%= entityInstance %>SearchRepository.exists(<%= entityInstance %>.getId());
        assertThat(<%= entityInstance %>ExistsInEs).isFalse();<% } %>

        // Validate the database is empty
        List<<%= entityClass %>> <%= entityInstance %>List = <%= entityInstance %>Repository.findAll();
        assertThat(<%= entityInstance %>List).hasSize(databaseSizeBeforeDelete - 1);
    }<% if (searchEngine === 'elasticsearch') { %>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void search<%= entityClass %>() throws Exception {
        // Initialize the database
<%_ if (service !== 'no' && dto !== 'mapstruct') { _%>
        <%= entityInstance %>Service.save(<%= entityInstance %>);
<%_ } else { _%>
        <%= entityInstance %>Repository.save<% if (databaseType === 'sql') { %>AndFlush<% } %>(<%= entityInstance %>);
        <%= entityInstance %>SearchRepository.save(<%= entityInstance %>);
<%_ } _%>

        // Search the <%= entityInstance %>
        rest<%= entityClass %>MockMvc.perform(get("/api/_search/<%= entityApiUrl %>?query=id:" + <%= entityInstance %>.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_UTF8_VALUE))<% if (databaseType === 'sql') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().intValue())))<% } %><% if (databaseType === 'mongodb') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId())))<% } %><% if (databaseType === 'cassandra') { %>
            .andExpect(jsonPath("$.[*].id").value(hasItem(<%= entityInstance %>.getId().toString())))<% } %><% for (idx in fields) {%>
            <%_ if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>ContentType").value(hasItem(<%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%>_CONTENT_TYPE)))
            <%_ } _%>
            .andExpect(jsonPath("$.[*].<%=fields[idx].fieldName%>").value(hasItem(<% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %>Base64Utils.encodeToString(<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>sameInstant(<% } %><%='DEFAULT_' + fields[idx].fieldNameUnderscored.toUpperCase()%><% if ((fields[idx].fieldType === 'byte[]' || fields[idx].fieldType === 'ByteBuffer') && fields[idx].fieldTypeBlobContent !== 'text') { %><% if (databaseType === 'cassandra') { %>.array()<% } %>)<% } else if (fields[idx].fieldType === 'Integer') { %><% } else if (fields[idx].fieldType === 'Long') { %>.intValue()<% } else if (fields[idx].fieldType === 'Float' || fields[idx].fieldType === 'Double') { %>.doubleValue()<% } else if (fields[idx].fieldType === 'BigDecimal') { %>.intValue()<% } else if (fields[idx].fieldType === 'Boolean') { %>.booleanValue()<% } else if (fields[idx].fieldType === 'ZonedDateTime') { %>)<% } else { %>.toString()<% } %>)))<% } %>;
    }<% } %>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(<%= entityClass %>.class);
        <%= entityClass %> <%= entityInstance %>1 = new <%= entityClass %>();
        <%= entityInstance %>1.setId(<% if (databaseType === 'sql') { %>1L<% } else if (databaseType === 'mongodb') { %>"id1"<% } else if (databaseType === 'cassandra') { %>UUID.randomUUID()<% } %>);
        <%= entityClass %> <%= entityInstance %>2 = new <%= entityClass %>();
        <%= entityInstance %>2.setId(<%= entityInstance %>1.getId());
        assertThat(<%= entityInstance %>1).isEqualTo(<%= entityInstance %>2);
        <%= entityInstance %>2.setId(<% if (databaseType === 'sql') { %>2L<% } else if (databaseType === 'mongodb') { %>"id2"<% } else if (databaseType === 'cassandra') { %>UUID.randomUUID()<% } %>);
        assertThat(<%= entityInstance %>1).isNotEqualTo(<%= entityInstance %>2);
        <%= entityInstance %>1.setId(null);
        assertThat(<%= entityInstance %>1).isNotEqualTo(<%= entityInstance %>2);
    }
    <%_ if (dto === 'mapstruct') { _%>

    @Test<% if (databaseType === 'sql') { %>
    @Transactional<% } %>
    public void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(<%= entityClass %>DTO.class);
        <%= entityClass %>DTO <%= entityInstance %>DTO1 = new <%= entityClass %>DTO();
        <%= entityInstance %>DTO1.setId(<% if (databaseType === 'sql') { %>1L<% } else if (databaseType === 'mongodb') { %>"id1"<% } else if (databaseType === 'cassandra') { %>UUID.randomUUID()<% } %>);
        <%= entityClass %>DTO <%= entityInstance %>DTO2 = new <%= entityClass %>DTO();
        assertThat(<%= entityInstance %>DTO1).isNotEqualTo(<%= entityInstance %>DTO2);
        <%= entityInstance %>DTO2.setId(<%= entityInstance %>DTO1.getId());
        assertThat(<%= entityInstance %>DTO1).isEqualTo(<%= entityInstance %>DTO2);
        <%= entityInstance %>DTO2.setId(<% if (databaseType === 'sql') { %>2L<% } else if (databaseType === 'mongodb') { %>"id2"<% } else if (databaseType === 'cassandra') { %>UUID.randomUUID()<% } %>);
        assertThat(<%= entityInstance %>DTO1).isNotEqualTo(<%= entityInstance %>DTO2);
        <%= entityInstance %>DTO1.setId(null);
        assertThat(<%= entityInstance %>DTO1).isNotEqualTo(<%= entityInstance %>DTO2);
    }
        <%_ if (databaseType === 'sql') { _%>

    @Test
    @Transactional
    public void testEntityFromId() {
        assertThat(<%= entityInstance %>Mapper.fromId(42L).getId()).isEqualTo(42);
        assertThat(<%= entityInstance %>Mapper.fromId(null)).isNull();
    }
         <%_ } _%>
    <%_ } _%>
}
