<%#
 Copyright 2013-2017 the original author or authors.

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
package <%=packageName%>.service;

<%_ const serviceClassName = entityClass + 'QueryService';
    const instanceType = (dto === 'mapstruct') ? entityClass + 'DTO' : entityClass;
    const instanceName = (dto === 'mapstruct') ? entityInstance + 'DTO' : entityInstance;
    const mapper = entityInstance  + 'Mapper';
    const dtoToEntity = mapper + '.'+ 'toEntity';
    const entityToDto = mapper + '.'+ 'toDto';
    const entityListToDto = mapper + '.' + 'toDto';
    const entityToDtoReference = mapper + '::'+ 'toDto';
    const repository = entityInstance  + 'Repository';
    const criteria = entityClass + 'Criteria';

    if (fieldsContainLocalDate === true) { _%>
import java.time.LocalDate;<% } %><% if (fieldsContainZonedDateTime === true) { %>
import java.time.ZonedDateTime;<% } if (fieldsContainBigDecimal === true) { %>
import java.math.BigDecimal;<% } %>
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specifications;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import io.github.jhipster.service.QueryService;

import <%=packageName%>.domain.<%= entityClass %>;
import <%=packageName%>.domain.*; // for static metamodels
import <%=packageName%>.repository.<%= entityClass %>Repository;<% if (searchEngine === 'elasticsearch') { %>
import <%=packageName%>.repository.search.<%= entityClass %>SearchRepository;<% } %>
import <%=packageName%>.service.dto.<%= entityClass %>Criteria;
<% if (dto === 'mapstruct') { %>
import <%=packageName%>.service.dto.<%= entityClass %>DTO;
import <%=packageName%>.service.mapper.<%= entityClass %>Mapper;<% } %>
<%_ for (idx in fields) { if (fields[idx].fieldIsEnum === true) { _%>
import <%=packageName%>.domain.enumeration.<%= fields[idx].fieldType %>;
<%_ } } _%>

/**
 * Service for executing complex queries for <%= entityClass %> entities in the database.
 * The main input is a {@link <%= entityClass %>Criteria} which get's converted to {@link Specifications},
 * in a way that all the filters must apply.
 * It returns a {@link List} of {%link <%= instanceType %>} or a {@link Page} of {%link <%= instanceType %>} which fulfills the criterias
 */
@Service<% if (databaseType === 'sql') { %>
@Transactional(readOnly = true)<% } %>
public class <%= serviceClassName %> extends QueryService<<%= entityClass %>> {

    private final Logger log = LoggerFactory.getLogger(<%= serviceClassName %>.class);

<%- include('../common/inject_template', {viaService: false, constructorName: serviceClassName, queryService: false}); -%>

    /**
     * Return a {@link List} of {%link <%= instanceType %>} which matches the criteria from the database
     * @param criteria The object which holds all the filters, which the entities should match.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public List<<%= instanceType %>> findByCriteria(<%= criteria %> criteria) {
        log.debug("find by criteria : {}", criteria);
        final Specifications<<%= entityClass %>> specification = createSpecification(criteria);
    <%_ if (dto === 'mapstruct') { _%>
        return <%= entityListToDto %>(<%= repository %>.findAll(specification));
    <%_ } else { _%>
        return <%= repository %>.findAll(specification);
    <%_ } _%>
    }

    /**
     * Return a {@link Page} of {%link <%= instanceType %>} which matches the criteria from the database
     * @param criteria The object which holds all the filters, which the entities should match.
     * @param page The page, which should be returned.
     * @return the matching entities.
     */
    @Transactional(readOnly = true)
    public Page<<%= instanceType %>> findByCriteria(<%= criteria %> criteria, Pageable page) {
        log.debug("find by criteria : {}, page: {}", criteria, page);
        final Specifications<<%= entityClass %>> specification = createSpecification(criteria);
    <%_ if (dto === 'mapstruct') { _%>
        final Page<<%= entityClass %>> result = <%= repository %>.findAll(specification, page);
        return result.map(<%= entityToDtoReference %>);
    <%_ } else { _%>
        return <%= repository %>.findAll(specification, page);
    <%_ } _%>
    }

    /**
     * Function to convert <%= criteria %> to a {@link Specifications}
     */
    private Specifications<<%= entityClass %>> createSpecification(<%= criteria %> criteria) {
        Specifications<<%= entityClass %>> specification = Specifications.where(null);
        if (criteria != null) {
            if (criteria.getId() != null) {
                specification = specification.and(buildSpecification(criteria.getId(), <%= entityClass %>_.id));
            }
            <%_
            fields.forEach((field) => {
                if (isFilterableType(field.fieldType)) { _%>
            if (criteria.get<%= field.fieldInJavaBeanMethod %>() != null) {
                specification = specification.and(<%= getSpecificationBuilder(field.fieldType) %>(criteria.get<%= field.fieldInJavaBeanMethod %>(), <%= entityClass %>_.<%= field.fieldName %>));
            }
            <%_ }
            });

            relationships.forEach((relationship) => {
                const relationshipType = relationship.relationshipType;
                if (relationshipType == 'many-to-one' || relationshipType == 'one-to-one') { _%>
            if (criteria.get<%= relationship.relationshipNameCapitalized %>Id() != null) {
                specification = specification.and(buildReferringEntitySpecification(criteria.get<%= relationship.relationshipNameCapitalized %>Id(), <%= entityClass %>_.<%= relationship.relationshipFieldName %>, <%= relationship.otherEntityNameCapitalized %>_.id));
            }
            <%_    } // if relationshipType=...
            }); // forEach
        _%>
        }
        return specification;
    }

}
